import { NextResponse } from "next/server";
import { getAdminSession } from "@/backend/lib/auth";
import { prisma } from "@/backend/lib/prisma";
import { safeServerError } from "@/backend/lib/api";
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const CAROUSEL_SOURCE_DIR = join(process.cwd(), "src", "frontend", "carousel-source");

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    // Check admin authentication
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role !== "OWNER") {
      return NextResponse.json({ error: "Forbidden: Owner only" }, { status: 403 });
    }

    // Parse the multipart form data
    const data = await request.formData();
    const files = data.getAll("images") as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: "No images provided" }, { status: 400 });
    }

    const supportedExtensions = new Set([
      ".avif",
      ".gif",
      ".jpeg",
      ".jpg",
      ".png",
      ".webp",
    ]);

    const results = await Promise.all(
      files.map(async (file) => {
        // @ts-expectCast - file from FormData
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const originalName = file.name ?? "unknown";
        const ext = originalName.slice(originalName.lastIndexOf(".")).toLowerCase();

        // Validate extension
        if (!supportedExtensions.has(ext)) {
          return { success: false, name: originalName, error: "Unsupported format" };
        }

        // Generate a unique name to avoid conflicts
        const uniqueName = `${crypto.randomUUID()}${ext}`;
        const sourcePath = join(CAROUSEL_SOURCE_DIR, uniqueName);

        // Save the original file to the source directory
        await mkdir(CAROUSEL_SOURCE_DIR, { recursive: true });
        await writeFile(sourcePath, buffer);

        // Process the image with sharp: rotate, resize to max 300px height, convert to WebP
        const imageData = await sharp(buffer)
          .rotate()
          .resize({ height: 300, withoutEnlargement: true })
          .webp({ quality: 75, effort: 4 })
          .toBuffer();

        // Add to database
        await prisma.carouselImage.upsert({
          where: { sourceName: uniqueName },
          create: {
            sourceName: uniqueName,
            sourceFingerprint: "",
            imageData,
            altText: "Xordium event photograph",
            sortOrder: 0,
          },
          update: {
            sourceFingerprint: "",
            imageData,
          },
        });

        return { success: true, name: originalName, savedName: uniqueName };
      })
    );

    const successful = results.filter((r) => r.success).length;
    return NextResponse.json({
      message: `${successful} of ${files.length} images uploaded successfully`,
      results,
    });
  } catch (error) {
    return safeServerError("Failed to upload carousel images:", error);
  }
}
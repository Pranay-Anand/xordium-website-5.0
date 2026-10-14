import { NextResponse } from "next/server";
import { getAdminSession } from "@/backend/lib/auth";
import { prisma } from "@/backend/lib/prisma";
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const CAROUSEL_SOURCE_DIR = join(process.cwd(), "public", "carousel");

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role !== "OWNER") {
      return NextResponse.json({ error: "Forbidden: Owner only" }, { status: 403 });
    }

    const data = await request.formData();
    const files = data.getAll("images") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No images provided" }, { status: 400 });
    }

    const supportedExtensions = new Set([
      ".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp",
    ]);

    const results = await Promise.all(
      files.map(async (file) => {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const originalName = file.name;
        const ext = originalName.slice(originalName.lastIndexOf(".")).toLowerCase();

        if (!supportedExtensions.has(ext)) {
          return { success: false, name: originalName, error: "Unsupported format" };
        }

        const webpName = `${originalName.replace(/\.[^.]+$/, '')}.webp`;
        const sourcePath = join(CAROUSEL_SOURCE_DIR, webpName);

        await mkdir(CAROUSEL_SOURCE_DIR, { recursive: true });

        const imageData = await sharp(buffer)
          .rotate()
          .webp({ quality: 85, effort: 4 })
          .toBuffer();

        await writeFile(sourcePath, imageData);

        await prisma.carouselImage.upsert({
          where: { sourceName: webpName },
          create: {
            sourceName: webpName,
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

        return { success: true, name: originalName, savedName: webpName };
      })
    );

    const successful = results.filter((r) => r.success).length;
    return NextResponse.json({
      message: `${successful} of ${files.length} images uploaded successfully`,
      results,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload carousel images" },
      { status: 500 }
    );
  }
}
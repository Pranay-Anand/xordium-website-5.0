import { NextResponse } from "next/server";
import { safeServerError } from "@/backend/lib/api";
import { prisma } from "@/backend/lib/prisma";
import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const IMAGE_EXTENSIONS = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp"]);
const SOURCE_DIRECTORY = join(process.cwd(), "src", "frontend", "carousel-source");

export const dynamic = "force-dynamic";

async function syncLocalCarouselImages() {
  const files = await readdir(SOURCE_DIRECTORY).catch(() => [] as string[]);

  await Promise.all(
    files
      .filter((file) => IMAGE_EXTENSIONS.has(file.slice(file.lastIndexOf(".")).toLowerCase()))
      .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }))
      .map(async (sourceName, sortOrder) => {
        const sourcePath = join(SOURCE_DIRECTORY, sourceName);
        const sourceStats = await stat(sourcePath);
        const sourceFingerprint = `${sourceStats.size}-${sourceStats.mtimeMs}`;
        const existing = await prisma.carouselImage.findUnique({
          where: { sourceName },
          select: { sourceFingerprint: true },
        });

        if (existing?.sourceFingerprint === sourceFingerprint) {
          await prisma.carouselImage.update({ where: { sourceName }, data: { sortOrder } });
          return;
        }

        const imageData = await sharp(sourcePath)
          .rotate()
          .resize({ height: 300, withoutEnlargement: true })
          .webp({ quality: 75, effort: 4 })
          .toBuffer();

        await prisma.carouselImage.upsert({
          where: { sourceName },
          create: { sourceName, sourceFingerprint, imageData, sortOrder },
          update: { sourceFingerprint, imageData, sortOrder },
        });
      })
  );
}

// GET /api/carousel - public homepage carousel images
export async function GET() {
  try {
    await syncLocalCarouselImages();
    const images = await prisma.carouselImage.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { id: true, altText: true },
    });
    return NextResponse.json(images);
  } catch (error) {
    return safeServerError("Failed to fetch carousel images:", error);
  }
}

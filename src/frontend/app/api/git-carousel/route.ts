import { NextResponse } from "next/server";
import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";

const CAROUSEL_SOURCE_DIR = join(process.cwd(), "src", "frontend", "carousel-source");
const IMAGE_EXTENSIONS = new Set([
  ".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp",
]);

export async function GET() {
  try {
    const files = await readdir(CAROUSEL_SOURCE_DIR).catch(() => [] as string[]);

    const images = await Promise.all(
      files.map(async (file) => {
        const filePath = join(CAROUSEL_SOURCE_DIR, file);
        const stats = await stat(filePath).catch(() => null);
        if (!stats) return null;

        const ext = path.extname(file).toLowerCase();
        if (!IMAGE_EXTENSIONS.has(ext)) return null;

        // Determine the best image source: WebP first, then original
        const webpPath = `/api/carousel/image/${file.replace(/\.[^.]+$/, '')}-webp`;
        const originalPath = `/images/carousel/${file}`;

        return {
          id: file,
          altText: `Carousel image - ${file}`,
          // Use WebP if available, otherwise original
          // We'll detect this client-side by checking file existence
          sourceName: file,
        };
      })
    ).filter((img): img is NonNullable<typeof img> => img !== null);

    return NextResponse.json(images);
  } catch (error) {
    console.error("Failed to fetch git carousel images:", error);
    return NextResponse.json(
      { error: "Failed to load carousel images" },
      { status: 500 }
    );
  }
}

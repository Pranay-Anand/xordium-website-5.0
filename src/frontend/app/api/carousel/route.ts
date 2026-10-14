import { NextResponse } from "next/server";
import { readdir } from "node:fs/promises";
import { join } from "node:path";

const CAROUSEL_PUBLIC_DIR = join(process.cwd(), "public", "carousel");
const IMAGE_EXTENSIONS = new Set([
  ".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp",
]);

export async function GET() {
  try {
    const files = await readdir(CAROUSEL_PUBLIC_DIR).catch(() => [] as string[]);

    const images = files
      .filter((file) => {
        const ext = file.slice(file.lastIndexOf(".")).toLowerCase();
        return IMAGE_EXTENSIONS.has(ext);
      })
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .map((file) => ({
        id: file,
        altText: `Carousel image - ${file}`,
      }));

    return NextResponse.json(images);
  } catch (error) {
    console.error("Failed to fetch carousel images:", error);
    return NextResponse.json(
      { error: "Failed to load carousel images" },
      { status: 500 }
    );
  }
}
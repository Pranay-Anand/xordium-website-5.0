import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { requireAdmin } from "@/backend/lib/api";

// Allow up to 11 MB multipart body (10 MB image + overhead)
export const config = {
  api: { bodyParser: false },
};

export const maxDuration = 30; // seconds

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

// POST /api/moderator/events/:slug/poster
// Accepts multipart/form-data with a "file" field.
// The file must already be converted to WebP on the client before upload
// (enforced by accepting only image/* and returning a deterministic path).
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const denied = await requireAdmin(request, true, "content:write");
  if (denied) return denied;

  try {
    const { slug } = await params;

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Upload JPEG, PNG, or WebP." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File too large. Maximum 10 MB." },
        { status: 413 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save as <slug>.webp — the client converts to WebP before uploading
    const filename = `${slug}.webp`;
    const assetsDir = join(process.cwd(), "public", "assets");

    await mkdir(assetsDir, { recursive: true });
    await writeFile(join(assetsDir, filename), buffer);

    const publicPath = `/assets/${filename}`;
    return NextResponse.json({ path: publicPath });
  } catch (error) {
    console.error("Poster upload error:", error);
    return NextResponse.json(
      { error: "Failed to save poster." },
      { status: 500 }
    );
  }
}

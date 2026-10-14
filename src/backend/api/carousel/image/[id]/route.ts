import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const image = await prisma.carouselImage.findUnique({
    where: { id },
    select: { imageData: true },
  });

  if (!image) return new NextResponse(null, { status: 404 });

  return new NextResponse(image.imageData, {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}

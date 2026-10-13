import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/prisma";
import {
  inputErrorResponse,
  optionalText,
  optionalUrl,
  readJsonObject,
  requireAdmin,
  safeServerError,
} from "@/backend/lib/api";

// PUT /api/moderator/events/:slug - update description/poster (moderator+)
export async function PUT(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const denied = await requireAdmin(request, true, "content:write");
  if (denied) return denied;

  try {
    const { slug } = await params;
    const body = await readJsonObject(request, 16_384);

    const description = optionalText(body.description, "Description", 8_000);
    const posterUrl = optionalUrl(body.posterUrl, "Poster URL");

    const existing = await prisma.event.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    const updated = await prisma.event.update({
      where: { slug },
      data: {
        ...(description !== null && { description }),
        ...(posterUrl !== null && { posterUrl }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    const inputResponse = inputErrorResponse(error);
    if (inputResponse) return inputResponse;
    return safeServerError("Failed to update event:", error);
  }
}

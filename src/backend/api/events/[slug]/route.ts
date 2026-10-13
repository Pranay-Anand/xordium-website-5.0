import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/prisma";
import { safeServerError } from "@/backend/lib/api";

// GET /api/events/:slug - single event (public)
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    const event = await prisma.event.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        tag: true,
        title: true,
        category: true,
        description: true,
        image: true,
        prizePool: true,
        venue: true,
        format: true,
        schedule: true,
        teamSize: true,
        cta: true,
        featured: true,
        createdAt: true,
        posterUrl: true,
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    return safeServerError("Failed to fetch event:", error);
  }
}

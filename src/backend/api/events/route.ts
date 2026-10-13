import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/prisma";
import { safeServerError } from "@/backend/lib/api";

// GET /api/events - list all events (public)
export async function GET() {
  try {
    const events = await prisma.event.findMany({
      select: {
        id: true,
        slug: true,
        tag: true,
        title: true,
        category: true,
        prizePool: true,
        venue: true,
        format: true,
        schedule: true,
        featured: true,
        createdAt: true,
        posterUrl: true,
      },
      orderBy: [{ featured: "desc" }, { title: "asc" }],
    });

    return NextResponse.json(events);
  } catch (error) {
    return safeServerError("Failed to fetch events:", error);
  }
}

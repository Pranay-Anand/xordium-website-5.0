import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/prisma";
import { requireAdmin, safeServerError } from "@/backend/lib/api";

// GET /api/moderator/events - list featured events (moderator+)
export async function GET(request: Request) {
  const denied = await requireAdmin(request, true, "content:read");
  if (denied) return denied;

  try {
    const events = await prisma.event.findMany({
      where: { featured: true },
      orderBy: { title: "asc" },
    });

    return NextResponse.json(events);
  } catch (error) {
    return safeServerError("Failed to fetch events:", error);
  }
}

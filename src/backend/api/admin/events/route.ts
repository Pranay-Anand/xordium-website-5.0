import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/prisma";
import { requireAdmin, safeServerError } from "@/backend/lib/api";

// GET /api/admin/events - list all events (owner only) with featured first, sorted by date
export async function GET(request: Request) {
  const denied = await requireAdmin(request, true, "users:manage");
  if (denied) return denied;

  try {
    const events = await prisma.event.findMany({
      orderBy: [
        { featured: "desc" }, // featured first
        { createdAt: "asc" }, // then by creation date (oldest first)
      ],
    });

    return NextResponse.json(events);
  } catch (error) {
    return safeServerError("Failed to fetch events:", error);
  }
}

// DELETE /api/admin/events - delete event (owner only)
export async function DELETE(request: Request) {
  const denied = await requireAdmin(request, true, "users:manage");
  if (denied) return denied;

  try {
    const body = await request.json();
    const { slug } = body;

    if (!slug) {
      return NextResponse.json({ error: "Event slug is required." }, { status: 400 });
    }

    const existing = await prisma.event.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    await prisma.event.delete({
      where: { slug },
    });

    return NextResponse.json({ message: "Event deleted successfully." });
  } catch (error) {
    return safeServerError("Failed to delete event:", error);
  }
}
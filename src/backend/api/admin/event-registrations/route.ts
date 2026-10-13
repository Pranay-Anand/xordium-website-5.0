import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/prisma";
import { requireAdmin, safeServerError } from "@/backend/lib/api";

// GET /api/admin/event-registrations - list event registrations (owner/admin)
export async function GET(request: Request) {
  const denied = await requireAdmin(request, false, "registrations:read");
  if (denied) return denied;

  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    const registrations = await prisma.eventRegistration.findMany({
      where: eventId ? { eventId } : {},
      orderBy: { createdAt: "desc" },
      take: 5000,
    });

    return NextResponse.json(registrations);
  } catch (error) {
    return safeServerError("Failed to fetch registrations:", error);
  }
}

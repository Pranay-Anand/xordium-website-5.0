import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/prisma";
import {
  inputErrorResponse,
  isCrossOriginRequest,
  optionalText,
  readJsonObject,
  requireAdmin,
  requiredText,
  requestIdentifier,
  safeServerError,
} from "@/backend/lib/api";
import { checkRateLimit } from "@/backend/lib/rateLimit";

// GET /api/support - list registrations (admin+)
export async function GET(request: Request) {
  const denied = await requireAdmin(request, true, "registrations:read");
  if (denied) return denied;

  try {
    const registrations = await prisma.registration.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        eventId: true,
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json(registrations);
  } catch (error) {
    return safeServerError("Failed to fetch registrations:", error);
  }
}

// POST /api/support - register for an event (public)
export async function POST(request: Request) {
  if (isCrossOriginRequest(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const limit = checkRateLimit(`register:${requestIdentifier(request)}`, 5, 60_000);
    if (!limit.success) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again shortly." },
        { status: 429 }
      );
    }

    const body = await readJsonObject(request, 4_096);
    const email = requiredText(body.email, "Email", 254).toLowerCase();
    const eventSlug = requiredText(body.eventSlug, "Event", 200);

    if (!email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: { slug: eventSlug },
      select: { id: true },
    });
    if (!event) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    const existing = await prisma.registration.findFirst({
      where: { eventId: event.id, email },
    });
    if (existing) {
      return NextResponse.json(
        { error: "You are already registered for this event." },
        { status: 409 }
      );
    }

    const name = optionalText(body.name, "Name", 100);

    const registration = await prisma.registration.create({
      data: { eventId: event.id, email, name },
      select: { id: true, email: true, name: true, createdAt: true, eventId: true },
    });

    return NextResponse.json(registration, { status: 201 });
  } catch (error) {
    const inputResponse = inputErrorResponse(error);
    if (inputResponse) return inputResponse;
    return safeServerError("Failed to process registration:", error);
  }
}

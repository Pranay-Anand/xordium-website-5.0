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

// GET /api/support - list support messages (admin+)
export async function GET(request: Request) {
  const denied = await requireAdmin(request, true, "registrations:read");
  if (denied) return denied;

  try {
    const messages = await prisma.supportMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json(messages);
  } catch (error) {
    return safeServerError("Failed to fetch support messages:", error);
  }
}

// POST /api/support - submit support message (public)
export async function POST(request: Request) {
  if (isCrossOriginRequest(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const limit = checkRateLimit(`support:${requestIdentifier(request)}`, 10, 60_000);
    if (!limit.success) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again shortly." },
        { status: 429 }
      );
    }

    const body = await readJsonObject(request, 8_192);
    const name = requiredText(body.name, "Name", 100);
    const email = requiredText(body.email, "Email", 254).toLowerCase();
    const topic = requiredText(body.topic, "Topic", 50);
    const game = optionalText(body.game, "Game", 50);
    const message = requiredText(body.message, "Message", 5000);

    if (!email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const supportMessage = await prisma.supportMessage.create({
      data: { name, email, topic, game, message },
      select: { id: true, email: true, name: true, topic: true, game: true, createdAt: true },
    });

    // Generate a dispatch ID
    const dispatchId = `XRD-${Date.now().toString(36).toUpperCase()}-${supportMessage.id.slice(0, 6).toUpperCase()}`;

    return NextResponse.json(
      { 
        success: true, 
        dispatchId,
        notificationSent: false 
      }, 
      { status: 201 }
    );
  } catch (error) {
    const inputResponse = inputErrorResponse(error);
    if (inputResponse) return inputResponse;
    return safeServerError("Failed to process support message:", error);
  }
}
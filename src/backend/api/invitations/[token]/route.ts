import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/prisma";
import { safeServerError } from "@/backend/lib/api";

// GET /api/invitations/:token - validate an invitation token (public)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    if (!token || token.length < 16 || token.length > 128) {
      return NextResponse.json({ error: "Invalid invitation link." }, { status: 400 });
    }

    const invitation = await prisma.invitation.findUnique({
      where: { token },
      select: { email: true, role: true, expiresAt: true, acceptedAt: true },
    });

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found." }, { status: 404 });
    }
    if (invitation.acceptedAt) {
      return NextResponse.json(
        { error: "This invitation has already been used." },
        { status: 410 }
      );
    }
    if (invitation.expiresAt.getTime() <= Date.now()) {
      return NextResponse.json(
        { error: "This invitation has expired. Ask for a new one." },
        { status: 410 }
      );
    }

    return NextResponse.json({
      email: invitation.email,
      role: invitation.role,
      expiresAt: invitation.expiresAt,
    });
  } catch (error) {
    return safeServerError("Failed to validate invitation:", error);
  }
}

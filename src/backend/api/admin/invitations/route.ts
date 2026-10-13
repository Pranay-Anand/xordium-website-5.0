import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { prisma } from "@/backend/lib/prisma";
import { getAdminSession, isAdminRole } from "@/backend/lib/auth";
import { invitationUrl, renderInvitationEmail, sendEmail } from "@/backend/lib/email";
import { checkPersistentRateLimit } from "@/backend/lib/rateLimit";
import {
  inputErrorResponse,
  readJsonObject,
  requireAdmin,
  requiredText,
  requestIdentifier,
  safeServerError,
} from "@/backend/lib/api";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INVITE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// GET /api/admin/invitations - list invitations (owner/admin)
export async function GET(request: Request) {
  const denied = await requireAdmin(request, true, "users:manage");
  if (denied) return denied;

  try {
    const session = await getAdminSession();
    // Admins may only see invitations they themselves sent.
    const invitations = await prisma.invitation.findMany({
      where: session?.role === "OWNER" ? {} : { invitedById: session!.id },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        email: true,
        role: true,
        expiresAt: true,
        acceptedAt: true,
        createdAt: true,
        invitedBy: { select: { email: true } },
      },
    });

    return NextResponse.json(invitations);
  } catch (error) {
    return safeServerError("Failed to fetch invitations:", error);
  }
}

// POST /api/admin/invitations - create an invitation and email a setup link
export async function POST(request: Request) {
  const denied = await requireAdmin(request, true, "users:manage");
  if (denied) return denied;

  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limit = await checkPersistentRateLimit(
      `invite-create:${requestIdentifier(request)}`,
      30,
      15 * 60_000
    );
    if (!limit.success) {
      return NextResponse.json(
        { error: "Too many invitations sent. Please try again later." },
        { status: 429 }
      );
    }

    const body = await readJsonObject(request, 2_048);
    const email = requiredText(body.email, "Email", 254).toLowerCase();
    const role = requiredText(body.role, "Role", 20).toUpperCase();

    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }
    if (!isAdminRole(role) || role === "OWNER") {
      return NextResponse.json({ error: "Role must be ADMIN or MODERATOR." }, { status: 400 });
    }
    // Only the owner may invite admins.
    if (role === "ADMIN" && session.role !== "OWNER") {
      return NextResponse.json(
        { error: "Only the owner can invite admins." },
        { status: 403 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists." },
        { status: 409 }
      );
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + INVITE_TTL_MS);

    // Reuse any pending invitation for this email so we don't pile up rows.
    const pending = await prisma.invitation.findFirst({
      where: { email, acceptedAt: null, expiresAt: { gt: new Date() } },
      select: { id: true },
    });

    const invitation = await prisma.invitation.upsert({
      where: pending ? { id: pending.id } : { token },
      create: {
        email,
        role,
        token,
        invitedById: session.id,
        expiresAt,
      },
      update: {
        role,
        token,
        invitedById: session.id,
        expiresAt,
        acceptedAt: null,
      },
      select: {
        id: true,
        email: true,
        role: true,
        expiresAt: true,
        token: true,
      },
    });

    const url = invitationUrl(invitation.token);
    const { subject, html, text } = renderInvitationEmail({
      email,
      role,
      inviteUrl: url,
      inviterName: session.name || session.email,
      expiresAt: invitation.expiresAt,
    });
    const emailResult = await sendEmail({ to: email, subject, html, text });

    const { token: _omit, ...safeInvitation } = invitation;

    return NextResponse.json(
      {
        success: true,
        invitation: safeInvitation,
        inviteUrl: url,
        emailSent: emailResult.ok,
        emailError: emailResult.ok ? undefined : emailResult.error,
      },
      { status: 201 }
    );
  } catch (error) {
    const inputResponse = inputErrorResponse(error);
    if (inputResponse) return inputResponse;
    return safeServerError("Failed to create invitation:", error);
  }
}

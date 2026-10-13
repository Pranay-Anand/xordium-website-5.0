import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/backend/lib/prisma";
import { hashPassword } from "@/backend/lib/auth";
import { checkPersistentRateLimit } from "@/backend/lib/rateLimit";
import {
  ApiInputError,
  inputErrorResponse,
  isCrossOriginRequest,
  readJsonObject,
  requiredPassword,
  requiredText,
  requestIdentifier,
  safeServerError,
} from "@/backend/lib/api";

// Roll number format, e.g. BTECH/150101/22
const ROLL_NO_PATTERN = /^BTECH\/\d+\/\d+$/i;
const USERNAME_PATTERN = /^[a-z0-9_.]{3,32}$/;

// POST /api/invitations/:token/accept - set up the invited account (public)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  if (isCrossOriginRequest(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const limit = await checkPersistentRateLimit(
      `invite-accept:${requestIdentifier(request)}`,
      10,
      15 * 60_000
    );
    if (!limit.success) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 }
      );
    }

    const { token } = await params;
    if (!token || token.length < 16 || token.length > 128) {
      return NextResponse.json({ error: "Invalid invitation link." }, { status: 400 });
    }

    const invitation = await prisma.invitation.findUnique({
      where: { token },
      select: { id: true, email: true, role: true, expiresAt: true, acceptedAt: true },
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

    const body = await readJsonObject(request, 4_096);

    const name = requiredText(body.name, "Name", 100);
    const password = requiredPassword(body.password);

    const rawRollNo = requiredText(body.rollNo, "Roll number", 30).toUpperCase();
    if (!ROLL_NO_PATTERN.test(rawRollNo)) {
      throw new ApiInputError(
        "Roll number must look like BTECH/150101/22."
      );
    }

    const username = requiredText(body.username, "Username", 32).toLowerCase();
    if (!USERNAME_PATTERN.test(username)) {
      throw new ApiInputError(
        "Username must be 3-32 characters: lowercase letters, numbers, _ or ."
      );
    }

    // Guard against collisions before insert.
    const [emailTaken, usernameTaken, rollTaken] = await Promise.all([
      prisma.user.findUnique({ where: { email: invitation.email }, select: { id: true } }),
      prisma.user.findUnique({ where: { username }, select: { id: true } }),
      prisma.user.findUnique({ where: { rollNo: rawRollNo }, select: { id: true } }),
    ]);
    if (emailTaken) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }
    if (usernameTaken) {
      return NextResponse.json(
        { error: "That username is already taken." },
        { status: 409 }
      );
    }
    if (rollTaken) {
      return NextResponse.json(
        { error: "That roll number is already registered." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    try {
      // Create the account and burn the invitation atomically.
      await prisma.$transaction([
        prisma.user.create({
          data: {
            email: invitation.email,
            name,
            username,
            rollNo: rawRollNo,
            password: passwordHash,
            role: invitation.role,
            isActive: true,
            mustSetPassword: false,
          },
          select: { id: true, email: true, username: true, role: true },
        }),
        prisma.invitation.update({
          where: { id: invitation.id },
          data: { acceptedAt: new Date() },
        }),
      ]);
    } catch (error) {
      // Unique-constraint race (username/rollNo taken between check and insert).
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const target = (error.meta?.target as string[] | undefined) ?? [];
        const field = target.includes("username")
          ? "username"
          : target.includes("rollNo")
          ? "roll number"
          : target.includes("email")
          ? "email"
          : "field";
        return NextResponse.json(
          { error: `That ${field} is already taken.` },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      user: { email: invitation.email, username, role: invitation.role },
    });
  } catch (error) {
    const inputResponse = inputErrorResponse(error);
    if (inputResponse) return inputResponse;
    return safeServerError("Failed to set up account:", error);
  }
}

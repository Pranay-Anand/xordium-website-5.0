import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/prisma";
import { hashPassword, verifyPassword, clearAdminSessionCookie, getAdminSession } from "@/backend/lib/auth";
import { checkPersistentRateLimit } from "@/backend/lib/rateLimit";
import {
  inputErrorResponse,
  isCrossOriginRequest,
  readJsonObject,
  requiredPassword,
  requestIdentifier,
  safeServerError,
} from "@/backend/lib/api";

export async function POST(request: Request) {
  if (isCrossOriginRequest(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limit = await checkPersistentRateLimit(
      `password-change:${requestIdentifier(request)}`,
      10,
      15 * 60_000
    );
    if (!limit.success) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await readJsonObject(request, 2_048);
    const currentPassword = requiredPassword(body.currentPassword, "Current password");
    const newPassword = requiredPassword(body.newPassword, "New password");

    if (newPassword === currentPassword) {
      return NextResponse.json(
        { error: "New password must differ from current password." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const valid = await verifyPassword(currentPassword, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
    }

    const passwordHash = await hashPassword(newPassword);
    // Bumping authVersion invalidates every other outstanding session token
    await prisma.user.update({
      where: { id: user.id },
      data: { password: passwordHash, mustSetPassword: false, authVersion: { increment: 1 } },
    });

    await clearAdminSessionCookie();

    return NextResponse.json({
      success: true,
      message: "Password updated. Please sign in again.",
    });
  } catch (error) {
    const inputResponse = inputErrorResponse(error);
    if (inputResponse) return inputResponse;
    return safeServerError("Password change failed:", error);
  }
}

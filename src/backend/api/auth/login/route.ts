import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/prisma";
import { verifyPassword, createAdminToken, isAdminRole, setAdminSessionCookie } from "@/backend/lib/auth";
import { checkPersistentRateLimit } from "@/backend/lib/rateLimit";
import { createHash } from "node:crypto";
import {
  inputErrorResponse,
  isCrossOriginRequest,
  readJsonObject,
  requiredPassword,
  requiredText,
  requestIdentifier,
  safeServerError,
} from "@/backend/lib/api";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Used to equalize timing when the account does not exist
const DUMMY_PASSWORD_HASH = "$2b$10$5HPkhMnvfP7vmjg/cGH22eUxYETRT46rbWNbpJR.qIMMXEw/oYzvO";

export async function POST(request: Request) {
  if (isCrossOriginRequest(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const ipLimit = await checkPersistentRateLimit(
      `login-ip:${requestIdentifier(request)}`,
      20,
      15 * 60_000
    );
    if (!ipLimit.success) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await readJsonObject(request, 2_048);
    const email = requiredText(body.email, "Email", 254).toLowerCase();
    const emailKey = createHash("sha256").update(email).digest("hex");
    const accountLimit = await checkPersistentRateLimit(
      `login-account:${emailKey}`,
      10,
      15 * 60_000
    );
    if (!accountLimit.success) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429 }
      );
    }

    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const password = requiredPassword(body.password);

    const user = await prisma.user.findUnique({ where: { email } });
    // Verify against a dummy hash when the user is missing to avoid timing leaks
    const valid = await verifyPassword(password, user?.password ?? DUMMY_PASSWORD_HASH);
    if (!valid || !user || !user.isActive || user.mustSetPassword || !isAdminRole(user.role)) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const token = await createAdminToken({
      id: user.id,
      email: user.email,
      role: user.role,
      authVersion: user.authVersion,
    });
    await setAdminSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    const inputResponse = inputErrorResponse(error);
    if (inputResponse) return inputResponse;
    return safeServerError("Admin login failed:", error);
  }
}

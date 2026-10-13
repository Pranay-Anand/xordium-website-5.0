import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/prisma";
import { hashPassword, isAdminRole } from "@/backend/lib/auth";
import {
  inputErrorResponse,
  readJsonObject,
  requiredPassword,
  requiredText,
  safeServerError,
} from "@/backend/lib/api";
import { requireAdmin } from "@/backend/lib/api";

// GET /api/admin/users - list all users (owner only)
export async function GET(request: Request) {
  const denied = await requireAdmin(request, true, "users:manage");
  if (denied) return denied;

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    return safeServerError("Failed to fetch users:", error);
  }
}

// POST /api/admin/users - create new admin/moderator (owner only)
export async function POST(request: Request) {
  const denied = await requireAdmin(request, true, "users:manage");
  if (denied) return denied;

  try {
    const body = await readJsonObject(request, 4_096);
    const email = requiredText(body.email, "Email", 254).toLowerCase();
    const name = requiredText(body.name, "Name", 100);
    const password = requiredPassword(body.password);
    const role = requiredText(body.role, "Role", 20).toUpperCase();

    if (!isAdminRole(role) || role === "OWNER") {
      return NextResponse.json(
        { error: "Role must be ADMIN or MODERATOR." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "A user with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, name, password: passwordHash, role },
      select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
    });

    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (error) {
    const inputResponse = inputErrorResponse(error);
    if (inputResponse) return inputResponse;
    return safeServerError("Failed to create user:", error);
  }
}

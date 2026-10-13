import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/prisma";
import { getAdminSession } from "@/backend/lib/auth";
import {
  inputErrorResponse,
  readJsonObject,
  requireAdmin,
  requiredText,
  safeServerError,
} from "@/backend/lib/api";

// POST /api/admin/moderators/promote - change a user's role (owner/admin)
export async function POST(request: Request) {
  const denied = await requireAdmin(request, true, "users:manage");
  if (denied) return denied;

  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await readJsonObject(request, 2_048);
    const targetUserId = requiredText(body.targetUserId, "Target user ID", 64);
    const newRole = requiredText(body.role, "Role", 20).toUpperCase();

    // Nobody can change their own role
    if (targetUserId === session.id) {
      return NextResponse.json(
        { error: "You cannot change your own role." },
        { status: 403 }
      );
    }

    if (newRole !== "ADMIN" && newRole !== "MODERATOR") {
      return NextResponse.json(
        { error: "Role must be ADMIN or MODERATOR." },
        { status: 400 }
      );
    }

    const target = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, role: true },
    });
    if (!target) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Only the OWNER may grant or revoke the ADMIN role
    if (session.role !== "OWNER" && (newRole === "ADMIN" || target.role === "ADMIN")) {
      return NextResponse.json(
        { error: "Only the owner can manage admin roles." },
        { status: 403 }
      );
    }

    // The OWNER account itself is immutable
    if (target.role === "OWNER") {
      return NextResponse.json({ error: "The owner role cannot be changed." }, { status: 403 });
    }

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
      select: { id: true, email: true, name: true, role: true, isActive: true },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    const inputResponse = inputErrorResponse(error);
    if (inputResponse) return inputResponse;
    return safeServerError("Failed to update role:", error);
  }
}

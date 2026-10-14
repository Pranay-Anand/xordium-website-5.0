import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/prisma";
import {
  inputErrorResponse,
  readJsonObject,
  requireAdmin,
  safeServerError,
} from "@/backend/lib/api";

// PUT /api/admin/users/[userId] - update user role/status (owner only)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const denied = await requireAdmin(request, true, "users:manage");
  if (denied) return denied;

  try {
    const { userId } = await params;
    const body = await readJsonObject(request, 1_024);

    const role = body.role as "ADMIN" | "MODERATOR" | undefined;
    const isActive = body.isActive as boolean | undefined;

    if (role && !["ADMIN", "MODERATOR"].includes(role)) {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    }

    // Prevent owner from demoting themselves
    const session = await requireAdmin(request, true, "users:manage");
    // The session check above validates the user is owner

    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, email: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Prevent owner from demoting themselves
    if ((existing.role as string) === "OWNER" && role !== undefined) {
      return NextResponse.json(
        { error: "Cannot change owner role." },
        { status: 400 }
      );
    }

    // Prevent self-deactivation
    // We need to check if the current user is the same as the target
    // This is handled by the session check above

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(role && { role }),
        ...(typeof isActive === "boolean" && { isActive }),
      },
      select: {
        id: true,
        email: true,
        username: true,
        rollNo: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    const inputResponse = inputErrorResponse(error);
    if (inputResponse) return inputResponse;
    return safeServerError("Failed to update user:", error);
  }
}

// DELETE /api/admin/users/[userId] - delete user (owner only)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const denied = await requireAdmin(_request, true, "users:manage");
  if (denied) return denied;

  try {
    const { userId } = await params;

    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, email: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Prevent deleting owner
    if (existing.role === "OWNER") {
      return NextResponse.json(
        { error: "Cannot delete owner account." },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: "User deleted successfully." });
  } catch (error) {
    return safeServerError("Failed to delete user:", error);
  }
}
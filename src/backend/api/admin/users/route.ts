import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/prisma";
import { requireAdmin, safeServerError } from "@/backend/lib/api";

// GET /api/admin/users - list all users (owner only)
// Accounts are created via the invitation flow (see /api/admin/invitations).
export async function GET(request: Request) {
  const denied = await requireAdmin(request, true, "users:manage");
  if (denied) return denied;

  try {
    const users = await prisma.user.findMany({
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
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    return safeServerError("Failed to fetch users:", error);
  }
}

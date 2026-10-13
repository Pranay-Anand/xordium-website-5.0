import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/prisma";
import { requireAdmin, safeServerError } from "@/backend/lib/api";

// GET /api/admin/moderators - list all moderators (admin+)
export async function GET(request: Request) {
  const denied = await requireAdmin(request, true, "content:read");
  if (denied) return denied;

  try {
    const moderators = await prisma.user.findMany({
      where: { role: "MODERATOR" },
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

    return NextResponse.json(moderators);
  } catch (error) {
    return safeServerError("Failed to fetch moderators:", error);
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/prisma";
import { requireAdmin, safeServerError } from "@/backend/lib/api";

// GET /api/admin/support - list support messages (admin+)
export async function GET(request: Request) {
  const denied = await requireAdmin(request, true, "registrations:read");
  if (denied) return denied;

  try {
    const messages = await prisma.supportMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json(messages);
  } catch (error) {
    return safeServerError("Failed to fetch support messages:", error);
  }
}
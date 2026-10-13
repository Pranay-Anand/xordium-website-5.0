import { NextResponse } from "next/server";
import { requireAdmin, safeServerError } from "@/backend/lib/api";
import { getAdminSession } from "@/backend/lib/auth";

export async function GET(request: Request) {
  try {
    const denied = await requireAdmin(request);
    if (denied) return denied;

    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: session.id,
        email: session.email,
        name: session.name,
        role: session.role,
      },
    });
  } catch (error) {
    return safeServerError("Failed to load session:", error);
  }
}

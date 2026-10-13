import { NextResponse } from "next/server";
import { clearAdminSessionCookie } from "@/backend/lib/auth";
import { isCrossOriginRequest, safeServerError } from "@/backend/lib/api";

export async function POST(request: Request) {
  if (isCrossOriginRequest(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await clearAdminSessionCookie();
    return NextResponse.json({ success: true });
  } catch (error) {
    return safeServerError("Admin logout failed:", error);
  }
}

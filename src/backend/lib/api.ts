import { NextResponse } from "next/server";
import { getAdminSession } from "@/backend/lib/auth";
import type { AdminRole } from "@/backend/lib/auth";

export class ApiInputError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
  }
}

export async function readJsonObject(
  request: Request,
  maxBytes = 16_384
): Promise<Record<string, unknown>> {
  const contentType = request.headers.get("content-type")?.split(";")[0].trim();
  if (contentType !== "application/json") {
    throw new ApiInputError("Content-Type must be application/json.", 415);
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    throw new ApiInputError("Request body is too large.", 413);
  }

  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > maxBytes) {
    throw new ApiInputError("Request body is too large.", 413);
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    throw new ApiInputError("Request body must be valid JSON.");
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ApiInputError("Request body must be a JSON object.");
  }

  return body as Record<string, unknown>;
}

export function requiredText(value: unknown, field: string, maxLength = 200): string {
  if (typeof value !== "string") {
    throw new ApiInputError(`${field} is required.`);
  }
  const result = value.trim();
  if (!result || result.length > maxLength) {
    throw new ApiInputError(`${field} must be between 1 and ${maxLength} characters.`);
  }
  return result.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
}

export function optionalText(
  value: unknown,
  field: string,
  maxLength = 5000
): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" || value.trim().length > maxLength) {
    throw new ApiInputError(`${field} must be at most ${maxLength} characters.`);
  }
  return value.trim().replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
}

export function requiredPassword(value: unknown, field = "Password"): string {
  if (typeof value !== "string" || value.length < 8 || Buffer.byteLength(value, "utf8") > 72) {
    throw new ApiInputError(`${field} must be between 8 and 72 bytes.`);
  }
  return value;
}

export function optionalUrl(value: unknown, field: string): string | null {
  const raw = optionalText(value, field, 2048);
  if (raw === null) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error();
    return url.toString();
  } catch {
    throw new ApiInputError(`${field} must be a valid HTTP or HTTPS URL.`);
  }
}

// ═══════════════════════════════════════════════════════════════
// ROLE-BASED ACCESS CONTROL: OWNER > ADMIN > MODERATOR
// ═══════════════════════════════════════════════════════════════

export type AdminPermission =
  | "content:read"
  | "content:write"
  | "users:manage"
  | "registrations:read";

const ROLE_PERMISSIONS: Record<AdminRole, readonly AdminPermission[]> = {
  OWNER: ["content:read", "content:write", "users:manage", "registrations:read"],
  ADMIN: ["content:read", "content:write", "registrations:read"],
  MODERATOR: ["content:read", "content:write"],
};

export async function requireAdmin(
  request: Request,
  checkOrigin = false,
  permission: AdminPermission = "content:read"
) {
  if (checkOrigin && isCrossOriginRequest(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!ROLE_PERMISSIONS[session.role].includes(permission)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export function isCrossOriginRequest(request: Request) {
  if (request.headers.get("sec-fetch-site") === "cross-site") return true;
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const host = request.headers.get("host");
  if (!host) return true;
  try {
    return new URL(origin).host !== host;
  } catch {
    return true;
  }
}

export function inputErrorResponse(error: unknown) {
  if (error instanceof ApiInputError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  return null;
}

export function safeServerError(label: string, error: unknown) {
  console.error(label, error instanceof Error ? error.name : "Unknown error");
  return NextResponse.json({ error: "The request could not be completed." }, { status: 500 });
}

export function requestIdentifier(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const forwardedAddresses = forwardedFor?.split(",");
  const clientIp = forwardedAddresses?.at(-1)?.trim() || request.headers.get("x-real-ip");
  return clientIp && clientIp.length < 100 ? clientIp : "unknown";
}

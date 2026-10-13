import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/prisma";
import { requireAdmin, safeServerError } from "@/backend/lib/api";

// Quote a value for CSV, doubling internal quotes (RFC 4180).
function csvEscape(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  return /[",\n\r]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

// GET /api/admin/event-registrations/export - download registrations as CSV
export async function GET(request: Request) {
  const denied = await requireAdmin(request, false, "registrations:read");
  if (denied) return denied;

  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    const rows = await prisma.eventRegistration.findMany({
      where: eventId ? { eventId } : {},
      orderBy: { createdAt: "asc" },
    });

    const header = [
      "Registered At",
      "Event ID",
      "Event",
      "Team Name",
      "Team Size",
      "External Team",
      "Head Name",
      "Head Email",
      "Head Phone",
      "College",
      "Branch",
      "Year",
      "Roll Number",
      "Team Members",
      "Privacy Accepted",
    ];

    const lines = [header.map(csvEscape).join(",")];

    for (const row of rows) {
      const members = Array.isArray(row.teamMembers)
        ? (row.teamMembers as Array<Record<string, unknown>>)
        : [];
      const memberSummary = members
        .map((member) => `${String(member.name ?? "")} <${String(member.email ?? "")}>`)
        .join("; ");

      lines.push(
        [
          row.createdAt.toISOString(),
          row.eventId,
          row.eventName,
          row.teamName,
          String(members.length + 1),
          row.isExternalTeam ? "Yes" : "No",
          row.fullName,
          row.email,
          row.phone,
          row.collegeName,
          row.branch,
          row.year,
          row.rollNumber,
          memberSummary,
          "Yes",
        ]
          .map(csvEscape)
          .join(","),
      );
    }

    // UTF-8 BOM so Excel opens accented characters correctly.
    const csv = "\uFEFF" + lines.join("\r\n");
    const filename = eventId
      ? `event-registrations-${eventId}.csv`
      : "event-registrations.csv";

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return safeServerError("Failed to export registrations:", error);
  }
}

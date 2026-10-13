import { SITE_URL } from "@/backend/lib/site";

// Send transactional email via the Resend HTTP API.
// Uses fetch directly so we don't add an SDK dependency to the bundle.

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface SendEmailResult {
  ok: boolean;
  error?: string;
}

function getResendConfig(): { apiKey: string; from: string } | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  const from = process.env.RESEND_FROM || "Xordium Admin <onboarding@resend.dev>";
  return { apiKey, from };
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const config = getResendConfig();
  if (!config) {
    return { ok: false, error: "RESEND_API_KEY is not configured." };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: config.from,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
      // Don't let a slow Resend hang the caller (registrations, invites).
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      let message = `Resend returned ${response.status}`;
      try {
        const parsed = JSON.parse(detail);
        if (parsed?.message) message = parsed.message;
      } catch {
        if (detail) message = detail.slice(0, 200);
      }
      return { ok: false, error: message };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to reach Resend.",
    };
  }
}

const roleLabel: Record<string, string> = {
  ADMIN: "Administrator",
  MODERATOR: "Moderator",
};

export function renderInvitationEmail(params: {
  email: string;
  role: string;
  inviteUrl: string;
  inviterName: string;
  expiresAt: Date;
}): { subject: string; html: string; text: string } {
  const { email, role, inviteUrl, inviterName, expiresAt } = params;
  const label = roleLabel[role] ?? role;
  const expires = expiresAt.toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "UTC",
  });

  const subject = `You're invited to join Xordium 5.0 as ${label}`;
  const text = [
    `${inviterName} has invited you to join the Xordium 5.0 admin team as ${label}.`,
    "",
    `Set up your account (username, roll number, password):`,
    inviteUrl,
    "",
    `This link expires on ${expires} (UTC) and can only be used once.`,
    `This invitation was sent to ${email}.`,
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Xordium 5.0 Invitation</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Courier New',ui-monospace,monospace;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:520px;background:#111111;border:1px solid rgba(255,255,255,0.12);border-radius:6px;">
          <tr>
            <td style="padding:28px 32px;border-bottom:1px solid rgba(255,255,255,0.1);">
              <span style="font-size:18px;font-weight:bold;letter-spacing:0.2em;color:#ffffff;">XORDIUM</span>
              <span style="font-size:18px;font-weight:bold;letter-spacing:0.2em;color:#ef4444;"> 5.0</span>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px;">
              <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.2em;color:#9ca3af;text-transform:uppercase;">// ACCESS INVITATION</p>
              <h1 style="margin:0 0 20px;font-size:20px;line-height:1.4;color:#ffffff;font-weight:bold;">
                You've been invited as ${label}
              </h1>
              <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#d1d5db;">
                <strong style="color:#ffffff;">${inviterName}</strong> has invited
                <strong style="color:#ffffff;">${email}</strong> to join the Xordium 5.0
                admin team as <strong style="color:#ffffff;">${label}</strong>.
              </p>
              <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#d1d5db;">
                Use the button below to set up your account — you'll choose your
                username, roll number (e.g. BTECH/150101/22) and password.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0;">
                <tr>
                  <td style="background:#dc2626;border-radius:4px;">
                    <a href="${inviteUrl}" style="display:inline-block;padding:14px 28px;font-size:12px;font-weight:bold;letter-spacing:0.15em;color:#ffffff;text-decoration:none;text-transform:uppercase;">
                      SET UP ACCOUNT &rarr;
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#9ca3af;">
                If the button doesn't work, paste this link into your browser:
              </p>
              <p style="margin:8px 0 0;font-size:12px;word-break:break-all;">
                <a href="${inviteUrl}" style="color:#f87171;text-decoration:none;">${inviteUrl}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.1);">
              <p style="margin:0;font-size:11px;line-height:1.6;color:#6b7280;">
                This link expires on ${expires} (UTC) and can only be used once.
                If you weren't expecting this invitation, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html, text };
}

export function invitationUrl(token: string): string {
  return `${SITE_URL}/invite/${token}`;
}

// User-supplied values must be escaped before going into HTML email markup.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface ConfirmationMember {
  name: string;
  email: string;
  branch: string;
  year: string;
  phone: string;
}

// Congratulations email to the team leader summarising their registration.
export function renderRegistrationConfirmationEmail(params: {
  eventName: string;
  fullName: string;
  email: string;
  phone: string;
  collegeName: string;
  branch: string;
  year: string;
  rollNumber: string;
  teamName: string;
  teamMembers: ConfirmationMember[];
  isExternalTeam: boolean;
  registeredAt: Date;
}): { subject: string; html: string; text: string } {
  const {
    eventName,
    fullName,
    email,
    phone,
    collegeName,
    branch,
    year,
    rollNumber,
    teamName,
    teamMembers,
    isExternalTeam,
    registeredAt,
  } = params;

  const esc = escapeHtml;
  const registered = registeredAt.toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "UTC",
  });
  const teamSize = teamMembers.length + 1;
  const hasTeam = Boolean(teamName) || teamMembers.length > 0;

  // ---- plain text ----
  const textLines: string[] = [
    "Congratulations — you're registered for Xordium 5.0!",
    "",
    `Event: ${eventName}`,
    "",
    "Team leader:",
    `  Name:    ${fullName}`,
    `  Email:   ${email}`,
    `  Phone:   ${phone}`,
    `  College: ${collegeName}`,
    `  Branch:  ${branch}`,
    `  Year:    ${year}`,
    `  Roll no: ${rollNumber}`,
  ];
  if (hasTeam) {
    textLines.push("", `Team: ${teamName} (${teamSize} people)`);
    teamMembers.forEach((member, index) => {
      textLines.push(
        `  ${index + 1}. ${member.name} — ${member.email} — ${member.phone} — ${member.branch} — ${member.year}`,
      );
    });
  }
  if (isExternalTeam) {
    textLines.push("", "Team type: External (not from BIT)");
  }
  textLines.push(
    "",
    `Registered on ${registered} (UTC).`,
    "See you at the event — the Xordium 5.0 team.",
  );
  const text = textLines.join("\n");

  // ---- html ----
  const row = (label: string, value: string) => `
            <tr>
              <td style="padding:7px 0;font-size:11px;letter-spacing:0.12em;color:#9ca3af;text-transform:uppercase;width:120px;vertical-align:top;">${esc(label)}</td>
              <td style="padding:7px 0;font-size:13px;color:#ffffff;">${esc(value)}</td>
            </tr>`;

  const memberRows = teamMembers
    .map(
      (member, index) => `
            <tr>
              <td colspan="2" style="padding:8px 0;border-top:1px solid rgba(255,255,255,0.06);">
                <span style="font-size:13px;color:#ffffff;">${index + 1}. ${esc(member.name)}</span><br />
                <span style="font-size:12px;color:#9ca3af;">${esc(member.email)} &middot; ${esc(member.phone)} &middot; ${esc(member.branch)} &middot; ${esc(member.year)}</span>
              </td>
            </tr>`,
    )
    .join("");

  const teamSection = hasTeam
    ? `
          <tr>
            <td colspan="2" style="padding:18px 0 4px;border-top:1px solid rgba(255,255,255,0.1);">
              <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.2em;color:#22d3ee;text-transform:uppercase;">// Team &mdash; ${esc(teamName)} (${teamSize} people)</p>
            </td>
          </tr>${memberRows}`
    : "";

  const externalBadge = isExternalTeam
    ? `
          <tr>
            <td colspan="2" style="padding:14px 0 0;">
              <span style="display:inline-block;padding:4px 10px;font-size:11px;font-weight:bold;letter-spacing:0.1em;color:#fbbf24;background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.4);border-radius:4px;text-transform:uppercase;">External team (not from BIT)</span>
            </td>
          </tr>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Xordium 5.0 Registration</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Courier New',ui-monospace,monospace;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px;background:#111111;border:1px solid rgba(255,255,255,0.12);border-radius:6px;">
          <tr>
            <td style="padding:28px 32px;border-bottom:1px solid rgba(255,255,255,0.1);">
              <span style="font-size:18px;font-weight:bold;letter-spacing:0.2em;color:#ffffff;">XORDIUM</span>
              <span style="font-size:18px;font-weight:bold;letter-spacing:0.2em;color:#ef4444;"> 5.0</span>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px;">
              <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.2em;color:#4ade80;text-transform:uppercase;">// Registration confirmed</p>
              <h1 style="margin:0 0 6px;font-size:22px;line-height:1.3;color:#ffffff;font-weight:bold;">
                You&apos;re in, ${esc(fullName.split(" ")[0] || fullName)}!
              </h1>
              <p style="margin:0 0 22px;font-size:13px;line-height:1.6;color:#d1d5db;">
                Congratulations — your registration for <strong style="color:#ffffff;">${esc(eventName)}</strong> is confirmed.
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(255,255,255,0.1);">
                ${row("Event", eventName)}
                ${row("Team leader", fullName)}
                ${row("Email", email)}
                ${row("Phone", phone)}
                ${row("College", collegeName)}
                ${row("Branch", branch)}
                ${row("Year", year)}
                ${row("Roll no", rollNumber)}
                ${teamSection}
                ${externalBadge}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.1);">
              <p style="margin:0;font-size:11px;line-height:1.6;color:#6b7280;">
                Registered on ${esc(registered)} (UTC). Keep this email as your confirmation.
                See you at the event &mdash; the Xordium 5.0 team.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const subject = `You're registered for Xordium 5.0 — ${eventName}`;

  return { subject, html, text };
}
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
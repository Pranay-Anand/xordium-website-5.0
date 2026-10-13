import { prisma } from "@/backend/lib/prisma";
import { checkPersistentRateLimit } from "@/backend/lib/rateLimit";
import { renderRegistrationConfirmationEmail, sendEmail } from "@/backend/lib/email";
import {
  isCrossOriginRequest,
  requestIdentifier,
  safeServerError,
} from "@/backend/lib/api";
import {
  HACKATHON_EVENT_ID,
  isBitEmail,
  registrationEvents,
  requiresBitEmail,
} from "@/data/events";
import type {
  Branch,
  RegistrationSubmission,
  RegistrationTeamMember,
} from "@/types/registration";

const branches: Branch[] = [
  "CSE",
  "IT",
  "ECE",
  "EEE",
  "Mechanical",
  "Civil",
  "Other",
];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\d{10}$/;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isBranch(value: unknown): value is Branch {
  return typeof value === "string" && branches.includes(value as Branch);
}

type ValidationResult =
  | { submission: RegistrationSubmission }
  | { error: string };

function validateSubmission(value: unknown): ValidationResult {
  if (!isObject(value)) {
    return { error: "The registration data is not valid." };
  }

  const event = registrationEvents.find((item) => item.id === value.eventId);
  if (!event || value.eventName !== event.name) {
    return { error: "Choose a valid event to register for." };
  }

  // Only the hackathon carries an external-team declaration.
  const isExternalTeam =
    event.id === HACKATHON_EVENT_ID && value.isExternalTeam === true;
  const bitRequired = requiresBitEmail(event.id, isExternalTeam);

  if (
    !isText(value.fullName) ||
    !isText(value.email) ||
    !isText(value.phone) ||
    !isText(value.collegeName) ||
    !isBranch(value.branch) ||
    !isText(value.year) ||
    !isText(value.rollNumber) ||
    value.acceptedPrivacyPolicy !== true
  ) {
    return { error: "Some registration details are missing or invalid." };
  }

  const fullName = value.fullName.trim();
  const email = value.email.trim();
  const phone = value.phone.trim();
  const collegeName = value.collegeName.trim();
  const year = value.year.trim();
  const rollNumber = value.rollNumber.trim();

  if (!emailPattern.test(email) || !phonePattern.test(phone)) {
    return { error: "Enter a valid email address and 10-digit phone number." };
  }
  if (bitRequired && !isBitEmail(email)) {
    return {
      error: `Registrations require a college email ending in @bitmesra.ac.in.`,
    };
  }

  let teamMembers: RegistrationTeamMember[] = [];

  if (!event.allowTeamMembers) {
    if (
      value.teamName !== "" ||
      !Array.isArray(value.teamMembers) ||
      value.teamMembers.length > 0
    ) {
      return { error: "This event does not accept team members." };
    }
  } else {
    // The leader is part of the roster even though they are not in this array.
    if (
      !isText(value.teamName) ||
      !Array.isArray(value.teamMembers) ||
      value.teamMembers.length + 1 < event.minTeamSize ||
      value.teamMembers.length + 1 > event.maxTeamSize
    ) {
      return {
        error: `Teams for this event need ${event.minTeamSize}–${event.maxTeamSize} people.`,
      };
    }

    for (const memberValue of value.teamMembers) {
      if (
        !isObject(memberValue) ||
        !isText(memberValue.name) ||
        !isText(memberValue.email) ||
        !isBranch(memberValue.branch) ||
        !isText(memberValue.year) ||
        !isText(memberValue.phone)
      ) {
        return { error: "One of your team members is missing details." };
      }

      const memberEmail = memberValue.email.trim();
      if (!emailPattern.test(memberEmail) || !phonePattern.test(memberValue.phone.trim())) {
        return { error: "One of your team members has an invalid email or phone." };
      }
      if (bitRequired && !isBitEmail(memberEmail)) {
        return {
          error: `Every team member needs a college email ending in @bitmesra.ac.in.`,
        };
      }

      teamMembers.push({
        name: memberValue.name.trim(),
        email: memberEmail,
        branch: memberValue.branch,
        year: memberValue.year.trim(),
        phone: memberValue.phone.trim(),
      });
    }

    const allEmails = [email, ...teamMembers.map((member) => member.email)].map(
      (personEmail) => personEmail.toLowerCase(),
    );
    if (new Set(allEmails).size !== allEmails.length) {
      return { error: "Each person on the team must use a different email." };
    }
  }

  return {
    submission: {
      eventId: event.id,
      eventName: event.name,
      fullName,
      email,
      phone,
      collegeName,
      branch: value.branch,
      year,
      rollNumber,
      teamName: event.allowTeamMembers ? value.teamName.trim() : "",
      teamMembers,
      isExternalTeam,
      acceptedPrivacyPolicy: true,
    },
  };
}

export async function POST(request: Request) {
  if (isCrossOriginRequest(request)) {
    return Response.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const rate = await checkPersistentRateLimit(
    `register:${requestIdentifier(request)}`,
    20,
    60 * 60_000,
  ).catch(() => ({ success: true }));
  if (!rate.success) {
    return Response.json(
      { success: false, error: "Too many registrations. Please try again later." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { success: false, error: "The registration data is not valid JSON." },
      { status: 400 },
    );
  }

  const result = validateSubmission(body);
  if ("error" in result) {
    return Response.json(
      { success: false, error: result.error },
      { status: 400 },
    );
  }

  const submission = result.submission;

  try {
    await prisma.eventRegistration.create({
      data: {
        eventId: submission.eventId,
        eventName: submission.eventName,
        fullName: submission.fullName,
        email: submission.email,
        phone: submission.phone,
        collegeName: submission.collegeName,
        branch: submission.branch,
        year: submission.year,
        rollNumber: submission.rollNumber,
        teamName: submission.teamName,
        teamMembers: submission.teamMembers,
        isExternalTeam: submission.isExternalTeam,
      },
    });
  } catch (error) {
    return safeServerError("Failed to store registration:", error);
  }

  // Best-effort congratulations email to the team leader only.
  // A delivery problem must never fail an already-stored registration.
  try {
    const { subject, html, text } = renderRegistrationConfirmationEmail({
      eventName: submission.eventName,
      fullName: submission.fullName,
      email: submission.email,
      phone: submission.phone,
      collegeName: submission.collegeName,
      branch: submission.branch,
      year: submission.year,
      rollNumber: submission.rollNumber,
      teamName: submission.teamName,
      teamMembers: submission.teamMembers,
      isExternalTeam: submission.isExternalTeam,
      registeredAt: new Date(),
    });
    const sent = await sendEmail({ to: submission.email, subject, html, text });
    if (!sent.ok) {
      console.warn("Registration confirmation email failed:", sent.error);
    }
  } catch (error) {
    console.warn(
      "Registration confirmation email error:",
      error instanceof Error ? error.message : "unknown",
    );
  }

  return Response.json({ success: true });
}

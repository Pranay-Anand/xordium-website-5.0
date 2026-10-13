import { registrationEvents } from "@/data/events";
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

function validateSubmission(value: unknown): RegistrationSubmission | null {
  if (!isObject(value)) return null;

  const event = registrationEvents.find(
    (item) => item.id === value.eventId,
  );
  if (
    !event ||
    value.eventName !== event.name ||
    !isText(value.fullName) ||
    !isText(value.email) ||
    !isText(value.phone) ||
    !isText(value.collegeName) ||
    !isBranch(value.branch) ||
    !isText(value.year) ||
    !isText(value.rollNumber) ||
    value.acceptedPrivacyPolicy !== true
  ) {
    return null;
  }

  const fullName = value.fullName.trim();
  const email = value.email.trim();
  const phone = value.phone.trim();
  const collegeName = value.collegeName.trim();
  const year = value.year.trim();
  const rollNumber = value.rollNumber.trim();

  if (!emailPattern.test(email) || !phonePattern.test(phone)) return null;

  if (!event.allowTeamMembers) {
    if (
      value.teamName !== "" ||
      !Array.isArray(value.teamMembers) ||
      value.teamMembers.length > 0
    ) {
      return null;
    }

    return {
      eventId: event.id,
      eventName: event.name,
      fullName,
      email,
      phone,
      collegeName,
      branch: value.branch,
      year,
      rollNumber,
      teamName: "",
      teamMembers: [],
      acceptedPrivacyPolicy: true,
    };
  }

  // The leader is part of the roster even though they are not in this array.
  if (
    !isText(value.teamName) ||
    !Array.isArray(value.teamMembers) ||
    value.teamMembers.length + 1 < event.minTeamSize ||
    value.teamMembers.length + 1 > event.maxTeamSize
  ) {
    return null;
  }

  const teamMembers: RegistrationTeamMember[] = [];
  for (const memberValue of value.teamMembers) {
    if (
      !isObject(memberValue) ||
      !isText(memberValue.name) ||
      !isText(memberValue.email) ||
      !isBranch(memberValue.branch) ||
      !isText(memberValue.year) ||
      !isText(memberValue.phone)
    ) {
      return null;
    }

    const member = {
      name: memberValue.name.trim(),
      email: memberValue.email.trim(),
      branch: memberValue.branch,
      year: memberValue.year.trim(),
      phone: memberValue.phone.trim(),
    };
    if (!emailPattern.test(member.email) || !phonePattern.test(member.phone)) {
      return null;
    }
    teamMembers.push(member);
  }

  const allEmails = [email, ...teamMembers.map((member) => member.email)].map(
    (personEmail) => personEmail.toLowerCase(),
  );
  if (new Set(allEmails).size !== allEmails.length) return null;

  return {
    eventId: event.id,
    eventName: event.name,
    fullName,
    email,
    phone,
    collegeName,
    branch: value.branch,
    year,
    rollNumber,
    teamName: value.teamName.trim(),
    teamMembers,
    acceptedPrivacyPolicy: true,
  };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { success: false, error: "The registration data is not valid JSON." },
      { status: 400 },
    );
  }

  const submission = validateSubmission(body);
  if (!submission) {
    return Response.json(
      {
        success: false,
        error:
          "Some registration details are missing or invalid. Check the form and try again.",
      },
      { status: 400 },
    );
  }

  const registrationUrl = process.env.REGISTRATION_URL;
  if (!registrationUrl) {
    return Response.json(
      {
        success: false,
        error:
          "Registration is not configured yet. Please contact the fest organizers.",
      },
      { status: 503 },
    );
  }

  try {
    const endpoint = new URL(registrationUrl);
    if (endpoint.protocol !== "https:") {
      return Response.json(
        {
          success: false,
          error: "The registration service URL must use HTTPS.",
        },
        { status: 503 },
      );
    }

    const upstreamResponse = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submission),
      cache: "no-store",
    });
    const upstreamBody = await upstreamResponse.text();
    let upstreamResult: unknown;

    try {
      upstreamResult = JSON.parse(upstreamBody);
    } catch {
      upstreamResult = null;
    }

    if (
      !upstreamResponse.ok ||
      (upstreamResult !== null &&
        isObject(upstreamResult) &&
        upstreamResult.success === false)
    ) {
      return Response.json(
        {
          success: false,
          error:
            "The registration service could not accept your details. Please try again later.",
        },
        { status: 502 },
      );
    }

    return Response.json({ success: true });
  } catch {
    return Response.json(
      {
        success: false,
        error:
          "We could not reach the registration service. Please try again later.",
      },
      { status: 502 },
    );
  }
}

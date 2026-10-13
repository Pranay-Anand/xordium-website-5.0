"use client";

import { useState, type SyntheticEvent } from "react";
import Link from "next/link";
import { registrationEvents, HACKATHON_EVENT_ID, requiresBitEmail, isBitEmail, BIT_EMAIL_DOMAIN } from "@/data/events";
import type {
  Branch,
  RegistrationSubmission,
  RegistrationTeamMember,
} from "@/types/registration";
import TeamMemberFields from "@/components/TeamMemberFields";

const branches: Branch[] = [
  "CSE",
  "IT",
  "ECE",
  "EEE",
  "Mechanical",
  "Civil",
  "Other",
];

const emptyMember = (): RegistrationTeamMember => ({
  name: "",
  email: "",
  branch: "",
  year: "",
  phone: "",
});

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\d{10}$/;

type Props = {
  initialEventId?: string;
};

export default function RegistrationForm({ initialEventId }: Props) {
  const startingEvent =
    registrationEvents.find((event) => event.id === initialEventId) ??
    registrationEvents[0];

  const [eventId, setEventId] = useState(startingEvent.id);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [branch, setBranch] = useState<Branch | "">("");
  const [year, setYear] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [teamName, setTeamName] = useState("");
  // The leader is counted in the minimum team size, so prefill the other slots.
  const [teamMembers, setTeamMembers] = useState<RegistrationTeamMember[]>(
    startingEvent.allowTeamMembers
      ? Array.from({ length: startingEvent.minTeamSize - 1 }, emptyMember)
      : [],
  );
  const [acceptedPrivacyPolicy, setAcceptedPrivacyPolicy] = useState(false);
  // Hackathon only: team declared they are not from BIT (waives @bitmesra.ac.in).
  const [isExternalTeam, setIsExternalTeam] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registered, setRegistered] = useState<RegistrationSubmission | null>(
    null,
  );

  const selectedEvent =
    registrationEvents.find((event) => event.id === eventId) ??
    registrationEvents[0];
  const hasTeamFields = selectedEvent.allowTeamMembers;
  const totalTeamSize = 1 + teamMembers.length;
  const showExternalToggle = selectedEvent.id === HACKATHON_EVENT_ID;
  const bitRequired = requiresBitEmail(selectedEvent.id, isExternalTeam);

  function changeEvent(newEventId: string) {
    const newEvent = registrationEvents.find((event) => event.id === newEventId);
    if (!newEvent) return;

    setEventId(newEventId);
    setTeamMembers(
      newEvent.allowTeamMembers
        ? Array.from({ length: newEvent.minTeamSize - 1 }, emptyMember)
        : [],
    );
    setTeamName("");
    setIsExternalTeam(false);
    setErrors({});
  }

  function changeMember(
    index: number,
    field: keyof RegistrationTeamMember,
    value: string,
  ) {
    setTeamMembers((current) =>
      current.map((member, memberIndex) =>
        memberIndex === index
          ? { ...member, [field]: value }
          : member,
      ),
    );
  }

  function validateForm() {
    const nextErrors: Record<string, string> = {};
    const requiredValues: [string, string, string][] = [
      ["fullName", fullName, "Enter your full name."],
      ["email", email, "Enter your email address."],
      ["phone", phone, "Enter your phone number."],
      ["collegeName", collegeName, "Enter your college name."],
      ["branch", branch, "Select your branch."],
      ["year", year, "Enter your year of study."],
      ["rollNumber", rollNumber, "Enter your roll or registration number."],
    ];

    for (const [field, value, message] of requiredValues) {
      if (!value.trim()) nextErrors[field] = message;
    }

    if (email.trim() && !emailPattern.test(email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    } else if (email.trim() && bitRequired && !isBitEmail(email)) {
      nextErrors.email = `Use your ${BIT_EMAIL_DOMAIN} email address.`;
    }
    if (phone.trim() && !phonePattern.test(phone.trim())) {
      nextErrors.phone = "Enter a valid 10-digit phone number.";
    }

    const teamEmails = [email, ...teamMembers.map((member) => member.email)]
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);
    const duplicateEmails = new Set(
      teamEmails.filter(
        (value, index) => teamEmails.indexOf(value) !== index,
      ),
    );

    if (duplicateEmails.has(email.trim().toLowerCase())) {
      nextErrors.email = "Each person on the team must use a different email.";
    }

    if (hasTeamFields) {
      if (!teamName.trim()) nextErrors.teamName = "Enter your team name.";
      if (totalTeamSize < selectedEvent.minTeamSize) {
        nextErrors.teamSize = `Add members until your team has at least ${selectedEvent.minTeamSize} people.`;
      } else if (totalTeamSize > selectedEvent.maxTeamSize) {
        nextErrors.teamSize = `This event allows no more than ${selectedEvent.maxTeamSize} people per team.`;
      }

      teamMembers.forEach((member, index) => {
        const prefix = `teamMembers.${index}`;
        if (!member.name.trim()) nextErrors[`${prefix}.name`] = "Enter this member's name.";
        if (!member.email.trim()) {
          nextErrors[`${prefix}.email`] = "Enter this member's email.";
        } else if (!emailPattern.test(member.email.trim())) {
          nextErrors[`${prefix}.email`] = "Enter a valid email address.";
        } else if (bitRequired && !isBitEmail(member.email)) {
          nextErrors[`${prefix}.email`] = `Use a ${BIT_EMAIL_DOMAIN} email address.`;
        }
        if (!member.branch) nextErrors[`${prefix}.branch`] = "Select this member's branch.";
        if (!member.year.trim()) nextErrors[`${prefix}.year`] = "Enter this member's year of study.";
        if (!member.phone.trim()) {
          nextErrors[`${prefix}.phone`] = "Enter this member's phone number.";
        } else if (!phonePattern.test(member.phone.trim())) {
          nextErrors[`${prefix}.phone`] = "Enter a valid 10-digit phone number.";
        }
        if (
          member.email.trim() &&
          duplicateEmails.has(member.email.trim().toLowerCase())
        ) {
          nextErrors[`${prefix}.email`] =
            "Each person on the team must use a different email.";
        }
      });
    }

    if (!acceptedPrivacyPolicy) {
      nextErrors.acceptedPrivacyPolicy = "Consent is required to register.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting || !validateForm()) return;

    setFormError("");
    setIsSubmitting(true);

    const submission: RegistrationSubmission = {
      eventId: selectedEvent.id,
      eventName: selectedEvent.name,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      collegeName: collegeName.trim(),
      branch,
      year: year.trim(),
      rollNumber: rollNumber.trim(),
      teamName: hasTeamFields ? teamName.trim() : "",
      teamMembers: hasTeamFields
        ? teamMembers.map((member) => ({
            name: member.name.trim(),
            email: member.email.trim(),
            branch: member.branch,
            year: member.year.trim(),
            phone: member.phone.trim(),
          }))
        : [],
      isExternalTeam,
      acceptedPrivacyPolicy,
    };

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission),
      });
      const result: { success?: boolean; error?: string } =
        await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        setFormError(
          result.error ??
            "We could not submit your registration. Please try again.",
        );
        return;
      }

      setRegistered(submission);
    } catch {
      setFormError(
        "We could not reach the registration service. Check your connection and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (registered) {
    return (
      <section
        className="rounded border border-cyan-300/40 bg-[#101218] p-5 sm:p-8"
        aria-live="polite"
      >
        <p className="font-mono text-[10px] tracking-[0.25em] text-cyan-300 uppercase">
          Registration received // Success
        </p>
        <h2 className="mt-2 font-display text-3xl font-black uppercase">
          You&apos;re on the roster
        </h2>
        <p className="mt-2 font-mono text-xs leading-relaxed text-white/60">
          Your registration for {registered.eventName} was submitted.
        </p>
        <dl className="mt-5 grid gap-3 border-t border-white/10 pt-4 font-mono text-xs sm:grid-cols-2">
          <SummaryItem label="Participant" value={registered.fullName} />
          <SummaryItem label="Email" value={registered.email} />
          {registered.teamName ? (
            <>
              <SummaryItem
                label="Team"
                value={`${registered.teamName} · ${registered.teamMembers.length + 1} people`}
              />
              <SummaryItem
                label="Team members"
                value={registered.teamMembers
                  .map((member) => member.name)
                  .join(", ")}
              />
            </>
          ) : null}
        </dl>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 min-h-11 bg-red-600 px-5 py-2.5 font-mono text-[11px] font-bold tracking-[0.15em] text-white uppercase hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
        >
          Register another participant
        </button>
      </section>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-7">
      <section aria-labelledby="participant-heading">
        <div className="mb-4 border-b border-white/10 pb-3">
          <p className="font-mono text-[10px] tracking-[0.2em] text-red-400 uppercase">
            Registration // 01
          </p>
          <h2
            id="participant-heading"
            className="mt-1 font-display text-xl font-extrabold uppercase"
          >
            Participant details
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="event" className="field-label">
              Event
            </label>
            <select
              id="event"
              required
              value={eventId}
              onChange={(event) => changeEvent(event.target.value)}
              className="field-control"
            >
              {registrationEvents.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>
          <TextField
            id="fullName"
            label="Full name"
            value={fullName}
            error={errors.fullName}
            onChange={setFullName}
            required
          />
          <TextField
            id="email"
            label={bitRequired ? `Email (${BIT_EMAIL_DOMAIN})` : "Email"}
            type="email"
            value={email}
            error={errors.email}
            onChange={setEmail}
            required
          />
          <TextField
            id="phone"
            label="Phone / WhatsApp number"
            type="tel"
            value={phone}
            error={errors.phone}
            onChange={setPhone}
            required
          />
          <TextField
            id="collegeName"
            label="College name"
            value={collegeName}
            error={errors.collegeName}
            onChange={setCollegeName}
            required
          />
          <div>
            <label htmlFor="branch" className="field-label">
              Branch
            </label>
            <select
              id="branch"
              required
              value={branch}
              onChange={(event) => setBranch(event.target.value as Branch | "")}
              aria-invalid={Boolean(errors.branch)}
              aria-describedby={errors.branch ? "branch-error" : undefined}
              className="field-control"
            >
              <option value="">Select branch</option>
              {branches.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <FieldError id="branch-error" message={errors.branch} />
          </div>
          <TextField
            id="year"
            label="Year of study"
            value={year}
            error={errors.year}
            onChange={setYear}
            required
          />
          <TextField
            id="rollNumber"
            label="College roll / registration number"
            value={rollNumber}
            error={errors.rollNumber}
            onChange={setRollNumber}
            required
          />
        </div>

        {showExternalToggle ? (
          <label className="mt-4 flex items-start gap-3 border border-cyan-300/30 bg-cyan-300/5 p-3">
            <input
              type="checkbox"
              checked={isExternalTeam}
              onChange={(event) => setIsExternalTeam(event.target.checked)}
              className="mt-0.5 size-4 shrink-0 accent-cyan-400"
            />
            <span className="font-mono text-xs leading-relaxed text-white/70">
              <span className="block text-[11px] font-bold uppercase tracking-[0.15em] text-white">
                Our team is not from Birla Institute of Technology (BIT)
              </span>
              <span className="mt-1 block text-white/50">
                Inter-college / open team? Tick this and the{" "}
                <span className="text-cyan-300">{BIT_EMAIL_DOMAIN}</span> email
                requirement is waived for your whole team. BIT teams must leave
                this unchecked and use {BIT_EMAIL_DOMAIN} emails.
              </span>
            </span>
          </label>
        ) : null}
      </section>

      {hasTeamFields ? (
        <section aria-labelledby="team-heading">
          <div className="mb-4 border-b border-white/10 pb-3">
            <p className="font-mono text-[10px] tracking-[0.2em] text-cyan-300 uppercase">
              Squad // {selectedEvent.minTeamSize}–{selectedEvent.maxTeamSize} people
            </p>
            <h2
              id="team-heading"
              className="mt-1 font-display text-xl font-extrabold uppercase"
            >
              Team details
            </h2>
            <p className="mt-1 font-mono text-[11px] text-white/50">
              You are the team leader. The allowed team size includes you.
            </p>
          </div>
          <TextField
            id="teamName"
            label="Team name"
            value={teamName}
            error={errors.teamName}
            onChange={setTeamName}
            required
          />
          <div className="mt-4">
            <TeamMemberFields
              members={teamMembers}
              errors={errors}
              onChange={changeMember}
              onRemove={(index) =>
                setTeamMembers((current) =>
                  current.filter((_, memberIndex) => memberIndex !== index),
                )
              }
            />
          </div>
          {errors.teamSize ? (
            <p className="mt-2 font-mono text-[11px] text-red-300" role="alert">
              {errors.teamSize}
            </p>
          ) : null}
          <button
            type="button"
            disabled={totalTeamSize >= selectedEvent.maxTeamSize}
            onClick={() => setTeamMembers((current) => [...current, emptyMember()])}
            className="mt-4 min-h-11 border border-cyan-300/50 px-4 py-2 font-mono text-[11px] font-bold tracking-[0.15em] text-cyan-200 uppercase transition hover:bg-cyan-300/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            + Add team member
          </button>
        </section>
      ) : null}

      <section className="border-t border-white/10 pt-5">
        <label className="flex items-start gap-3 font-mono text-xs leading-relaxed text-white/65">
          <input
            type="checkbox"
            checked={acceptedPrivacyPolicy}
            onChange={(event) => setAcceptedPrivacyPolicy(event.target.checked)}
            aria-invalid={Boolean(errors.acceptedPrivacyPolicy)}
            aria-describedby={
              errors.acceptedPrivacyPolicy
                ? "privacy-consent-error"
                : undefined
            }
            className="mt-0.5 size-4 shrink-0 accent-red-600"
          />
          <span>
            I agree to the{" "}
            <Link
              href="/privacy"
              className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200"
            >
              Privacy Policy
            </Link>{" "}
            and consent to the use of the information above for event
            registration.
          </span>
        </label>
        <FieldError
          id="privacy-consent-error"
          message={errors.acceptedPrivacyPolicy}
        />
      </section>

      {formError ? (
        <p
          className="rounded border border-red-500/40 bg-red-950/30 p-3 font-mono text-xs text-red-200"
          role="alert"
        >
          {formError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="min-h-12 w-full bg-red-600 px-5 py-3 font-mono text-xs font-bold tracking-[0.2em] text-white uppercase transition hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
      >
        {isSubmitting ? "Submitting registration..." : "Submit registration →"}
      </button>
    </form>
  );
}

function TextField({
  id,
  label,
  type = "text",
  value,
  error,
  onChange,
  required = false,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        inputMode={type === "tel" ? "numeric" : undefined}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="field-control"
      />
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p id={id} className="mt-1 font-mono text-[11px] text-red-300" role="alert">
      {message}
    </p>
  ) : null;
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] tracking-[0.2em] text-white/40 uppercase">
        {label}
      </dt>
      <dd className="mt-1 wrap-break-word text-white">{value}</dd>
    </div>
  );
}

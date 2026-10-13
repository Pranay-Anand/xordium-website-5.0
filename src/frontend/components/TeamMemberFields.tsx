"use client";

import type { Branch, RegistrationTeamMember } from "@/types/registration";

const branches: Branch[] = [
  "CSE",
  "IT",
  "ECE",
  "EEE",
  "Mechanical",
  "Civil",
  "Other",
];

type Props = {
  members: RegistrationTeamMember[];
  errors: Record<string, string>;
  onChange: (index: number, field: keyof RegistrationTeamMember, value: string) => void;
  onRemove: (index: number) => void;
};

export default function TeamMemberFields({
  members,
  errors,
  onChange,
  onRemove,
}: Props) {
  return (
    <div className="space-y-4">
      {members.map((member, index) => (
        <fieldset
          key={index}
          className="rounded border border-white/10 bg-[#0d0f14] p-4"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <legend className="font-display text-lg font-extrabold text-white uppercase">
              Team member {index + 2}
            </legend>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="rounded border border-white/20 px-3 py-1.5 font-mono text-[10px] tracking-[0.15em] text-white/70 uppercase hover:border-red-500 hover:text-red-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
              aria-label={`Remove team member ${index + 2}`}
            >
              Remove
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <MemberInput
              id={`member-${index}-name`}
              label="Full name"
              value={member.name}
              error={errors[`teamMembers.${index}.name`]}
              onChange={(value) => onChange(index, "name", value)}
            />
            <MemberInput
              id={`member-${index}-email`}
              label="Email"
              type="email"
              value={member.email}
              error={errors[`teamMembers.${index}.email`]}
              onChange={(value) => onChange(index, "email", value)}
            />
            <div>
              <label
                htmlFor={`member-${index}-branch`}
                className="font-mono text-[11px] tracking-[0.15em] text-white/70 uppercase"
              >
                Branch
              </label>
              <select
                id={`member-${index}-branch`}
                value={member.branch}
                onChange={(event) => onChange(index, "branch", event.target.value)}
                aria-invalid={Boolean(errors[`teamMembers.${index}.branch`])}
                aria-describedby={
                  errors[`teamMembers.${index}.branch`]
                    ? `member-${index}-branch-error`
                    : undefined
                }
                className="mt-1.5 block min-h-11 w-full rounded border border-white/15 bg-[#0a0c10] px-3 py-2.5 font-mono text-xs text-white focus:border-cyan-300 focus:outline-none"
              >
                <option value="">Select branch</option>
                {branches.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
              <FieldError
                id={`member-${index}-branch-error`}
                message={errors[`teamMembers.${index}.branch`]}
              />
            </div>
            <MemberInput
              id={`member-${index}-year`}
              label="Year of study"
              value={member.year}
              error={errors[`teamMembers.${index}.year`]}
              onChange={(value) => onChange(index, "year", value)}
            />
            <MemberInput
              id={`member-${index}-phone`}
              label="Phone / WhatsApp number"
              type="tel"
              value={member.phone}
              error={errors[`teamMembers.${index}.phone`]}
              onChange={(value) => onChange(index, "phone", value)}
            />
          </div>
        </fieldset>
      ))}
    </div>
  );
}

function MemberInput({
  id,
  label,
  type = "text",
  value,
  error,
  onChange,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="font-mono text-[11px] tracking-[0.15em] text-white/70 uppercase"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        inputMode={type === "tel" ? "numeric" : undefined}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="mt-1.5 block min-h-11 w-full rounded border border-white/15 bg-[#0a0c10] px-3 py-2.5 font-mono text-xs text-white placeholder:text-white/30 focus:border-cyan-300 focus:outline-none"
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

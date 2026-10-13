"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getCurrentUser,
  fetchEventRegistrations,
  eventRegistrationsExportUrl,
  type EventRegistration,
} from "@/lib/admin-api";

export default function EventRegistrationsPage() {
  const user = getCurrentUser();
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterEvent, setFilterEvent] = useState<string>("");

  useEffect(() => {
    loadRegistrations();
  }, []);

  async function loadRegistrations() {
    try {
      const data = await fetchEventRegistrations();
      setRegistrations(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load registrations",
      );
    } finally {
      setLoading(false);
    }
  }

  // Build filter options from the events people actually registered for.
  const eventOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const reg of registrations) {
      if (!map.has(reg.eventId)) map.set(reg.eventId, reg.eventName);
    }
    return [...map.entries()].map(([id, name]) => ({ id, name }));
  }, [registrations]);

  const filtered = filterEvent
    ? registrations.filter((reg) => reg.eventId === filterEvent)
    : registrations;

  const externalCount = filtered.filter((reg) => reg.isExternalTeam).length;

  if (!user || (user.role !== "ADMIN" && user.role !== "OWNER")) {
    return (
      <div className="border border-red-500/50 bg-red-500/10 p-6 rounded">
        <h2 className="font-mono text-sm font-bold text-red-400 uppercase tracking-[0.2em]">
          Access Denied
        </h2>
        <p className="mt-2 font-mono text-xs text-white/60">
          This page requires Admin or Owner privileges.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-[0.2em] text-white uppercase">
            // EVENT REGISTRATIONS
          </h1>
          <p className="mt-2 font-mono text-[11px] text-white/40 uppercase tracking-[0.2em]">
            Responses from the public event registration form
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadRegistrations}
            className="border border-white/20 bg-white/5 px-4 py-2 font-mono text-[11px] font-bold tracking-[0.2em] text-white/60 uppercase hover:bg-white/10 hover:text-white transition-colors"
          >
            ↻ Refresh
          </button>
          <a
            href={eventRegistrationsExportUrl(filterEvent || undefined)}
            className="bg-red-600 px-4 py-2 font-mono text-[11px] font-bold tracking-[0.2em] text-white uppercase hover:bg-red-500 transition-colors"
          >
            ⬇ Export CSV
          </a>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 border border-red-500/50 bg-red-500/10 p-3 rounded">
          <p className="font-mono text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Filter */}
      <div className="mb-6">
        <label className="block font-mono text-xs text-white/70 uppercase tracking-[0.15em]">
          FILTER BY EVENT
          <select
            value={filterEvent}
            onChange={(e) => setFilterEvent(e.target.value)}
            className="mt-1 block w-full max-w-md rounded border border-white/20 bg-white/5 p-2.5 text-white focus:border-red-500 focus:outline-none"
          >
            <option value="" className="bg-neutral-900 text-white">
              All Events
            </option>
            {eventOptions.map((event) => (
              <option
                key={event.id}
                value={event.id}
                className="bg-neutral-900 text-white"
              >
                {event.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="border border-white/10 bg-white/5 p-4 rounded">
          <p className="font-mono text-[10px] text-white/50 uppercase tracking-[0.2em] mb-1">
            Total Responses
          </p>
          <p className="font-mono text-2xl font-bold text-white">
            {registrations.length}
          </p>
        </div>
        <div className="border border-white/10 bg-white/5 p-4 rounded">
          <p className="font-mono text-[10px] text-white/50 uppercase tracking-[0.2em] mb-1">
            Showing
          </p>
          <p className="font-mono text-2xl font-bold text-white">
            {filtered.length}
          </p>
        </div>
        <div className="border border-white/10 bg-white/5 p-4 rounded">
          <p className="font-mono text-[10px] text-white/50 uppercase tracking-[0.2em] mb-1">
            External (non-BIT) Teams
          </p>
          <p className="font-mono text-2xl font-bold text-white">
            {externalCount}
          </p>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="border border-white/10 bg-white/5 rounded overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="border-b border-white/10 p-4 animate-pulse">
              <div className="h-4 bg-white/10 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-white/10 bg-white/5 p-8 rounded text-center">
          <p className="font-mono text-sm text-white/60">
            No registrations found.
          </p>
        </div>
      ) : (
        <RegistrationTable registrations={filtered} />
      )}
    </div>
  );
}

function RegistrationTable({
  registrations,
}: {
  registrations: EventRegistration[];
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="border border-white/10 bg-white/5 rounded overflow-hidden overflow-x-auto">
      <table className="w-full">
        <thead className="border-b border-white/10">
          <tr>
            <th className="px-4 py-3 text-left font-mono text-[10px] text-white/50 uppercase tracking-[0.2em]">
              Registered
            </th>
            <th className="px-4 py-3 text-left font-mono text-[10px] text-white/50 uppercase tracking-[0.2em]">
              Event
            </th>
            <th className="px-4 py-3 text-left font-mono text-[10px] text-white/50 uppercase tracking-[0.2em]">
              Team Head
            </th>
            <th className="px-4 py-3 text-left font-mono text-[10px] text-white/50 uppercase tracking-[0.2em]">
              Email
            </th>
            <th className="px-4 py-3 text-left font-mono text-[10px] text-white/50 uppercase tracking-[0.2em]">
              Team
            </th>
            <th className="px-4 py-3 text-left font-mono text-[10px] text-white/50 uppercase tracking-[0.2em]">
              Size
            </th>
            <th className="px-4 py-3 text-left font-mono text-[10px] text-white/50 uppercase tracking-[0.2em]">
              Type
            </th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {registrations.map((reg) => {
            const expanded = expandedId === reg.id;
            return (
              <RegistrationRow
                key={reg.id}
                reg={reg}
                expanded={expanded}
                onToggle={() => setExpandedId(expanded ? null : reg.id)}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function RegistrationRow({
  reg,
  expanded,
  onToggle,
}: {
  reg: EventRegistration;
  expanded: boolean;
  onToggle: () => void;
}) {
  const teamSize = reg.teamMembers.length + 1;
  return (
    <>
      <tr
        onClick={onToggle}
        className="border-b border-white/5 hover:bg-white/5 cursor-pointer"
      >
        <td className="px-4 py-3 font-mono text-[10px] text-white/40 whitespace-nowrap">
          {new Date(reg.createdAt).toLocaleDateString()}
        </td>
        <td className="px-4 py-3 font-mono text-[11px] text-white/70">
          {reg.eventName}
        </td>
        <td className="px-4 py-3 font-mono text-xs text-white">
          {reg.fullName}
        </td>
        <td className="px-4 py-3 font-mono text-xs text-white/80">
          {reg.email}
        </td>
        <td className="px-4 py-3 font-mono text-[11px] text-white/60">
          {reg.teamName || "—"}
        </td>
        <td className="px-4 py-3 font-mono text-[11px] text-white/60">
          {teamSize}
        </td>
        <td className="px-4 py-3">
          <span
            className={`inline-block px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.15em] rounded ${
              reg.isExternalTeam
                ? "bg-amber-600/20 text-amber-400 border border-amber-500/50"
                : "bg-white/10 text-white/60 border border-white/20"
            }`}
          >
            {reg.isExternalTeam ? "External" : "BIT"}
          </span>
        </td>
        <td className="px-4 py-3 font-mono text-[11px] text-red-400">
          {expanded ? "▾" : "▸"}
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-white/5 bg-black/20">
          <td colSpan={8} className="px-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="font-mono text-[10px] text-white/40 uppercase tracking-[0.2em] mb-2">
                  Team Head
                </p>
                <dl className="space-y-1 font-mono text-xs">
                  <Detail label="Name" value={reg.fullName} />
                  <Detail label="Email" value={reg.email} />
                  <Detail label="Phone" value={reg.phone} />
                  <Detail label="College" value={reg.collegeName} />
                  <Detail label="Branch" value={reg.branch} />
                  <Detail label="Year" value={reg.year} />
                  <Detail label="Roll Number" value={reg.rollNumber} />
                </dl>
              </div>
              <div>
                <p className="font-mono text-[10px] text-white/40 uppercase tracking-[0.2em] mb-2">
                  Team Members ({reg.teamMembers.length})
                </p>
                {reg.teamMembers.length === 0 ? (
                  <p className="font-mono text-xs text-white/50">
                    Individual entry — no team members.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {reg.teamMembers.map((member, index) => (
                      <li
                        key={index}
                        className="border border-white/10 rounded p-2 font-mono text-xs"
                      >
                        <p className="text-white">{member.name}</p>
                        <p className="text-white/60">
                          {member.email} · {member.phone}
                        </p>
                        <p className="text-white/40">
                          {member.branch} · {member.year}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-28 shrink-0 text-white/40 uppercase tracking-[0.1em] text-[10px]">
        {label}
      </dt>
      <dd className="text-white/80">{value || "—"}</dd>
    </div>
  );
}

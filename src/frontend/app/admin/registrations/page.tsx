"use client";

import { useEffect, useState } from "react";
import {
  getCurrentUser,
  fetchRegistrations,
  fetchEvents,
  type Registration,
  type AdminEvent,
} from "@/lib/admin-api";

export default function RegistrationsPage() {
  const user = getCurrentUser();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterEvent, setFilterEvent] = useState<string | "">("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [regs, evts] = await Promise.all([
        fetchRegistrations(),
        fetchEvents().catch(() => [] as AdminEvent[]),
      ]);
      setRegistrations(regs);
      setEvents(evts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load registrations");
    } finally {
      setLoading(false);
    }
  }

  function getEventTitle(eventId: string): string {
    const event = events.find((e) => e.id === eventId);
    return event ? event.title : `Event #${eventId.slice(0, 8)}...`;
  }

  const filteredRegistrations = filterEvent
    ? registrations.filter((r) => r.eventId === filterEvent)
    : registrations;

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-[0.2em] text-white uppercase">
            // REGISTRATIONS
          </h1>
          <p className="mt-2 font-mono text-[11px] text-white/40 uppercase tracking-[0.2em]">
            View event registrations
          </p>
        </div>
        <button
          onClick={loadData}
          className="border border-white/20 bg-white/5 px-4 py-2 font-mono text-[11px] font-bold tracking-[0.2em] text-white/60 uppercase hover:bg-white/10 hover:text-white transition-colors"
        >
          ↻ Refresh
        </button>
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
            {events.map((event) => (
              <option
                key={event.id}
                value={event.id}
                className="bg-neutral-900 text-white"
              >
                {event.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="border border-white/10 bg-white/5 p-4 rounded">
          <p className="font-mono text-[10px] text-white/50 uppercase tracking-[0.2em] mb-1">
            Total Registrations
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
            {filteredRegistrations.length}
          </p>
        </div>
        <div className="border border-white/10 bg-white/5 p-4 rounded">
          <p className="font-mono text-[10px] text-white/50 uppercase tracking-[0.2em] mb-1">
            Events
          </p>
          <p className="font-mono text-2xl font-bold text-white">{events.length}</p>
        </div>
      </div>

      {/* Registrations Table */}
      {loading ? (
        <div className="border border-white/10 bg-white/5 rounded overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="border-b border-white/10 p-4 animate-pulse">
              <div className="h-4 bg-white/10 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      ) : filteredRegistrations.length === 0 ? (
        <div className="border border-white/10 bg-white/5 p-8 rounded text-center">
          <p className="font-mono text-sm text-white/60">No registrations found.</p>
        </div>
      ) : (
        <div className="border border-white/10 bg-white/5 rounded overflow-hidden overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/10">
              <tr>
                <th className="px-4 py-3 text-left font-mono text-[10px] text-white/50 uppercase tracking-[0.2em]">
                  Email
                </th>
                <th className="px-4 py-3 text-left font-mono text-[10px] text-white/50 uppercase tracking-[0.2em]">
                  Name
                </th>
                <th className="px-4 py-3 text-left font-mono text-[10px] text-white/50 uppercase tracking-[0.2em]">
                  Event
                </th>
                <th className="px-4 py-3 text-left font-mono text-[10px] text-white/50 uppercase tracking-[0.2em]">
                  Registered
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRegistrations.map((reg) => (
                <tr key={reg.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3 font-mono text-xs text-white">{reg.email}</td>
                  <td className="px-4 py-3 font-mono text-xs text-white/80">
                    {reg.name || "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-white/60">
                    {getEventTitle(reg.eventId)}
                  </td>
                  <td className="px-4 py-3 font-mono text-[10px] text-white/40">
                    {new Date(reg.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  getCurrentUser,
  fetchEvents,
  updateEvent,
  type AdminEvent,
} from "@/lib/admin-api";

export default function EventsPage() {
  const user = getCurrentUser();
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingEvent, setEditingEvent] = useState<AdminEvent | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [editPosterUrl, setEditPosterUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      const data = await fetchEvents();
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events");
    } finally {
      setLoading(false);
    }
  }

  function startEditing(event: AdminEvent) {
    setEditingEvent(event);
    setEditDescription(event.description || "");
    setEditPosterUrl(event.poster_url || "");
    setSuccess("");
    setError("");
  }

  function cancelEditing() {
    setEditingEvent(null);
    setEditDescription("");
    setEditPosterUrl("");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editingEvent) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await updateEvent(editingEvent.slug, {
        description: editDescription,
        poster_url: editPosterUrl,
      });
      setSuccess(`Event "${editingEvent.title}" updated successfully`);
      setEditingEvent(null);
      loadEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update event");
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-mono text-2xl font-bold tracking-[0.2em] text-white uppercase">
          // EVENTS
        </h1>
        <p className="mt-2 font-mono text-[11px] text-white/40 uppercase tracking-[0.2em]">
          Manage event descriptions and posters
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 border border-red-500/50 bg-red-500/10 p-3 rounded">
          <p className="font-mono text-xs text-red-400">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-4 border border-green-500/50 bg-green-500/10 p-3 rounded">
          <p className="font-mono text-xs text-green-400">{success}</p>
        </div>
      )}

      {/* Edit Form Modal */}
      {editingEvent && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="border border-white/20 bg-[#0a0c10] p-6 rounded max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-mono text-lg font-bold text-white uppercase tracking-[0.2em]">
                Edit Event
              </h2>
              <button
                onClick={cancelEditing}
                className="font-mono text-white/60 hover:text-white text-xl"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <p className="font-mono text-[11px] text-white/50 uppercase tracking-[0.15em]">
                Event
              </p>
              <p className="font-mono text-sm text-white">{editingEvent.title}</p>
            </div>

            <form onSubmit={handleSave}>
              <label className="block font-mono text-xs text-white/70 uppercase tracking-[0.15em]">
                DESCRIPTION
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={6}
                  className="mt-1 block w-full rounded border border-white/20 bg-white/5 p-2.5 text-white placeholder:text-white/30 focus:border-red-500 focus:outline-none resize-y"
                />
              </label>

              <label className="mt-4 block font-mono text-xs text-white/70 uppercase tracking-[0.15em]">
                POSTER URL (1350×1080 recommended)
                <input
                  type="url"
                  value={editPosterUrl}
                  onChange={(e) => setEditPosterUrl(e.target.value)}
                  placeholder="https://..."
                  className="mt-1 block w-full rounded border border-white/20 bg-white/5 p-2.5 text-white placeholder:text-white/30 focus:border-red-500 focus:outline-none"
                />
              </label>

              {editPosterUrl && (
                <div className="mt-3">
                  <p className="font-mono text-[10px] text-white/40 uppercase tracking-[0.15em] mb-2">
                    Preview
                  </p>
                  <img
                    src={editPosterUrl}
                    alt="Poster preview"
                    className="border border-white/20 rounded max-h-48 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-red-600 px-5 py-2.5 font-mono text-[11px] font-bold tracking-[0.2em] text-white uppercase hover:bg-red-500 disabled:opacity-50 transition-colors"
                >
                  {saving ? "SAVING..." : "SAVE CHANGES →"}
                </button>
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="border border-white/20 bg-white/5 px-5 py-2.5 font-mono text-[11px] font-bold tracking-[0.2em] text-white/60 uppercase hover:bg-white/10 hover:text-white transition-colors"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Events Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border border-white/10 bg-white/5 p-4 rounded animate-pulse">
              <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-white/10 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="border border-white/10 bg-white/5 p-8 rounded text-center">
          <p className="font-mono text-sm text-white/60">No events found.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="border border-white/10 bg-white/5 p-4 rounded hover:border-white/20 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-mono text-[10px] text-red-400 uppercase tracking-[0.15em]">
                    {event.tag}
                  </p>
                  <h3 className="font-mono text-sm font-bold text-white mt-1">
                    {event.title}
                  </h3>
                </div>
                {event.featured === 1 && (
                  <span className="bg-red-600/20 text-red-400 border border-red-500/50 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.15em] rounded">
                    Featured
                  </span>
                )}
              </div>

              {event.description && (
                <p className="font-mono text-[11px] text-white/60 line-clamp-2 mb-3">
                  {event.description.slice(0, 150)}...
                </p>
              )}

              <div className="flex items-center justify-between">
                <p className="font-mono text-[10px] text-white/40">{event.category}</p>
                <button
                  onClick={() => startEditing(event)}
                  className="bg-white/10 border border-white/20 px-3 py-1.5 font-mono text-[10px] font-bold text-white uppercase tracking-[0.15em] hover:bg-white/20 transition-colors"
                >
                  Edit →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-8 border border-white/10 bg-white/5 p-4 rounded">
        <h4 className="font-mono text-[11px] text-white/60 uppercase tracking-[0.15em] mb-2">
          Moderator Capabilities
        </h4>
        <ul className="space-y-1">
          <li className="font-mono text-[11px] text-white/40">✓ Edit event descriptions</li>
          <li className="font-mono text-[11px] text-white/40">✓ Upload/update poster URLs (1350×1080)</li>
          <li className="font-mono text-[11px] text-white/40">✓ View all featured events</li>
          <li className="font-mono text-[11px] text-white/40">✗ Cannot create or delete events</li>
          <li className="font-mono text-[11px] text-white/40">✗ Cannot manage users or roles</li>
        </ul>
      </div>
    </div>
  );
}

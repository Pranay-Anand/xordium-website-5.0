"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  getCurrentUser,
  fetchAdminEvents,
  updateEvent,
  deleteEvent,
  type AdminEvent,
} from "@/lib/admin-api";
import { stripMarkdown } from "@/lib/markdown";

// WebP conversion via Canvas (client-side, no server deps)
const convertToWebP = (file: File): Promise<Blob> =>
{
  return new Promise((resolve, reject) =>
  {
    const url = URL.createObjectURL(file);
    const img = document.createElement("img");

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        return reject(new Error("Canvas 2D context unavailable."));
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (blob) resolve(blob);
          else reject(new Error("Canvas toBlob returned null."));
        },
        "image/webp",
        0.92
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image."));
    };

    img.src = url;
  });
};

// Upload WebP blob to the poster endpoint
async function uploadPoster(slug: string, webpBlob: Blob): Promise<string> {
  const form = new FormData();
  form.append("file", webpBlob, `${slug}.webp`);

  const res = await fetch(`/api/moderator/events/${slug}/poster`, {
    method: "POST",
    credentials: "same-origin",
    body: form,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed.");
  return data.path as string;
}

// Component
export default function EventsPage() {
  const user = getCurrentUser();
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingEvent, setEditingEvent] = useState<AdminEvent | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [editPosterUrl, setEditPosterUrl] = useState("");
  const [deletingEvent, setDeletingEvent] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Image upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [pendingBlob, setPendingBlob] = useState<Blob | null>(null);
  const [converting, setConverting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      const data = await fetchAdminEvents();
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
    setEditPosterUrl(event.posterUrl || event.image || "");
    setPreviewSrc(null);
    setPendingBlob(null);
    setSuccess("");
    setError("");
  }

  function cancelEditing() {
    setEditingEvent(null);
    setEditDescription("");
    setEditPosterUrl("");
    setPreviewSrc(null);
    setPendingBlob(null);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setConverting(true);
    setError("");
    try {
      const webp = await convertToWebP(file);
      setPendingBlob(webp);
      const objUrl = URL.createObjectURL(webp);
      setPreviewSrc(objUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image conversion failed.");
    } finally {
      setConverting(false);
    }
  }

  async function handleUploadNow() {
    if (!pendingBlob || !editingEvent) return;
    setUploading(true);
    setError("");
    try {
      const path = await uploadPoster(editingEvent.slug, pendingBlob);
      setEditPosterUrl(path);
      setPendingBlob(null);
      setSuccess("Poster uploaded - click Save to apply.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editingEvent) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      let posterUrl = editPosterUrl;
      if (pendingBlob) {
        posterUrl = await uploadPoster(editingEvent.slug, pendingBlob);
        setPendingBlob(null);
        setEditPosterUrl(posterUrl);
      }

      await updateEvent(editingEvent.slug, {
        description: editDescription,
        posterUrl: posterUrl || undefined,
      });
      setSuccess(`"${editingEvent.title}" updated successfully.`);
      setEditingEvent(null);
      loadEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update event.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(slug: string) {
    setDeleting(true);
    setError("");
    try {
      await deleteEvent(slug);
      setSuccess("Event deleted successfully.");
      loadEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete event.");
    } finally {
      setDeleting(false);
    }
  }

  async function handleDeleteConfirm(slug: string) {
    if (deleteConfirm !== slug) {
      setDeleteConfirm(slug);
      setTimeout(() => setDeleteConfirm(null), 3000);
      return;
    }
    await handleDelete(slug);
    setDeleteConfirm(null);
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
          Manage event descriptions, posters, and featured status
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

      {/* Edit Modal */}
      {editingEvent && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4">
          <div className="border border-white/20 bg-[var(--color-dracula-bg)] rounded max-w-2xl w-full max-h-[92vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div>
                <p className="font-mono text-[10px] tracking-[0.3em] text-red-500 uppercase">
                  {editingEvent.tag}
                </p>
                <h2 className="font-mono text-base font-bold text-white mt-0.5">
                  {editingEvent.title}
                </h2>
              </div>
              <button
                onClick={cancelEditing}
                className="font-mono text-white/50 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6">
              {/* Description */}
              <div>
                <label className="block font-mono text-[11px] tracking-[0.2em] text-white/60 uppercase mb-1.5">
                  Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={5}
                  className="block w-full rounded border border-white/20 bg-white/5 p-3 font-mono text-xs text-white placeholder:text-white/30 focus:border-red-500 focus:outline-none resize-y"
                  placeholder="Event description (Markdown supported)..."
                />
                <p className="mt-1.5 font-mono text-[10px] leading-relaxed text-white/35">
                  Markdown supported - **bold**, *italic*, - lists, &gt;   quotes,
                </p>
              </div>

              {/* Poster upload */}
              <div>
                <label className="block font-mono text-[11px] tracking-[0.2em] text-white/60 uppercase mb-1.5">
                  Poster Image
                  <span className="ml-2 text-white/30 normal-case tracking-normal">
                    (portrait 1080x1350 - any format, saved as WebP)
                  </span>
                </label>

                {/* Drop zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded border-2 border-dashed border-white/20 bg-white/5 p-8 text-center transition hover:border-red-500/60 hover:bg-white/[0.07]"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/avif"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                  {converting ? (
                    <p className="font-mono text-xs text-white/50">
                      Converting to WebP...
                    </p>
                  ) : previewSrc ? (
                    <>
                      {/* 4:5 portrait preview */}
                      <div className="relative w-40" style={{ paddingBottom: "125%" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={previewSrc}
                          alt="Poster preview"
                          className="absolute inset-0 h-full w-full rounded border border-white/20 object-cover"
                        />
                      </div>
                      <p className="font-mono text-[10px] text-green-400">
                        Converted to WebP - ready to save
                      </p>
                      <p className="font-mono text-[10px] text-white/40">
                        Click to replace
                      </p>
                    </>
                  ) : (
                    <>
                      <svg
                        className="h-8 w-8 text-white/25"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                        />
                      </svg>
                      <div>
                        <p className="font-mono text-xs text-white/60">
                          Click to select a poster image
                        </p>
                        <p className="font-mono text-[10px] text-white/35 mt-1">
                          JPEG - PNG - WebP - AVIF - up to 10 MB
                        </p>
                      </div>
                      {(editPosterUrl) && (
                        <p className="font-mono text-[10px] text-cyan-400">
                          Current: {editPosterUrl.split("/").pop()}
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Separate upload button when blob is pending */}
                {pendingBlob && !uploading && (
                  <button
                    type="button"
                    onClick={handleUploadNow}
                    className="mt-2 border border-white/20 bg-white/5 px-4 py-2 font-mono text-[11px] font-bold tracking-[0.15em] text-white/70 uppercase hover:bg-white/10 hover:text-white transition-colors"
                  >
                    Upload poster only (skip save)
                  </button>
                )}
                {uploading && (
                  <p className="mt-2 font-mono text-[11px] text-white/50">
                    Uploading...
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 border-t border-white/10 pt-4">
                <button
                  type="submit"
                  disabled={saving || uploading || converting}
                  className="bg-red-600 px-6 py-2.5 font-mono text-[11px] font-bold tracking-[0.2em] text-white uppercase hover:bg-red-500 disabled:opacity-50 transition-colors"
                >
                  {saving ? "SAVING..." : "SAVE CHANGES >"}
                </button>
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="border border-white/20 bg-white/5 px-6 py-2.5 font-mono text-[11px] font-bold tracking-[0.2em] text-white/60 uppercase hover:bg-white/10 hover:text-white transition-colors"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Events grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="border border-white/10 bg-white/5 p-4 rounded animate-pulse"
            >
              <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
              <div className="h-3 bg-white/10 rounded w-1/2" />
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
                    {event.featured ? " " : ""}{event.tag}
                  </p>
                  <h3 className="font-mono text-sm font-bold text-white mt-1">
                    {event.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {event.featured && (
                    <span className="bg-yellow-600/20 text-yellow-400 border border-yellow-500/50 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.15em] rounded">
                      Featured
                    </span>
                  )}
                  {(event.posterUrl || event.image) && (
                    <span className="bg-green-600/20 text-green-400 border border-green-500/50 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.15em] rounded">
                      Poster
                    </span>
                  )}
                </div>
              </div>

              {(event.posterUrl || event.image) && (
                <div className="mb-3">
                  <img
                    src={event.posterUrl || event.image}
                    alt={event.title}
                    className="w-full h-48 object-contain rounded border border-white/10 bg-white/5"
                  />
                </div>
              )}

              {event.description && (
                <p className="font-mono text-[11px] text-white/60 line-clamp-4 mb-3">
                  {stripMarkdown(event.description).slice(0, 300)}...
                </p>
              )}

              <div className="flex items-center justify-between">
                <p className="font-mono text-[10px] text-white/40">
                  {event.category}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEditing(event)}
                    className="bg-white/10 border border-white/20 px-3 py-1.5 font-mono text-[10px] font-bold text-white uppercase tracking-[0.15em] hover:bg-white/20 transition-colors"
                  >
                    Edit
                  </button>
                  {user?.role === "OWNER" && (
                    <button
                      onClick={() => handleDeleteConfirm(event.slug)}
                      disabled={deleting}
                      className={`bg-white/10 border px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.15em] transition-colors ${
                        deleteConfirm === event.slug
                          ? "bg-red-600 border-red-500 text-white"
                          : "border-white/20 text-white/60 hover:bg-red-600/20 hover:border-red-500 hover:text-red-400"
                      }`}
                    >
                      {deleteConfirm === event.slug
                        ? deleting
                          ? "DELETING..."
                          : "CONFIRM DELETE"
                        : "Delete"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info box */}
      <div className="mt-8 border border-white/10 bg-white/5 p-4 rounded">
        <h4 className="font-mono text-[11px] text-white/60 uppercase tracking-[0.15em] mb-2">
          Owner Capabilities
        </h4>
        <ul className="space-y-1">
          <li className="font-mono text-[11px] text-white/40">Edit event descriptions & posters</li>
          <li className="font-mono text-[11px] text-white/40">Delete events</li>
          <li className="font-mono text-[11px] text-white/40">Featured events shown first, then sorted by date</li>
          <li className="font-mono text-[11px] text-white/40">Upload poster images (auto-converted to WebP, portrait 1080x1350)</li>
        </ul>
      </div>
    </div>
  );
}

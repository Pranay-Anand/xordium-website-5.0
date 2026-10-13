"use client";

import { useEffect, useState } from "react";
import {
  getCurrentUser,
  fetchModerators,
  fetchUsers,
  promoteToModerator,
  type AdminUser,
} from "@/lib/admin-api";

export default function ModeratorsPage() {
  const currentUser = getCurrentUser();
  const [moderators, setModerators] = useState<AdminUser[]>([]);
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPromoteForm, setShowPromoteForm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [promoting, setPromoting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [mods, users] = await Promise.all([
        fetchModerators(),
        fetchUsers().catch(() => [] as AdminUser[]), // Non-owners can't fetch all users
      ]);
      setModerators(mods);
      setAllUsers(users);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  async function handlePromote(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUserId) return;

    setError("");
    setSuccess("");
    setPromoting(true);

    try {
      await promoteToModerator(selectedUserId);
      setSuccess("User promoted to moderator successfully");
      setSelectedUserId(null);
      setShowPromoteForm(false);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to promote user");
    } finally {
      setPromoting(false);
    }
  }

  // Filter users who aren't already moderators or owners
  const promotableUsers = allUsers.filter(
    (u) => u.role === "ADMIN" || u.role === "MODERATOR"
  );

  if (
    !currentUser ||
    (currentUser.role !== "ADMIN" && currentUser.role !== "OWNER")
  ) {
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
            // MODERATORS
          </h1>
          <p className="mt-2 font-mono text-[11px] text-white/40 uppercase tracking-[0.2em]">
            Manage event moderators
          </p>
        </div>
        <button
          onClick={() => setShowPromoteForm(!showPromoteForm)}
          className="bg-red-600 px-4 py-2 font-mono text-[11px] font-bold tracking-[0.2em] text-white uppercase hover:bg-red-500 transition-colors"
        >
          {showPromoteForm ? "× Cancel" : "+ Promote to Moderator"}
        </button>
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

      {/* Promote Form */}
      {showPromoteForm && (
        <form
          onSubmit={handlePromote}
          className="mb-8 border border-white/10 bg-white/5 p-6 rounded"
        >
          <h3 className="font-mono text-sm font-bold text-white uppercase tracking-[0.2em] mb-4">
            Promote User to Moderator
          </h3>

          <label className="block font-mono text-xs text-white/70 uppercase tracking-[0.15em]">
            SELECT USER
            <select
              required
              value={selectedUserId || ""}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="mt-1 block w-full rounded border border-white/20 bg-white/5 p-2.5 text-white focus:border-red-500 focus:outline-none"
            >
              <option value="">Choose a user...</option>
              {promotableUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.email} ({u.role})
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            disabled={promoting || !selectedUserId}
            className="mt-4 bg-red-600 px-5 py-2.5 font-mono text-[11px] font-bold tracking-[0.2em] text-white uppercase hover:bg-red-500 disabled:opacity-50 transition-colors"
          >
            {promoting ? "PROMOTING..." : "PROMOTE →"}
          </button>
        </form>
      )}

      {/* Moderators List */}
      {loading ? (
        <div className="border border-white/10 bg-white/5 rounded overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border-b border-white/10 p-4 animate-pulse">
              <div className="h-4 bg-white/10 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : moderators.length === 0 ? (
        <div className="border border-white/10 bg-white/5 p-8 rounded text-center">
          <p className="font-mono text-sm text-white/60">No moderators found.</p>
          <p className="mt-2 font-mono text-[11px] text-white/40">
            Promote users to moderator role using the button above.
          </p>
        </div>
      ) : (
        <div className="border border-white/10 bg-white/5 rounded overflow-hidden">
          <div className="grid grid-cols-[1fr,1fr,auto] border-b border-white/10">
            <div className="px-4 py-3 font-mono text-[10px] text-white/50 uppercase tracking-[0.2em]">
              Email
            </div>
            <div className="px-4 py-3 font-mono text-[10px] text-white/50 uppercase tracking-[0.2em]">
              Name
            </div>
            <div className="px-4 py-3 font-mono text-[10px] text-white/50 uppercase tracking-[0.2em]">
              Joined
            </div>
          </div>
          {moderators.map((mod) => (
            <div
              key={mod.id}
              className="grid grid-cols-[1fr,1fr,auto] border-b border-white/5 hover:bg-white/5"
            >
              <div className="px-4 py-3 font-mono text-xs text-white">{mod.email}</div>
              <div className="px-4 py-3 font-mono text-xs text-white/80">
                {mod.name || "—"}
              </div>
              <div className="px-4 py-3 font-mono text-[10px] text-white/40">
                {mod.createdAt ? new Date(mod.createdAt).toLocaleDateString() : "—"}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-8 border border-white/10 bg-white/5 p-4 rounded">
        <h4 className="font-mono text-[11px] text-white/60 uppercase tracking-[0.15em] mb-2">
          Moderator Permissions
        </h4>
        <ul className="space-y-1">
          <li className="font-mono text-[11px] text-white/40">✓ Edit event descriptions</li>
          <li className="font-mono text-[11px] text-white/40">
            ✓ Upload posters (1350x1080)
          </li>
          <li className="font-mono text-[11px] text-white/40">✗ Cannot add/manage users</li>
          <li className="font-mono text-[11px] text-white/40">
            ✗ Cannot promote other users
          </li>
        </ul>
      </div>
    </div>
  );
}

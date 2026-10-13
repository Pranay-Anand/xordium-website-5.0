"use client";

import { useEffect, useState } from "react";
import {
  getCurrentUser,
  fetchUsers,
  fetchInvitations,
  sendInvitation,
  type AdminUser,
  type Invitation,
} from "@/lib/admin-api";

export default function UsersPage() {
  const currentUser = getCurrentUser();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [lastInviteUrl, setLastInviteUrl] = useState("");
  const [copied, setCopied] = useState(false);

  // Invitation form state — only email + role; the invitee sets the rest.
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"ADMIN" | "MODERATOR">("MODERATOR");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [u, inv] = await Promise.all([
        fetchUsers(),
        fetchInvitations().catch(() => [] as Invitation[]),
      ]);
      setUsers(u);
      setInvitations(inv);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  async function handleSendInvite(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLastInviteUrl("");
    setCopied(false);
    setSending(true);

    try {
      const result = await sendInvitation({ email: newEmail, role: newRole });
      setLastInviteUrl(result.inviteUrl);
      setSuccess(
        result.emailSent
          ? `Invitation emailed to ${result.invitation.email}.`
          : `Invitation created, but the email could not be delivered. Share the link below manually.`
      );
      if (!result.emailSent && result.emailError) {
        setError(`Email delivery failed: ${result.emailError}`);
      }
      setNewEmail("");
      setNewRole("MODERATOR");
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invitation");
    } finally {
      setSending(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(lastInviteUrl);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  if (!currentUser || currentUser.role !== "OWNER") {
    return (
      <div className="border border-red-500/50 bg-red-500/10 p-6 rounded">
        <h2 className="font-mono text-sm font-bold text-red-400 uppercase tracking-[0.2em]">
          Access Denied
        </h2>
        <p className="mt-2 font-mono text-xs text-white/60">
          This page requires Owner privileges.
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
            // USERS
          </h1>
          <p className="mt-2 font-mono text-[11px] text-white/40 uppercase tracking-[0.2em]">
            Invite users by email — they set up their own account
          </p>
        </div>
        <button
          onClick={() => setShowInviteForm(!showInviteForm)}
          className="bg-red-600 px-4 py-2 font-mono text-[11px] font-bold tracking-[0.2em] text-white uppercase hover:bg-red-500 transition-colors"
        >
          {showInviteForm ? "× Cancel" : "+ Invite User"}
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

      {/* Invitation link fallback */}
      {lastInviteUrl && (
        <div className="mb-6 border border-amber-500/40 bg-amber-500/10 p-4 rounded">
          <p className="font-mono text-[10px] text-amber-400 uppercase tracking-[0.2em] mb-2">
            Invitation link (valid 24h, single use)
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <code className="flex-1 break-all font-mono text-[11px] text-white/80 bg-black/30 p-2 rounded">
              {lastInviteUrl}
            </code>
            <button
              onClick={copyLink}
              className="border border-white/20 bg-white/5 px-3 py-2 font-mono text-[10px] font-bold tracking-[0.15em] text-white/70 uppercase hover:bg-white/10 hover:text-white transition-colors"
            >
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>
        </div>
      )}

      {/* Invite Form */}
      {showInviteForm && (
        <form
          onSubmit={handleSendInvite}
          className="mb-8 border border-white/10 bg-white/5 p-6 rounded"
        >
          <h3 className="font-mono text-sm font-bold text-white uppercase tracking-[0.2em] mb-1">
            Invite New User
          </h3>
          <p className="font-mono text-[11px] text-white/40 mb-4">
            We email them a 24-hour link to set their own name, roll number, username and password.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <label className="block font-mono text-xs text-white/70 uppercase tracking-[0.15em]">
              EMAIL
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="user@institution.edu"
                className="mt-1 block w-full rounded border border-white/20 bg-white/5 p-2.5 text-white placeholder:text-white/30 focus:border-red-500 focus:outline-none"
              />
            </label>

            <label className="block font-mono text-xs text-white/70 uppercase tracking-[0.15em]">
              ROLE
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as "ADMIN" | "MODERATOR")}
                className="mt-1 block w-full rounded border border-white/20 bg-white/5 p-2.5 text-white focus:border-red-500 focus:outline-none"
              >
                <option value="MODERATOR" className="bg-neutral-900 text-white">
                  Moderator
                </option>
                <option value="ADMIN" className="bg-neutral-900 text-white">
                  Admin
                </option>
              </select>
            </label>
          </div>

          <button
            type="submit"
            disabled={sending}
            className="mt-4 bg-red-600 px-5 py-2.5 font-mono text-[11px] font-bold tracking-[0.2em] text-white uppercase hover:bg-red-500 disabled:opacity-50 transition-colors"
          >
            {sending ? "SENDING..." : "SEND INVITATION →"}
          </button>
        </form>
      )}

      {/* Users Table */}
      <h3 className="font-mono text-sm font-bold text-white uppercase tracking-[0.2em] mb-3">
        Active Users
      </h3>
      {loading ? (
        <div className="border border-white/10 bg-white/5 rounded overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="border-b border-white/10 p-4 animate-pulse">
              <div className="h-4 bg-white/10 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="border border-white/10 bg-white/5 p-8 rounded text-center">
          <p className="font-mono text-sm text-white/60">No users found.</p>
        </div>
      ) : (
        <div className="border border-white/10 bg-white/5 rounded overflow-hidden overflow-x-auto mb-8">
          <table className="w-full">
            <thead className="border-b border-white/10">
              <tr>
                <th className="px-4 py-3 text-left font-mono text-[10px] text-white/50 uppercase tracking-[0.2em]">
                  Email
                </th>
                <th className="px-4 py-3 text-left font-mono text-[10px] text-white/50 uppercase tracking-[0.2em]">
                  Username
                </th>
                <th className="px-4 py-3 text-left font-mono text-[10px] text-white/50 uppercase tracking-[0.2em]">
                  Roll No
                </th>
                <th className="px-4 py-3 text-left font-mono text-[10px] text-white/50 uppercase tracking-[0.2em]">
                  Name
                </th>
                <th className="px-4 py-3 text-left font-mono text-[10px] text-white/50 uppercase tracking-[0.2em]">
                  Role
                </th>
                <th className="px-4 py-3 text-left font-mono text-[10px] text-white/50 uppercase tracking-[0.2em]">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3 font-mono text-xs text-white">{u.email}</td>
                  <td className="px-4 py-3 font-mono text-xs text-white/80">
                    {u.username || "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-white/60">
                    {u.rollNo || "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-white/80">
                    {u.name || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.15em] rounded ${
                        u.role === "OWNER"
                          ? "bg-red-600/20 text-red-400 border border-red-500/50"
                          : u.role === "ADMIN"
                          ? "bg-blue-600/20 text-blue-400 border border-blue-500/50"
                          : "bg-white/10 text-white/60 border border-white/20"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[10px] text-white/40">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Invitations */}
      <h3 className="font-mono text-sm font-bold text-white uppercase tracking-[0.2em] mb-3">
        Sent Invitations
      </h3>
      {invitations.length === 0 ? (
        <div className="border border-white/10 bg-white/5 p-6 rounded text-center">
          <p className="font-mono text-xs text-white/50">No invitations sent yet.</p>
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
                  Role
                </th>
                <th className="px-4 py-3 text-left font-mono text-[10px] text-white/50 uppercase tracking-[0.2em]">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-mono text-[10px] text-white/50 uppercase tracking-[0.2em]">
                  Sent
                </th>
              </tr>
            </thead>
            <tbody>
              {invitations.map((inv) => {
                const expired = new Date(inv.expiresAt).getTime() <= Date.now();
                const status = inv.acceptedAt
                  ? "ACCEPTED"
                  : expired
                  ? "EXPIRED"
                  : "PENDING";
                return (
                  <tr key={inv.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3 font-mono text-xs text-white">{inv.email}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-white/60">
                      {inv.role}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.15em] rounded ${
                          status === "ACCEPTED"
                            ? "bg-green-600/20 text-green-400 border border-green-500/50"
                            : status === "PENDING"
                            ? "bg-amber-600/20 text-amber-400 border border-amber-500/50"
                            : "bg-white/10 text-white/50 border border-white/20"
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[10px] text-white/40">
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

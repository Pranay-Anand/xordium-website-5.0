"use client";

import { useEffect, useState } from "react";
import {
  getCurrentUser,
  fetchUsers,
  createUser,
  type AdminUser,
} from "@/lib/admin-api";

export default function UsersPage() {
  const currentUser = getCurrentUser();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Create user form state
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"ADMIN" | "MODERATOR">("MODERATOR");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setCreating(true);

    try {
      const result = await createUser({
        email: newEmail,
        name: newName,
        password: newPassword,
        role: newRole,
      });
      setSuccess(`User created: ${result.user.email}`);
      setNewEmail("");
      setNewName("");
      setNewPassword("");
      setNewRole("MODERATOR");
      setShowCreateForm(false);
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setCreating(false);
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
            Manage all admin users
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-red-600 px-4 py-2 font-mono text-[11px] font-bold tracking-[0.2em] text-white uppercase hover:bg-red-500 transition-colors"
        >
          {showCreateForm ? "× Cancel" : "+ Create User"}
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

      {/* Create User Form */}
      {showCreateForm && (
        <form
          onSubmit={handleCreateUser}
          className="mb-8 border border-white/10 bg-white/5 p-6 rounded"
        >
          <h3 className="font-mono text-sm font-bold text-white uppercase tracking-[0.2em] mb-4">
            Create New User
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <label className="block font-mono text-xs text-white/70 uppercase tracking-[0.15em]">
              EMAIL
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="mt-1 block w-full rounded border border-white/20 bg-white/5 p-2.5 text-white placeholder:text-white/30 focus:border-red-500 focus:outline-none"
              />
            </label>

            <label className="block font-mono text-xs text-white/70 uppercase tracking-[0.15em]">
              NAME
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="mt-1 block w-full rounded border border-white/20 bg-white/5 p-2.5 text-white placeholder:text-white/30 focus:border-red-500 focus:outline-none"
              />
            </label>

            <label className="block font-mono text-xs text-white/70 uppercase tracking-[0.15em]">
              PASSWORD (min 8 chars)
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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
                <option value="MODERATOR">Moderator</option>
                <option value="ADMIN">Admin</option>
              </select>
            </label>
          </div>

          <button
            type="submit"
            disabled={creating}
            className="mt-4 bg-red-600 px-5 py-2.5 font-mono text-[11px] font-bold tracking-[0.2em] text-white uppercase hover:bg-red-500 disabled:opacity-50 transition-colors"
          >
            {creating ? "CREATING..." : "CREATE USER →"}
          </button>
        </form>
      )}

      {/* Users Table */}
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
    </div>
  );
}

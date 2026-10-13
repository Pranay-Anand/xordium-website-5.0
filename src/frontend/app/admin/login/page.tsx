"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/admin-api";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      router.push("/admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-mono text-2xl font-bold tracking-[0.3em] text-white uppercase">
            XORDIUM // ADMIN
          </h1>
          <p className="mt-2 font-mono text-[11px] text-white/40 uppercase tracking-[0.2em]">
            Authentication Required
          </p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="border border-white/10 bg-white/5 p-6 rounded"
        >
          <label className="block font-mono text-xs text-white/70 uppercase tracking-[0.15em]">
            EMAIL
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@xordium.com"
              className="mt-1 block w-full rounded border border-white/20 bg-white/5 p-2.5 text-white placeholder:text-white/30 focus:border-red-500 focus:outline-none"
            />
          </label>

          <label className="mt-4 block font-mono text-xs text-white/70 uppercase tracking-[0.15em]">
            PASSWORD
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="mt-1 block w-full rounded border border-white/20 bg-white/5 p-2.5 text-white placeholder:text-white/30 focus:border-red-500 focus:outline-none"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full bg-red-600 py-2.5 font-mono text-[11px] font-bold tracking-[0.2em] text-white uppercase hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "AUTHENTICATING..." : "SIGN IN →"}
          </button>

          {error && (
            <div className="mt-4 border border-red-500/50 bg-red-500/10 p-3 rounded">
              <p className="font-mono text-xs text-red-400">{error}</p>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="font-mono text-[10px] text-white/30 uppercase tracking-[0.2em]">
            Owner &gt; Admin &gt; Moderator
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getInvitation, acceptInvitation } from "@/lib/admin-api";

const ROLL_NO_PATTERN = /^BTECH\/\d+\/\d+$/i;
const USERNAME_PATTERN = /^[a-z0-9_.]{3,32}$/;

type Phase = "loading" | "invalid" | "form" | "submitting" | "done";

export default function AcceptInvitePage() {
  const params = useParams<{ token: string }>();
  const token = params?.token ?? "";

  const [phase, setPhase] = useState<Phase>("loading");
  const [inviteError, setInviteError] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  const [name, setName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const inv = await getInvitation(token);
        if (cancelled) return;
        setEmail(inv.email);
        setRole(inv.role);
        setPhase("form");
      } catch (err) {
        if (cancelled) return;
        setInviteError(err instanceof Error ? err.message : "Invalid invitation.");
        setPhase("invalid");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (!ROLL_NO_PATTERN.test(rollNo.trim().toUpperCase())) {
      setFormError("Roll number must look like BTECH/150101/22.");
      return;
    }
    if (!USERNAME_PATTERN.test(username.trim().toLowerCase())) {
      setFormError("Username must be 3-32 characters: lowercase letters, numbers, _ or .");
      return;
    }
    if (password.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setFormError("Passwords do not match.");
      return;
    }

    setPhase("submitting");
    try {
      await acceptInvitation(token, {
        name: name.trim(),
        rollNo: rollNo.trim().toUpperCase(),
        username: username.trim().toLowerCase(),
        password,
      });
      setPhase("done");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to set up account.");
      setPhase("form");
    }
  }

  const inputClass =
    "mt-1 block w-full rounded border border-white/20 bg-white/5 p-2.5 text-white placeholder:text-white/30 focus:border-red-500 focus:outline-none";

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-8">
        <h1 className="font-mono text-2xl font-bold tracking-[0.2em] text-white uppercase">
          // SET UP ACCOUNT
        </h1>
        <p className="mt-2 font-mono text-[11px] text-white/40 uppercase tracking-[0.2em]">
          Complete your Xordium admin profile
        </p>
      </div>

      {phase === "loading" && (
        <div className="border border-white/10 bg-white/5 p-8 rounded">
          <p className="font-mono text-sm text-white/60 animate-pulse">
            Validating invitation…
          </p>
        </div>
      )}

      {phase === "invalid" && (
        <div className="border border-red-500/50 bg-red-500/10 p-6 rounded">
          <h2 className="font-mono text-sm font-bold text-red-400 uppercase tracking-[0.2em]">
            Invitation Unavailable
          </h2>
          <p className="mt-2 font-mono text-xs text-white/60">{inviteError}</p>
          <Link
            href="/admin/login"
            className="mt-4 inline-block font-mono text-[11px] font-bold tracking-[0.15em] text-red-400 uppercase hover:text-red-300"
          >
            ← Go to login
          </Link>
        </div>
      )}

      {phase === "done" && (
        <div className="border border-green-500/50 bg-green-500/10 p-6 rounded">
          <h2 className="font-mono text-sm font-bold text-green-400 uppercase tracking-[0.2em]">
            Account Ready
          </h2>
          <p className="mt-2 font-mono text-xs text-white/70">
            Your account has been created. Sign in with your username or email.
          </p>
          <Link
            href="/admin/login"
            className="mt-4 inline-block bg-red-600 px-5 py-2.5 font-mono text-[11px] font-bold tracking-[0.2em] text-white uppercase hover:bg-red-500 transition-colors"
          >
            CONTINUE TO LOGIN →
          </Link>
        </div>
      )}

      {(phase === "form" || phase === "submitting") && (
        <form
          onSubmit={handleSubmit}
          className="border border-white/10 bg-white/5 p-6 rounded"
        >
          <div className="mb-5 border border-white/10 bg-black/20 p-3 rounded">
            <p className="font-mono text-[10px] text-white/40 uppercase tracking-[0.2em]">
              Invited as
            </p>
            <p className="font-mono text-sm text-white mt-1">{email}</p>
            <p className="font-mono text-[11px] text-red-400 uppercase tracking-[0.15em] mt-1">
              {role}
            </p>
          </div>

          {formError && (
            <div className="mb-4 border border-red-500/50 bg-red-500/10 p-3 rounded">
              <p className="font-mono text-xs text-red-400">{formError}</p>
            </div>
          )}

          <div className="space-y-4">
            <label className="block font-mono text-xs text-white/70 uppercase tracking-[0.15em]">
              FULL NAME
              <input
                type="text"
                required
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className={inputClass}
              />
            </label>

            <label className="block font-mono text-xs text-white/70 uppercase tracking-[0.15em]">
              ROLL NUMBER
              <input
                type="text"
                required
                maxLength={30}
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value.toUpperCase())}
                placeholder="BTECH/150101/22"
                className={inputClass}
              />
              <span className="mt-1 block font-mono text-[10px] text-white/30">
                Format: BTECH/&lt;digits&gt;/&lt;digits&gt;
              </span>
            </label>

            <label className="block font-mono text-xs text-white/70 uppercase tracking-[0.15em]">
              USERNAME
              <input
                type="text"
                required
                minLength={3}
                maxLength={32}
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="jane.doe"
                className={inputClass}
              />
              <span className="mt-1 block font-mono text-[10px] text-white/30">
                3-32 chars: letters, numbers, _ or .
              </span>
            </label>

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block font-mono text-xs text-white/70 uppercase tracking-[0.15em]">
                PASSWORD
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="block font-mono text-xs text-white/70 uppercase tracking-[0.15em]">
                CONFIRM PASSWORD
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={inputClass}
                />
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={phase === "submitting"}
            className="mt-6 w-full bg-red-600 px-5 py-3 font-mono text-[11px] font-bold tracking-[0.2em] text-white uppercase hover:bg-red-500 disabled:opacity-50 transition-colors"
          >
            {phase === "submitting" ? "SETTING UP..." : "SET UP ACCOUNT →"}
          </button>
        </form>
      )}
    </div>
  );
}

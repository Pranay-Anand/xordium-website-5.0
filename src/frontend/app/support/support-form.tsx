"use client";

import { useState } from "react";

export default function SupportForm() {
  const [email, setEmail] = useState("");
  const [contents, setContents] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Sending…");
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, contents }),
      });
      if (!res.ok) {
        const message = await res.text();
        setStatus(`Error: ${message}`);
        return;
      }
      setEmail("");
      setContents("");
      setStatus("Ticket submitted.");
    } catch {
      setStatus("Error: network failure");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <label className="block font-mono text-xs text-white/70">
        EMAIL
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="squad-lead@college.edu"
          className="mt-1 block w-full rounded border border-white/20 bg-white/5 p-2.5 text-white placeholder:text-white/30"
        />
      </label>
      <label className="mt-4 block font-mono text-xs text-white/70">
        TRANSMISSION — MIN 10 CHARACTERS
        <textarea
          required
          value={contents}
          onChange={(e) => setContents(e.target.value)}
          placeholder="Describe the fault, bracket dispute, or hardware query..."
          className="mt-1 block w-full rounded border border-white/20 bg-white/5 p-2.5 text-white placeholder:text-white/30"
          rows={4}
        />
      </label>
      <button
        type="submit"
        className="mt-4 bg-red-600 px-5 py-2.5 font-mono text-[11px] font-bold tracking-[0.2em] text-white uppercase hover:bg-red-500"
      >
        Dispatch ticket →
      </button>
      {status !== null ? (
        <p className="mt-2 font-mono text-xs text-white/70">{status}</p>
      ) : null}
    </form>
  );
}

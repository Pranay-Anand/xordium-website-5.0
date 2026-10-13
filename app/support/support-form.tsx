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
    <form onSubmit={handleSubmit} className="mt-8 w-full max-w-md">
      <label className="block text-sm text-white/70">
        Email
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded border border-white/20 bg-white/5 p-2 text-white"
        />
      </label>
      <label className="mt-4 block text-sm text-white/70">
        What do you need help with? (min 10 characters)
        <textarea
          required
          value={contents}
          onChange={(e) => setContents(e.target.value)}
          className="mt-1 block w-full rounded border border-white/20 bg-white/5 p-2 text-white"
          rows={4}
        />
      </label>
      <button
        type="submit"
        className="mt-4 rounded bg-white px-4 py-2 font-semibold text-[#121318]"
      >
        Submit ticket
      </button>
      {status !== null ? (
        <p className="mt-2 text-sm text-white/70">{status}</p>
      ) : null}
    </form>
  );
}

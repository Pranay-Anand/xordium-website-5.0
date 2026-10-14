"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, fetchSupportMessages, type SupportMessage } from "@/lib/admin-api";

export default function SupportAdminPage() {
  const user = getCurrentUser();
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!user) return null;

  useEffect(() => {
    loadMessages();
  }, []);

  async function loadMessages() {
    try {
      const data = await fetchSupportMessages();
      setMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages");
    } finally {
      setLoading(false);
    }
  }

  function toggleExpand(id: string) {
    setExpandedId(expandedId === id ? null : id);
  }

  if (!user) return null;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-mono text-2xl font-bold tracking-[0.2em] text-white uppercase">
          // SUPPORT INBOX
        </h1>
        <p className="mt-2 font-mono text-[11px] text-white/40 uppercase tracking-[0.2em]">
          Manage incoming support messages from participants
        </p>
      </div>

      {error && (
        <div className="mb-4 border border-red-500/50 bg-red-500/10 p-3 rounded">
          <p className="font-mono text-xs text-red-400">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="border border-white/10 bg-white/5 p-4 rounded animate-pulse">
              <div className="h-4 bg-white/10 rounded w-1/3 mb-2" />
              <div className="h-3 bg-white/10 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : messages.length === 0 ? (
        <div className="border border-white/10 bg-white/5 p-8 rounded text-center">
          <p className="font-mono text-sm text-white/60">No support messages yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => {
            const isExpanded = expandedId === msg.id;
            return (
              <div
                key={msg.id}
                className="border border-white/10 bg-white/5 p-4 rounded hover:border-white/20 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-mono text-sm font-bold text-white">
                        {msg.name}
                      </p>
                      <p className="font-mono text-xs text-white/60">
                        {msg.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`inline-block px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.15em] rounded ${
                          msg.topic === "technical"
                            ? "bg-red-600/20 text-red-400 border border-red-500/50"
                            : msg.topic === "registration"
                            ? "bg-blue-600/20 text-blue-400 border border-blue-500/50"
                            : msg.topic === "bracket"
                            ? "bg-yellow-600/20 text-yellow-400 border border-yellow-500/50"
                            : msg.topic === "hardware"
                            ? "bg-orange-600/20 text-orange-400 border border-orange-500/50"
                            : msg.topic === "scrims"
                            ? "bg-green-600/20 text-green-400 border border-green-500/50"
                            : "bg-white/10 text-white/60 border border-white/20"
                        }`}
                      >
                        {msg.topic.toUpperCase()}
                      </span>
                      {msg.game && (
                        <span className="bg-purple-600/20 text-purple-400 border border-purple-500/50 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.15em] rounded">
                          {msg.game}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="font-mono text-[10px] text-white/40">
                      {new Date(msg.createdAt).toLocaleString()}
                    </p>
                    <button
                      onClick={() => toggleExpand(msg.id)}
                      className="bg-white/10 border border-white/20 px-3 py-1.5 font-mono text-[10px] font-bold text-white uppercase tracking-[0.15em] hover:bg-white/20 transition-colors"
                    >
                      {isExpanded ? "COLLAPSE" : "EXPAND"}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                    <div className="bg-black/30 p-4 rounded border border-white/10">
                      <p className="font-mono text-[10px] text-white/40 uppercase tracking-[0.15em] mb-1">
                        Message
                      </p>
                      <p className="font-mono text-xs text-white/80 whitespace-pre-wrap">
                        {msg.message}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 font-mono text-[10px] text-white/50">
                      <span>Topic: <span className="text-white/70">{msg.topic}</span></span>
                      {msg.game && (
                        <span>Game: <span className="text-white/70">{msg.game}</span></span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
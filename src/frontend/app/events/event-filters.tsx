"use client";

import { useMemo, useState } from "react";
import EventCard from "@/components/event-card";
import { events, getCategories } from "@/lib/events";

export default function EventFilters() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const categories = useMemo(() => ["All", ...getCategories()], []);

  const filtered = events.filter((e) => {
    const q = query.trim().toLowerCase();
    const matchesQuery =
      q.length === 0 ||
      `${e.title} ${e.description} ${e.venue} ${e.tag}`
        .toLowerCase()
        .includes(q);
    const matchesCategory = category === "All" || e.category === category;
    return matchesQuery && matchesCategory;
  });

  return (
    <>
      <div className="flex flex-col gap-2 rounded border border-white/10 bg-[#101218] p-3 lg:flex-row">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="⌕ Search protocols, LAN brackets, hardware rules or venue..."
          className="flex-1 bg-transparent px-2 py-2 font-mono text-xs text-white placeholder:text-white/35 focus:outline-none"
        />
        <div className="flex items-center gap-2 font-mono text-[11px] tracking-[0.15em] text-white/50 uppercase">
          <span>
            Sort by: <span className="text-white">Prize pool ↓</span>
          </span>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 font-mono text-[11px] tracking-[0.15em] uppercase">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`border px-3 py-1.5 ${
              category === c
                ? "border-red-600 bg-red-600 text-white"
                : "border-white/15 text-white/55 hover:bg-white/10"
            }`}
          >
            {c === "All" ? `All tracks • ${events.length}` : c}
          </button>
        ))}
      </div>
      <p className="mt-4 font-mono text-[11px] tracking-[0.2em] text-white/45 uppercase">
        ■ Combat & code protocols [ {String(filtered.length).padStart(2, "0")}{" "}
        verified competitions ]
      </p>
      <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((e) => (
          <EventCard key={e.slug} event={e} />
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className="mt-6 rounded border border-white/10 bg-[#101218] p-6 text-center font-mono text-xs text-white/50">
          No protocols match your query. Clear search or contact support.
        </p>
      ) : null}
    </>
  );
}

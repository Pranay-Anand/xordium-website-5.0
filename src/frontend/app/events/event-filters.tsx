"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { events, getCategories } from "@/lib/events";
import { getRegistrationHref } from "@/data/events";

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
      {/* Search bar */}
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

      {/* Category pills */}
      <div className="mt-3 flex flex-wrap gap-2 font-mono text-[11px] tracking-[0.15em] uppercase">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`border px-3 py-1.5 transition ${
              category === c
                ? "border-red-600 bg-red-600 text-white"
                : "border-white/15 text-white/55 hover:bg-white/10"
            }`}
          >
            {c === "All" ? `All tracks • ${events.length}` : c}
          </button>
        ))}
      </div>

      <p className="mt-6 font-mono text-[11px] tracking-[0.2em] text-white/45 uppercase">
        ■ Combat &amp; code protocols [{" "}
        {String(filtered.length).padStart(2, "0")} verified competitions ]
      </p>

      {filtered.length === 0 ? (
        <p className="mt-6 rounded border border-white/10 bg-[#101218] p-6 text-center font-mono text-xs text-white/50">
          No protocols match your query. Clear search or contact support.
        </p>
      ) : (
        <div className="mt-6 flex flex-col divide-y divide-white/10 border border-white/10">
          {filtered.map((e, i) => {
            // 1-indexed: odd events (1,3,5…) → description left, poster right
            //            even events (2,4,6…) → poster left, description right
            const posterOnLeft = (i + 1) % 2 === 0;

            const Poster = (
              <div className="group relative w-full lg:w-1/2 shrink-0">
                {/* 4:5 aspect ratio wrapper for portrait 1080×1350 images */}
                <div className="relative w-full" style={{ paddingBottom: "125%" }}>
                  <Image
                    src={e.image}
                    alt={e.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                  {/* Tag */}
                  <div className="absolute left-3 top-3 z-10">
                    <span className="bg-red-600 px-2 py-1 font-mono text-[9px] tracking-[0.2em] text-white uppercase">
                      {e.tag}
                    </span>
                  </div>
                  {/* Category */}
                  <div className="absolute right-3 top-3 z-10">
                    <span className="bg-black/70 px-2 py-1 font-mono text-[9px] tracking-[0.2em] text-cyan-300 uppercase">
                      {e.category}
                    </span>
                  </div>
                  {/* Edge fade toward the description side */}
                  <div
                    className={`absolute inset-0 z-10 hidden lg:block ${posterOnLeft
                        ? "bg-gradient-to-r from-transparent via-transparent to-[#101218]/60"
                        : "bg-gradient-to-l from-transparent via-transparent to-[#101218]/60"
                      }`}
                  />
                </div>
              </div>
            );

            const Info = (
              <div
                className={`flex w-full flex-col justify-center bg-[#101218] p-8 lg:w-1/2 ${posterOnLeft ? "lg:pl-10" : "lg:pr-10"
                  }`}
              >
                {/* Index */}
                <p className="font-mono text-[10px] tracking-[0.35em] text-red-500 uppercase">
                  {String(i + 1).padStart(2, "0")} /{" "}
                  {String(filtered.length).padStart(2, "0")}
                </p>

                <h3 className="mt-2 font-display text-2xl font-black leading-tight uppercase sm:text-3xl">
                  {e.title}
                </h3>

                <p className="mt-3 font-mono text-xs leading-relaxed text-white/60">
                  {e.description}
                </p>

                <dl className="mt-5 space-y-2 border-t border-white/10 pt-5 font-mono text-[11px]">
                  <div className="flex justify-between gap-4">
                    <dt className="text-white/40 uppercase">Venue</dt>
                    <dd className="text-right text-white/80">{e.venue}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-white/40 uppercase">Format</dt>
                    <dd className="text-right text-white/80">{e.format}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-white/40 uppercase">Schedule</dt>
                    <dd className="text-right text-white/80">{e.schedule}</dd>
                  </div>
                  {e.teamSize && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-white/40 uppercase">Team</dt>
                      <dd className="text-right text-white/80">{e.teamSize}</dd>
                    </div>
                  )}
                </dl>

                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                  <div>
                    <div className="font-mono text-[9px] tracking-[0.2em] text-white/40 uppercase">
                      Prize pool
                    </div>
                    <div className="font-display text-2xl font-black text-red-500">
                      {e.prizePool}
                    </div>
                    {e.prizeNote && (
                      <div className="font-mono text-[10px] text-cyan-300 uppercase">
                        {e.prizeNote}
                      </div>
                    )}
                  </div>
                  <Link
                    href={getRegistrationHref(e.slug)}
                    className="bg-red-600 px-5 py-2.5 font-mono text-[11px] font-bold tracking-[0.15em] text-white uppercase transition hover:bg-red-500"
                  >
                    {e.cta} →
                  </Link>
                </div>
              </div>
            );

            return (
              <div
                key={e.slug}
                className="flex flex-col lg:flex-row lg:items-stretch"
              >
                {posterOnLeft ? (
                  <>
                    {Poster}
                    {Info}
                  </>
                ) : (
                  <>
                    {Info}
                    {Poster}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

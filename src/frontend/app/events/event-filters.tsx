"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { events, getCategories } from "@/lib/events";
import { getRegistrationHref } from "@/data/events";
import MarkdownText from "@/components/markdown-text";

const FILTER_CATEGORIES = [
  "All",
  "Technical",
  "Esports",
  "Fun",
] as const;

type FilterCategory = (typeof FILTER_CATEGORIES)[number];

function getEventFilterCategory(eventCategory: string): FilterCategory {
  const technicalCategories = ["Hackathon", "Algorithms", "AI / ML", "Cybersecurity", "Hardware"];
  const esportsCategories = ["Esports"];
  const funCategories = ["Robotics", "Open"];

  if (technicalCategories.includes(eventCategory)) return "Technical";
  if (esportsCategories.includes(eventCategory)) return "Esports";
  if (funCategories.includes(eventCategory)) return "Fun";
  return "Fun";
}

export default function EventFilters() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<FilterCategory>("All");
  const [sortBy, setSortBy] = useState<"prize" | "date" | "title">("prize");

  const filteredEvents = useMemo(() => {
    let filtered = events.filter((e) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        q.length === 0 ||
        `${e.title} ${e.description} ${e.venue} ${e.tag}`
          .toLowerCase()
          .includes(q);
      const eventFilterCategory = getEventFilterCategory(e.category);
      const matchesCategory = category === "All" || eventFilterCategory === category;
      return matchesQuery && matchesCategory;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "prize":
          return parseFloat(b.prizePool.replace(/[^0-9.]/g, "")) - parseFloat(a.prizePool.replace(/[^0-9.]/g, ""));
        case "date":
          return a.schedule.localeCompare(b.schedule);
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [query, category, sortBy]);

  return (
    <div className="flex flex-col gap-6">
      {/* Category filters */}
      <div className="flex flex-wrap gap-2 font-mono text-[13px] tracking-[0.15em] uppercase">
        {FILTER_CATEGORIES.map((c) => (
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

      <p className="mt-6 font-mono text-[13px] tracking-[0.2em] text-white/40 uppercase">
        ■ Event protocols [{" "}
        {String(filteredEvents.length).padStart(2, "0")} active protocols ]
      </p>

      {/* Event cards grid */}
      {filteredEvents.length === 0 ? (
        <div className="border border-white/10 bg-[#101218] p-8 rounded text-center">
          <p className="font-mono text-[13px] text-white/60">No protocols match your query. Clear search or adjust filters.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {filteredEvents.map((e, i) => {
            // 1-indexed: odd events (1,3,5…) → poster left, description right
            //            even events (2,4,6…) → description left, poster right
            const posterOnLeft = (i + 1) % 2 === 0;

            const Poster = (
              <div className="group relative shrink-0 w-full lg:w-[35%] min-w-[280px] max-w-[420px]">
                <div className="relative aspect-[4/5] overflow-hidden rounded border border-white/10 bg-[#101218]">
                  <Image
                    src={e.image}
                    alt={e.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 35vw"
                    className="object-contain transition duration-700 group-hover:scale-102"
                  />
                  {/* Tag */}
                  <div className="absolute left-3 top-3 z-10">
                    <span className="bg-red-600 px-2 py-1 font-mono text-[13px] tracking-[0.2em] text-white uppercase">
                      {e.tag}
                    </span>
                  </div>
                  {/* Category */}
                  <div className="absolute right-3 top-3 z-10">
                    <span className="bg-black/70 px-2 py-1 font-mono text-[13px] tracking-[0.2em] text-cyan-300 uppercase">
                      {e.category}
                    </span>
                  </div>
                </div>
              </div>
            );

            const Info = (
              <div
                className={`flex w-full flex-col justify-center bg-[#0a0c10]/60 backdrop-blur-xl border border-white/10 p-5 lg:p-7 ${posterOnLeft ? "lg:pl-6" : "lg:pr-6"}`}
              >
                {/* Index */}
                <p className="font-mono text-[13px] tracking-[0.35em] text-red-500 uppercase">
                  {String(i + 1).padStart(2, "0")} /{" "}
                  {String(filteredEvents.length).padStart(2, "0")}
                </p>

                <h3 className="mt-1.5 font-display text-lg font-black leading-tight uppercase sm:text-xl">
                  {e.title}
                </h3>

                <MarkdownText className="mt-2 font-mono text-[13px] leading-relaxed text-white/60 line-clamp-3">
                  {e.description}
                </MarkdownText>

                <dl className="mt-4 space-y-2 border-t border-white/10 pt-4 font-mono text-[13px]">
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

                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                  <div>
                    <div className="font-mono text-[13px] tracking-[0.2em] text-white/40 uppercase">
                      Prize pool
                    </div>
                    <div className="font-display text-lg font-black text-red-500">
                      {e.prizePool}
                    </div>
                    {e.prizeNote && (
                      <div className="font-mono text-[13px] text-cyan-300 uppercase">
                        {e.prizeNote}
                      </div>
                    )}
                  </div>
                  <Link
                    href={getRegistrationHref(e.slug)}
                    className="bg-red-600 px-4 py-2 font-mono text-[13px] font-bold tracking-[0.15em] text-white uppercase transition hover:bg-red-500"
                  >
                    {e.cta} →
                  </Link>
                </div>
              </div>
            );

            return (
              <div
                key={e.slug}
                className="flex flex-col overflow-hidden border border-white/10 bg-[#0a0c10]/60 backdrop-blur-xl border border-white/10 lg:h-96 lg:flex-row lg:items-stretch rounded-xl overflow-hidden"
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
    </div>
  );
}

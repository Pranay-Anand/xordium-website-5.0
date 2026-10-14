import Image from "next/image";
import Link from "next/link";
import { getRegistrationHref } from "@/data/events";
import EventFilters from "./event-filters";
import { TOTAL_PRIZE_POOL, getEvent } from "@/lib/events";
import MarkdownText from "@/components/markdown-text";

export default function EventsPage() {
  const flagship = getEvent("synapse-protocol")!;

  return (
    <>
      <section className="border-b border-white/10 bg-gradient-to-b from-[#16090b] to-[#0a0c10]">
        <div className="mx-auto max-w-6xl px-4 pt-6 pb-5">
          <p className="font-mono text-[10px] tracking-[0.3em] text-red-500 uppercase">
            Syllabus 2026 // Arena directory active // Cycle 05
          </p>
          <h1 className="mt-1.5 font-display text-4xl leading-none font-black uppercase sm:text-6xl">
            Events directory{" "}
            <span className="text-red-600">{"//"}</span>{" "}
            <span className="text-cyan-300">競技一覧</span>
          </h1>
          <p className="mt-3 max-w-2xl font-mono text-xs leading-relaxed text-white/60">
            List of events, technical, esports and fun for you to drop in
            engineered for Birla Institute of Technology.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-5">
        {/* Flagship */}
        <div className="overflow-hidden rounded border border-white/10 bg-[#101218]">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-1.5">
            <p className="font-mono text-[10px] tracking-[0.2em] text-red-400 uppercase">
              Flagship // Hackathon
            </p>
            <p className="font-mono text-[10px] tracking-[0.2em] text-white/40 uppercase">
              36-hour sprint
            </p>
          </div>
          <div className="grid gap-4 p-4 md:grid-cols-[minmax(0,1fr)_13rem] md:gap-5 md:p-5">
            {/* Poster */}
            <div className="relative h-44 shrink-0 overflow-hidden rounded border border-white/10 md:order-2 md:h-auto">
              <Image
                src={flagship.image}
                alt={flagship.title}
                fill
                sizes="(max-width: 768px) 100vw, 13rem"
                className="object-cover"
              />
              <span className="absolute bottom-2 left-2 bg-black/70 px-2 py-0.5 font-mono text-[9px] tracking-[0.2em] text-white uppercase">
                {flagship.venue}
              </span>
            </div>

            {/* Details */}
            <div className="md:order-1">
              <h2 className="font-display text-2xl leading-tight font-black uppercase sm:text-3xl">
                {flagship.title}
              </h2>
              <MarkdownText className="mt-1.5 font-mono text-[11px] leading-relaxed text-white/60 line-clamp-3">
                {flagship.description}
              </MarkdownText>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] tracking-[0.12em] text-white/40 uppercase">
                {[
                  ["Prize", flagship.prizePool],
                  ["Team", "2 – 4"],
                  ["Duration", "36 hours"],
                  ["Hardware", "NVIDIA / ESP32"],
                ].map(([k, v]) => (
                  <span key={k}>
                    <span className="text-white/35">{k}:</span>{" "}
                    <span className="text-white/75">{v}</span>
                  </span>
                ))}
              </div>

              <div className="mt-3 rounded border border-white/10 bg-white/[0.03] p-3 font-mono text-[11px]">
                <p className="tracking-[0.2em] text-white/45 uppercase">
                  Evaluation matrix
                </p>
                <div className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-4">
                  {[
                    ["Architecture", "30%"],
                    ["Novelty", "25%"],
                    ["Stress test", "20%"],
                    ["UI telemetry", "15%"],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      className="flex items-baseline justify-between gap-2 sm:flex-col sm:items-start sm:gap-0"
                    >
                      <span className="text-white/70">{k}</span>
                      <span className="font-bold text-cyan-300">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Link
                  href={getRegistrationHref(flagship.slug)}
                  className="bg-red-600 px-5 py-2.5 text-center font-mono text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-red-500"
                >
                  Submit deck // Squad registration →
                </Link>
                <Link
                  href="/about"
                  className="border border-white/25 px-5 py-2.5 text-center font-mono text-[11px] tracking-[0.2em] uppercase hover:bg-white/10"
                >
                  ↓ Download ruleset_PDF
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Filters + grid */}
        <div className="mt-6">
          <EventFilters />
        </div>
      </section>
    </>
  );
}

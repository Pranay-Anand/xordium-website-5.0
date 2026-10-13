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
        <div className="mx-auto max-w-6xl px-4 pt-10 pb-8">
          <p className="font-mono text-[10px] tracking-[0.3em] text-red-500 uppercase">
            Syllabus 2026 // Arena directory active // Cycle 05
          </p>
          <h1 className="mt-2 font-display text-5xl leading-none font-black tracking-tight uppercase sm:text-7xl">
            Events directory{" "}
            <span className="text-red-600">{"//"}</span>{" "}
            <span className="text-cyan-300">競技一覧</span>
          </h1>
          <div className="mt-4 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <p className="max-w-2xl font-mono text-xs leading-relaxed text-white/60">
              Official syllabus of competitive tracks, endurance hackathons,
              hardware symposia, and premier national esports championships
              engineered for Birla Institute of Technology.
            </p>
            <div className="shrink-0 rounded border border-white/10 bg-[#101218] px-5 py-3">
              <p className="font-mono text-[10px] tracking-[0.25em] text-white/45 uppercase">
                Cumulative purse
              </p>
              <p className="font-display text-3xl font-black text-cyan-300">
                {TOTAL_PRIZE_POOL} INR
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        {/* Flagship */}
        <div className="overflow-hidden rounded border border-white/10 bg-[#101218]">
          <p className="bg-red-600 px-3 py-1 text-right font-mono text-[10px] tracking-[0.25em] text-white uppercase">
            Flagship specification // Hackathon
          </p>
          <div className="grid gap-6 p-5 lg:grid-cols-2">
            <div>
              <p className="font-mono text-[10px] tracking-[0.25em] text-cyan-300 uppercase">
                ■ Continuous time-frame // 36-hour sprint
              </p>
              <h2 className="mt-2 font-display text-3xl leading-tight font-black uppercase sm:text-4xl">
                {flagship.title}
              </h2>
              <MarkdownText className="mt-3 font-mono text-xs leading-relaxed text-white/60">
                {flagship.description}
              </MarkdownText>
              <div className="mt-4 rounded border border-white/10 p-4 font-mono text-[11px]">
                <p className="tracking-[0.2em] text-white/45 uppercase">
                  Official evaluation matrix // Weighting
                </p>
                {[
                  ["System architecture & zero-leak concurrency", "30%"],
                  ["Algorithmic novelty & quantization efficiency", "25%"],
                  ["Live jury stress test & hardware verification", "20%"],
                  ["UI telemetry & real-time proof", "15%"],
                ].map(([k, v]) => (
                  <div key={k} className="mt-2 flex justify-between gap-2">
                    <span className="text-white/70">{k}</span>
                    <span className="text-cyan-300">{v}</span>
                  </div>
                ))}
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
            <div>
              <div className="relative h-56 overflow-hidden rounded">
                <Image
                  src={flagship.image}
                  alt={flagship.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <span className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 font-mono text-[10px] tracking-[0.2em] text-white uppercase">
                  Stage 01 qualifier: {flagship.venue}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded border border-white/10 bg-white/10">
                {[
                  ["Prize pool", flagship.prizePool, flagship.prizeNote ?? ""],
                  ["Team limit", "2 – 4", "Engineers per squad"],
                  ["Run duration", "36 hours", "Non-stop synthesis"],
                  ["Allowed HW", "NVIDIA / ESP32", "Local runtime verified"],
                ].map(([k, v, n]) => (
                  <div key={k} className="bg-[#14161c] p-3">
                    <p className="font-mono text-[9px] tracking-[0.25em] text-white/45 uppercase">
                      {k}
                    </p>
                    <p className="font-display text-xl font-black">{v}</p>
                    <p className="font-mono text-[10px] text-cyan-300 uppercase">
                      {n}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Filters + grid */}
        <div className="mt-8">
          <EventFilters />
        </div>

        {/* Compliance */}
        <div className="mt-10 rounded border border-white/10 bg-[#101218] p-5">
          <h2 className="font-display text-2xl font-black uppercase">
            Participant compliance directives
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {[
              ["Eligibility & squads", "Bona fide undergraduate, postgraduate, and diploma students. Cross-institutional teams permitted across hackathon and CTF."],
              ["Hardware bring-in", "Personal rigs and microcontrollers pass quarantine safety inspection at Campus Gate 02 prior to arena admittance."],
              ["Disbursement dispatch", "Prize pools disbursed via verified digital transfer within 96 hours of victory declaration and jury sign-off."],
            ].map(([t, b]) => (
              <div key={t} className="rounded border border-white/10 p-4">
                <h3 className="font-mono text-xs font-bold tracking-[0.15em] text-cyan-300 uppercase">
                  {t}
                </h3>
                <p className="mt-2 font-mono text-[11px] leading-relaxed text-white/55">
                  {b}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

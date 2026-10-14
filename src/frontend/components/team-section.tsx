"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import SectionHeading from "@/components/section-heading";
import {
  president,
  vicePresidents,
  otherCoreExecutives,
  seniorCoordinators,
  juniorCoordinators,
  CoreMember,
  CoordinatorMember,
} from "@/data/team";

// ─── Placeholder Avatar (SVG data URI) ───────────────────────────────────────
const PLACEHOLDER_SVG = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'><rect width='400' height='400' fill='%23282a36'/><circle cx='200' cy='155' r='70' fill='%2344475a'/><ellipse cx='200' cy='340' rx='110' ry='80' fill='%2344475a'/></svg>`;

function resolveImage(src: string): string {
  // If the src still points to the placeholder path, use inline SVG
  if (src.includes("placeholder")) return PLACEHOLDER_SVG;
  return src;
}

// ─── Core Executive Card ──────────────────────────────────────────────────────
function CoreCard({
  member,
  size = "md",
}: {
  member: CoreMember;
  size?: "lg" | "md" | "sm";
}) {
  const [imgSrc, setImgSrc] = useState(resolveImage(member.image));

  const sizeClasses = {
    lg: "w-40 h-40 sm:w-48 sm:h-48",
    md: "w-32 h-32 sm:w-36 sm:h-36",
    sm: "w-24 h-24",
  };

  const nameClasses = {
    lg: "text-base sm:text-lg",
    md: "text-sm sm:text-base",
    sm: "text-xs sm:text-sm",
  };

  return (
    <div className="glass-panel group flex flex-col items-center gap-3 p-3">
      {/* Photo */}
      <div
        className={`relative ${sizeClasses[size]} rounded-full overflow-hidden border-2 border-white/10 group-hover:border-red-500/60 transition-all duration-300 shadow-lg group-hover:shadow-red-500/20 group-hover:shadow-xl`}
      >
        <Image
          src={imgSrc}
          alt={member.name}
          fill
          sizes="(max-width: 640px) 96px, 192px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setImgSrc(PLACEHOLDER_SVG)}
          unoptimized={imgSrc.startsWith("data:")}
        />
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Caption */}
      <div className="text-center">
        <p
          className={`font-display font-bold text-white leading-tight ${nameClasses[size]}`}
        >
          {member.name}
        </p>
        <p className="mt-0.5 font-mono text-[10px] tracking-widest text-cyan-400 uppercase">
          {member.post}
        </p>
        <p className="mt-0.5 font-mono text-[10px] text-white/40">
          {member.rollNo}
        </p>
      </div>
    </div>
  );
}

// ─── Coordinator Card ─────────────────────────────────────────────────────────
function CoordinatorCard({ member }: { member: CoordinatorMember }) {
  const [imgSrc, setImgSrc] = useState(resolveImage(member.image));

  return (
    <div className="glass-panel group flex w-full flex-col items-center gap-3 p-3">
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-cyan-400/60 transition-all duration-300 shadow-lg group-hover:shadow-cyan-400/20 group-hover:shadow-xl">
        <Image
          src={imgSrc}
          alt={member.name}
          fill
          sizes="128px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setImgSrc(PLACEHOLDER_SVG)}
          unoptimized={imgSrc.startsWith("data:")}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="text-center">
        <p className="font-display font-bold text-white text-sm leading-tight">
          {member.name}
        </p>
        <p className="mt-0.5 font-mono text-[10px] text-white/40">
          {member.rollNo}
        </p>
      </div>
    </div>
  );
}

// ─── Gallery Carousel ─────────────────────────────────────────────────────────
function CoordinatorGallery({
  members,
  id,
}: {
  members: CoordinatorMember[];
  id: string;
}) {
  const PAGE_SIZE = 4;

  // Sort A→Z by name at render time — data file order does not matter
  const sortedMembers = useMemo(
    () => [...members].sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" })),
    [members]
  );
  const totalPages = Math.ceil(sortedMembers.length / PAGE_SIZE);
  const [page, setPage] = useState(0);

  const visibleMembers = sortedMembers.slice(
    page * PAGE_SIZE,
    page * PAGE_SIZE + PAGE_SIZE
  );

  const prev = () => setPage((p) => Math.max(0, p - 1));
  const next = () => setPage((p) => Math.min(totalPages - 1, p + 1));

  if (sortedMembers.length === 0) return null;

  return (
    <div className="relative flex items-center gap-2 sm:gap-4">
      {/* Left Arrow */}
      <button
        id={`${id}-prev`}
        onClick={prev}
        disabled={page === 0}
        aria-label="Previous"
        className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full border border-white/15 bg-black/40 hover:bg-white/10 hover:border-white/30 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200 backdrop-blur-sm group"
      >
        <svg
          className="w-5 h-5 text-white group-hover:text-cyan-300 transition-colors"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {/* Cards */}
      <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 min-h-[200px]">
        {visibleMembers.map((m, i) => (
          <CoordinatorCard key={`${m.rollNo}-${i}`} member={m} />
        ))}
        {/* Fill empty slots to maintain layout */}
        {Array.from({ length: PAGE_SIZE - visibleMembers.length }).map((_, i) => (
          <div key={`empty-${i}`} className="invisible" />
        ))}
      </div>

      {/* Right Arrow */}
      <button
        id={`${id}-next`}
        onClick={next}
        disabled={page === totalPages - 1}
        aria-label="Next"
        className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full border border-white/15 bg-black/40 hover:bg-white/10 hover:border-white/30 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200 backdrop-blur-sm group"
      >
        <svg
          className="w-5 h-5 text-white group-hover:text-cyan-300 transition-colors"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Page dots */}
      {totalPages > 1 && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              id={`${id}-dot-${i}`}
              onClick={() => setPage(i)}
              aria-label={`Go to page ${i + 1}`}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                i === page
                  ? "bg-cyan-400 w-4"
                  : "bg-white/25 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main TeamSection Component ───────────────────────────────────────────────
export default function TeamSection() {
  return (
    <section className="border-y border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-16 space-y-20">
        <SectionHeading
          kicker="The people behind the machine"
          title="Our Team"
          blurb="The dedicated individuals who power Xordium — architects, coordinators, and operators working in unison."
        />

        {/* ── Core Executives ──────────────────────────────────────────── */}
        <div>
          <div className="mb-10 flex items-center gap-3">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
            <p className="font-mono text-[11px] tracking-[0.35em] text-red-400 uppercase">
              // Core Executives
            </p>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
          </div>

          {/* President */}
          <div className="flex justify-center mb-10">
            <div className="relative">
              <CoreCard member={president} size="lg" />
              {/* Crown / top indicator */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-red-600/90 rounded-sm">
                <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-white">
                  President
                </span>
              </div>
            </div>
          </div>

          {/* Vice Presidents */}
          <div className="flex justify-center gap-12 sm:gap-20 mb-12">
            {vicePresidents.map((vp, i) => (
              <div key={i} className="relative">
                <CoreCard member={vp} size="md" />
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-white/10 border border-white/20 rounded-sm whitespace-nowrap">
                  <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-cyan-300">
                    Vice President
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Connector line between president row and VP row and grid */}
          <div className="relative mb-6">
            <div className="border-t border-white/10" />
            <p className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0d0f14] px-3 font-mono text-[10px] tracking-[0.2em] text-white/25 uppercase whitespace-nowrap">
              Post Holders
            </p>
          </div>

          {/* Other post holders — 4 columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {otherCoreExecutives.map((m, i) => (
              <CoreCard key={i} member={m} size="sm" />
            ))}
          </div>
        </div>

        {/* ── Senior Coordinators ───────────────────────────────────────── */}
        <div>
          <div className="mb-10 flex items-center gap-3">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
            <p className="font-mono text-[11px] tracking-[0.35em] text-cyan-400 uppercase">
              // Senior Coordinators
            </p>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
          </div>
          <div className="pb-10">
            <CoordinatorGallery members={seniorCoordinators} id="senior-gallery" />
          </div>
        </div>

        {/* ── Junior Coordinators ───────────────────────────────────────── */}
        <div>
          <div className="mb-10 flex items-center gap-3">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
            <p className="font-mono text-[11px] tracking-[0.35em] text-white/50 uppercase">
              // Junior Coordinators
            </p>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
          </div>
          <div className="pb-10">
            <CoordinatorGallery members={juniorCoordinators} id="junior-gallery" />
          </div>
        </div>
      </div>
    </section>
  );
}

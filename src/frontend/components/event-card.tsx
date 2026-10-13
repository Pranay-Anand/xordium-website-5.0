import Image from "next/image";
import Link from "next/link";
import { getRegistrationHref } from "@/data/events";
import type { FestEvent } from "@/lib/events";
import MarkdownText from "@/components/markdown-text";

export default function EventCard({ event }: { event: FestEvent }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded border border-white/10 bg-[#101218]">
      <div className="relative h-44 overflow-hidden">
        <Image
          src={event.image}
          alt={event.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-2 font-mono text-[9px] tracking-[0.2em] uppercase">
          <span className="bg-red-600 px-2 py-1 text-white">{event.tag}</span>
          <span className="bg-black/70 px-2 py-1 text-cyan-300">
            {event.category}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-lg leading-tight font-extrabold text-white uppercase">
          {event.title}
        </h3>
        <MarkdownText className="mt-2 line-clamp-3 font-mono text-xs leading-relaxed text-white/55">
          {event.description}
        </MarkdownText>
        <dl className="mt-3 space-y-1 border-t border-white/10 pt-3 font-mono text-[11px]">
          <div className="flex justify-between gap-2">
            <dt className="text-white/40 uppercase">Venue</dt>
            <dd className="text-right text-white/80">{event.venue}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-white/40 uppercase">Format</dt>
            <dd className="text-right text-white/80">{event.format}</dd>
          </div>
        </dl>
        <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
          <div>
            <div className="font-mono text-[9px] tracking-[0.2em] text-white/40 uppercase">
              Prize pool
            </div>
            <div className="font-display text-xl font-black text-red-500">
              {event.prizePool}
            </div>
          </div>
          <Link
            href={getRegistrationHref(event.slug)}
            className="bg-red-600 px-4 py-2 font-mono text-[11px] font-bold tracking-[0.15em] text-white uppercase transition hover:bg-red-500"
          >
            {event.cta} →
          </Link>
        </div>
      </div>
    </article>
  );
}

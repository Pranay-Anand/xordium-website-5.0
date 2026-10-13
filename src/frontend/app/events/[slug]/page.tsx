import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRegistrationHref } from "@/data/events";
import { events, getEvent } from "@/lib/events";
import MarkdownText from "@/components/markdown-text";

export function generateStaticParams() {
  return events.map((e) => ({ slug: e.slug }));
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = getEvent(slug);
  if (event === undefined) notFound();

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <Link
        href="/events"
        className="font-mono text-[11px] tracking-[0.2em] text-white/50 uppercase hover:text-white"
      >
        ← Back to directory
      </Link>
      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <div className="relative min-h-72 overflow-hidden rounded border border-white/10">
          <Image
            src={event.image}
            alt={event.title}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            priority
          />
          <span className="absolute top-2 left-2 bg-red-600 px-2 py-1 font-mono text-[10px] tracking-[0.2em] uppercase">
            {event.tag}
          </span>
        </div>
        <div>
          <p className="font-mono text-[11px] tracking-[0.25em] text-cyan-300 uppercase">
            {event.category} // {event.schedule}
          </p>
          <h1 className="mt-2 font-display text-4xl leading-tight font-black uppercase">
            {event.title}
          </h1>
          <MarkdownText className="mt-3 font-mono text-xs leading-relaxed text-white/60">
            {event.description}
          </MarkdownText>
          <dl className="mt-5 space-y-2 rounded border border-white/10 bg-[#101218] p-4 font-mono text-xs">
            {[
              ["Prize pool", event.prizePool],
              ["Venue", event.venue],
              ["Format", event.format],
              ["Schedule", event.schedule],
              ...(event.teamSize !== undefined
                ? [["Squad", event.teamSize] as [string, string]]
                : []),
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3">
                <dt className="tracking-[0.2em] text-white/40 uppercase">{k}</dt>
                <dd className="text-right text-white">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Link
              href={getRegistrationHref(event.slug)}
              className="bg-red-600 px-5 py-2.5 text-center font-mono text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-red-500"
            >
              {event.cta} // Register →
            </Link>
            <Link
              href="/events"
              className="border border-white/25 px-5 py-2.5 text-center font-mono text-[11px] tracking-[0.2em] uppercase hover:bg-white/10"
            >
              All events
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

import Image from "next/image";
import Link from "next/link";
import Countdown from "@/components/countdown";
import EventCard from "@/components/event-card";
import HomepageCarousel from "@/components/homepage-carousel";
import SectionHeading from "@/components/section-heading";
import { REGISTRATION_DEADLINE, getFeaturedEvents } from "@/lib/events";

const stats = [
  { value: "$15,000+", label: "Prize pool & bounty contracts" },
  { value: "128+ TEAMS", label: "Collegiate varsity contenders" },
  { value: "96 HOURS", label: "Continuous tournament stream" },
  { value: "BIT CAMPUS", label: "Mesra // 550 acre complex" },
];

const schedule = [
  {
    time: "09:00 – 11:30",
    title: "Registration convergence & hardware verification",
    detail: "ID & peripheral inspection, LAN seat assignment.",
    venue: "Tech Complex Hall A",
    mode: "Mandatory",
  },
  {
    time: "12:00 – 13:30",
    title: "Xordium 5.0 ceremonial keynote & bracket draw",
    detail: "Official ceremony featuring Ignite leads, tournament directors, live draw.",
    venue: "Main Auditorium",
    mode: "Ceremony live",
  },
  {
    time: "14:30 – 20:00",
    title: "Valorant LAN group stage // Round of 32",
    detail: "Parallel simultaneous combat sessions on dual 128-tick racks.",
    venue: "Arena Ground 01",
    mode: "Elimination",
  },
  {
    time: "21:00 – Late",
    title: "Synapse hackathon: kickoff & problem statement drop",
    detail: "36-hour timer initiates. Enterprise sponsors release forget briefs.",
    venue: "Innovation Labs",
    mode: "Sprint start",
  },
];

const directives = [
  {
    n: "01",
    title: "Eligibility verification",
    body: "Participants must present valid collegiate ID. Cross-institutional squads permitted across hackathon and CTF categories.",
  },
  {
    n: "02",
    title: "Peripheral & hardware sanction",
    body: "Personal mice, keyboards, and controllers scanned before LAN deployment. No unauthorized firmware.",
  },
  {
    n: "03",
    title: "Accommodation & campus lodging",
    body: "On-campus hostels with 24/7 cafeteria access. Allotment for participants with confirmed stage-02 registration.",
  },
  {
    n: "04",
    title: "Fair-play & integrity charter",
    body: "Zero-tolerance anti-cheat. Unauthorized client monitoring triggers instantaneous removal and academic notification.",
  },
];

export default function Home() {
  const featured = getFeaturedEvents();

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <Image
          src="/assets/valorant-jett.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0c10]/60 via-[#0a0c10]/85 to-[#0a0c10]" />
        <div className="relative mx-auto max-w-6xl px-4 pt-14 pb-10 text-center">
          <p className="font-mono text-[10px] tracking-[0.3em] text-red-500 uppercase">
            ■ Birla Institute of Technology // Ignite x Esports // 2026 edition
          </p>
          <p className="mt-3 font-mono text-[11px] tracking-[0.3em] text-white/60 uppercase">
            Flagship technical events • Premier eSports arena
          </p>
          <h1 className="mt-2 font-display text-6xl leading-none font-black tracking-tight sm:text-8xl">
            XORDIUM <span className="text-red-600">5.0</span>
          </h1>
          <p className="font-display text-xl font-bold tracking-[0.4em] text-white/80">
            YEAR 2026
          </p>
          <p className="mx-auto mt-4 max-w-2xl font-mono text-sm leading-relaxed text-white/60 sm:text-base">
            Where cybernetic intellect confronts elite esports
            execution. A week of inter-collegiate competition, showcasing the
            pinnacle of collegiate esports and intellectual prowess.
          </p>
          <div className="mx-auto mt-6 max-w-xl">
            <Countdown target={REGISTRATION_DEADLINE} caption="Event commence in" />
          </div>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/events"
              className="bg-red-600 px-6 py-3 font-mono text-xs font-bold tracking-[0.2em] uppercase hover:bg-red-500"
            >
              Explore all events →
            </Link>
            <Link
              href=""
              className="border border-white/25 px-6 py-3 font-mono text-xs tracking-[0.2em] uppercase hover:bg-white/10"
            >
              ↓ Official Brochure [PDF]
            </Link>
          </div>
          <div className="mx-auto mt-8 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded border border-white/10 bg-white/10 sm:grid-cols-4">
          </div>
        </div>
      </section>

      {/* FEATURED COMPETITIONS */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <SectionHeading
          kicker="Transmission specifications // 01"
          title="Featured competitions"
          blurb="Engineered for extreme performance. Each track carries strict tournament guidelines, certified adjudicators, enterprise compute nodes, and direct cash disbursements."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((e) => (
            <EventCard key={e.slug} event={e} />
          ))}
        </div>
      </section>

      <HomepageCarousel />

      {/* SCHEDULE */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <SectionHeading
          kicker="Festival timetable // Featured timetable"
          title="Festival schedule timetable"
          blurb="Structured four-day competitive continuum across the BIT collegiate campus. All times indexed to Indian Standard Time (IST)."
        />
        <div className="mb-4 flex gap-2 overflow-x-auto font-mono text-[11px] tracking-[0.15em] uppercase">
          {["Day 01 // Arrival & opening", "Day 02 // Bracket battles", "Day 03 // 24h sprint & mecha", "Day 04 // Grand finals & awards"].map(
            (d, i) => (
              <span
                key={d}
                className={`shrink-0 border px-3 py-2 ${
                  i === 0
                    ? "border-red-600 bg-red-600 text-white"
                    : "border-white/15 text-white/50"
                }`}
              >
                {d}
              </span>
            ),
          )}
        </div>
        <div className="space-y-2">
          {schedule.map((s) => (
            <div
              key={s.title}
              className="grid gap-2 rounded border border-white/10 bg-[#101218] p-4 sm:grid-cols-[140px_1fr_auto] sm:items-center"
            >
              <span className="font-mono text-xs text-cyan-300">{s.time}</span>
              <div>
                <h3 className="font-display text-sm font-extrabold tracking-wide uppercase">
                  {s.title}
                </h3>
                <p className="font-mono text-[11px] text-white/50">{s.detail}</p>
              </div>
              <div className="flex gap-2 font-mono text-[10px] tracking-[0.15em] uppercase">
                <span className="border border-white/15 px-2 py-1 text-white/60">
                  {s.venue}
                </span>
                <span className="border border-red-600/50 px-2 py-1 text-red-400">
                  [{s.mode}]
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* VENUE */}
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-14 lg:grid-cols-2">
        <div>
          <SectionHeading
            kicker="Campus geospatial node"
            title="Birla Institute of Technology"
          />
          <p className="font-mono text-xs leading-relaxed text-white/60">
            Patna Campus
          </p>
          <p className="mt-3 font-mono text-[11px] text-white/45">
            Birla Institute of Technology, Patna, Bihar 800014
            <br />
            ignite@bitmesra.ac.in
          </p>
        </div>
        <div className="relative min-h-64 overflow-hidden rounded border border-white/10">
          <Image
            src="/assets/treasure-hunt.jpg"
            alt="BIT campus arena map"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover opacity-80"
          />
          <span className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 font-mono text-[10px] tracking-[0.2em] text-cyan-300 uppercase">
            Coordinates - 25.59556, 85.08639
          </span>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/10 bg-gradient-to-b from-[#16090b] to-[#0a0c10]">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <p className="font-mono text-[11px] tracking-[0.3em] text-red-500 uppercase">
            {"//"} Comms endpoint
          </p>
          <h2 className="mt-2 font-display text-4xl font-black uppercase sm:text-5xl">
            Enter the Xordium 5.0 arena
          </h2>
          <p className="mx-auto mt-3 max-w-xl font-mono text-xs text-white/55">
            Registration Phase 01 slots are allocated on a rolling
            qualification basis. Final roster freezes 72 hours before opening
            ceremonies.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="bg-red-600 px-6 py-3 font-mono text-xs font-bold tracking-[0.2em] uppercase hover:bg-red-500"
            >
              Authenticate & register now →
            </Link>
            <Link
              href="/support"
              className="border border-white/25 px-6 py-3 font-mono text-xs tracking-[0.2em] uppercase hover:bg-white/10"
            >
              Join Discord comms
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

import Image from "next/image";
import Link from "next/link";
import SectionHeading from "@/components/section-heading";
import TeamSection from "@/components/team-section";

const scale = [{
  value: "06", label: "Engineering depts — CSE, AIML, ECE, EEE, ME and CE unified under single arena infrastructure"
}, {value: "02", label: "Student guilds — autonomous branches operating technical & esports"}, {
  value: "12h", label: "Non-stop uninterrupted compute"
}, {value: "100%", label: "Student-crafted"},];

export default function AboutPage() {
  return (<>
    <section className="border-b border-white/10">
      <div className="mx-auto max-w-6xl px-4 pt-10 pb-8">
        <p className="font-mono text-[10px] tracking-[0.3em] text-red-500 uppercase">
          Sys // Declassified overview // Protocol 2026
        </p>
        <h1 className="mt-2 font-display text-5xl leading-none font-black uppercase sm:text-7xl">
          About <span className="text-red-600">Xordium 5.0</span>
        </h1>
        <p className="mt-1 font-display text-2xl font-bold text-cyan-300">
          {"//"} 概要・電脳電波核
        </p>
        <p className="mt-3 max-w-2xl font-mono text-xs leading-relaxed text-white/60">
          The convergence of bleeding-edge open hardware, algorithmic
          dominance, underground cyberpunk culture, and Tier-1 collegiate
          esports warfare at Birla Institute of Technology.
        </p>
      </div>
    </section>

    {/* Manifesto */}
    <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-2">
      <div className="relative min-h-80 overflow-hidden rounded border border-white/10">
        <Image
          src="/assets/Xordium Banner.jpeg"
          alt="Xordium arena"
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
        <span
          className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 font-mono text-[10px] tracking-[0.2em] uppercase">
          Comming Soon
        </span>
      </div>
      <div>
        <p className="font-mono text-[11px] tracking-[0.3em] text-red-500 uppercase">
          // Symposium manifesto
        </p>
        <blockquote className="mt-2 font-display text-3xl leading-tight font-black uppercase">
          “We reject the slide deck and measure the{" "}
          <span className="text-red-600">solder seam</span>.”
        </blockquote>
        <p className="mt-4 font-mono text-xs leading-relaxed text-white/60">
          Xordium is the annual flagship fest of
          Club Ignite and the eSports Society of
          Birla Institute of Technology, Mesra –
          Off Campus, Patna.
        </p>
        <p className="mt-2 font-mono text-xs leading-relaxed text-white/60">
          Xordium brings together technology
          enthusiasts, gamers, and creators from
          across campuses to experience a dynamic
          blend of technical workshops, competitive
          events, eSports tournaments, and funfilled
          challenges. From coding battles
          and robotics showdowns to highenergy
          gaming arenas and creative contests,
          every segment of Xordium is designed to
          ignite minds and fuel collaboration.
        </p>
      </div>
    </section>

    {/* Scale */}
    <section className="border-y border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <SectionHeading
          kicker="Telemetry benchmarks"
          title="Scale of engagement"
        />
        <div
          className="glass-panel grid gap-px overflow-hidden sm:grid-cols-2 lg:grid-cols-4">
          {scale.map((s) => (<div key={s.label} className="bg-transparent p-5">
            <p className="font-display text-5xl font-black">{s.value}</p>
            <p className="mt-2 font-mono text-[11px] leading-relaxed text-white/55">
              {s.label}
            </p>
          </div>))}
        </div>
      </div>
    </section>

    {/*{Team}*/}
    <TeamSection />


    {/* CTA */}
    <section className="border-t border-white/10">
      <div className="glass-panel mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-12 sm:flex-row">
        <div>
          <h2 className="font-display text-3xl font-black uppercase">
            Prepare your deck for 2026
          </h2>
        </div>
        <div className="flex gap-2">
          <Link
            href="/register"
            className="bg-red-600 px-5 py-2.5 font-mono text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-red-500"
          >
            Register delegate →
          </Link>
          <Link
            href="/events"
            className="border border-white/25 px-5 py-2.5 font-mono text-[11px] tracking-[0.2em] uppercase hover:bg-white/10"
          >
            Explore tracks
          </Link>
        </div>
      </div>
    </section>
  </>);
}

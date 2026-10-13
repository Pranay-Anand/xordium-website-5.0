import Image from "next/image";
import Link from "next/link";
import SectionHeading from "@/components/section-heading";

const scale = [
  { value: "04", label: "Engineering depts — CSE, ECE, EEE unified under single arena infrastructure" },
  { value: "05", label: "Student guilds — autonomous branches operating combat robotics, CTF, esports" },
  { value: "48h", label: "Non-stop labs — uninterrupted compute, power conditioning, live telemetry" },
  { value: "100%", label: "Student-crafted — from arena polycarbonate cages to custom bracket servers" },
];

const guilds = [
  { n: "Division 01", name: "ACM Student Chapter", spec: "Algorithmic tracks", body: "Supervising the algorithmic showdowns, competitive data structures speedruns, and low-level C++ micro-optimizations under adversarial constraints." },
  { n: "Division 02", name: "IEEE Student Branch", spec: "RF & signal processing", body: "Directing RF, software-defined radio, and signal interception challenges, plus signal telemetry decodes during live wireless capture drills." },
  { n: "Division 03", name: "The Robotics Club", spec: "Combat arena & kinematics", body: "Engineering the heavyweight combat robot brackets, autonomous line-traversal, and extreme torque stress runs." },
  { n: "Division 04", name: "Cybersec Guild", spec: "CTF defense & exploitation", body: "Architects of the live red-team vs blue-team jeopardy CTF arena, reverse-engineering pavilions, and air-gapped simulated SCADA rigs." },
  { n: "Division 05", name: "Design & Prototyping", spec: "UI/UX & spatial art", body: "Responsible for ergonomic human-machine interaction, physical neon installation design, broadcast telemetry graphics, and stadium visuals." },
  { n: "Division 06", name: "Ignite x Esports Council", spec: "Competitive arena ops", body: "The apex esports arm steering the tournament brackets, low-latency LAN fabric, caster desks, and multi-stream live production feeds." },
];

const transit = [
  ["Patna Junction (PNBE)", "Every 45 min", "07:00 – 22:00"],
  ["Jai Prakash Airport (PAT)", "Hourly", "08:00 – 21:00"],
  ["Patliputra Jn (PPTA)", "Every 60 min", "07:30 – 22:00"],
];

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-white/10 bg-gradient-to-b from-[#16090b] to-[#0a0c10]">
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
            src="/assets/fifa.jpg"
            alt="Xordium arena"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover grayscale"
          />
          <span className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 font-mono text-[10px] tracking-[0.2em] uppercase">
            Testing bench • 01 — Stable
          </span>
        </div>
        <div>
          <p className="font-mono text-[11px] tracking-[0.3em] text-red-500 uppercase">
            ⚡ Section 01 // Symposium manifesto
          </p>
          <blockquote className="mt-2 font-display text-3xl leading-tight font-black uppercase">
            “We reject the slide deck and measure the{" "}
            <span className="text-red-600">solder seam</span>.”
          </blockquote>
          <p className="mt-4 font-mono text-xs leading-relaxed text-white/60">
            Xordium emerged out of sheer dissatisfaction with sterile academia
            and decorative hackathons. We believe that true computational
            fluency happens when real silicon meets high-voltage tension,
            zero-day threat simulations, and high-frequency esports
            battlefields.
          </p>
          <p className="mt-2 font-mono text-xs leading-relaxed text-white/60">
            At Birla Institute of Technology Patna, our halls do not simulate
            theories — they prototype combat kinematics, test RF vulnerability
            vectors, and host high-octane stadium-scale competitive games where
            every millisecond is fought with surgical resolve.
          </p>
        </div>
      </section>

      {/* Scale */}
      <section className="border-y border-white/10 bg-[#0d0f14]">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <SectionHeading
            kicker="Section 02 // Telemetry benchmarks"
            title="Scale of engagement"
          />
          <div className="grid gap-px overflow-hidden rounded border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {scale.map((s) => (
              <div key={s.label} className="bg-[#101218] p-5">
                <p className="font-display text-5xl font-black">{s.value}</p>
                <p className="mt-2 font-mono text-[11px] leading-relaxed text-white/55">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guilds */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <SectionHeading
          kicker="Section 03 // Guild directory"
          title="Organizing affiliates & guilds"
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {guilds.map((g, i) => (
            <div
              key={g.name}
              className={`rounded border border-white/10 border-l-4 bg-[#101218] p-5 ${
                i % 3 === 0
                  ? "border-l-red-600"
                  : i % 3 === 1
                    ? "border-l-cyan-400"
                    : "border-l-red-600"
              }`}
            >
              <p className="font-mono text-[10px] tracking-[0.25em] text-white/40 uppercase">
                {g.n}
              </p>
              <h3 className="mt-1 font-display text-lg font-extrabold uppercase">
                {g.name}
              </h3>
              <p className="mt-2 font-mono text-[11px] leading-relaxed text-white/55">
                {g.body}
              </p>
              <p className="mt-3 font-mono text-[10px] tracking-[0.2em] text-cyan-300 uppercase">
                Specs: {g.spec} →
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Coordinates */}
      <section className="border-y border-white/10 bg-[#0d0f14]">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              kicker="Section 04 // Venue geography & transit"
              title="Coordinates & arena topography"
            />
            <p className="font-mono text-sm text-white">
              25°35′58.2″N 85°05′12.1″E
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {["Main Auditorium", "Complex B Terminals", "Arena West Pit", "Microelectronics Lab"].map(
                (z) => (
                  <div
                    key={z}
                    className="rounded border border-white/10 bg-[#101218] p-3 font-mono text-[11px] text-white/70"
                  >
                    {z}
                  </div>
                ),
              )}
            </div>
          </div>
          <div className="rounded border border-white/10 bg-[#101218] p-4">
            <p className="font-mono text-[10px] tracking-[0.25em] text-white/45 uppercase">
              Official transit timetable — live
            </p>
            <div className="mt-3 space-y-2">
              {transit.map(([stop, freq, hours]) => (
                <div
                  key={stop}
                  className="flex items-center justify-between gap-2 border-b border-white/10 pb-2 font-mono text-[11px]"
                >
                  <span className="text-white">{stop}</span>
                  <span className="text-white/50">{freq}</span>
                  <span className="text-cyan-300">{hours}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Directorate */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <SectionHeading
          kicker="Section 05 // Governance & steering"
          title="Directorate & convenor protocols"
        />
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Dr. Rajesh K. Sharma", "Head of Distributed Computing & Cybersecure Research Lab", "rajesk.cse@bitmesra.ac.in"],
            ["Dr. Ananya Sen", "Associate Professor & Chair, Embedded System Synthesis Group", "asen.ee@bitmesra.ac.in"],
            ["Aayush Verma", "Ignite Council President • Final Year Computer Science", "convenor@xordium.ignite.bit.in"],
          ].map(([name, role, mail]) => (
            <div
              key={name}
              className="rounded border border-white/10 bg-[#101218] p-5"
            >
              <h3 className="font-display text-lg font-extrabold uppercase">
                {name}
              </h3>
              <p className="mt-1 font-mono text-[11px] text-white/55">{role}</p>
              <p className="mt-3 font-mono text-[11px] text-cyan-300">{mail}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded border border-red-600/40 bg-red-950/20 p-5">
          <h3 className="font-display text-lg font-extrabold tracking-wide text-red-400 uppercase">
            Zero-tolerance policy
          </h3>
          <p className="mt-2 font-mono text-[11px] leading-relaxed text-white/60">
            Hardware & RF fair play: any unauthorized spectrum jamming,
            malicious bots, or physical sabotage of rival combat bots results
            in immediate disqualification. Script exploitation and unsanctioned
            macros invoke instantaneous forfeit and permanent league
            blacklisting.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/10 bg-gradient-to-b from-[#16090b] to-[#0a0c10]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-12 sm:flex-row">
          <div>
            <h2 className="font-display text-3xl font-black uppercase">
              Prepare your deck for 2026
            </h2>
            <p className="mt-1 font-mono text-xs text-white/55">
              Join 3,000+ collegiate competitors across 40+ premier technical
              institutes.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/events"
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
    </>
  );
}

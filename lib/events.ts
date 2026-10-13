export type EventCategory =
  | "Esports"
  | "Hackathon"
  | "Robotics"
  | "AI / ML"
  | "Cybersecurity"
  | "Algorithms"
  | "Hardware"
  | "Open";

export interface FestEvent {
  slug: string;
  tag: string;
  title: string;
  category: EventCategory;
  description: string;
  image: string;
  prizePool: string;
  prizeNote?: string;
  venue: string;
  format: string;
  schedule: string;
  teamSize?: string;
  cta: string;
  featured?: boolean;
}

export const FESTIVAL_START = new Date("2026-12-18T09:00:00+05:30");

export const TOTAL_PRIZE_POOL = "₹4,85,000";

export const events: FestEvent[] = [
  {
    slug: "synapse-protocol",
    tag: "HACK-SYN-01",
    title: "Synapse Protocol: Decentralized Edge & Kinetic Compute",
    category: "Hackathon",
    description:
      "National flagship 36-hour endurance hackathon. Fault-tolerant distributed networks, local LLM quantization pipelines, and autonomous device coordination under artificial network degradation.",
    image: "/events/hackathon.jpg",
    prizePool: "₹1,20,000",
    prizeNote: "Cash + incubation",
    venue: "Central Computer Centre // Lab 04",
    format: "36 hours non-stop synthesis",
    schedule: "Day 01 → Day 03",
    teamSize: "2 – 4 engineers per squad",
    cta: "Submit deck",
    featured: true,
  },
  {
    slug: "overclock-tactical",
    tag: "ESP-VAL-01",
    title: "Overclock: Tactical Esports",
    category: "Esports",
    description:
      "Tier-1 collegiate tactical FPS showdown. Valorant 5v5 single elimination bracket on 128-tick LAN servers, low-ping dedicated arena hardware.",
    image: "/events/valorant-jett.jpg",
    prizePool: "₹60,000",
    venue: "Mainstage Arena",
    format: "5v5 squad LAN bracket",
    schedule: "Day 02 // 10:00 IST",
    cta: "Register squad",
    featured: true,
  },
  {
    slug: "mecha-clash",
    tag: "ROB-CLASH-02",
    title: "Mecha-Clash: Combat Robotics",
    category: "Robotics",
    description:
      "15kg remote combat bot destruction in an armored polycarbonate enclosure. Spinners, flippers, and vertical drums with mandatory failsafe circuits.",
    image: "/events/workshop.jpg",
    prizePool: "₹80,000",
    venue: "Arena: Impact Cage",
    format: "15kg weight ceiling",
    schedule: "Day 03 // Knockouts",
    cta: "Enter bot",
    featured: true,
  },
  {
    slug: "zero-day-ctf",
    tag: "SEC-CTF-03",
    title: "Zero-Day: Jeopardy CTF",
    category: "Cybersecurity",
    description:
      "Binary exploitation, kernel rootkits, cryptographic deciphering, and web-pwn trials hosted on isolated physical enterprise subnets.",
    image: "/events/technocrat.jpg",
    prizePool: "₹70,000",
    venue: "Isolated Subnet",
    format: "12 continuous hours",
    schedule: "Day 02 // Overnight",
    cta: "Authorize team",
    featured: true,
  },
  {
    slug: "code-shift",
    tag: "ALG-SHIFT-04",
    title: "Code-Shift: Speed Algorithms",
    category: "Algorithms",
    description:
      "Gladiator single-elimination speed coding bracket. Rapid graph theory, dynamic programming, and string matching under blitz timers.",
    image: "/events/competitive-programming.jpg",
    prizePool: "₹45,000",
    venue: "Blitz Stage",
    format: "32 coders double elim",
    schedule: "Day 01 // Qualifiers",
    cta: "Claim seed",
    featured: true,
  },
  {
    slug: "latent-runner",
    tag: "AIML-RUN-05",
    title: "Latent Runner: Vision Benchmark",
    category: "AI / ML",
    description:
      "Deploy lightweight neural models on physical NVIDIA Jetson Orin Nano boards to identify high-velocity objects under extreme latency.",
    image: "/events/gen-ai.jpg",
    prizePool: "₹65,000",
    venue: "Vision Benchmark Lab",
    format: "> 60 FPS @ INT8 accuracy",
    schedule: "Day 03 // Finals",
    cta: "Benchmark model",
    featured: true,
  },
  {
    slug: "bgmi-showdown",
    tag: "ESP-BGMI-06",
    title: "BGMI Battlegrounds Showdown",
    category: "Esports",
    description:
      "Erangel points-race battle royale. Pro-league points table across 6 drops with livestream observer slots and shoutcaster desk.",
    image: "/events/bgmi.jpg",
    prizePool: "₹50,000",
    venue: "Mobile Arena // Hall B",
    format: "Squad TPP, 6 drops",
    schedule: "Day 02 // Evening",
    cta: "Drop in",
  },
  {
    slug: "free-fire-clash",
    tag: "ESP-FF-07",
    title: "Free Fire Clash Squad",
    category: "Esports",
    description:
      "4v4 clash-squad warfare on Bermuda. Best-of-7 brackets with economy tracking and grandmaster observer overlays.",
    image: "/events/free-fire.jpg",
    prizePool: "₹30,000",
    venue: "Mobile Arena // Hall B",
    format: "4v4 clash squad BO7",
    schedule: "Day 01 // Evening",
    cta: "Queue up",
  },
  {
    slug: "aerial-derby",
    tag: "ROB-AERO-08",
    title: "Aerial Derby: Drone Soccer",
    category: "Robotics",
    description:
      "FPV drone soccer inside a caged sky-arena. Five-player squads pilot caged quads through a suspended goal ring.",
    image: "/events/fifa.jpg",
    prizePool: "₹40,000",
    venue: "Sky Cage // Grounds",
    format: "5v5 drone soccer",
    schedule: "Day 04 // Showcase",
    cta: "Fly in",
  },
  {
    slug: "treasure-hunt",
    tag: "OPEN-HUNT-09",
    title: "Midnight Treasure Hunt",
    category: "Open",
    description:
      "Campus-wide cryptic chase across 40 checkpoints. Ciphers, QR dead-drops, and a final vault combination under floodlights.",
    image: "/events/treasure-hunt.jpg",
    prizePool: "₹25,000",
    venue: "Whole campus // Night",
    format: "Teams of 4, 6 hours",
    schedule: "Day 02 // 23:00 IST",
    cta: "Join hunt",
  },
  {
    slug: "ad-mad-showdown",
    tag: "OPEN-ADMAD-10",
    title: "Ad-Mad Content Showdown",
    category: "Open",
    description:
      "72-hour brand parody sprint. Teams script, shoot, and cut a 60-second spot. Live audience vote plus jury craft scores.",
    image: "/events/ad-making.jpg",
    prizePool: "₹20,000",
    venue: "Media Lab // Stage",
    format: "Teams of 3–5",
    schedule: "Day 01 → Day 03",
    cta: "Pitch in",
  },
];

export function getFeaturedEvents(): FestEvent[] {
  return events.filter((e) => e.featured);
}

export function getEvent(slug: string): FestEvent | undefined {
  return events.find((e) => e.slug === slug);
}

export function getCategories(): EventCategory[] {
  return [...new Set(events.map((e) => e.category))];
}

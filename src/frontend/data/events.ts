export type RegistrationEvent = {
  id: string;
  name: string;
  type: "individual" | "team";
  minTeamSize: number;
  maxTeamSize: number;
  allowTeamMembers: boolean;
};

export const registrationEvents: RegistrationEvent[] = [
  {
    id: "synapse-protocol",
    name: "Hackathon (Synapse Protocol: Decentralized Edge & Kinetic Compute)",
    type: "team",
    minTeamSize: 2,
    maxTeamSize: 4,
    allowTeamMembers: true,
  },
  {
    id: "overclock-tactical",
    name: "Esports (Overclock: Tactical Esports)",
    type: "team",
    minTeamSize: 5,
    maxTeamSize: 5,
    allowTeamMembers: true,
  },
  {
    id: "mecha-clash",
    name: "Robotics (Mecha-Clash: Combat Robotics)",
    type: "team",
    minTeamSize: 2,
    maxTeamSize: 4,
    allowTeamMembers: true,
  },
  {
    id: "zero-day-ctf",
    name: "Cybersecurity (Zero-Day: Jeopardy CTF)",
    type: "team",
    minTeamSize: 2,
    maxTeamSize: 4,
    allowTeamMembers: true,
  },
  {
    id: "code-shift",
    name: "Algorithms (Code-Shift: Speed Algorithms)",
    type: "individual",
    minTeamSize: 1,
    maxTeamSize: 1,
    allowTeamMembers: false,
  },
  {
    id: "latent-runner",
    name: "AI / ML (Latent Runner: Vision Benchmark)",
    type: "individual",
    minTeamSize: 1,
    maxTeamSize: 1,
    allowTeamMembers: false,
  },
  {
    id: "bgmi-showdown",
    name: "BGMI (BGMI Battlegrounds Showdown)",
    type: "team",
    minTeamSize: 4,
    maxTeamSize: 4,
    allowTeamMembers: true,
  },
  {
    id: "free-fire-clash",
    name: "Free Fire (Free Fire Clash Squad)",
    type: "team",
    minTeamSize: 4,
    maxTeamSize: 4,
    allowTeamMembers: true,
  },
  {
    id: "aerial-derby",
    name: "FIFA (Aerial Derby: Drone Soccer)",
    type: "team",
    minTeamSize: 5,
    maxTeamSize: 5,
    allowTeamMembers: true,
  },
  {
    id: "treasure-hunt",
    name: "Treasure Hunt (Midnight Treasure Hunt)",
    type: "individual",
    minTeamSize: 1,
    maxTeamSize: 1,
    allowTeamMembers: false,
  },
  {
    id: "ad-mad-showdown",
    name: "Ad-making (Ad-Mad Content Showdown)",
    type: "team",
    minTeamSize: 3,
    maxTeamSize: 5,
    allowTeamMembers: true,
  },
];

// Participants must register with their institutional email...
export const BIT_EMAIL_DOMAIN = "@bitmesra.ac.in";

// ...except hackathon teams that declare they are not from BIT.
export const HACKATHON_EVENT_ID = "synapse-protocol";

export function isHackathonEvent(eventId: string): boolean {
  return eventId === HACKATHON_EVENT_ID;
}

// Whether a registration must use @bitmesra.ac.in emails.
// Only a hackathon team marked as external is exempt.
export function requiresBitEmail(
  eventId: string,
  isExternalTeam: boolean,
): boolean {
  if (eventId === HACKATHON_EVENT_ID && isExternalTeam) return false;
  return true;
}

export function isBitEmail(email: string): boolean {
  return email.trim().toLowerCase().endsWith(BIT_EMAIL_DOMAIN);
}

export function getRegistrationHref(eventId: string): string {
  const isRegistrationEvent = registrationEvents.some(
    (event) => event.id === eventId,
  );
  return isRegistrationEvent
    ? `/register?event=${encodeURIComponent(eventId)}`
    : "/register";
}

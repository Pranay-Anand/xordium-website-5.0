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

export function getRegistrationHref(eventId: string): string {
  const isRegistrationEvent = registrationEvents.some(
    (event) => event.id === eventId,
  );
  return isRegistrationEvent
    ? `/register?event=${encodeURIComponent(eventId)}`
    : "/register";
}

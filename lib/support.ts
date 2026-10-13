export interface SupportTicket {
  id: string;
  email: string;
  contents: string;
  createdAt: string;
}

// In-memory store for development. Replace with a database query in
// production (Route Handlers on some hosts run as lambdas and cannot
// share data between requests).
const tickets: SupportTicket[] = [];

export function listTickets(): SupportTicket[] {
  return [...tickets];
}

export function validateTicketInput(input: {
  email: unknown;
  contents: unknown;
}): { email: string; contents: string } {
  if (typeof input.email !== "string" || !input.email.includes("@")) {
    throw new Error("Invalid email");
  }
  if (typeof input.contents !== "string" || input.contents.trim().length < 10) {
    throw new Error("Contents must be at least 10 characters");
  }
  return { email: input.email.trim(), contents: input.contents.trim() };
}

export function createTicket(input: {
  email: string;
  contents: string;
}): SupportTicket {
  const ticket: SupportTicket = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    email: input.email,
    contents: input.contents,
    createdAt: new Date().toISOString(),
  };
  tickets.push(ticket);
  return ticket;
}

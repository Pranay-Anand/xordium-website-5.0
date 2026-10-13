export const tickets = [];

export function listTickets() {
  return [...tickets];
}

export function validateTicketInput(input) {
  if (typeof input.email !== "string" || !input.email.includes("@")) {
    throw new Error("Invalid email");
  }
  if (typeof input.contents !== "string" || input.contents.trim().length < 10) {
    throw new Error("Contents must be at least 10 characters");
  }
  return { email: input.email.trim(), contents: input.contents.trim() };
}

export function createTicket(input) {
  const ticket = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    email: input.email,
    contents: input.contents,
    createdAt: new Date().toISOString(),
  };
  tickets.push(ticket);
  return ticket;
}
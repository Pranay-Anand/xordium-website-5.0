import {
  createTicket,
  listTickets,
  validateTicketInput,
} from "@/lib/support";

export async function GET() {
  return Response.json({ tickets: listTickets() });
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const { email, contents } =
      body !== null && typeof body === "object"
        ? validateTicketInput(body as { email: unknown; contents: unknown })
        : validateTicketInput({ email: undefined, contents: undefined });
    const ticket = createTicket({ email, contents });
    return Response.json({ ticket }, { status: 201 });
  } catch (reason) {
    const message =
      reason instanceof Error ? reason.message : "Unexpected error";
    return new Response(message, { status: 400 });
  }
}

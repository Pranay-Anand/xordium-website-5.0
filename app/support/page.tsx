import { listTickets } from "@/lib/support";
import SupportForm from "./support-form";

export default function SupportPage() {
  const tickets = listTickets();

  return (
    <main className="flex min-h-screen flex-col items-center bg-[#121318] p-24">
      <h1 className="text-5xl font-bold text-white">Support</h1>
      <p className="mt-4 text-lg text-white/70">
        {tickets.length} open ticket{tickets.length === 1 ? "" : "s"}
      </p>
      <SupportForm />
    </main>
  );
}

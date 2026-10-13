import { listTickets } from "@/lib/support";
import SectionHeading from "@/components/section-heading";
import SupportForm from "./support-form";

export default function SupportPage() {
  const tickets = listTickets();

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <SectionHeading
        kicker="Comms endpoint // Helpdesk"
        title="Support"
        blurb="Transmission issues, registration queries, or hardware compatibility checks — open a ticket and the committee arbiters respond via comms."
      />
      <p className="font-mono text-[11px] tracking-[0.2em] text-white/45 uppercase">
        {tickets.length} open ticket{tickets.length === 1 ? "" : "s"} this
        session
      </p>
      <div className="mt-4 rounded border border-white/10 bg-[#101218] p-5">
        <SupportForm />
      </div>
    </section>
  );
}

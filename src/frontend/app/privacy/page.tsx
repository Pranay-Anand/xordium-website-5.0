export default function PrivacyPage() {
  return (
    <>
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <p className="font-mono text-[10px] tracking-[0.3em] text-red-500 uppercase">
            Participant information // Policy
          </p>
          <h1 className="mt-2 font-display text-5xl font-black uppercase sm:text-7xl">
            Privacy <span className="text-red-600">policy</span>
          </h1>
        </div>
      </section>
      <main className="glass-panel mx-auto my-10 max-w-3xl space-y-6 px-6 py-8 font-mono text-xs leading-relaxed text-white/65 sm:px-8">
        <section>
          <h2 className="font-display text-xl font-extrabold text-white uppercase">
            Information collected
          </h2>
          <p className="mt-2">
            The registration form collects only your event selection, name,
            email, phone or WhatsApp number, college, branch, year of study,
            college roll or registration number, and (for team events) team
            name and each team member&apos;s name, email, branch, year, and
            phone number.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-extrabold text-white uppercase">
            How it is used
          </h2>
          <p className="mt-2">
            The information is sent to the event registration service to manage
            participant lists and coordinate the events you register for. It
            is not used for unrelated purposes.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-extrabold text-white uppercase">
            Questions
          </h2>
          <p className="mt-2">
            Contact the fest organizers if you have questions about your
            registration information or would like to request an update.
          </p>
        </section>
      </main>
    </>
  );
}

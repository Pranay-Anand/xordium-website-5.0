import RegistrationForm from "@/components/RegistrationForm";

export default async function RegistrationPage({
  searchParams,
}: {
  searchParams: Promise<{ event?: string | string[] }>;
}) {
  const params = await searchParams;
  const initialEventId =
    typeof params.event === "string" ? params.event : undefined;

  return (
    <>
      <section className="border-b border-white/10 bg-gradient-to-b from-[#16090b] to-[#0a0c10]">
        <div className="mx-auto max-w-6xl px-4 pt-10 pb-8">
          <p className="font-mono text-[10px] tracking-[0.3em] text-red-500 uppercase">
            Participant intake // Xordium 5.0
          </p>
          <h1 className="mt-2 font-display text-5xl leading-none font-black uppercase sm:text-7xl">
            Event <span className="text-red-600">registration</span>
          </h1>
          <p className="mt-3 max-w-2xl font-mono text-xs leading-relaxed text-white/60">
            Enter your details to join an event. Team events ask for the full
            team roster; individual events only need your own details.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
        <div className="rounded border border-white/10 bg-[#101218] p-4 sm:p-7">
          <RegistrationForm initialEventId={initialEventId} />
        </div>
      </main>
    </>
  );
}

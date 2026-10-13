export default function SectionHeading({
  kicker,
  title,
  blurb,
}: {
  kicker: string;
  title: string;
  blurb?: string;
}) {
  return (
    <div className="mb-8">
      <p className="font-mono text-[11px] tracking-[0.3em] text-cyan-300 uppercase">
        {"//"} {kicker}
      </p>
      <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-white uppercase sm:text-4xl">
        {title}
      </h2>
      {blurb !== undefined ? (
        <p className="mt-2 max-w-2xl font-mono text-xs leading-relaxed text-white/55">
          {blurb}
        </p>
      ) : null}
    </div>
  );
}

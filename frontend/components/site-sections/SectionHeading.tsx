export function SectionHeading({
  kicker,
  heading,
}: {
  kicker: string;
  heading: string;
}) {
  return (
    <div className="mb-14 text-center">
      <p className="mb-3 text-xs uppercase tracking-[0.35em] text-[var(--site-accent)]">
        {kicker}
      </p>
      <h2 className="font-[family-name:var(--font-display)] text-3xl text-[#f7f3ea] sm:text-5xl">
        {heading}
      </h2>
    </div>
  );
}

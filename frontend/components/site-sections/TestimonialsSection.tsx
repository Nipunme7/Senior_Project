import type { TestimonialsSectionConfig } from "@/lib/types/website-config";
import type { SectionComponentProps } from "@/components/site-sections/section-props";
import { SectionHeading } from "@/components/site-sections/SectionHeading";

export function TestimonialsSection({
  id,
  variant,
  props,
}: SectionComponentProps<TestimonialsSectionConfig>) {
  const heading = props.heading ?? "Testimonials";
  const items = props.items ?? [];

  if (items.length === 0) {
    return null;
  }

  if (variant === "featured-quote") {
    const [featured, ...rest] = items;

    return (
      <section id={id} className="mx-auto max-w-4xl px-6 py-24 text-center">
        <SectionHeading kicker="Testimonials" heading={heading} />
        <blockquote>
          <p className="font-[family-name:var(--font-display)] text-2xl leading-relaxed text-[#f7f3ea] sm:text-4xl">
            “{featured.quote}”
          </p>
          <footer className="mt-8 text-sm uppercase tracking-[0.2em] text-[var(--site-accent)]">
            {featured.name}
            {featured.role ? ` — ${featured.role}` : ""}
          </footer>
        </blockquote>
        {rest.length > 0 ? (
          <div className="mt-16 grid gap-8 text-left sm:grid-cols-2">
            {rest.map((item) => (
              <blockquote key={item.name} className="border-t border-white/10 pt-6">
                <p className="text-sm leading-relaxed text-[#cfc9bb]">“{item.quote}”</p>
                <footer className="mt-4 text-xs uppercase tracking-[0.18em] text-[var(--site-accent)]">
                  {item.name}
                </footer>
              </blockquote>
            ))}
          </div>
        ) : null}
      </section>
    );
  }

  return (
    <section id={id} className="mx-auto max-w-6xl px-6 py-24">
      <SectionHeading kicker="Testimonials" heading={heading} />
      <div className="grid gap-6 md:grid-cols-3">
        {items.map((item) => (
          <blockquote key={item.name} className="border border-white/10 bg-white/5 p-8">
            <p className="text-base leading-relaxed text-[#f7f3ea]">“{item.quote}”</p>
            <footer className="mt-6 text-xs uppercase tracking-[0.18em] text-[var(--site-accent)]">
              {item.name}
              {item.role ? ` · ${item.role}` : ""}
            </footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}

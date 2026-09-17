import type { PricingSectionConfig } from "@/lib/types/website-config";
import type { SectionComponentProps } from "@/components/site-sections/section-props";
import { SectionHeading } from "@/components/site-sections/SectionHeading";

export function PricingSection({
  id,
  variant,
  props,
}: SectionComponentProps<PricingSectionConfig>) {
  const heading = props.heading ?? "Pricing";
  const items = props.items ?? [];

  if (variant === "simple-list") {
    return (
      <section id={id} className="mx-auto max-w-3xl px-6 py-24">
        <SectionHeading kicker="Pricing" heading={heading} />
        <ul className="divide-y divide-white/10 border-y border-white/10">
          {items.map((item) => (
            <li key={item.name} className="flex items-baseline justify-between gap-6 py-6">
              <div>
                <h3 className="text-lg text-[#f7f3ea]">{item.name}</h3>
                {item.description ? (
                  <p className="mt-1 text-sm text-[#cfc9bb]">{item.description}</p>
                ) : null}
              </div>
              <p className="shrink-0 text-sm tracking-[0.18em] text-[var(--site-accent)]">
                {item.price}
              </p>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section id={id} className="mx-auto max-w-6xl px-6 py-24">
      <SectionHeading kicker="Pricing" heading={heading} />
      <div className="grid gap-6 md:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.name}
            className="border border-white/10 bg-white/5 p-8 text-center"
          >
            <h3 className="font-[family-name:var(--font-display)] text-2xl text-[#f7f3ea]">
              {item.name}
            </h3>
            <p className="mt-4 text-3xl text-[var(--site-accent)]">{item.price}</p>
            {item.description ? (
              <p className="mt-4 text-sm text-[#cfc9bb]">{item.description}</p>
            ) : null}
            {item.features && item.features.length > 0 ? (
              <ul className="mt-8 space-y-2 text-sm text-[#d9d4c8]">
                {item.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

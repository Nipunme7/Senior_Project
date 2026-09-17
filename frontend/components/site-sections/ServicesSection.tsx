import type { ServicesSectionConfig } from "@/lib/types/website-config";
import type { SectionComponentProps } from "@/components/site-sections/section-props";

function SectionHeading({ heading }: { heading: string }) {
  return (
    <div className="mb-14 text-center">
      <p className="mb-3 text-xs uppercase tracking-[0.35em] text-[var(--site-accent)]">
        Offerings
      </p>
      <h2 className="font-[family-name:var(--font-display)] text-3xl text-[#f7f3ea] sm:text-5xl">
        {heading}
      </h2>
    </div>
  );
}

export function ServicesSection({
  id,
  variant,
  props,
}: SectionComponentProps<ServicesSectionConfig>) {
  const heading = props.heading ?? "Services";
  const items = props.items ?? [];

  if (variant === "list") {
    return (
      <section id={id} className="mx-auto max-w-4xl px-6 py-24">
        <SectionHeading heading={heading} />
        <ul className="divide-y divide-white/10 border-y border-white/10">
          {items.map((item) => (
            <li
              key={item.name}
              className="flex flex-col gap-2 py-8 sm:flex-row sm:items-baseline sm:justify-between"
            >
              <div>
                <h3 className="text-xl text-[#f7f3ea]">{item.name}</h3>
                {item.description ? (
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#cfc9bb]">
                    {item.description}
                  </p>
                ) : null}
              </div>
              {item.price ? (
                <p className="text-sm tracking-[0.18em] text-[var(--site-accent)]">
                  {item.price}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    );
  }

  if (variant === "icon-grid") {
    return (
      <section id={id} className="mx-auto max-w-6xl px-6 py-24">
        <SectionHeading heading={heading} />
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article key={item.name} className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border border-[var(--site-accent)] text-lg tracking-[0.2em] text-[var(--site-accent)]">
                {item.name.slice(0, 1)}
              </div>
              <h3 className="text-xl text-[#f7f3ea]">{item.name}</h3>
              {item.description ? (
                <p className="mt-3 text-sm leading-relaxed text-[#cfc9bb]">{item.description}</p>
              ) : null}
              {item.price ? (
                <p className="mt-4 text-sm text-[var(--site-accent)]">{item.price}</p>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id={id} className="mx-auto max-w-6xl px-6 py-24">
      <SectionHeading heading={heading} />
      <div className="grid gap-6 md:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.name}
            className="border border-white/10 bg-white/5 p-8 transition hover:border-[var(--site-accent)]"
          >
            <h3 className="font-[family-name:var(--font-display)] text-2xl text-[#f7f3ea]">
              {item.name}
            </h3>
            {item.description ? (
              <p className="mt-4 text-sm leading-relaxed text-[#cfc9bb]">{item.description}</p>
            ) : null}
            {item.price ? (
              <p className="mt-8 text-sm uppercase tracking-[0.18em] text-[var(--site-accent)]">
                {item.price}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

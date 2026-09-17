import type { CtaSectionConfig } from "@/lib/types/website-config";
import { firstImage } from "@/lib/media";
import type { SectionComponentProps } from "@/components/site-sections/section-props";
import { MediaImage } from "@/components/site-sections/MediaImage";

function CtaContent({
  heading,
  body,
  ctaLabel,
  ctaHref,
  align = "center",
}: {
  heading: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-xl"}>
      <h2 className="font-[family-name:var(--font-display)] text-3xl text-[#f7f3ea] sm:text-5xl">
        {heading}
      </h2>
      {body ? <p className="mt-4 text-base leading-relaxed text-[#d9d4c8]">{body}</p> : null}
      {ctaLabel && ctaHref ? (
        <a
          href={ctaHref}
          className="mt-8 inline-flex border border-[var(--site-accent)] px-8 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--site-accent)] transition hover:bg-[var(--site-accent)] hover:text-[var(--site-primary)]"
        >
          {ctaLabel}
        </a>
      ) : null}
    </div>
  );
}

export function CTASection({
  id,
  variant,
  props,
  media,
}: SectionComponentProps<CtaSectionConfig>) {
  const ctaHref = props.ctaHref ?? "#contact_01";
  const image = firstImage(media);

  if (variant === "banner") {
    return (
      <section id={id} className="px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 border border-[var(--site-accent)] px-8 py-10 md:flex-row">
          <CtaContent
            heading={props.heading}
            body={props.body}
            ctaLabel={props.ctaLabel}
            ctaHref={ctaHref}
            align="left"
          />
        </div>
      </section>
    );
  }

  if (variant === "image-background") {
    return (
      <section id={id} className="relative overflow-hidden px-6 py-28">
        {image ? (
          <MediaImage
            src={image.url}
            alt={image.alt}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10">
          <CtaContent
            heading={props.heading}
            body={props.body}
            ctaLabel={props.ctaLabel}
            ctaHref={ctaHref}
          />
        </div>
      </section>
    );
  }

  return (
    <section id={id} className="px-6 py-24">
      <CtaContent
        heading={props.heading}
        body={props.body}
        ctaLabel={props.ctaLabel}
        ctaHref={ctaHref}
      />
    </section>
  );
}

import type { AboutSectionConfig } from "@/lib/types/website-config";
import { firstImage } from "@/lib/media";
import type { SectionComponentProps } from "@/components/site-sections/section-props";
import { MediaImage } from "@/components/site-sections/MediaImage";
import { SectionHeading } from "@/components/site-sections/SectionHeading";

function AboutCopy({ heading, body }: { heading: string; body: string }) {
  return (
    <div>
      <p className="mb-3 text-xs uppercase tracking-[0.35em] text-[var(--site-accent)]">
        About
      </p>
      <h2 className="font-[family-name:var(--font-display)] text-3xl text-[#f7f3ea] sm:text-4xl">
        {heading}
      </h2>
      <p className="mt-6 whitespace-pre-line text-base leading-relaxed text-[#cfc9bb]">
        {body}
      </p>
    </div>
  );
}

export function AboutSection({
  id,
  variant,
  props,
  media,
}: SectionComponentProps<AboutSectionConfig>) {
  const heading = props.heading ?? "Our Story";
  const image = firstImage(media);

  if (variant === "text-only") {
    return (
      <section id={id} className="mx-auto max-w-3xl px-6 py-24">
        <SectionHeading kicker="About" heading={heading} />
        <p className="whitespace-pre-line text-center text-base leading-relaxed text-[#cfc9bb] sm:text-lg">
          {props.body}
        </p>
      </section>
    );
  }

  const imageColumn = image ? (
    <MediaImage
      src={image.url}
      alt={image.alt}
      className="h-full min-h-[280px] w-full object-cover"
    />
  ) : (
    <div className="min-h-[280px] bg-white/5" />
  );

  const textColumn = (
    <div className="flex items-center px-6 py-12 md:px-12">
      <AboutCopy heading={heading} body={props.body} />
    </div>
  );

  return (
    <section id={id} className="mx-auto grid max-w-6xl items-stretch py-24 md:grid-cols-2">
      {variant === "image-left" ? imageColumn : textColumn}
      {variant === "image-left" ? textColumn : imageColumn}
    </section>
  );
}

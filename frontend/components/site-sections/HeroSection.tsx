import type { HeroSectionConfig } from "@/lib/types/website-config";
import { firstImage, firstVideo } from "@/lib/media";
import type { SectionComponentProps } from "@/components/site-sections/section-props";

function HeroCopy({
  kicker,
  headline,
  subheadline,
  ctaLabel,
  ctaHref,
  align = "center",
}: {
  kicker: string;
  headline: string;
  subheadline?: string;
  ctaLabel?: string;
  ctaHref?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-xl text-left"}>
      <p className="mb-4 text-xs font-medium uppercase tracking-[0.35em] text-[var(--site-accent)]">
        {kicker}
      </p>
      <h1 className="font-[family-name:var(--font-display)] text-4xl leading-tight text-[#f7f3ea] sm:text-5xl lg:text-7xl">
        {headline}
      </h1>
      {subheadline ? (
        <p
          className={`mt-6 text-base leading-relaxed text-[#d9d4c8] sm:text-lg ${
            align === "center" ? "mx-auto max-w-xl" : ""
          }`}
        >
          {subheadline}
        </p>
      ) : null}
      {ctaLabel && ctaHref ? (
        <a
          href={ctaHref}
          className="mt-10 inline-flex border border-[var(--site-accent)] px-8 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--site-accent)] transition hover:bg-[var(--site-accent)] hover:text-[var(--site-primary)]"
        >
          {ctaLabel}
        </a>
      ) : null}
    </div>
  );
}

function CoverImage({ src, alt }: { src: string; alt: string }) {
  return (
    // Phase 1 uses a plain img so we do not add remote image-host config yet.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className="absolute inset-0 h-full w-full object-cover" />
  );
}

export function HeroSection({
  id,
  variant,
  props,
  media,
  theme,
}: SectionComponentProps<HeroSectionConfig>) {
  const image = firstImage(media);
  const video = firstVideo(media);
  const kicker = theme.style === "ai-choose" ? "Featured" : theme.style;
  const ctaHref = props.ctaLabel ? (props.ctaHref ?? "#services_01") : undefined;
  const isSplit = variant === "split-left" || variant === "split-right";

  const copy = (
    <HeroCopy
      kicker={kicker}
      headline={props.headline}
      subheadline={props.subheadline}
      ctaLabel={props.ctaLabel}
      ctaHref={ctaHref}
      align={isSplit ? "left" : "center"}
    />
  );

  if (isSplit) {
    const imageColumn = (
      <div className="relative min-h-[320px] md:min-h-[640px]">
        {image ? <CoverImage src={image.url} alt={image.alt} /> : <div className="absolute inset-0 bg-[#1c1c1c]" />}
      </div>
    );
    const textColumn = <div className="flex items-center px-8 py-16 md:px-16">{copy}</div>;

    return (
      <section id={id} className="grid min-h-[70vh] md:grid-cols-2">
        {variant === "split-left" ? imageColumn : textColumn}
        {variant === "split-left" ? textColumn : imageColumn}
      </section>
    );
  }

  const isFullscreen = variant === "fullscreen-image" || variant === "video-background";

  return (
    <section
      id={id}
      className={`relative flex items-center justify-center overflow-hidden px-6 ${
        isFullscreen ? "min-h-screen" : "min-h-[70vh] py-24"
      }`}
    >
      {variant === "video-background" && video ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster={image?.url}
          aria-label={video.alt}
        >
          <source src={video.url} />
        </video>
      ) : image ? (
        <CoverImage src={image.url} alt={image.alt} />
      ) : null}

      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/45 to-[var(--site-primary)]" />
      <div className="relative z-10 w-full max-w-5xl">{copy}</div>
    </section>
  );
}

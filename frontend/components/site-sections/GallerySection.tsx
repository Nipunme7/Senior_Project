import type { GallerySectionConfig, MediaAsset } from "@/lib/types/website-config";
import type { SectionComponentProps } from "@/components/site-sections/section-props";

function GalleryImage({ asset, className }: { asset: MediaAsset; className?: string }) {
  return (
    // Phase 1 uses a plain img so we do not add remote image-host config yet.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={asset.url} alt={asset.alt} className={className} />
  );
}

function GalleryHeading({ heading }: { heading: string }) {
  return (
    <div className="mb-14 text-center">
      <p className="mb-3 text-xs uppercase tracking-[0.35em] text-[var(--site-accent)]">
        Gallery
      </p>
      <h2 className="font-[family-name:var(--font-display)] text-3xl text-[#f7f3ea] sm:text-5xl">
        {heading}
      </h2>
    </div>
  );
}

export function GallerySection({
  id,
  variant,
  props,
  media,
}: SectionComponentProps<GallerySectionConfig>) {
  const heading = props.heading ?? "Gallery";
  const images = media.filter((asset) => asset.type === "image");

  if (images.length === 0) {
    return null;
  }

  if (variant === "featured") {
    const [featured, ...rest] = images;

    return (
      <section id={id} className="mx-auto max-w-6xl px-6 py-24">
        <GalleryHeading heading={heading} />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2 md:row-span-2">
            <GalleryImage
              asset={featured}
              className="h-full min-h-[280px] w-full object-cover md:min-h-[520px]"
            />
          </div>
          {rest.map((asset) => (
            <GalleryImage
              key={asset.id}
              asset={asset}
              className="h-48 w-full object-cover md:h-full"
            />
          ))}
        </div>
      </section>
    );
  }

  if (variant === "masonry") {
    return (
      <section id={id} className="mx-auto max-w-6xl px-6 py-24">
        <GalleryHeading heading={heading} />
        <div className="columns-1 gap-4 sm:columns-2">
          {images.map((asset, index) => (
            <GalleryImage
              key={asset.id}
              asset={asset}
              className={`mb-4 w-full object-cover ${index % 2 === 0 ? "aspect-[3/4]" : "aspect-[4/3]"}`}
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id={id} className="mx-auto max-w-6xl px-6 py-24">
      <GalleryHeading heading={heading} />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {images.map((asset) => (
          <GalleryImage
            key={asset.id}
            asset={asset}
            className="aspect-square w-full object-cover"
          />
        ))}
      </div>
    </section>
  );
}

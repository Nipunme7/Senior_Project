import type { WebsiteConfig } from "@/lib/types/website-config";

/**
 * If AI omitted mediaIds, attach uploaded media for render.
 * Hero gets the first id; gallery gets the rest; about/cta take leftovers.
 */
export function ensureSectionMediaIds(
  config: WebsiteConfig,
  mediaIds: string[],
): WebsiteConfig {
  if (mediaIds.length === 0) {
    return config;
  }

  const unused = [...mediaIds];
  const sections = config.sections.map((section) => {
    if (section.mediaIds && section.mediaIds.length > 0) {
      return section;
    }
    if (section.type === "hero" && unused.length > 0) {
      return { ...section, mediaIds: [unused.shift() as string] };
    }
    if (section.type === "gallery" && unused.length > 0) {
      const ids = unused.splice(0, unused.length);
      return { ...section, mediaIds: ids };
    }
    if (
      (section.type === "about" || section.type === "cta") &&
      unused.length > 0
    ) {
      return { ...section, mediaIds: [unused.shift() as string] };
    }
    return section;
  });

  return { ...config, sections };
}

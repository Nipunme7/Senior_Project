import {
  ABOUT_VARIANTS,
  CONTACT_VARIANTS,
  CTA_VARIANTS,
  FOOTER_VARIANTS,
  GALLERY_VARIANTS,
  HERO_VARIANTS,
  PRICING_VARIANTS,
  SERVICES_VARIANTS,
  TESTIMONIALS_VARIANTS,
  type SectionType,
  type SiteSection,
  type WebsiteConfig,
} from "@/lib/types/website-config";

/** Catalog variants for the section editor (stable IDs only). */
export const VARIANTS_BY_TYPE: Record<SectionType, readonly string[]> = {
  hero: HERO_VARIANTS,
  about: ABOUT_VARIANTS,
  services: SERVICES_VARIANTS,
  pricing: PRICING_VARIANTS,
  gallery: GALLERY_VARIANTS,
  testimonials: TESTIMONIALS_VARIANTS,
  cta: CTA_VARIANTS,
  contact: CONTACT_VARIANTS,
  footer: FOOTER_VARIANTS,
};

/** Section types where assigning mediaIds is useful in the editor. */
export const MEDIA_SECTION_TYPES = new Set<SectionType>([
  "hero",
  "about",
  "gallery",
  "cta",
]);

export function replaceSectionInConfig(
  config: WebsiteConfig,
  nextSection: SiteSection,
): WebsiteConfig {
  const index = config.sections.findIndex((section) => section.id === nextSection.id);
  if (index < 0) {
    throw new Error(`Section “${nextSection.id}” was not found.`);
  }

  const sections = config.sections.slice();
  const previous = sections[index];
  if (previous.type !== nextSection.type) {
    throw new Error("Section type cannot change during edit.");
  }

  sections[index] = nextSection;
  return { ...config, sections };
}

export function toggleMediaId(
  mediaIds: string[] | undefined,
  mediaId: string,
  options: { multi: boolean },
): string[] {
  const current = mediaIds ?? [];
  if (current.includes(mediaId)) {
    return current.filter((id) => id !== mediaId);
  }
  if (!options.multi) {
    return [mediaId];
  }
  return [...current, mediaId];
}

export function sectionLabel(section: SiteSection): string {
  return `${section.type} · ${section.id}`;
}

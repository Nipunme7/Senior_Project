/**
 * WebsiteConfig is the structured representation of a generated site.
 * React maps stable section type IDs (hero, services, gallery, …)
 * to reusable components. AI must never reference source filenames.
 */

export const DESIGN_STYLES = [
  "luxury",
  "minimal",
  "modern",
  "professional",
  "playful",
  "ai-choose",
] as const;

export type DesignStyle = (typeof DESIGN_STYLES)[number];

export const SECTION_TYPES = [
  "hero",
  "about",
  "services",
  "pricing",
  "gallery",
  "testimonials",
  "cta",
  "contact",
  "footer",
] as const;

export type SectionType = (typeof SECTION_TYPES)[number];

export const HERO_VARIANTS = [
  "centered",
  "split-left",
  "split-right",
  "fullscreen-image",
  "video-background",
] as const;

export type HeroVariant = (typeof HERO_VARIANTS)[number];

export const ABOUT_VARIANTS = ["text-only", "image-left", "image-right"] as const;

export type AboutVariant = (typeof ABOUT_VARIANTS)[number];

export const SERVICES_VARIANTS = ["cards", "list", "icon-grid"] as const;

export type ServicesVariant = (typeof SERVICES_VARIANTS)[number];

export const PRICING_VARIANTS = ["cards", "simple-list"] as const;

export type PricingVariant = (typeof PRICING_VARIANTS)[number];

export const GALLERY_VARIANTS = ["grid", "masonry", "featured"] as const;

export type GalleryVariant = (typeof GALLERY_VARIANTS)[number];

export const TESTIMONIALS_VARIANTS = ["cards", "featured-quote"] as const;

export type TestimonialsVariant = (typeof TESTIMONIALS_VARIANTS)[number];

export const CTA_VARIANTS = ["simple", "banner", "image-background"] as const;

export type CtaVariant = (typeof CTA_VARIANTS)[number];

export const CONTACT_VARIANTS = ["simple", "split", "map-right"] as const;

export type ContactVariant = (typeof CONTACT_VARIANTS)[number];

export const FOOTER_VARIANTS = ["basic"] as const;

export type FooterVariant = (typeof FOOTER_VARIANTS)[number];

export interface ThemeConfig {
  style: DesignStyle;
  primaryColor: string;
  accentColor: string;
}

export interface MediaAsset {
  id: string;
  type: "image" | "video";
  url: string;
  alt: string;
}

export interface HeroProps {
  headline: string;
  subheadline?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export interface AboutProps {
  heading?: string;
  body: string;
}

export interface ServiceItem {
  name: string;
  description?: string;
  price?: string;
}

export interface ServicesProps {
  heading?: string;
  items: ServiceItem[];
}

export interface PricingItem {
  name: string;
  price: string;
  description?: string;
  features?: string[];
}

export interface PricingProps {
  heading?: string;
  items: PricingItem[];
}

export interface GalleryProps {
  heading?: string;
}

export interface TestimonialItem {
  quote: string;
  name: string;
  role?: string;
}

export interface TestimonialsProps {
  heading?: string;
  items: TestimonialItem[];
}

export interface CtaProps {
  heading: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export interface ContactProps {
  heading?: string;
  address?: string;
  phone?: string;
  email?: string;
  hours?: string;
  mapEmbedUrl?: string;
}

export interface FooterProps {
  tagline?: string;
  copyright?: string;
}

interface SectionBase {
  id: string;
  mediaIds?: string[];
}

export interface HeroSectionConfig extends SectionBase {
  type: "hero";
  variant: HeroVariant;
  props: HeroProps;
}

export interface AboutSectionConfig extends SectionBase {
  type: "about";
  variant: AboutVariant;
  props: AboutProps;
}

export interface ServicesSectionConfig extends SectionBase {
  type: "services";
  variant: ServicesVariant;
  props: ServicesProps;
}

export interface PricingSectionConfig extends SectionBase {
  type: "pricing";
  variant: PricingVariant;
  props: PricingProps;
}

export interface GallerySectionConfig extends SectionBase {
  type: "gallery";
  variant: GalleryVariant;
  props: GalleryProps;
}

export interface TestimonialsSectionConfig extends SectionBase {
  type: "testimonials";
  variant: TestimonialsVariant;
  props: TestimonialsProps;
}

export interface CtaSectionConfig extends SectionBase {
  type: "cta";
  variant: CtaVariant;
  props: CtaProps;
}

export interface ContactSectionConfig extends SectionBase {
  type: "contact";
  variant: ContactVariant;
  props: ContactProps;
}

export interface FooterSectionConfig extends SectionBase {
  type: "footer";
  variant: FooterVariant;
  props: FooterProps;
}

export type SiteSection =
  | HeroSectionConfig
  | AboutSectionConfig
  | ServicesSectionConfig
  | PricingSectionConfig
  | GallerySectionConfig
  | TestimonialsSectionConfig
  | CtaSectionConfig
  | ContactSectionConfig
  | FooterSectionConfig;

export interface WebsiteConfig {
  siteName: string;
  theme: ThemeConfig;
  sections: SiteSection[];
}

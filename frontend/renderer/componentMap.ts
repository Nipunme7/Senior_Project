import type { ComponentType } from "react";
import { AboutSection } from "@/components/site-sections/AboutSection";
import { ContactSection } from "@/components/site-sections/ContactSection";
import { CTASection } from "@/components/site-sections/CTASection";
import { FooterSection } from "@/components/site-sections/FooterSection";
import { GallerySection } from "@/components/site-sections/GallerySection";
import { HeroSection } from "@/components/site-sections/HeroSection";
import { PricingSection } from "@/components/site-sections/PricingSection";
import { ServicesSection } from "@/components/site-sections/ServicesSection";
import { TestimonialsSection } from "@/components/site-sections/TestimonialsSection";
import type { SectionComponentProps } from "@/components/site-sections/section-props";
import type { SectionType } from "@/lib/types/website-config";

/**
 * Central mapping from stable catalog IDs to React components.
 * This is the only place section type IDs are bound to React files.
 * AI must choose IDs such as `gallery`, never filenames such as `GallerySection.tsx`.
 */
export const componentMap: Record<
  SectionType,
  ComponentType<SectionComponentProps>
> = {
  hero: HeroSection as ComponentType<SectionComponentProps>,
  about: AboutSection as ComponentType<SectionComponentProps>,
  services: ServicesSection as ComponentType<SectionComponentProps>,
  pricing: PricingSection as ComponentType<SectionComponentProps>,
  gallery: GallerySection as ComponentType<SectionComponentProps>,
  testimonials: TestimonialsSection as ComponentType<SectionComponentProps>,
  cta: CTASection as ComponentType<SectionComponentProps>,
  contact: ContactSection as ComponentType<SectionComponentProps>,
  footer: FooterSection as ComponentType<SectionComponentProps>,
};

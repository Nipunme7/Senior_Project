import type { DesignStyle, SectionType } from "@/lib/types/website-config";
import { SECTION_TYPES } from "@/lib/types/website-config";

export interface InspirationOption {
  id: string;
  title: string;
  blurb: string;
  style: DesignStyle;
  hint: string;
  /** CSS gradient for style swatch (no tenant photos). */
  swatch: string;
  accent: string;
}

export interface SectionOption {
  type: SectionType;
  label: string;
  description: string;
  required?: boolean;
}

/** Style directions — abstract swatches, not business photos. */
export const INSPIRATION_OPTIONS: InspirationOption[] = [
  {
    id: "luxury",
    title: "Luxury",
    blurb: "Dark, refined, premium",
    style: "luxury",
    hint: "Dark backgrounds, gold accents, spare copy — like a high-end local shop.",
    swatch: "linear-gradient(145deg, #111111 0%, #2a2a2a 55%, #c9a45c 160%)",
    accent: "#92400e",
  },
  {
    id: "minimal",
    title: "Minimal",
    blurb: "Airy, calm, editorial",
    style: "minimal",
    hint: "Light neutrals, lots of space, short understated lines.",
    swatch: "linear-gradient(145deg, #f8f7f4 0%, #e8e4dc 50%, #9a9488 140%)",
    accent: "#44403c",
  },
  {
    id: "professional",
    title: "Professional",
    blurb: "Trustworthy, clear, local",
    style: "professional",
    hint: "Straightforward local-business layout: clear sections, plain trustworthy tone.",
    swatch: "linear-gradient(145deg, #0f172a 0%, #1e3a5f 55%, #94a3b8 140%)",
    accent: "#1e3a5f",
  },
  {
    id: "modern",
    title: "Modern",
    blurb: "Bold, simple, product-first",
    style: "modern",
    hint: "Clean modern shop: strong headings, short lines, no fluff.",
    swatch: "linear-gradient(145deg, #0f766e 0%, #134e4a 45%, #99f6e4 150%)",
    accent: "#0f766e",
  },
];

export const SECTION_OPTIONS: SectionOption[] = [
  {
    type: "hero",
    label: "Hero",
    description: "Full-width opening with headline and CTA",
    required: true,
  },
  {
    type: "about",
    label: "About",
    description: "Your story and what makes you different",
  },
  {
    type: "services",
    label: "Services",
    description: "List of offerings with short descriptions",
  },
  {
    type: "pricing",
    label: "Pricing",
    description: "Packages or menu-style prices",
  },
  {
    type: "gallery",
    label: "Gallery",
    description: "Photo grid of your work or space",
  },
  {
    type: "testimonials",
    label: "Testimonials",
    description: "Customer quotes and social proof",
  },
  {
    type: "cta",
    label: "Call to action",
    description: "Strong mid-page push to book or visit",
  },
  {
    type: "contact",
    label: "Contact",
    description: "Address, phone, hours, and map area",
  },
  {
    type: "footer",
    label: "Footer",
    description: "Closing bar with copyright and tagline",
    required: true,
  },
];

export const DEFAULT_SECTION_TYPES: SectionType[] = [
  "hero",
  "about",
  "services",
  "contact",
  "footer",
];

export type BrandColorCount = 1 | 2 | 3;

/** Starter swatches when the owner bumps count up — freely overridable. */
export const DEFAULT_BRAND_COLORS = ["#111111", "#C9A45C", "#0f766e"] as const;

export function normalizeHexColor(value: string, fallback = "#111111"): string {
  const trimmed = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    return trimmed.toLowerCase();
  }
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    const [, r, g, b] = trimmed;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return fallback.toLowerCase();
}

function hexLuminance(hex: string): number {
  const raw = normalizeHexColor(hex).slice(1);
  const r = parseInt(raw.slice(0, 2), 16) / 255;
  const g = parseInt(raw.slice(2, 4), 16) / 255;
  const b = parseInt(raw.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Single-color sites still need an accent for highlights/CTAs. */
export function deriveAccentColor(primary: string): string {
  return hexLuminance(primary) < 0.45 ? "#c9a45c" : "#111111";
}

export function normalizeBrandColors(
  count: BrandColorCount,
  colors: string[],
): string[] {
  const next: string[] = [];
  for (let i = 0; i < count; i += 1) {
    next.push(
      normalizeHexColor(
        colors[i] ?? DEFAULT_BRAND_COLORS[i] ?? "#888888",
        DEFAULT_BRAND_COLORS[i] ?? "#888888",
      ),
    );
  }
  return next;
}

/**
 * Map 1–3 owner picks onto WebsiteConfig.theme (primary + accent only).
 * Triple: base + mid preference + highlight → primary = first, accent = third.
 */
export function themeColorsFromBrand(colors: string[]): {
  primaryColor: string;
  accentColor: string;
} {
  const normalized = colors.map((color, index) =>
    normalizeHexColor(color, DEFAULT_BRAND_COLORS[index] ?? "#888888"),
  );
  if (normalized.length <= 1) {
    const primaryColor = normalized[0] ?? DEFAULT_BRAND_COLORS[0];
    return { primaryColor, accentColor: deriveAccentColor(primaryColor) };
  }
  if (normalized.length === 2) {
    return { primaryColor: normalized[0], accentColor: normalized[1] };
  }
  return { primaryColor: normalized[0], accentColor: normalized[2] };
}

export function withThemeColors<
  T extends { theme: { style: string; primaryColor: string; accentColor: string } },
>(config: T, colors: string[]): T {
  const { primaryColor, accentColor } = themeColorsFromBrand(colors);
  return {
    ...config,
    theme: {
      ...config.theme,
      primaryColor,
      accentColor,
    },
  };
}

export function brandColorsLabel(colors: string[]): string {
  if (colors.length === 1) {
    return `1 color · ${normalizeHexColor(colors[0])}`;
  }
  return `${colors.length} colors · ${colors.map((c) => normalizeHexColor(c)).join(" · ")}`;
}

export function isSectionType(value: string): value is SectionType {
  return (SECTION_TYPES as readonly string[]).includes(value);
}

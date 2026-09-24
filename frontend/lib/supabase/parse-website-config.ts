import { SECTION_TYPES, type WebsiteConfig } from "@/lib/types/website-config";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Lightweight structural check before treating JSONB as WebsiteConfig.
 * Full business-rule validation belongs in the FastAPI layer later.
 */
export function parseWebsiteConfig(value: unknown): WebsiteConfig | null {
  if (!isRecord(value)) {
    return null;
  }

  if (typeof value.siteName !== "string" || !value.siteName.trim()) {
    return null;
  }

  if (!isRecord(value.theme)) {
    return null;
  }

  if (!Array.isArray(value.sections) || value.sections.length === 0) {
    return null;
  }

  for (const section of value.sections) {
    if (!isRecord(section)) {
      return null;
    }
    if (typeof section.id !== "string" || typeof section.type !== "string") {
      return null;
    }
    if (!SECTION_TYPES.includes(section.type as (typeof SECTION_TYPES)[number])) {
      return null;
    }
  }

  return value as unknown as WebsiteConfig;
}

/**
 * Thin client for the trusted FastAPI backend.
 * Owner mutations send the Supabase access token as Bearer auth.
 */

import type { WebsiteConfig } from "@/lib/types/website-config";

export interface GenerateMediaItem {
  id: string;
  description?: string | null;
  kind?: string | null;
}

export interface GenerateContactInfo {
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  hours?: string | null;
}

export interface GenerateSiteInput {
  businessName: string;
  businessType?: string;
  description?: string;
  services?: string[];
  contact?: GenerateContactInfo;
  style?: string;
  inspirationHint?: string;
  sections?: string[];
  media?: GenerateMediaItem[];
  slug?: string;
  persist?: boolean;
}

export interface GenerateSiteResult {
  config: WebsiteConfig;
  sectionCount: number;
  sectionTypes: string[];
  site: {
    id: string;
    ownerId: string;
    businessName: string;
    slug: string;
    status: "draft" | "published";
    style: string | null;
  } | null;
}

export class BackendApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "BackendApiError";
    this.status = status;
  }
}

export function getBackendBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!raw) {
    throw new BackendApiError(
      "NEXT_PUBLIC_API_URL is not set. Add it to frontend/.env (e.g. http://localhost:8000).",
      503,
    );
  }
  return raw.replace(/\/$/, "");
}

export async function generateSiteConfig(
  accessToken: string,
  input: GenerateSiteInput,
): Promise<GenerateSiteResult> {
  const baseUrl = getBackendBaseUrl();
  const response = await fetch(`${baseUrl}/v1/sites/generate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      businessName: input.businessName,
      businessType: input.businessType ?? null,
      description: input.description ?? null,
      services: input.services ?? null,
      contact: input.contact ?? null,
      style: input.style ?? null,
      inspirationHint: input.inspirationHint ?? null,
      sections: input.sections ?? null,
      media: input.media ?? null,
      slug: input.slug ?? null,
      persist: input.persist ?? false,
    }),
  });

  if (!response.ok) {
    let detail = `Generate failed (${response.status})`;
    try {
      const body = (await response.json()) as { detail?: unknown };
      if (typeof body.detail === "string") {
        detail = body.detail;
      } else if (body.detail != null) {
        detail = JSON.stringify(body.detail);
      }
    } catch {
      // keep default detail
    }
    throw new BackendApiError(detail, response.status);
  }

  return (await response.json()) as GenerateSiteResult;
}

export interface ValidateSiteResult {
  valid: boolean;
  config: WebsiteConfig;
  sectionCount: number;
  sectionTypes: string[];
}

/** Validate WebsiteConfig through FastAPI before persisting edits. */
export async function validateSiteConfig(
  config: WebsiteConfig,
): Promise<ValidateSiteResult> {
  const baseUrl = getBackendBaseUrl();
  const response = await fetch(`${baseUrl}/v1/sites/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ config }),
  });

  if (!response.ok) {
    let detail = `Validation failed (${response.status})`;
    try {
      const body = (await response.json()) as { detail?: unknown };
      if (typeof body.detail === "string") {
        detail = body.detail;
      } else if (body.detail != null) {
        detail = JSON.stringify(body.detail);
      }
    } catch {
      // keep default
    }
    throw new BackendApiError(detail, response.status);
  }

  return (await response.json()) as ValidateSiteResult;
}

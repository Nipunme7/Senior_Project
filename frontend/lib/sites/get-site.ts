import { demoMediaById } from "@/lib/demo/media";
import { getDemoSite, listDemoSiteSlugs, type DemoSite } from "@/lib/demo/sites";
import { createSupabaseClient } from "@/lib/supabase/client";
import type { SiteRow } from "@/lib/supabase/database.types";
import { parseWebsiteConfig } from "@/lib/supabase/parse-website-config";
import type { MediaAsset } from "@/lib/types/website-config";

export type ResolvedSite = DemoSite;

type PublishedSiteSelect = Pick<
  SiteRow,
  "slug" | "business_name" | "site_config" | "status"
>;

/**
 * Resolve a tenant site for `/site/[slug]`.
 *
 * Order:
 * 1. Published row in Supabase (when configured)
 * 2. Hard-coded Phase 2 demo fallback
 *
 * Media still uses the local demo catalog until Phase 6 storage resolution.
 */
export async function getSiteBySlug(slug: string): Promise<ResolvedSite | undefined> {
  const fromSupabase = await getPublishedSiteFromSupabase(slug);
  if (fromSupabase) {
    return fromSupabase;
  }

  return getDemoSite(slug);
}

export function listKnownSiteSlugs(): string[] {
  return listDemoSiteSlugs();
}

async function getPublishedSiteFromSupabase(
  slug: string,
): Promise<ResolvedSite | undefined> {
  const supabase = createSupabaseClient();
  if (!supabase) {
    return undefined;
  }

  const { data, error } = await supabase
    .from("sites")
    .select("slug, business_name, site_config, status")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) {
    return undefined;
  }

  const row = data as PublishedSiteSelect;
  const config = parseWebsiteConfig(row.site_config);
  if (!config) {
    return undefined;
  }

  return {
    slug: row.slug,
    config,
    mediaById: demoMediaById as Record<string, MediaAsset>,
  };
}

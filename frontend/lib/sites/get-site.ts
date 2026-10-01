import { demoMediaById } from "@/lib/demo/media";
import { getDemoSite, listDemoSiteSlugs, type DemoSite } from "@/lib/demo/sites";
import { mediaRowsToAssets } from "@/lib/media/resolve-rows";
import { createSupabaseClient } from "@/lib/supabase/client";
import type { MediaRow, SiteRow } from "@/lib/supabase/database.types";
import { parseWebsiteConfig } from "@/lib/supabase/parse-website-config";
import type { MediaAsset } from "@/lib/types/website-config";

export type ResolvedSite = DemoSite;

type PublishedSiteSelect = Pick<
  SiteRow,
  "id" | "slug" | "business_name" | "site_config" | "status"
>;

/**
 * Resolve a tenant site for `/site/[slug]`.
 *
 * Order:
 * 1. Published row in Supabase (when configured), with Storage-backed media
 * 2. Hard-coded Phase 2 demo fallback (local /public/demo media)
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
    .select("id, slug, business_name, site_config, status")
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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    return undefined;
  }

  const { data: mediaData } = await supabase
    .from("media")
    .select("id, storage_path, type, description")
    .eq("site_id", row.id);

  const mediaRows = (mediaData ?? []) as Pick<
    MediaRow,
    "id" | "storage_path" | "type" | "description"
  >[];

  const fromStorage = mediaRowsToAssets(mediaRows, supabaseUrl);

  // Keep demo assets as a fallback for seeded configs that still use demo IDs.
  const mediaById: Record<string, MediaAsset> = {
    ...demoMediaById,
    ...fromStorage,
  };

  return {
    slug: row.slug,
    config,
    mediaById,
  };
}

import { ensureSectionMediaIds } from "@/lib/media/ensure-section-media";
import { mediaRowsToSignedAssets } from "@/lib/media/resolve-rows";
import { createSupabaseClient } from "@/lib/supabase/client";
import type { MediaRow, SiteRow } from "@/lib/supabase/database.types";
import { parseWebsiteConfig } from "@/lib/supabase/parse-website-config";
import type { MediaAsset, WebsiteConfig } from "@/lib/types/website-config";

export interface ResolvedSite {
  slug: string;
  config: WebsiteConfig;
  mediaById: Record<string, MediaAsset>;
}

type PublishedSiteSelect = Pick<
  SiteRow,
  "id" | "slug" | "business_name" | "site_config" | "status"
>;

/**
 * Resolve a tenant site for `/site/[slug]`.
 * Only published Supabase rows are public. Drafts stay owner-only.
 */
export async function getSiteBySlug(slug: string): Promise<ResolvedSite | undefined> {
  return getPublishedSiteFromSupabase(slug);
}

/** No static demo slugs — public sites come from published Supabase rows. */
export function listKnownSiteSlugs(): string[] {
  return [];
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

  const mediaById = await mediaRowsToSignedAssets(
    supabase,
    mediaRows,
    supabaseUrl,
  );
  return {
    slug: row.slug,
    config: ensureSectionMediaIds(
      config,
      mediaRows.map((mediaRow) => mediaRow.id),
    ),
    mediaById,
  };
}

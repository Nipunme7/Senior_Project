import type { SupabaseClient } from "@supabase/supabase-js";
import { mediaRowsToSignedAssets } from "@/lib/media/resolve-rows";
import type { MediaRow, SiteRow, SiteStatus } from "@/lib/supabase/database.types";
import { parseWebsiteConfig } from "@/lib/supabase/parse-website-config";
import type { MediaAsset, WebsiteConfig } from "@/lib/types/website-config";

export interface CreateOwnerSiteInput {
  businessName: string;
  slug: string;
  style?: string;
  status?: SiteStatus;
}

export interface OwnedSiteView {
  site: SiteRow;
  config: WebsiteConfig;
  mediaById: Record<string, MediaAsset>;
}

/** List sites owned by the signed-in user. */
export async function listOwnedSites(
  supabase: SupabaseClient,
  ownerId: string,
): Promise<SiteRow[]> {
  const { data, error } = await supabase
    .from("sites")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as SiteRow[];
}

/**
 * Create a draft site for the current user.
 * Requires an authenticated session and a matching profiles row.
 */
export async function createOwnerSite(
  supabase: SupabaseClient,
  userId: string,
  input: CreateOwnerSiteInput,
): Promise<SiteRow> {
  const slug = input.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
  const businessName = input.businessName.trim();

  if (!businessName) {
    throw new Error("Business name is required.");
  }
  if (!slug) {
    throw new Error("Slug is required.");
  }

  const { data, error } = await supabase
    .from("sites")
    .insert({
      owner_id: userId,
      business_name: businessName,
      slug,
      status: input.status ?? "draft",
      style: input.style ?? null,
      site_config: {
        siteName: businessName,
        theme: {
          style: input.style ?? "modern",
          primaryColor: "#111111",
          accentColor: "#C9A45C",
        },
        sections: [
          {
            id: "hero_01",
            type: "hero",
            variant: "centered",
            props: {
              headline: businessName,
              subheadline: "Draft site — upload media, then generate with AI.",
            },
          },
        ],
      },
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Failed to create site.");
  }

  return data as SiteRow;
}

/** Replace the draft/published site_config for an owned site. */
export async function updateOwnerSiteConfig(
  supabase: SupabaseClient,
  siteId: string,
  config: WebsiteConfig,
  style?: string | null,
): Promise<SiteRow> {
  const patch: { site_config: WebsiteConfig; style?: string | null } = {
    site_config: config,
  };
  if (style !== undefined) {
    patch.style = style;
  }

  const { data, error } = await supabase
    .from("sites")
    .update(patch)
    .eq("id", siteId)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Failed to update site config.");
  }

  return data as SiteRow;
}

/** Publish an owned site so `/site/{slug}` can serve it publicly. */
export async function publishOwnerSite(
  supabase: SupabaseClient,
  siteId: string,
): Promise<SiteRow> {
  const { data, error } = await supabase
    .from("sites")
    .update({ status: "published" })
    .eq("id", siteId)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Failed to publish site.");
  }

  return data as SiteRow;
}

/** Load an owned site (draft or published) by slug for owner preview. */
export async function getOwnedSiteBySlug(
  supabase: SupabaseClient,
  ownerId: string,
  slug: string,
  supabaseUrl: string,
): Promise<OwnedSiteView | null> {
  const { data, error } = await supabase
    .from("sites")
    .select("*")
    .eq("owner_id", ownerId)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    return null;
  }

  const site = data as SiteRow;
  const config = parseWebsiteConfig(site.site_config);
  if (!config) {
    throw new Error("Stored site_config is invalid.");
  }

  const { data: mediaData, error: mediaError } = await supabase
    .from("media")
    .select("id, storage_path, type, description")
    .eq("site_id", site.id);

  if (mediaError) {
    throw new Error(mediaError.message);
  }

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
    site,
    config,
    mediaById,
  };
}

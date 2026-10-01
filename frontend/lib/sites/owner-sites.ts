import type { SupabaseClient } from "@supabase/supabase-js";
import type { SiteRow, SiteStatus } from "@/lib/supabase/database.types";

export interface CreateOwnerSiteInput {
  businessName: string;
  slug: string;
  style?: string;
  status?: SiteStatus;
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
              subheadline: "Draft site — upload media, then generate with AI later.",
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

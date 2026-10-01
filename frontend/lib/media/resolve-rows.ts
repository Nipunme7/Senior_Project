import { SITE_MEDIA_BUCKET } from "@/lib/media/constants";
import type { MediaRow } from "@/lib/supabase/database.types";
import type { MediaAsset } from "@/lib/types/website-config";

/** Build a public Storage URL for a path inside the site-media bucket. */
export function publicMediaUrl(supabaseUrl: string, storagePath: string): string {
  const base = supabaseUrl.replace(/\/$/, "");
  const encodedPath = storagePath
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  return `${base}/storage/v1/object/public/${SITE_MEDIA_BUCKET}/${encodedPath}`;
}

/**
 * Turn media table rows into renderer MediaAsset records keyed by media ID.
 * WebsiteConfig sections reference these IDs — never raw Storage URLs.
 */
export function mediaRowsToAssets(
  rows: Pick<MediaRow, "id" | "storage_path" | "type" | "description">[],
  supabaseUrl: string,
): Record<string, MediaAsset> {
  const byId: Record<string, MediaAsset> = {};

  for (const row of rows) {
    byId[row.id] = {
      id: row.id,
      type: row.type,
      url: publicMediaUrl(supabaseUrl, row.storage_path),
      alt: row.description?.trim() || "Site media",
    };
  }

  return byId;
}

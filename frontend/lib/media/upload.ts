import { SITE_MEDIA_BUCKET, MAX_VIDEOS_PER_SITE } from "@/lib/media/constants";
import { buildSiteMediaPath } from "@/lib/media/storage-path";
import { validateMediaFile } from "@/lib/media/validate";
import type { MediaRow } from "@/lib/supabase/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface UploadSiteMediaInput {
  siteId: string;
  file: File;
  description?: string;
}

export interface UploadSiteMediaResult {
  media: MediaRow;
}

/**
 * Upload a file to Supabase Storage and insert a media metadata row.
 * Configs/AI should reference `media.id`, not the Storage URL.
 */
export async function uploadSiteMedia(
  supabase: SupabaseClient,
  input: UploadSiteMediaInput,
): Promise<UploadSiteMediaResult> {
  const validation = validateMediaFile(input.file);
  if (!validation.ok) {
    throw new Error(validation.error);
  }

  if (validation.kind === "video") {
    const { count, error: countError } = await supabase
      .from("media")
      .select("id", { count: "exact", head: true })
      .eq("site_id", input.siteId)
      .eq("type", "video");

    if (countError) {
      throw new Error(countError.message);
    }
    if ((count ?? 0) >= MAX_VIDEOS_PER_SITE) {
      throw new Error(
        `This site already has the maximum of ${MAX_VIDEOS_PER_SITE} videos.`,
      );
    }
  }

  const storagePath = buildSiteMediaPath(input.siteId, input.file.name);

  const { error: uploadError } = await supabase.storage
    .from(SITE_MEDIA_BUCKET)
    .upload(storagePath, input.file, {
      cacheControl: "3600",
      upsert: false,
      contentType: input.file.type,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data, error: insertError } = await supabase
    .from("media")
    .insert({
      site_id: input.siteId,
      storage_path: storagePath,
      type: validation.kind,
      description: input.description?.trim() || input.file.name,
    })
    .select("*")
    .single();

  if (insertError || !data) {
    // Best-effort cleanup if the DB insert fails after Storage upload.
    await supabase.storage.from(SITE_MEDIA_BUCKET).remove([storagePath]);
    throw new Error(insertError?.message || "Failed to save media metadata.");
  }

  return { media: data as MediaRow };
}

export async function listSiteMedia(
  supabase: SupabaseClient,
  siteId: string,
): Promise<MediaRow[]> {
  const { data, error } = await supabase
    .from("media")
    .select("*")
    .eq("site_id", siteId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as MediaRow[];
}

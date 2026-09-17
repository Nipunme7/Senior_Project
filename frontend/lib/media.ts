import type { MediaAsset } from "@/lib/types/website-config";

/** Resolve catalog media IDs into renderer-ready assets. Unknown IDs are dropped. */
export function resolveMedia(
  mediaIds: string[] | undefined,
  mediaById: Record<string, MediaAsset>,
): MediaAsset[] {
  if (!mediaIds) {
    return [];
  }

  return mediaIds.flatMap((id) => {
    const asset = mediaById[id];
    return asset ? [asset] : [];
  });
}

export function firstImage(media: MediaAsset[]): MediaAsset | undefined {
  return media.find((asset) => asset.type === "image");
}

export function firstVideo(media: MediaAsset[]): MediaAsset | undefined {
  return media.find((asset) => asset.type === "video");
}

/** Supabase Storage bucket for site logos, images, and small videos. */
export const SITE_MEDIA_BUCKET = "site-media";

export const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const VIDEO_MIME_TYPES = ["video/mp4", "video/webm"] as const;

/** MVP image limit — keep uploads small and free-tier friendly. */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** MVP small-video limit — no large 4K uploads. */
export const MAX_VIDEO_BYTES = 20 * 1024 * 1024;

/** Soft cap so one site cannot flood storage in the MVP. */
export const MAX_VIDEOS_PER_SITE = 3;

import {
  IMAGE_MIME_TYPES,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
  VIDEO_MIME_TYPES,
} from "@/lib/media/constants";

export type MediaUploadKind = "image" | "video";

export interface MediaValidationResult {
  ok: true;
  kind: MediaUploadKind;
}

export interface MediaValidationError {
  ok: false;
  error: string;
}

/**
 * Enforce MVP media rules before Storage upload.
 * Images are primary; videos are limited small MP4/WebM only.
 */
export function validateMediaFile(
  file: Pick<File, "type" | "size" | "name">,
): MediaValidationResult | MediaValidationError {
  if (!file.type) {
    return { ok: false, error: "File type is missing." };
  }

  if ((IMAGE_MIME_TYPES as readonly string[]).includes(file.type)) {
    if (file.size > MAX_IMAGE_BYTES) {
      return {
        ok: false,
        error: `Image exceeds the ${MAX_IMAGE_BYTES / (1024 * 1024)}MB limit.`,
      };
    }
    return { ok: true, kind: "image" };
  }

  if ((VIDEO_MIME_TYPES as readonly string[]).includes(file.type)) {
    if (file.size > MAX_VIDEO_BYTES) {
      return {
        ok: false,
        error: `Video exceeds the ${MAX_VIDEO_BYTES / (1024 * 1024)}MB limit.`,
      };
    }
    return { ok: true, kind: "video" };
  }

  return {
    ok: false,
    error: `Unsupported type "${file.type || file.name}". Use JPEG, PNG, WebP, GIF, MP4, or WebM.`,
  };
}

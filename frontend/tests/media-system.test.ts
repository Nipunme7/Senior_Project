import { describe, expect, it } from "vitest";
import { MAX_IMAGE_BYTES, MAX_VIDEO_BYTES } from "@/lib/media/constants";
import { mediaRowsToAssets, publicMediaUrl } from "@/lib/media/resolve-rows";
import { buildSiteMediaPath } from "@/lib/media/storage-path";
import { validateMediaFile } from "@/lib/media/validate";

describe("validateMediaFile", () => {
  it("accepts a normal JPEG image", () => {
    expect(
      validateMediaFile({
        name: "hero.jpg",
        type: "image/jpeg",
        size: 1024,
      }),
    ).toEqual({ ok: true, kind: "image" });
  });

  it("rejects oversized images", () => {
    const result = validateMediaFile({
      name: "huge.png",
      type: "image/png",
      size: MAX_IMAGE_BYTES + 1,
    });
    expect(result.ok).toBe(false);
  });

  it("accepts small mp4 videos", () => {
    expect(
      validateMediaFile({
        name: "intro.mp4",
        type: "video/mp4",
        size: MAX_VIDEO_BYTES,
      }),
    ).toEqual({ ok: true, kind: "video" });
  });

  it("rejects unsupported types", () => {
    const result = validateMediaFile({
      name: "notes.pdf",
      type: "application/pdf",
      size: 100,
    });
    expect(result.ok).toBe(false);
  });
});

describe("buildSiteMediaPath", () => {
  it("prefixes the site id and sanitizes the file name", () => {
    const path = buildSiteMediaPath(
      "11111111-1111-1111-1111-111111111111",
      "../../weird name!!.JPG",
    );
    expect(path.startsWith("11111111-1111-1111-1111-111111111111/")).toBe(true);
    expect(path.endsWith("-weird_name__.JPG")).toBe(true);
  });
});

describe("mediaRowsToAssets", () => {
  it("maps media rows to MediaAsset records with public URLs", () => {
    const assets = mediaRowsToAssets(
      [
        {
          id: "media-uuid-1",
          storage_path: "site-1/hero.jpg",
          type: "image",
          description: "Hero photo",
        },
      ],
      "https://example.supabase.co",
    );

    expect(assets["media-uuid-1"]).toEqual({
      id: "media-uuid-1",
      type: "image",
      url: publicMediaUrl("https://example.supabase.co", "site-1/hero.jpg"),
      alt: "Hero photo",
    });
  });
});

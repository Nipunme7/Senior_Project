import { describe, expect, it } from "vitest";
import { parseWebsiteConfig } from "@/lib/supabase/parse-website-config";
import { eliteCutsConfig } from "@/lib/demo/elite-cuts-config";
import { isSupabaseConfigured } from "@/lib/supabase/client";

describe("parseWebsiteConfig", () => {
  it("accepts a valid WebsiteConfig object", () => {
    expect(parseWebsiteConfig(eliteCutsConfig)?.siteName).toBe("Elite Cuts");
  });

  it("rejects missing siteName", () => {
    expect(
      parseWebsiteConfig({
        theme: eliteCutsConfig.theme,
        sections: eliteCutsConfig.sections,
      }),
    ).toBeNull();
  });

  it("rejects empty sections", () => {
    expect(
      parseWebsiteConfig({
        siteName: "Empty",
        theme: eliteCutsConfig.theme,
        sections: [],
      }),
    ).toBeNull();
  });

  it("rejects unknown section types", () => {
    expect(
      parseWebsiteConfig({
        siteName: "Bad",
        theme: eliteCutsConfig.theme,
        sections: [{ id: "x", type: "not-real", variant: "cards", props: {} }],
      }),
    ).toBeNull();
  });

  it("rejects non-objects", () => {
    expect(parseWebsiteConfig(null)).toBeNull();
    expect(parseWebsiteConfig("nope")).toBeNull();
  });
});

describe("isSupabaseConfigured", () => {
  it("reports whether public env vars are present", () => {
    expect(typeof isSupabaseConfigured()).toBe("boolean");
  });
});

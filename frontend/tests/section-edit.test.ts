import { describe, expect, it } from "vitest";
import {
  replaceSectionInConfig,
  toggleMediaId,
} from "@/lib/sites/section-edit";
import type { WebsiteConfig } from "@/lib/types/website-config";

const baseConfig: WebsiteConfig = {
  siteName: "Harbor & Pine",
  theme: {
    style: "minimal",
    primaryColor: "#111111",
    accentColor: "#0f766e",
  },
  sections: [
    {
      id: "hero_01",
      type: "hero",
      variant: "centered",
      props: { headline: "Hello" },
      mediaIds: ["m1"],
    },
    {
      id: "services_01",
      type: "services",
      variant: "list",
      props: {
        items: [{ name: "Design", description: "Full home" }],
      },
    },
  ],
};

describe("section-edit helpers", () => {
  it("replaces one section without touching others", () => {
    const next = replaceSectionInConfig(baseConfig, {
      id: "hero_01",
      type: "hero",
      variant: "split-left",
      props: { headline: "Updated", subheadline: "Calm spaces" },
      mediaIds: ["m2"],
    });

    expect(next.sections[0].props).toMatchObject({
      headline: "Updated",
      subheadline: "Calm spaces",
    });
    expect(next.sections[0]).toMatchObject({ variant: "split-left", mediaIds: ["m2"] });
    expect(next.sections[1]).toEqual(baseConfig.sections[1]);
  });

  it("rejects unknown section ids and type changes", () => {
    expect(() =>
      replaceSectionInConfig(baseConfig, {
        id: "missing",
        type: "hero",
        variant: "centered",
        props: { headline: "X" },
      }),
    ).toThrow(/not found/i);

    expect(() =>
      replaceSectionInConfig(baseConfig, {
        id: "hero_01",
        type: "about",
        variant: "text-only",
        props: { body: "Nope" },
      }),
    ).toThrow(/type cannot change/i);
  });

  it("toggles media ids for single and multi select", () => {
    expect(toggleMediaId(["m1"], "m2", { multi: false })).toEqual(["m2"]);
    expect(toggleMediaId(["m1"], "m1", { multi: false })).toEqual([]);
    expect(toggleMediaId(["m1"], "m2", { multi: true })).toEqual(["m1", "m2"]);
    expect(toggleMediaId(["m1", "m2"], "m1", { multi: true })).toEqual(["m2"]);
  });
});

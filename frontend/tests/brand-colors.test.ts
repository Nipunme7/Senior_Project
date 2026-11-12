import { describe, expect, it } from "vitest";
import {
  brandColorsLabel,
  defaultPaletteForStyle,
  deriveAccentColor,
  deriveSecondaryColor,
  normalizeBrandColors,
  normalizeHexColor,
  palettesForStyle,
  themeColorsFromBrand,
  withThemeColors,
} from "@/lib/owner/wizard-options";

describe("brand colors", () => {
  it("normalizes hex values", () => {
    expect(normalizeHexColor("#ABC")).toBe("#aabbcc");
    expect(normalizeHexColor("nope", "#111111")).toBe("#111111");
  });

  it("pads and trims to the chosen count", () => {
    expect(normalizeBrandColors(2, ["#fff"])).toEqual(["#ffffff", "#f4efe7"]);
    expect(normalizeBrandColors(1, ["#111111", "#c9a45c", "#0f766e"])).toEqual([
      "#111111",
    ]);
  });

  it("maps one, two, and three picks onto theme colors", () => {
    expect(themeColorsFromBrand(["#0f172a"])).toEqual({
      primaryColor: "#0f172a",
      secondaryColor: deriveSecondaryColor("#0f172a"),
      accentColor: deriveAccentColor("#0f172a"),
    });
    expect(themeColorsFromBrand(["#111111", "#86efac"])).toEqual({
      primaryColor: "#111111",
      secondaryColor: deriveSecondaryColor("#111111"),
      accentColor: "#86efac",
    });
    expect(themeColorsFromBrand(["#111111", "#334155", "#c9a45c"])).toEqual({
      primaryColor: "#111111",
      secondaryColor: "#334155",
      accentColor: "#c9a45c",
    });
  });

  it("exposes curated palettes per style", () => {
    const luxury = palettesForStyle("luxury");
    expect(luxury.length).toBe(4);
    expect(defaultPaletteForStyle("luxury").id).toBe("noirChampagne");
    expect(defaultPaletteForStyle("luxury").colors).toHaveLength(3);
  });

  it("patches config theme colors", () => {
    const next = withThemeColors(
      {
        theme: {
          style: "modern",
          primaryColor: "#000000",
          secondaryColor: "#ffffff",
          accentColor: "#ffffff",
        },
      },
      ["#102418", "#eef9f3", "#63c5a4"],
    );
    expect(next.theme.style).toBe("modern");
    expect(next.theme.primaryColor).toBe("#102418");
    expect(next.theme.secondaryColor).toBe("#eef9f3");
    expect(next.theme.accentColor).toBe("#63c5a4");
  });

  it("labels selections for the generate summary", () => {
    expect(brandColorsLabel(["#111111"])).toBe("1 color · #111111");
    expect(brandColorsLabel(["#111111", "#c9a45c"])).toContain("2 colors");
  });
});

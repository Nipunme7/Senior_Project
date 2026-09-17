import { describe, expect, it } from "vitest";
import { eliteCutsConfig } from "@/lib/demo/elite-cuts-config";
import { demoMediaById } from "@/lib/demo/media";
import { getDemoSite, listDemoSiteSlugs } from "@/lib/demo/sites";
import { renderSite } from "./helpers";

describe("demo site routes", () => {
  it("only exposes the barber and cafe slugs", () => {
    expect(listDemoSiteSlugs()).toEqual(["barber", "cafe"]);
    expect(getDemoSite("barber")?.config.siteName).toBe("Elite Cuts");
    expect(getDemoSite("cafe")?.config.siteName).toBe("Everest Coffee");
    expect(getDemoSite("missing")).toBeUndefined();
  });

  it("renders a known slug through SiteRenderer", () => {
    const site = getDemoSite("barber");
    expect(site).toBeDefined();

    const { getByRole } = renderSite(eliteCutsConfig, demoMediaById);

    expect(getByRole("heading", { name: "Precision Grooming. Elevated." })).toBeInTheDocument();
  });

  it("treats unknown slugs as missing sites", () => {
    expect(getDemoSite("missing")).toBeUndefined();
    expect(listDemoSiteSlugs().includes("missing")).toBe(false);
  });
});

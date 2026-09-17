import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const notFound = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});

vi.mock("next/navigation", () => ({
  notFound: () => notFound(),
}));

import SitePage, { generateMetadata, generateStaticParams } from "@/app/site/[slug]/page";
import { getDemoSite } from "@/lib/demo/sites";

describe("demo site routes", () => {
  beforeEach(() => {
    notFound.mockClear();
  });

  it("only exposes the barber and cafe slugs", () => {
    expect(generateStaticParams()).toEqual([{ slug: "barber" }, { slug: "cafe" }]);
    expect(getDemoSite("barber")?.config.siteName).toBe("Elite Cuts");
    expect(getDemoSite("cafe")?.config.siteName).toBe("Everest Coffee");
    expect(getDemoSite("missing")).toBeUndefined();
  });

  it("renders a known slug through SiteRenderer", async () => {
    const ui = await SitePage({ params: Promise.resolve({ slug: "barber" }) });
    const { getByRole } = render(ui);

    expect(notFound).not.toHaveBeenCalled();
    expect(getByRole("heading", { name: "Precision Grooming. Elevated." })).toBeInTheDocument();
  });

  it("calls notFound for /site/missing", async () => {
    await expect(SitePage({ params: Promise.resolve({ slug: "missing" }) })).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
    expect(notFound).toHaveBeenCalledTimes(1);
  });

  it("does not invent metadata for a missing slug", async () => {
    await expect(
      generateMetadata({ params: Promise.resolve({ slug: "missing" }) }),
    ).resolves.toEqual({ title: "Site not found" });
  });
});

import { describe, expect, it } from "vitest";
import { componentMap } from "@/renderer/componentMap";
import type { SiteSection, WebsiteConfig } from "@/lib/types/website-config";
import { makeConfig, renderSite, renderedSectionIds, testTheme } from "./helpers";

const catalogConfig = makeConfig(
  [
    {
      id: "hero_01",
      type: "hero",
      variant: "centered",
      props: { headline: "UniqueHeroHeadline" },
    },
    {
      id: "about_01",
      type: "about",
      variant: "text-only",
      props: { heading: "UniqueAboutHeading", body: "About body copy." },
    },
    {
      id: "services_01",
      type: "services",
      variant: "cards",
      props: {
        heading: "UniqueServicesHeading",
        items: [{ name: "UniqueServiceItem", price: "$10" }],
      },
    },
    {
      id: "pricing_01",
      type: "pricing",
      variant: "simple-list",
      props: {
        heading: "UniquePricingHeading",
        items: [{ name: "UniquePriceItem", price: "$20" }],
      },
    },
    {
      id: "gallery_01",
      type: "gallery",
      variant: "grid",
      props: { heading: "UniqueGalleryHeading" },
      mediaIds: ["media_02"],
    },
    {
      id: "testimonials_01",
      type: "testimonials",
      variant: "cards",
      props: {
        heading: "UniqueTestimonialsHeading",
        items: [{ quote: "UniqueQuote", name: "UniqueClient" }],
      },
    },
    {
      id: "cta_01",
      type: "cta",
      variant: "simple",
      props: { heading: "UniqueCtaHeading", ctaLabel: "Go", ctaHref: "#contact_01" },
    },
    {
      id: "contact_01",
      type: "contact",
      variant: "simple",
      props: { heading: "UniqueContactHeading", email: "hello@example.com" },
    },
    {
      id: "footer_01",
      type: "footer",
      variant: "basic",
      props: { tagline: "UniqueFooterTagline" },
    },
  ],
  { siteName: "Catalog Site", theme: { ...testTheme, style: "professional" } },
);

describe("SiteRenderer", () => {
  it("renders the registered component for each catalog section type", () => {
    const { getByRole, getByText } = renderSite(catalogConfig);

    expect(componentMap.hero).toBeDefined();
    expect(getByRole("heading", { name: "UniqueHeroHeadline" })).toBeInTheDocument();
    expect(getByRole("heading", { name: "UniqueAboutHeading" })).toBeInTheDocument();
    expect(getByRole("heading", { name: "UniqueServicesHeading" })).toBeInTheDocument();
    expect(getByText("UniqueServiceItem")).toBeInTheDocument();
    expect(getByRole("heading", { name: "UniquePricingHeading" })).toBeInTheDocument();
    expect(getByText("UniquePriceItem")).toBeInTheDocument();
    expect(getByRole("heading", { name: "UniqueGalleryHeading" })).toBeInTheDocument();
    expect(getByRole("heading", { name: "UniqueTestimonialsHeading" })).toBeInTheDocument();
    expect(getByText(/UniqueQuote/)).toBeInTheDocument();
    expect(getByRole("heading", { name: "UniqueCtaHeading" })).toBeInTheDocument();
    expect(getByRole("heading", { name: "UniqueContactHeading" })).toBeInTheDocument();
    expect(getByText("UniqueFooterTagline")).toBeInTheDocument();
  });

  it("renders sections in WebsiteConfig order", () => {
    const { container } = renderSite(catalogConfig);

    expect(renderedSectionIds(container)).toEqual(catalogConfig.sections.map((section) => section.id));
  });

  it("applies theme values from WebsiteConfig", () => {
    const { container } = renderSite(catalogConfig);
    const root = container.querySelector("[data-site]");

    expect(root).toHaveAttribute("data-site", "Catalog Site");
    expect(root).toHaveAttribute("data-style", "professional");
    expect(root).toHaveStyle({ backgroundColor: "#111111" });
  });

  it("skips unknown section types without crashing", () => {
    const config = {
      siteName: "Unsafe Site",
      theme: testTheme,
      sections: [
        {
          id: "hero_01",
          type: "hero",
          variant: "centered",
          props: { headline: "Still Visible" },
        },
        {
          id: "ghost_01",
          type: "not-a-real-section",
          variant: "none",
          props: {},
        },
        {
          id: "about_01",
          type: "about",
          variant: "text-only",
          props: { heading: "Also Visible", body: "Kept after the unknown block." },
        },
      ],
    } as unknown as WebsiteConfig;

    const { container, getByRole, queryByText } = renderSite(config);

    expect(renderedSectionIds(container)).toEqual(["hero_01", "about_01"]);
    expect(getByRole("heading", { name: "Still Visible" })).toBeInTheDocument();
    expect(getByRole("heading", { name: "Also Visible" })).toBeInTheDocument();
    expect(queryByText("ghost_01")).not.toBeInTheDocument();
    expect(container.querySelector("#ghost_01")).toBeNull();
  });

  it("does not invent extra sections beyond the config", () => {
    const sections: SiteSection[] = [
      {
        id: "hero_01",
        type: "hero",
        variant: "centered",
        props: { headline: "Only Hero" },
      },
    ];
    const { container, queryByRole } = renderSite(makeConfig(sections));

    expect(renderedSectionIds(container)).toEqual(["hero_01"]);
    expect(queryByRole("heading", { name: "Services" })).not.toBeInTheDocument();
  });
});

import { describe, expect, it } from "vitest";
import type { SiteSection } from "@/lib/types/website-config";
import { makeConfig, renderSite } from "./helpers";

function renderSections(sections: SiteSection[]) {
  return renderSite(makeConfig(sections, { siteName: "Variant Site" }));
}

describe("section variants", () => {
  it("renders important hero variants", () => {
    for (const variant of ["centered", "split-left", "split-right", "fullscreen-image"] as const) {
      const { getByRole, unmount } = renderSections([
        {
          id: "hero_01",
          type: "hero",
          variant,
          props: { headline: `Hero ${variant}` },
          mediaIds: ["media_01"],
        },
      ]);

      expect(getByRole("heading", { name: `Hero ${variant}` })).toBeInTheDocument();
      unmount();
    }
  });

  it("renders about, services, pricing, and gallery variants used by the demos", () => {
    const { getByRole, getByText, getByAltText } = renderSections([
      {
        id: "about_01",
        type: "about",
        variant: "image-right",
        props: { heading: "About image-right", body: "About copy." },
        mediaIds: ["media_06"],
      },
      {
        id: "about_02",
        type: "about",
        variant: "text-only",
        props: { heading: "About text-only", body: "Text only copy." },
      },
      {
        id: "services_01",
        type: "services",
        variant: "cards",
        props: { heading: "Service cards", items: [{ name: "Card Item", price: "$1" }] },
      },
      {
        id: "services_02",
        type: "services",
        variant: "list",
        props: { heading: "Service list", items: [{ name: "List Item", price: "$2" }] },
      },
      {
        id: "pricing_01",
        type: "pricing",
        variant: "cards",
        props: { heading: "Pricing cards", items: [{ name: "Plan A", price: "$30" }] },
      },
      {
        id: "pricing_02",
        type: "pricing",
        variant: "simple-list",
        props: { heading: "Pricing list", items: [{ name: "Drip", price: "$4" }] },
      },
      {
        id: "gallery_01",
        type: "gallery",
        variant: "masonry",
        props: { heading: "Masonry gallery" },
        mediaIds: ["media_02", "media_03"],
      },
      {
        id: "gallery_02",
        type: "gallery",
        variant: "grid",
        props: { heading: "Grid gallery" },
        mediaIds: ["cafe_03"],
      },
    ]);

    expect(getByRole("heading", { name: "About image-right" })).toBeInTheDocument();
    expect(getByRole("heading", { name: "About text-only" })).toBeInTheDocument();
    expect(getByText("Card Item")).toBeInTheDocument();
    expect(getByText("List Item")).toBeInTheDocument();
    expect(getByText("Plan A")).toBeInTheDocument();
    expect(getByText("Drip")).toBeInTheDocument();
    expect(getByRole("heading", { name: "Masonry gallery" })).toBeInTheDocument();
    expect(getByRole("heading", { name: "Grid gallery" })).toBeInTheDocument();
    expect(getByAltText("Barber giving a precise scissor haircut")).toBeInTheDocument();
  });

  it("renders testimonial, CTA, contact, and footer variants", () => {
    const { getByRole, getByText, getByTitle } = renderSections([
      {
        id: "testimonials_01",
        type: "testimonials",
        variant: "featured-quote",
        props: {
          heading: "Featured quotes",
          items: [{ quote: "Featured line", name: "Alex" }],
        },
      },
      {
        id: "testimonials_02",
        type: "testimonials",
        variant: "cards",
        props: {
          heading: "Quote cards",
          items: [{ quote: "Card line", name: "Sam" }],
        },
      },
      {
        id: "cta_01",
        type: "cta",
        variant: "banner",
        props: { heading: "Banner CTA", ctaLabel: "Book", ctaHref: "#contact_01" },
      },
      {
        id: "cta_02",
        type: "cta",
        variant: "image-background",
        props: { heading: "Image CTA", ctaLabel: "Visit", ctaHref: "#contact_01" },
        mediaIds: ["cafe_06"],
      },
      {
        id: "contact_01",
        type: "contact",
        variant: "split",
        props: { heading: "Split contact", email: "split@example.com" },
      },
      {
        id: "contact_02",
        type: "contact",
        variant: "map-right",
        props: {
          heading: "Map contact",
          address: "1 Main Street",
          mapEmbedUrl: "https://www.openstreetmap.org/export/embed.html",
        },
      },
      {
        id: "footer_01",
        type: "footer",
        variant: "basic",
        props: { tagline: "Basic footer", copyright: "© Test" },
      },
    ]);

    expect(getByText(/Featured line/)).toBeInTheDocument();
    expect(getByText(/Card line/)).toBeInTheDocument();
    expect(getByRole("heading", { name: "Banner CTA" })).toBeInTheDocument();
    expect(getByRole("heading", { name: "Image CTA" })).toBeInTheDocument();
    expect(getByRole("heading", { name: "Split contact" })).toBeInTheDocument();
    expect(getByRole("heading", { name: "Map contact" })).toBeInTheDocument();
    expect(getByTitle("Location map")).toBeInTheDocument();
    expect(getByText("Basic footer")).toBeInTheDocument();
  });
});

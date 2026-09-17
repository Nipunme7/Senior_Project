import { describe, expect, it } from "vitest";
import { eliteCutsConfig } from "@/lib/demo/elite-cuts-config";
import { everestCoffeeConfig } from "@/lib/demo/everest-coffee-config";
import { demoMediaById } from "@/lib/demo/media";
import { SiteRenderer } from "@/renderer/SiteRenderer";
import { renderSite, renderedSectionIds } from "./helpers";

describe("demo WebsiteConfig objects", () => {
  it("renders Elite Cuts content from the barber config", () => {
    const { container, getByRole, getByText } = renderSite(eliteCutsConfig, demoMediaById);

    expect(getByRole("heading", { name: "Precision Grooming. Elevated." })).toBeInTheDocument();
    expect(getByText("Signature Cut")).toBeInTheDocument();
    expect(getByText("A quieter kind of shop")).toBeInTheDocument();
    expect(container).not.toHaveTextContent("Coffee from higher ground.");
    expect(container).not.toHaveTextContent("Summit Latte");
  });

  it("renders Everest Coffee content from the cafe config", () => {
    const { container, getByRole, getByText } = renderSite(everestCoffeeConfig, demoMediaById);

    expect(getByRole("heading", { name: "Coffee from higher ground." })).toBeInTheDocument();
    expect(getByText("Summit Latte")).toBeInTheDocument();
    expect(getByText("Roasted for the climb")).toBeInTheDocument();
    expect(container).not.toHaveTextContent("Precision Grooming. Elevated.");
    expect(container).not.toHaveTextContent("Signature Cut");
  });

  it("keeps each demo site's section order", () => {
    const barber = renderSite(eliteCutsConfig);
    const cafe = renderSite(everestCoffeeConfig);

    expect(renderedSectionIds(barber.container)).toEqual(
      eliteCutsConfig.sections.map((section) => section.id),
    );
    expect(renderedSectionIds(cafe.container)).toEqual(
      everestCoffeeConfig.sections.map((section) => section.id),
    );
  });

  it("uses the same SiteRenderer for both demo configs", () => {
    expect(SiteRenderer.name).toBe("SiteRenderer");

    const barber = renderSite(eliteCutsConfig);
    const cafe = renderSite(everestCoffeeConfig);

    expect(barber.container.querySelector("[data-site]")?.getAttribute("data-site")).toBe(
      "Elite Cuts",
    );
    expect(cafe.container.querySelector("[data-site]")?.getAttribute("data-site")).toBe(
      "Everest Coffee",
    );
    expect(barber.container.querySelector("[data-style]")?.getAttribute("data-style")).toBe(
      "luxury",
    );
    expect(cafe.container.querySelector("[data-style]")?.getAttribute("data-style")).toBe(
      "minimal",
    );
  });
});

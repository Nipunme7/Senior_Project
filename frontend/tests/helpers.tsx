import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { SiteRenderer } from "@/renderer/SiteRenderer";
import { demoMediaById } from "@/lib/demo/media";
import type { MediaAsset, SiteSection, ThemeConfig, WebsiteConfig } from "@/lib/types/website-config";

export const testTheme: ThemeConfig = {
  style: "modern",
  primaryColor: "#111111",
  accentColor: "#C9A45C",
};

export function makeConfig(
  sections: SiteSection[],
  overrides: Partial<WebsiteConfig> = {},
): WebsiteConfig {
  return {
    siteName: "Test Site",
    theme: testTheme,
    sections,
    ...overrides,
  };
}

export function renderSite(
  config: WebsiteConfig,
  mediaById: Record<string, MediaAsset> = demoMediaById,
) {
  return render(<SiteRenderer config={config} mediaById={mediaById} />);
}

export function renderElement(ui: ReactElement) {
  return render(ui);
}

export function renderedSectionIds(container: HTMLElement): string[] {
  return [...container.querySelectorAll("section[id], footer[id]")].map((element) => element.id);
}

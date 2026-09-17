import type { CSSProperties } from "react";
import { componentMap } from "@/renderer/componentMap";
import { resolveMedia } from "@/lib/media";
import type { MediaAsset, WebsiteConfig } from "@/lib/types/website-config";

/** Inputs required to render a generated site from structured data. */
export interface SiteRendererProps {
  config: WebsiteConfig;
  mediaById: Record<string, MediaAsset>;
}

/**
 * Maps each `WebsiteConfig` section to a catalog React component.
 * Unknown section types are skipped so invalid AI output cannot crash the page.
 */
export function SiteRenderer({ config, mediaById }: SiteRendererProps) {
  const { theme } = config;

  return (
    <div
      className="min-h-screen"
      data-site={config.siteName}
      data-style={theme.style}
      style={
        {
          backgroundColor: theme.primaryColor,
          color: "#f4f1ea",
          "--site-primary": theme.primaryColor,
          "--site-accent": theme.accentColor,
        } as CSSProperties
      }
    >
      {config.sections.map((section) => {
        const Component = componentMap[section.type];

        if (!Component) {
          return null;
        }

        return (
          <Component
            key={section.id}
            {...section}
            media={resolveMedia(section.mediaIds, mediaById)}
            theme={theme}
          />
        );
      })}
    </div>
  );
}

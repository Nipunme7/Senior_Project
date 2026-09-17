import type {
  MediaAsset,
  SiteSection,
  ThemeConfig,
} from "@/lib/types/website-config";

/** Shared contract passed from `SiteRenderer` into every catalog section. */
export type SectionComponentProps<T extends SiteSection = SiteSection> = T & {
  media: MediaAsset[];
  theme: ThemeConfig;
};

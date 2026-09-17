import { eliteCutsConfig } from "@/lib/demo/elite-cuts-config";
import { everestCoffeeConfig } from "@/lib/demo/everest-coffee-config";
import { demoMediaById } from "@/lib/demo/media";
import type { MediaAsset, WebsiteConfig } from "@/lib/types/website-config";

export interface DemoSite {
  slug: string;
  config: WebsiteConfig;
  mediaById: Record<string, MediaAsset>;
}

/** Hard-coded Phase 2 tenants used by `/site/[slug]`. */
export const demoSitesBySlug: Record<string, DemoSite> = {
  barber: {
    slug: "barber",
    config: eliteCutsConfig,
    mediaById: demoMediaById,
  },
  cafe: {
    slug: "cafe",
    config: everestCoffeeConfig,
    mediaById: demoMediaById,
  },
};

/** Look up a demo tenant by slug. Unknown slugs should 404. */
export function getDemoSite(slug: string): DemoSite | undefined {
  return demoSitesBySlug[slug];
}

export function listDemoSiteSlugs(): string[] {
  return Object.keys(demoSitesBySlug);
}

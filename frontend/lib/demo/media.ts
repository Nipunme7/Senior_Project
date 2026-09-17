import type { MediaAsset } from "@/lib/types/website-config";

/**
 * Hard-coded stand-in for Supabase Storage.
 * The renderer resolves media IDs; replace this map later with database assets.
 */
export const demoMediaById: Record<string, MediaAsset> = {
  media_01: {
    id: "media_01",
    type: "image",
    url: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1920&q=80",
    alt: "Dark luxury barber shop with leather chairs and warm lighting",
  },
  media_02: {
    id: "media_02",
    type: "image",
    url: "https://images.unsplash.com/photo-1503951914875-834188fe4720?auto=format&fit=crop&w=1200&q=80",
    alt: "Barber giving a precise scissor haircut",
  },
  media_03: {
    id: "media_03",
    type: "image",
    url: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=1200&q=80",
    alt: "Straight-razor shave in a classic barber chair",
  },
  media_04: {
    id: "media_04",
    type: "image",
    url: "https://images.unsplash.com/photo-1621605815971-fbc54d83437f?auto=format&fit=crop&w=1200&q=80",
    alt: "Detailed beard trim with clippers",
  },
  media_05: {
    id: "media_05",
    type: "image",
    url: "https://images.unsplash.com/photo-1622286342621-4bd786b3f2ba?auto=format&fit=crop&w=1200&q=80",
    alt: "Finished fade haircut in the shop mirror",
  },
  media_06: {
    id: "media_06",
    type: "image",
    url: "https://images.unsplash.com/photo-1503951914875-834188fe4720?auto=format&fit=crop&w=1400&q=80",
    alt: "Craftsman barber at work in the Elite Cuts shop",
  },
  cafe_01: {
    id: "cafe_01",
    type: "image",
    url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1920&q=80",
    alt: "Barista pouring a latte in a sunlit cafe",
  },
  cafe_02: {
    id: "cafe_02",
    type: "image",
    url: "https://images.unsplash.com/photo-1501339841973-5e8aa4f6b7df?auto=format&fit=crop&w=1400&q=80",
    alt: "Warm wooden interior of Everest Coffee",
  },
  cafe_03: {
    id: "cafe_03",
    type: "image",
    url: "https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=1200&q=80",
    alt: "Close-up of a ceramic cup of coffee",
  },
  cafe_04: {
    id: "cafe_04",
    type: "image",
    url: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1200&q=80",
    alt: "Roasted coffee beans on a tray",
  },
  cafe_05: {
    id: "cafe_05",
    type: "image",
    url: "https://images.unsplash.com/photo-1442512595331-e89e73828ed7?auto=format&fit=crop&w=1200&q=80",
    alt: "Cafe counter with pastries and espresso machine",
  },
  cafe_06: {
    id: "cafe_06",
    type: "image",
    url: "https://images.unsplash.com/photo-1453614512568-7af50e04ea95?auto=format&fit=crop&w=1600&q=80",
    alt: "People working with coffee in a mountain-town cafe",
  },
};

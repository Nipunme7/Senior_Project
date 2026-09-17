import type { WebsiteConfig } from "@/lib/types/website-config";

export const everestCoffeeConfig: WebsiteConfig = {
  siteName: "Everest Coffee",
  theme: {
    style: "minimal",
    primaryColor: "#1F1710",
    accentColor: "#D4A574",
  },
  sections: [
    {
      id: "hero_01",
      type: "hero",
      variant: "split-left",
      props: {
        headline: "Coffee from higher ground.",
        subheadline: "Small-batch beans, mountain water, and a calm place to sit.",
        ctaLabel: "See the menu",
        ctaHref: "#services_01",
      },
      mediaIds: ["cafe_01"],
    },
    {
      id: "about_01",
      type: "about",
      variant: "text-only",
      props: {
        heading: "Roasted for the climb",
        body: "Everest Coffee started as a cart near campus and grew into a neighborhood shop. We roast lightly, brew patiently, and keep the room simple so the cup can do the talking.",
      },
    },
    {
      id: "services_01",
      type: "services",
      variant: "list",
      props: {
        heading: "Menu",
        items: [
          {
            name: "House Pour Over",
            description: "Single-origin, kettle-brewed to order.",
            price: "$5",
          },
          {
            name: "Summit Latte",
            description: "Oat or dairy, with a honey-cardamom option.",
            price: "$6",
          },
          {
            name: "Morning Bun",
            description: "Butter pastry with orange sugar.",
            price: "$4",
          },
        ],
      },
    },
    {
      id: "gallery_01",
      type: "gallery",
      variant: "grid",
      props: {
        heading: "The room",
      },
      mediaIds: ["cafe_03", "cafe_04", "cafe_05"],
    },
    {
      id: "pricing_01",
      type: "pricing",
      variant: "simple-list",
      props: {
        heading: "Punch cards",
        items: [
          { name: "Drip", price: "$4", description: "Daily house coffee" },
          { name: "Espresso", price: "$3.50", description: "Double shot" },
          { name: "Bag of beans", price: "$18", description: "12oz rotating origin" },
        ],
      },
    },
    {
      id: "testimonials_01",
      type: "testimonials",
      variant: "cards",
      props: {
        heading: "Regulars",
        items: [
          {
            quote: "Best pour-over within walking distance of campus.",
            name: "Maya Chen",
            role: "Student",
          },
          {
            quote: "Quiet enough to write. Warm enough to stay.",
            name: "Chris Adler",
            role: "Designer",
          },
          {
            quote: "The summit latte is my entire winter personality.",
            name: "Priya Shah",
          },
        ],
      },
    },
    {
      id: "cta_01",
      type: "cta",
      variant: "image-background",
      props: {
        heading: "Come in from the cold",
        body: "Open early. Laptops welcome until noon.",
        ctaLabel: "Find us",
        ctaHref: "#contact_01",
      },
      mediaIds: ["cafe_06"],
    },
    {
      id: "contact_01",
      type: "contact",
      variant: "map-right",
      props: {
        heading: "The shop",
        address: "412 Summit Avenue\nDecorah, IA 52101",
        phone: "563-555-0192",
        email: "hello@everestcoffee.example",
        hours: "Mon–Fri, 7am–4pm\nSat–Sun, 8am–3pm",
        mapEmbedUrl:
          "https://www.openstreetmap.org/export/embed.html?bbox=-91.805%2C43.295%2C-91.775%2C43.315&layer=mapnik",
      },
    },
    {
      id: "footer_01",
      type: "footer",
      variant: "basic",
      props: {
        tagline: "Everest Coffee",
        copyright: "© Everest Coffee. Demo site for the AI website platform.",
      },
    },
  ],
};

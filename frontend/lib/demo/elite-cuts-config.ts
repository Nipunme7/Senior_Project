import type { WebsiteConfig } from "@/lib/types/website-config";

export const eliteCutsConfig: WebsiteConfig = {
  siteName: "Elite Cuts",
  theme: {
    style: "luxury",
    primaryColor: "#111111",
    accentColor: "#C9A45C",
  },
  sections: [
    {
      id: "hero_01",
      type: "hero",
      variant: "fullscreen-image",
      props: {
        headline: "Precision Grooming. Elevated.",
        subheadline: "Premium barbering for a refined look.",
        ctaLabel: "View Services",
        ctaHref: "#services_01",
      },
      mediaIds: ["media_01"],
    },
    {
      id: "about_01",
      type: "about",
      variant: "image-right",
      props: {
        heading: "A quieter kind of shop",
        body: "Elite Cuts is a reservation-only barbering studio. We keep the chairs few, the tools sharp, and the room unhurried so every cut has room to be exact.",
      },
      mediaIds: ["media_06"],
    },
    {
      id: "services_01",
      type: "services",
      variant: "cards",
      props: {
        heading: "Services",
        items: [
          {
            name: "Signature Cut",
            description:
              "A precision scissor cut shaped to your features and finished with hot-towel styling.",
            price: "$65",
          },
          {
            name: "Hot Towel Shave",
            description:
              "Classic straight-razor shave with warm towels, oils, and a clean, close finish.",
            price: "$45",
          },
          {
            name: "Beard Sculpt",
            description:
              "Detailed beard shaping, line-up, and conditioning for a sharp profile.",
            price: "$35",
          },
        ],
      },
    },
    {
      id: "pricing_01",
      type: "pricing",
      variant: "cards",
      props: {
        heading: "Memberships",
        items: [
          {
            name: "The Cut",
            price: "$65",
            description: "Single visit",
            features: ["Signature haircut", "Hot towel finish", "Style consult"],
          },
          {
            name: "The Chair",
            price: "$180",
            description: "Three visits",
            features: ["Three signature cuts", "Priority booking", "Beard tidy included"],
          },
          {
            name: "The Studio",
            price: "$320",
            description: "Seasonal",
            features: ["Unlimited cuts for 3 months", "Shave add-ons", "After-hours slot"],
          },
        ],
      },
    },
    {
      id: "gallery_01",
      type: "gallery",
      variant: "masonry",
      props: {
        heading: "The Shop",
      },
      mediaIds: ["media_02", "media_03", "media_04", "media_05"],
    },
    {
      id: "testimonials_01",
      type: "testimonials",
      variant: "featured-quote",
      props: {
        heading: "Clients",
        items: [
          {
            quote: "The most considered haircut I have had in years.",
            name: "James Whitaker",
            role: "Architect",
          },
          {
            quote: "Quiet room. Sharp lines. I book a month ahead on purpose.",
            name: "Owen Hale",
          },
        ],
      },
    },
    {
      id: "cta_01",
      type: "cta",
      variant: "banner",
      props: {
        heading: "Reserve a chair",
        body: "We keep a small book. Walk-ins are rare.",
        ctaLabel: "Get in touch",
        ctaHref: "#contact_01",
      },
    },
    {
      id: "contact_01",
      type: "contact",
      variant: "split",
      props: {
        heading: "Visit the studio",
        address: "18 Mercer Street\nSuite 2\nNew York, NY 10013",
        phone: "212-555-0148",
        email: "book@elitecuts.example",
        hours: "Tue–Sat, 9am–6pm\nBy appointment",
      },
    },
    {
      id: "footer_01",
      type: "footer",
      variant: "basic",
      props: {
        tagline: "Elite Cuts",
        copyright: "© Elite Cuts. Demo site for the AI website platform.",
      },
    },
  ],
};

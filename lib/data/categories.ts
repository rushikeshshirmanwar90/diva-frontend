import type { Category, Collection } from "@/lib/types";
import { MODEL, STILL } from "@/lib/images";

export const categories: Category[] = [
  {
    slug: "rings",
    name: "Rings",
    blurb: "Solitaires, bands and cocktail statements",
    image: STILL.solitaireRing,
    displayOrder: 1,
  },
  {
    slug: "earrings",
    name: "Earrings",
    blurb: "Studs, hoops and chandeliers",
    image: STILL.hoopsOnDish,
    displayOrder: 2,
  },
  {
    slug: "necklaces",
    name: "Necklaces",
    blurb: "Temple gold to modern chain",
    image: STILL.chunkyChain,
    displayOrder: 3,
  },
  {
    slug: "pendants",
    name: "Pendants",
    blurb: "Everyday charms with meaning",
    image: STILL.tealPendant,
    displayOrder: 4,
  },
  {
    slug: "bracelets",
    name: "Bracelets",
    blurb: "Tennis lines and slim bangles",
    image: STILL.tennisBracelet,
    displayOrder: 5,
  },
  {
    slug: "chains",
    name: "Chains",
    blurb: "Rope, box and cable links",
    image: STILL.hangingPendants,
    displayOrder: 6,
  },
  {
    slug: "mangalsutra",
    name: "Mangalsutra",
    blurb: "Tradition, lightened for daily wear",
    image: STILL.diamondPendant,
    displayOrder: 7,
  },
  {
    slug: "bridal-sets",
    name: "Bridal Sets",
    blurb: "Complete looks for the big day",
    image: STILL.bridalNecklace,
    displayOrder: 8,
  },
  {
    slug: "mens",
    name: "For Him",
    blurb: "Signets, kadas and cufflinks",
    image: STILL.goldRingsOnStone,
    displayOrder: 9,
  },
];

export const collections: Collection[] = [
  {
    slug: "wedding-edit",
    name: "The Wedding Edit",
    tagline: "Heirlooms for the seven vows",
    description:
      "Polki, uncut diamond and 22K temple gold, chosen for the ceremonies that get photographed and retold for forty years.",
    image: MODEL.chokerPortrait,
  },
  {
    slug: "festive-radiance",
    name: "Festive Radiance",
    tagline: "Diwali to Durga Puja",
    description:
      "Warm yellow gold, rubies and enamel work — pieces that read beautifully under diya light and camera flash alike.",
    image: MODEL.layeredOlive,
  },
  {
    slug: "daily-wear",
    name: "Daily Wear",
    tagline: "Light enough to forget you're wearing it",
    description:
      "Under 6 grams, secure clasps, no snagging. Designed for laptops, school runs and airport security.",
    image: MODEL.daintyWhite,
  },
  {
    slug: "gifting",
    name: "The Gifting Suite",
    tagline: "Under ₹50,000",
    description:
      "Considered pieces at giftable prices, each arriving in a signed Diva box with a handwritten note if you'd like one.",
    image: MODEL.layeredPendants,
  },
  {
    slug: "limited-edition",
    name: "Limited Edition",
    tagline: "Numbered, then never again",
    description:
      "Small runs from our Jaipur atelier. Once a design sells through, the mould is retired.",
    image: MODEL.ringAndPendant,
  },
];

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}

export function getCollection(slug: string) {
  return collections.find((c) => c.slug === slug);
}

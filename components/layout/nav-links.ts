import type { Category } from "@/lib/types";
import { MODEL } from "@/lib/images";
import { occasionCollections } from "@/lib/data/occasions";

export type NavItem = {
  label: string;
  href: string;
  panel?: {
    columns: Array<{ heading: string; links: Array<{ label: string; href: string }> }>;
    feature?: { title: string; blurb: string; href: string; image: string };
  };
};

/**
 * Built from the taxonomy rather than declared once at module scope.
 *
 * Categories come from the backend; the Collections tab lists the backend's
 * occasions (`lib/data/occasions.ts`) — the same chips an admin ticks on the
 * add-product page — so it needs nothing fetched.
 */
export function buildNavItems(
  categories: Category[],
): NavItem[] {
  // Split in two so the panel reads as a pair of short lists rather than one
  // long column: 4 + 3 for the seven occasions.
  const half = Math.ceil(occasionCollections.length / 2);
  const occasionLinks = occasionCollections.map((c) => ({
    label: c.name,
    href: `/collections/${c.slug}`,
  }));
  const [featuredOccasion] = occasionCollections;

  return [
    {
      label: "Jewellery",
      href: "/shop",
      panel: {
        columns: [
          {
            heading: "By category",
            links: categories
              .slice(0, 5)
              .map((c) => ({ label: c.name, href: `/category/${c.slug}` })),
          },
          {
            heading: "More",
            links: [
              ...categories.slice(5).map((c) => ({
                label: c.name,
                href: `/category/${c.slug}`,
              })),
              { label: "Shop all", href: "/shop" },
            ],
          },
        ],
        feature: {
          title: "New this season",
          blurb: "Nine pieces added to the daily-wear edit",
          href: "/shop?sort=newest",
          image: MODEL.daintyWhite,
        },
      },
    },
    {
      label: "Collections",
      href: "/collections",
      panel: {
        columns: [
          { heading: "By occasion", links: occasionLinks.slice(0, half) },
          {
            heading: "More occasions",
            links: [
              ...occasionLinks.slice(half),
              { label: "All collections", href: "/collections" },
            ],
          },
        ],
        feature: featuredOccasion && {
          title: featuredOccasion.name,
          blurb: featuredOccasion.description,
          href: `/collections/${featuredOccasion.slug}`,
          image: featuredOccasion.image,
        },
      },
    },
    { label: "Our Story", href: "/about" },
  ];
}

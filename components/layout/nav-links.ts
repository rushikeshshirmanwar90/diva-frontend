import type { Category } from "@/lib/types";
import { MODEL } from "@/lib/images";

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
 */
export function buildNavItems(
  categories: Category[],
): NavItem[] {
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
    { label: "Our Story", href: "/about" },
  ];
}

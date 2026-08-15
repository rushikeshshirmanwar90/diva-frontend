import type { Category, Collection } from "@/lib/types";
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
 *
 * The categories and collections now come from the backend, so this cannot be
 * a constant evaluated at import time — the header calls it with whatever the
 * store actually has.
 */
export function buildNavItems(
  categories: Category[],
  collections: Collection[],
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
        // The "By metal" column is gone: those links filtered on 22K/18K gold
        // values the catalogue no longer has, so every one of them led to an
        // empty grid. Finish is now a per-product colour, not a fixed list.
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
        {
          heading: "Curated edits",
          links: collections.map((c) => ({
            label: c.name,
            href: `/collections/${c.slug}`,
          })),
        },
        {
          heading: "Shop by occasion",
          links: [
            { label: "Bridal", href: "/shop?occasion=Bridal" },
            { label: "Festive", href: "/shop?occasion=Festive" },
            { label: "Daily wear", href: "/shop?occasion=Daily+Wear" },
            { label: "Gifting", href: "/shop?occasion=Gifting" },
          ],
        },
        {
          heading: "Shop by budget",
          links: [
            { label: "Under ₹25,000", href: "/shop?price=0-25000" },
            { label: "₹25,000 – ₹50,000", href: "/shop?price=25000-50000" },
            { label: "₹50,000 – ₹1,00,000", href: "/shop?price=50000-100000" },
            { label: "Above ₹1,00,000", href: "/shop?price=100000-9999999" },
          ],
        },
      ],
      feature: {
        title: "New this season",
        blurb: "The latest additions to the catalogue",
        href: "/shop?sort=newest",
        image: MODEL.chokerPortrait,
      },
    },
  },
  // "Bridal" and "For Him" pointed at a hardcoded collection and category that
  // only ever existed in the demo data. Anything that is really stocked now
  // reaches the nav through the two panels above.
  { label: "Our Story", href: "/about" },
  ];
}

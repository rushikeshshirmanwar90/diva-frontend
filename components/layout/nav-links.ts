import type { Category } from "@/lib/types";
import { occasionCollections } from "@/lib/data/occasions";
import { genderCollections } from "@/lib/data/genders";

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
 * All Products, Women and Men are plain links (`lib/data/genders.ts` for the
 * last two). The other two tabs each open a panel: Categories lists the
 * backend's categories
 * in the admin's display order; Collections lists the backend's occasions
 * (`lib/data/occasions.ts`), the same chips an admin ticks on the
 * add-product page, so it needs nothing fetched.
 */
export function buildNavItems(
  categories: Category[],
): NavItem[] {
  // Split in two so each panel reads as a pair of short lists rather than
  // one long column.
  const categoryHalf = Math.ceil(categories.length / 2);
  const categoryLinks = categories.map((c) => ({
    label: c.name,
    href: `/category/${c.slug}`,
  }));
  const [featuredCategory] = categories;

  const half = Math.ceil(occasionCollections.length / 2);
  const occasionLinks = occasionCollections.map((c) => ({
    label: c.name,
    href: `/collections/${c.slug}`,
  }));
  const [featuredOccasion] = occasionCollections;

  return [
    { label: "All Products", href: "/shop" },
    ...genderCollections.map((c) => ({ label: c.name, href: `/for/${c.slug}` })),
    {
      label: "Categories",
      href: "/categories",
      panel: {
        columns: [
          { heading: "By category", links: categoryLinks.slice(0, categoryHalf) },
          {
            heading: "More",
            links: [
              ...categoryLinks.slice(categoryHalf),
              { label: "All categories", href: "/categories" },
            ],
          },
        ],
        feature: featuredCategory?.image
          ? {
              title: featuredCategory.name,
              blurb: featuredCategory.blurb,
              href: `/category/${featuredCategory.slug}`,
              image: featuredCategory.image,
            }
          : undefined,
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
  ];
}

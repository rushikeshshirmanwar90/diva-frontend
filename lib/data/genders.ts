import type { Gender, Product } from "@/lib/types";
import { MODEL, STILL } from "@/lib/images";

/**
 * The Women's and Men's collections — the header's two gender tabs.
 *
 * Backed by the "Gender" an admin picks on the add-product page, the way the
 * occasion edits are backed by the occasion chips. Unisex pieces appear in
 * both, so a plain chain does not vanish from the men's edit because it was
 * never marked "Men".
 *
 * Not `server-only`: the header is a client component and reads the same
 * list, so the tabs and the pages can never disagree on a slug or a name.
 */
export type GenderCollection = {
  slug: string;
  /** The tab label. */
  name: string;
  /** The page title. */
  title: string;
  tagline: string;
  description: string;
  image: string;
  /** Which admin gender values land in this edit. */
  genders: Gender[];
};

export const genderCollections: GenderCollection[] = [
  {
    slug: "women",
    name: "Women",
    title: "Women's Collection",
    tagline: "For her",
    description:
      "Every piece made for her — rings, earrings, necklaces and bridal sets, from a daily-wear stud to a full ceremonial set.",
    image: MODEL.chokerPortrait,
    genders: ["Women", "Unisex"],
  },
  {
    slug: "men",
    name: "Men",
    title: "Men's Collection",
    tagline: "For him",
    description:
      "Chains, bands, bracelets and studs cut heavier and plainer — pieces that read as considered rather than decorative.",
    image: STILL.chunkyChain,
    genders: ["Men", "Unisex"],
  },
];

export function getGenderCollection(slug: string): GenderCollection | undefined {
  return genderCollections.find((collection) => collection.slug === slug);
}

/** Products in a gender edit. Pure over a list, like the occasion helper. */
export function byGender(list: Product[], collection: GenderCollection): Product[] {
  return list.filter(
    (product) =>
      product.attributes.gender !== undefined &&
      collection.genders.includes(product.attributes.gender),
  );
}

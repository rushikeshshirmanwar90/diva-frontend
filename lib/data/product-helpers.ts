import type { Product } from "@/lib/types";

/**
 * Catalogue lookups, as pure functions over a list.
 *
 * Split out from `products.ts` because the same logic is needed on both sides
 * of the server boundary: pages await the catalogue and filter it here, while
 * the cart and search overlay run against the copy handed to the browser. The
 * alternative — one implementation per side — is how a search that works on the
 * server quietly stops matching the same things in the overlay.
 */

export function findBySlug(list: Product[], slug: string): Product | undefined {
  return list.find((product) => product.slug === slug);
}

export function byCategory(list: Product[], slug: string): Product[] {
  return list.filter((product) => product.categorySlug === slug);
}

export function byCollection(list: Product[], slug: string): Product[] {
  return list.filter((product) => product.collectionSlugs.includes(slug));
}

export function byBadge(list: Product[], badge: Product["badges"][number]): Product[] {
  return list.filter((product) => product.badges.includes(badge));
}

/** Same category first, then anything sharing a collection. */
export function related(list: Product[], product: Product, limit = 4): Product[] {
  const sameCategory = list.filter(
    (candidate) =>
      candidate.categorySlug === product.categorySlug && candidate.slug !== product.slug,
  );

  const sharedCollection = list.filter(
    (candidate) =>
      candidate.slug !== product.slug &&
      candidate.categorySlug !== product.categorySlug &&
      candidate.collectionSlugs.some((slug) => product.collectionSlugs.includes(slug)),
  );

  return [...sameCategory, ...sharedCollection].slice(0, limit);
}

export function search(list: Product[], query: string): Product[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];

  return list.filter((product) =>
    [
      product.title,
      product.subtitle,
      product.categorySlug,
      // Optional now — a plated piece has a finish but no stone or purity.
      product.attributes.metal,
      product.attributes.stone,
      ...product.attributes.occasions,
      ...product.variants.map((variant) => variant.label),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(needle),
  );
}

/**
 * The price shown on a card.
 *
 * Every variant of a design costs the same today, so this is just the product's
 * price — but it stays a function because the cards call it, and a per-variant
 * price would otherwise have to be threaded back through all of them.
 */
export function fromPrice(product: Product): number {
  const deltas = product.variants.map((variant) => variant.priceDelta);
  return product.price + (deltas.length ? Math.min(...deltas) : 0);
}

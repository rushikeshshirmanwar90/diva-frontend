import 'server-only';
import { getCatalogue, getProduct as fetchProduct } from '@/lib/data/catalogue';
import { byBadge, byCategory, byCollection, search } from '@/lib/data/product-helpers';
import { byOccasion, getOccasionCollection } from '@/lib/data/occasions';
import type { Product } from '@/lib/types';

/**
 * The catalogue, for server components.
 *
 * Same function names the pages already called, now asynchronous because the
 * data comes from the backend instead of a literal in this file. What the
 * storefront lists is exactly what has been added through the admin console.
 *
 * Client components cannot await, so they read the same catalogue out of
 * `CatalogueProvider` instead — see `lib/data/catalogue-context.tsx`.
 */

export async function products(): Promise<Product[]> {
  return getCatalogue();
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  return fetchProduct(slug);
}

export async function productsByCategory(slug: string): Promise<Product[]> {
  return byCategory(await getCatalogue(), slug);
}

export async function productsByCollection(slug: string): Promise<Product[]> {
  return byCollection(await getCatalogue(), slug);
}

/**
 * Products tagged with the occasion behind a `/collections/[slug]` page.
 *
 * An unknown slug yields an empty list rather than throwing; the page decides
 * whether that is a 404.
 */
export async function productsByOccasion(slug: string): Promise<Product[]> {
  const collection = getOccasionCollection(slug);
  return collection ? byOccasion(await getCatalogue(), collection) : [];
}

export async function productsByBadge(badge: Product['badges'][number]): Promise<Product[]> {
  return byBadge(await getCatalogue(), badge);
}

export async function searchProducts(query: string): Promise<Product[]> {
  return search(await getCatalogue(), query);
}

export { fromPrice } from '@/lib/data/product-helpers';

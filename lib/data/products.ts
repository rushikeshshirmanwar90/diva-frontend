import 'server-only';
import { getCatalogue, getProduct as fetchProduct } from '@/lib/data/catalogue';
import { byBadge, byCategory, byCollection, related, search } from '@/lib/data/product-helpers';
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

export async function productsByBadge(badge: Product['badges'][number]): Promise<Product[]> {
  return byBadge(await getCatalogue(), badge);
}

export async function relatedProducts(product: Product, limit = 4): Promise<Product[]> {
  return related(await getCatalogue(), product, limit);
}

export async function searchProducts(query: string): Promise<Product[]> {
  return search(await getCatalogue(), query);
}

export { fromPrice } from '@/lib/data/product-helpers';

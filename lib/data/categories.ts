import "server-only";
import { getCategories, getCollections } from "@/lib/data/catalogue";
import type { Category, Collection } from "@/lib/types";

/**
 * The taxonomy, for server components.
 *
 * Categories and collections come from the backend, like the products in them
 * — so the navigation lists exactly what has been created in the admin console.
 * Previously these were hand-written arrays, which meant the header offered
 * "Rings" and "Earrings" whether or not either existed.
 *
 * Client components read the same lists out of `CatalogueProvider` instead;
 * see `lib/data/catalogue-context.tsx`.
 */

export async function categories(): Promise<Category[]> {
  return getCategories();
}

export async function collections(): Promise<Collection[]> {
  return getCollections();
}

export async function getCategory(slug: string): Promise<Category | undefined> {
  return (await getCategories()).find((category) => category.slug === slug);
}

export async function getCollection(slug: string): Promise<Collection | undefined> {
  return (await getCollections()).find((collection) => collection.slug === slug);
}

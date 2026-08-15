"use client";

import { createContext, useContext, useMemo } from "react";
import type { Category, Collection, Product } from "@/lib/types";
import { findBySlug, search } from "@/lib/data/product-helpers";

/**
 * The catalogue, for client components.
 *
 * The cart, the wishlist, the recently-viewed rail and the search overlay all
 * need to turn a stored slug back into a product, and none of them can await a
 * fetch mid-render. So the root layout — a server component — reads the
 * catalogue once and hands it down through here.
 *
 * Passing it down rather than re-fetching in the browser means the list is
 * already in the HTML: no second round trip, no empty cart flashing on every
 * page load while a request resolves, and one source of truth shared with the
 * server-rendered pages.
 *
 * A store of this size fits comfortably in the payload. If the catalogue ever
 * grows past a few hundred pieces, this becomes a lookup endpoint keyed by the
 * slugs actually held in the cart — the shape of the hooks below would not
 * change.
 */

type CatalogueValue = {
  products: Product[];
  categories: Category[];
  collections: Collection[];
};

const EMPTY: CatalogueValue = { products: [], categories: [], collections: [] };

const CatalogueContext = createContext<CatalogueValue>(EMPTY);

export function CatalogueProvider({
  products,
  categories,
  collections,
  children,
}: CatalogueValue & { children: React.ReactNode }) {
  // Memoised on the arrays themselves: the layout re-creates the object on
  // every render, and without this every consumer re-renders with it.
  const value = useMemo(
    () => ({ products, categories, collections }),
    [products, categories, collections],
  );

  return <CatalogueContext.Provider value={value}>{children}</CatalogueContext.Provider>;
}

/** Every product the storefront knows about. */
export function useCatalogue(): Product[] {
  return useContext(CatalogueContext).products;
}

/** The categories that exist in the backend — the navigation is built on these. */
export function useCategories(): Category[] {
  return useContext(CatalogueContext).categories;
}

export function useCollections(): Collection[] {
  return useContext(CatalogueContext).collections;
}

/** Resolves a stored slug — a cart line, a wishlist entry — to a product. */
export function useProductLookup(): (slug: string) => Product | undefined {
  const catalogue = useCatalogue();

  return useMemo(() => {
    // A Map rather than a scan per lookup: the cart resolves every line on each
    // render, and a wishlist page resolves the whole list at once.
    const bySlug = new Map(catalogue.map((product) => [product.slug, product]));
    return (slug: string) => bySlug.get(slug);
  }, [catalogue]);
}

/**
 * Same as `useProductLookup`, keyed by id instead of slug.
 *
 * The account-backed wishlist stores `productId` — a Mongo id, since that's
 * what the backend's `Wishlist` model actually indexes — while everything
 * else in the storefront (cart, recently-viewed) keys off slug. This is the
 * one place that difference gets bridged, by looking a product back up
 * locally rather than asking the backend to resolve it.
 */
export function useProductLookupById(): (id: string) => Product | undefined {
  const catalogue = useCatalogue();

  return useMemo(() => {
    const byId = new Map(catalogue.map((product) => [product.id, product]));
    return (id: string) => byId.get(id);
  }, [catalogue]);
}

export function useProductSearch(query: string): Product[] {
  const catalogue = useCatalogue();
  return useMemo(() => search(catalogue, query), [catalogue, query]);
}

/** The non-hook form, for code already holding the list. */
export { findBySlug };

import "server-only";
import { cache } from "react";
import { getCatalogue } from "@/lib/data/catalogue";
import { backendUrl } from "@/lib/domain";
import { recommend, type Signals } from "@/lib/recommendations/score";
import type { Product } from "@/lib/types";

/**
 * "You may also like", for the product page.
 *
 * Two inputs, one pure function. The catalogue the page already holds, plus
 * the backend's behavioural counts for this product, go through
 * `lib/recommendations/score.ts` — which is where the algorithm lives and
 * where it is tested. This file only fetches.
 *
 * The signals call is allowed to fail. Without it the ranker falls back to
 * content similarity alone, which is a worse rail, not a missing one — and a
 * product page must never 500 because analytics were slow.
 */

type Envelope<T> = { success: true; data: T } | { success: false };

const getSignals = cache(async (slug: string): Promise<Signals | null> => {
  try {
    const response = await fetch(backendUrl(`/products/${encodeURIComponent(slug)}/signals`), {
      // The backend caches these for five minutes; the same here keeps a busy
      // product page from re-asking on every request.
      next: { revalidate: 300 },
      headers: { accept: "application/json" },
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as Envelope<Signals>;
    return payload.success ? payload.data : null;
  } catch {
    return null;
  }
});

export async function recommendedProducts(product: Product, limit = 8): Promise<Product[]> {
  const [catalogue, signals] = await Promise.all([getCatalogue(), getSignals(product.slug)]);
  return recommend(product, catalogue, signals, { limit });
}

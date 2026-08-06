"use client";

import { useStore } from "@/lib/store/store";
import { getProduct } from "@/lib/data/products";
import { ProductRail } from "@/components/product/product-grid";
import { SectionHeading } from "@/components/ui/section-heading";

export function RecentlyViewed({ excludeSlug }: { excludeSlug?: string }) {
  const { recentlyViewed, hydrated } = useStore();

  const items = recentlyViewed
    .filter((slug) => slug !== excludeSlug)
    .map(getProduct)
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  if (!hydrated || items.length === 0) return null;

  return (
    <section className="mt-24">
      <SectionHeading
        eyebrow="Pick up where you left off"
        title="Recently viewed"
        align="between"
      />
      <div className="mt-10">
        <ProductRail products={items} />
      </div>
    </section>
  );
}

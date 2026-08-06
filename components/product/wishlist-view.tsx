"use client";

import { Heart } from "lucide-react";
import { useStore } from "@/lib/store/store";
import { getProduct } from "@/lib/data/products";
import { ProductGrid } from "@/components/product/product-grid";
import { EmptyState } from "@/components/ui/empty-state";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export function WishlistView() {
  const { wishlist, hydrated } = useStore();

  const items = wishlist
    .map(getProduct)
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  if (!hydrated) return <div className="min-h-[50vh]" />;

  return (
    <div className="mx-auto max-w-[90rem] px-5 pt-8 pb-20 lg:px-10">
      <Breadcrumbs trail={[{ label: "Wishlist" }]} />

      {items.length === 0 ? (
        <EmptyState
          icon={<Heart width={24} height={24} strokeWidth={1.3} />}
          title="Your wishlist is empty"
          body="Tap the heart on any piece to keep it here. We'll tell you if the price moves or stock runs low."
        />
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-baseline justify-between gap-4">
            <h1 className="font-display text-4xl font-light text-ink lg:text-[3rem]">
              Wishlist
            </h1>
            <p className="text-xs text-muted">
              {items.length} saved {items.length === 1 ? "piece" : "pieces"} · we
              notify you on price changes
            </p>
          </div>
          <ProductGrid products={items} className="mt-12" />
        </>
      )}
    </div>
  );
}

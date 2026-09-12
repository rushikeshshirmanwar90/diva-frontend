import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product/product-card";
import { cn } from "@/lib/cn";

export function ProductGrid({
  products,
  columns = 4,
  className,
}: {
  products: Product[];
  columns?: 3 | 4;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-5 gap-y-12 sm:gap-x-8",
        columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3",
        className,
      )}
    >
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} priority={i < 4} />
      ))}
    </div>
  );
}

/**
 * Two-column grid on phones and tablets, horizontally scrolling rail from
 * `lg`.
 *
 * Below `lg` the rail was the worst offender on the site: six cards at 62vw
 * each meant ~1221px of content in a 390px viewport, so roughly two-thirds of
 * every "New this season" and "You may also like" list existed only behind a
 * sideways swipe that nothing on screen advertised. A grid puts the same cards
 * in the vertical scroll the page already has. From `lg` there is width for a
 * rail to make sense, so that behaviour is kept.
 */
export function ProductRail({ products }: { products: Product[] }) {
  return (
    <div className="no-scrollbar grid grid-cols-2 gap-x-5 gap-y-12 sm:gap-x-8 lg:flex lg:snap-x lg:snap-mandatory lg:gap-6 lg:overflow-x-auto lg:pb-2">
      {products.map((product) => (
        <div key={product.id} className="lg:w-[22rem] lg:shrink-0 lg:snap-start">
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}

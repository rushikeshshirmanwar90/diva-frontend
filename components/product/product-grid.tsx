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

/** Horizontally scrolling rail — used for related and recently viewed. */
export function ProductRail({ products }: { products: Product[] }) {
  return (
    <div className="no-scrollbar -mx-6 flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-2 lg:mx-0 lg:px-0">
      {products.map((product) => (
        <div
          key={product.id}
          className="w-[62vw] shrink-0 snap-start sm:w-[38vw] lg:w-[22rem]"
        >
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}

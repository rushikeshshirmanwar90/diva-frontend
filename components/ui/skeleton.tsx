import { cn } from "@/lib/cn";

/**
 * Placeholder block for content that has not arrived yet.
 *
 * The shimmer lives on an inner absolutely-positioned layer rather than on the
 * block itself, because the block needs a solid background *and* a moving
 * highlight, and one element cannot animate a gradient's position cheaply —
 * `background-position` is not compositor-friendly, `transform` is.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("relative overflow-hidden bg-beige-dark", className)}
    >
      <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/70 to-transparent" />
    </div>
  );
}

/**
 * Mirrors `ProductCard` — `aspect-4/5` image, then metal, title, subtitle,
 * price and rating.
 *
 * The point of matching it line for line is that the real card lands in the
 * same place the placeholder was. A generic grey box that is the wrong height
 * makes every card jump when the data arrives, which is a worse experience
 * than no skeleton at all.
 */
export function ProductCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-4/5 w-full" />
      <div className="pt-4">
        <Skeleton className="h-2.5 w-16" />
        <Skeleton className="mt-2.5 h-4 w-11/12" />
        <Skeleton className="mt-2 h-3 w-2/3" />
        <Skeleton className="mt-3 h-4 w-24" />
        <Skeleton className="mt-3 h-2.5 w-20" />
      </div>
    </div>
  );
}

/** The same two-up/four-up grid `ProductGrid` renders. */
export function ProductGridSkeleton({
  count = 8,
  columns = 4,
}: {
  count?: number;
  columns?: 3 | 4;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-5 gap-y-12 sm:gap-x-8",
        columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3",
      )}
    >
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Announces to screen readers that something is loading.
 *
 * The blocks above are all `aria-hidden` — a screen reader reading out twenty
 * empty placeholders is noise, not information. This says it once instead.
 */
export function LoadingAnnouncer({ label = "Loading" }: { label?: string }) {
  return (
    <span role="status" aria-live="polite" className="sr-only">
      {label}
    </span>
  );
}

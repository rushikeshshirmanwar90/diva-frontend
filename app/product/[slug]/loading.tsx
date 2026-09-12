import { LoadingAnnouncer, Skeleton } from "@/components/ui/skeleton";

/**
 * Mirrors the product page's own shell: breadcrumbs, then a two-up grid of
 * gallery and buy box that collapses to one column below `lg`.
 *
 * The gallery half reproduces `flex-col-reverse` — thumbnails render *below*
 * the main image on mobile and beside it on desktop — because getting that
 * backwards would slide the whole buy box up by a thumbnail's height the
 * instant the real page swapped in.
 */
export default function Loading() {
  return (
    <div className="mx-auto max-w-[90rem] px-5 pt-8 lg:px-10">
      <LoadingAnnouncer label="Loading product" />

      <Skeleton className="h-3 w-56 max-w-full" />

      <div className="mt-8 grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="flex min-w-0 flex-col-reverse gap-4 lg:flex-row">
          <div className="flex flex-wrap gap-3 lg:w-24 lg:flex-col lg:flex-nowrap">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="size-20 lg:h-28 lg:w-24" />
            ))}
          </div>
          <Skeleton className="aspect-4/5 min-w-0 flex-1" />
        </div>

        <div className="lg:pt-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-4 h-8 w-full lg:h-11" />
          <Skeleton className="mt-2 h-8 w-2/3 lg:h-11" />
          <Skeleton className="mt-3 h-3 w-1/2" />

          <div className="mt-4 flex items-center gap-4">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-24" />
          </div>

          {/* The bordered price band, kept as real borders so the block has the
              same height whether or not the numbers have arrived. */}
          <div className="mt-7 border-y border-line py-6">
            <Skeleton className="h-8 w-44" />
            <Skeleton className="mt-3 h-3 w-64 max-w-full" />
          </div>

          <div className="mt-7">
            <Skeleton className="h-3 w-24" />
            <div className="mt-3 flex flex-wrap gap-2">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-11 w-20" />
              ))}
            </div>
            <Skeleton className="mt-3 h-3 w-40" />
          </div>

          <div className="mt-7 flex flex-wrap items-stretch gap-3">
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 w-16" />
          </div>

          <div className="mt-8 grid gap-4 border-t border-line pt-8 sm:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="size-5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <Skeleton className="h-2.5 w-full" />
                  <Skeleton className="mt-1.5 h-2.5 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

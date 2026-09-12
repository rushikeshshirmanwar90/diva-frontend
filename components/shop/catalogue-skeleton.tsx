import {
  LoadingAnnouncer,
  ProductGridSkeleton,
  Skeleton,
} from "@/components/ui/skeleton";

/**
 * Loading shape for every catalogue-style route — shop, category, search and a
 * single collection all render `PageHeader` + `ShopView`, so they share one
 * placeholder rather than keeping four copies of the same markup in four
 * `loading.tsx` files.
 *
 * The `lg` sidebar is reproduced at its real `w-64` because the grid beside it
 * is sized by what is left over; omitting it would lay the placeholder cards
 * out full-width and then shuffle them sideways the moment the page arrived.
 */
export function CatalogueSkeleton({ withFilters = true }: { withFilters?: boolean }) {
  return (
    <>
      <LoadingAnnouncer label="Loading jewellery" />

      <header className="mx-auto mb-12 max-w-[90rem] px-5 pt-8 lg:px-10">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="mt-6 h-2.5 w-24" />
        <Skeleton className="mt-3 h-9 w-72 max-w-full lg:h-12" />
        <Skeleton className="mt-4 h-3 w-full max-w-2xl" />
        <Skeleton className="mt-2 h-3 w-3/4 max-w-xl" />
      </header>

      <div className="mx-auto max-w-[90rem] px-5 lg:px-10">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-14">
          {withFilters && (
            <aside className="hidden w-64 shrink-0 lg:block">
              <Skeleton className="h-6 w-24" />
              <div className="mt-8 space-y-7">
                {Array.from({ length: 4 }, (_, group) => (
                  <div key={group}>
                    <Skeleton className="h-2.5 w-20" />
                    <div className="mt-4 space-y-3">
                      {Array.from({ length: 4 }, (_, row) => (
                        <Skeleton key={row} className="h-3 w-full" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-9 w-32" />
            </div>
            <div className="mt-10">
              <ProductGridSkeleton count={8} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

import { LoadingAnnouncer, Skeleton } from "@/components/ui/skeleton";

/**
 * The fallback every async route falls back to when it has no closer
 * `loading.tsx` — collections, blog posts, policies, FAQ, contact, the order
 * confirmation and the home page.
 *
 * Deliberately generic: a page shell of title, lede and a card grid. Routes
 * whose shape is worth matching exactly (the catalogue routes and the product
 * page) have their own file, and Next uses the nearest one, so this never
 * shows for those.
 */
export default function Loading() {
  return (
    <div className="mx-auto max-w-[90rem] px-5 pt-8 pb-20 lg:px-10">
      <LoadingAnnouncer />

      <Skeleton className="h-3 w-40" />
      <Skeleton className="mt-6 h-9 w-80 max-w-full lg:h-12" />
      <Skeleton className="mt-4 h-3 w-full max-w-2xl" />
      <Skeleton className="mt-2 h-3 w-3/4 max-w-xl" />

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i}>
            <Skeleton className="aspect-4/3 w-full" />
            <Skeleton className="mt-4 h-4 w-2/3" />
            <Skeleton className="mt-2 h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

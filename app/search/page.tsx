import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shop/page-header";
import { ShopView } from "@/components/shop/shop-view";
import { searchProducts } from "@/lib/data/products";
import { categories } from "@/lib/data/categories";
import { filtersFromParams } from "@/lib/filters";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false },
};

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const params = await searchParams;
  const raw = params.q;
  const query = (Array.isArray(raw) ? raw[0] : raw) ?? "";
  const [results, categoryList] = await Promise.all([searchProducts(query), categories()]);
  const initialFilters = filtersFromParams(params);

  return (
    <>
      <PageHeader
        eyebrow={query ? `${results.length} results` : "Search"}
        title={query ? `“${query}”` : "Search Diva"}
        description={
          query
            ? undefined
            : "Use the search icon in the header to look up a piece by name, metal, stone or occasion."
        }
        trail={[{ label: "Search" }]}
      />

      {query && results.length === 0 ? (
        <div className="mx-auto max-w-[90rem] px-5 pb-24 lg:px-10">
          <div className="border border-line px-8 py-16 text-center">
            <p className="font-display text-2xl font-light text-ink">
              No pieces match “{query}”
            </p>
            <p className="mt-3 text-sm text-muted">
              Try a broader term — a metal, a stone, or one of the categories below.
            </p>
            <ul className="mt-8 flex flex-wrap justify-center gap-2">
              {categoryList.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/category/${c.slug}`}
                    className="inline-block bg-beige px-4 py-2 text-xs text-charcoal transition-colors hover:bg-charcoal hover:text-white"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <ShopView
          pool={results}
          initialFilters={initialFilters}
          keepParams={{ q: query }}
        />
      )}
    </>
  );
}

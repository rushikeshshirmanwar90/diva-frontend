"use client";

import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import type { Product } from "@/lib/types";
import {
  activeFilterCount,
  applyFilters,
  emptyFilters,
  filtersToQuery,
  priceBands,
  sortOptions,
  type FacetKey,
  type FilterState,
  type SortKey,
} from "@/lib/filters";
import { FilterPanel } from "@/components/shop/filter-panel";
import { ProductGrid } from "@/components/product/product-grid";
import { Button } from "@/components/ui/button";
import { categories } from "@/lib/data/categories";
import { cn } from "@/lib/cn";

const PAGE_SIZE = 8;

function labelFor(key: FacetKey, value: string) {
  if (key === "price") return priceBands.find((b) => b.key === value)?.label ?? value;
  if (key === "category")
    return categories.find((c) => c.slug === value)?.name ?? value;
  if (key === "availability")
    return value === "in-stock" ? "Ready to ship" : "Made to order";
  if (key === "rating") return `${value} & above`;
  return value;
}

export function ShopView({
  pool,
  initialFilters,
  includeCategory = true,
  keepParams,
}: {
  pool: Product[];
  initialFilters: FilterState;
  includeCategory?: boolean;
  /** Query params that must survive filter changes, e.g. `{ q: "gold hoops" }`. */
  keepParams?: Record<string, string>;
}) {
  const [state, setState] = useState<FilterState>(initialFilters);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Keep the URL shareable without triggering a Next navigation on every click.
  useEffect(() => {
    const query = filtersToQuery(state, keepParams);
    window.history.replaceState(null, "", `${window.location.pathname}${query}`);
  }, [state, keepParams]);

  const results = useMemo(() => applyFilters(pool, state), [pool, state]);
  const activeCount = activeFilterCount(state);

  const toggle = (key: FacetKey, value: string) => {
    setVisible(PAGE_SIZE);
    setState((prev) => {
      const current = prev[key];
      return {
        ...prev,
        [key]: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      };
    });
  };

  const clearAll = () => {
    setVisible(PAGE_SIZE);
    setState({ ...emptyFilters, sort: state.sort });
  };

  const chips = (
    Object.keys(state) as Array<keyof FilterState>
  ).flatMap((key) =>
    key === "sort"
      ? []
      : (state[key] as string[]).map((value) => ({
          key: key as FacetKey,
          value,
        })),
  );

  return (
    <div className="mx-auto max-w-[90rem] px-5 lg:px-10">
      <div className="flex flex-col gap-10 lg:flex-row lg:gap-14">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-40 pb-16">
            <div className="flex items-baseline justify-between">
              <p className="font-display text-xl font-light text-ink">Refine</p>
              {activeCount > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-[10px] tracking-luxe uppercase text-gold hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="mt-5 max-h-[calc(100vh-16rem)] overflow-y-auto pr-1">
              <FilterPanel
                basePool={pool}
                state={state}
                onToggle={toggle}
                includeCategory={includeCategory}
              />
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
            <p className="text-xs text-muted">
              <span className="text-ink">{results.length}</span>{" "}
              {results.length === 1 ? "piece" : "pieces"}
              {activeCount > 0 && ` · ${activeCount} filter${activeCount === 1 ? "" : "s"} applied`}
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="flex items-center gap-2 border border-line px-4 py-2 text-[10px] tracking-luxe uppercase text-charcoal lg:hidden"
              >
                <SlidersHorizontal width={13} height={13} /> Filter
                {activeCount > 0 && (
                  <span className="ml-1 rounded-full bg-gold px-1.5 text-[9px] text-white">
                    {activeCount}
                  </span>
                )}
              </button>

              <label className="flex items-center gap-2 text-[10px] tracking-luxe uppercase text-muted">
                Sort
                <select
                  value={state.sort}
                  onChange={(e) => {
                    setVisible(PAGE_SIZE);
                    setState((p) => ({ ...p, sort: e.target.value as SortKey }));
                  }}
                  className="border border-line bg-white px-3 py-2 text-[11px] tracking-normal text-ink outline-none focus:border-gold"
                >
                  {sortOptions.map((o) => (
                    <option key={o.key} value={o.key}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {chips.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {chips.map((chip) => (
                <li key={`${chip.key}-${chip.value}`}>
                  <button
                    type="button"
                    onClick={() => toggle(chip.key, chip.value)}
                    className="flex items-center gap-2 bg-beige px-3 py-1.5 text-xs text-charcoal transition-colors hover:bg-beige-dark"
                  >
                    {labelFor(chip.key, chip.value)}
                    <X width={11} height={11} />
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={clearAll}
                  className="px-3 py-1.5 text-xs text-gold hover:underline"
                >
                  Clear all
                </button>
              </li>
            </ul>
          )}

          {results.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-display text-2xl font-light text-ink">
                Nothing matches all of those filters
              </p>
              <p className="mt-3 text-sm text-muted">
                Try removing the price band, or widening the metal choice.
              </p>
              <Button variant="outline" className="mt-7" onClick={clearAll}>
                Clear all filters
              </Button>
            </div>
          ) : (
            <>
              <ProductGrid products={results.slice(0, visible)} className="mt-10" />
              {visible < results.length && (
                <div className="mt-16 flex flex-col items-center gap-4">
                  <p className="text-[11px] tracking-luxe uppercase text-muted">
                    Showing {Math.min(visible, results.length)} of {results.length}
                  </p>
                  <div className="h-px w-40 bg-line">
                    <div
                      className="h-full bg-gold transition-all duration-500"
                      style={{ width: `${(visible / results.length) * 100}%` }}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setVisible((v) => v + PAGE_SIZE)}
                  >
                    Load more
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-charcoal/40"
          />
          <div
            className={cn(
              "absolute inset-y-0 left-0 flex w-[88%] max-w-sm animate-fade-in flex-col bg-white",
            )}
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <p className="font-display text-xl font-light text-ink">Refine</p>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close filters"
              >
                <X width={19} height={19} strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-2">
              <FilterPanel
                basePool={pool}
                state={state}
                onToggle={toggle}
                includeCategory={includeCategory}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-line px-5 py-4">
              <Button variant="outline" onClick={clearAll}>
                Clear all
              </Button>
              <Button onClick={() => setDrawerOpen(false)}>
                Show {results.length}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

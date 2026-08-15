"use client";

import { Check } from "lucide-react";
import { useCatalogue, useCategories } from "@/lib/data/catalogue-context";
import type { Category, Product } from "@/lib/types";
import {
  facetCounts,
  priceBands,
  type FacetKey,
  type FilterState,
} from "@/lib/filters";
import { cn } from "@/lib/cn";

type Group = {
  key: FacetKey;
  label: string;
  options: Array<{ value: string; label: string }>;
};

/**
 * Finish and stone options come from the catalogue, not a fixed list.
 *
 * They used to be hardcoded as 22K Gold / Diamond / Uncut Polki and so on.
 * Nothing stocked carries those values any more, so every one of those chips
 * filtered the grid down to nothing — a filter that can only ever return zero
 * results is worse than no filter at all.
 */
function distinct(values: Array<string | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)))].sort();
}
const occasionOptions = [
  "Bridal",
  "Festive",
  "Daily Wear",
  "Office",
  "Gifting",
  "Party",
];

/** `categories` is passed in: this runs inside a client component that reads
 * them from context, and a module-level import would go back to the mock list. */
export function buildGroups(
  includeCategory: boolean,
  categories: Category[],
  pool: Product[],
): Group[] {
  const metalOptions = distinct(pool.map((product) => product.attributes.metal));
  const stoneOptions = distinct(pool.map((product) => product.attributes.stone));

  const groups: Group[] = [
    {
      key: "price",
      label: "Price",
      options: priceBands.map((b) => ({ value: b.key, label: b.label })),
    },
  ];

  if (includeCategory) {
    groups.push({
      key: "category",
      label: "Category",
      options: categories.map((c) => ({ value: c.slug, label: c.name })),
    });
  }

  // Only offered when the catalogue actually has them.
  if (metalOptions.length > 0) {
    groups.push({
      key: "metal",
      label: "Finish",
      options: metalOptions.map((m) => ({ value: m, label: m })),
    });
  }

  if (stoneOptions.length > 0) {
    groups.push({
      key: "stone",
      label: "Stone",
      options: stoneOptions.map((s) => ({
        value: s,
        label: s === "None" ? "No stone" : s,
      })),
    });
  }

  groups.push(
    {
      key: "occasion",
      label: "Occasion",
      options: occasionOptions.map((o) => ({ value: o, label: o })),
    },
    {
      key: "gender",
      label: "Wearer",
      options: [
        { value: "Women", label: "Women" },
        { value: "Men", label: "Men" },
        { value: "Unisex", label: "Unisex" },
      ],
    },
    {
      key: "availability",
      label: "Availability",
      options: [
        { value: "in-stock", label: "Ready to ship" },
        { value: "made-to-order", label: "Made to order" },
      ],
    },
    {
      key: "rating",
      label: "Customer rating",
      options: [
        { value: "4", label: "4.0 & above" },
        { value: "4.5", label: "4.5 & above" },
      ],
    },
  );

  return groups;
}

export function FilterPanel({
  basePool,
  state,
  onToggle,
  includeCategory,
}: {
  basePool: Product[];
  state: FilterState;
  onToggle: (key: FacetKey, value: string) => void;
  includeCategory: boolean;
}) {
  const categories = useCategories();
  const pool = useCatalogue();
  const groups = buildGroups(includeCategory, categories, pool);

  return (
    <div className="divide-y divide-line border-t border-line">
      {groups.map((group) => {
        const counts = facetCounts(basePool, state, group.key);
        const visible = group.options.filter((o) => (counts[o.value] ?? 0) > 0);
        if (visible.length === 0) return null;

        return (
          <details key={group.key} open className="group py-1">
            <summary className="flex cursor-pointer list-none items-center justify-between py-4">
              <span className="text-[11px] tracking-luxe uppercase text-ink">
                {group.label}
              </span>
              <span className="text-gold transition-transform duration-300 group-open:rotate-180">
                ⌄
              </span>
            </summary>
            <ul className="space-y-2.5 pb-5">
              {visible.map((option) => {
                const checked = state[group.key].includes(option.value);
                return (
                  <li key={option.value}>
                    <button
                      type="button"
                      onClick={() => onToggle(group.key, option.value)}
                      aria-pressed={checked}
                      className="group/opt flex w-full items-center gap-3 text-left"
                    >
                      <span
                        className={cn(
                          "flex size-4 shrink-0 items-center justify-center border transition-colors",
                          checked
                            ? "border-gold bg-gold text-white"
                            : "border-line group-hover/opt:border-charcoal",
                        )}
                      >
                        {checked && <Check width={11} height={11} strokeWidth={3} />}
                      </span>
                      <span
                        className={cn(
                          "flex-1 text-sm transition-colors",
                          checked ? "text-ink" : "text-muted group-hover/opt:text-ink",
                        )}
                      >
                        {option.label}
                      </span>
                      <span className="text-[10px] text-muted/70">
                        {counts[option.value]}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </details>
        );
      })}
    </div>
  );
}

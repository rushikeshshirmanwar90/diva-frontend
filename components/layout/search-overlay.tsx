"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { useProductSearch } from "@/lib/data/catalogue-context";
import { useCategories } from "@/lib/data/catalogue-context";
import { formatPaise } from "@/lib/format";

const suggestions = [
  "Solitaire ring",
  "Gold hoops",
  "Polki",
  "Mangalsutra",
  "Tennis bracelet",
  "Pendant under 30000",
];

export function SearchOverlay({ onClose }: { onClose: () => void }) {
  const categories = useCategories();

  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const matches = useProductSearch(query);
  const results = useMemo(() => matches.slice(0, 6), [matches]);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white/98 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col overflow-y-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <p className="eyebrow">Search Diva</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="text-charcoal hover:text-gold"
          >
            <X width={20} height={20} strokeWidth={1.5} />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (query.trim()) {
              router.push(`/search?q=${encodeURIComponent(query.trim())}`);
              onClose();
            }
          }}
          className="mt-8 flex items-center gap-4 border-b border-charcoal pb-4"
        >
          <Search width={22} height={22} strokeWidth={1.4} className="text-gold" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try “diamond pendant” or “22K hoops”"
            className="w-full bg-transparent font-display text-2xl font-light text-ink outline-none placeholder:text-muted/60 md:text-3xl"
          />
        </form>

        {!query && (
          <div className="mt-10 grid gap-10 sm:grid-cols-2">
            <div>
              <p className="eyebrow mb-4">Popular searches</p>
              <ul className="space-y-2.5">
                {suggestions.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      onClick={() => setQuery(s)}
                      className="link-underline text-sm text-charcoal"
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow mb-4">Browse categories</p>
              <ul className="grid grid-cols-2 gap-2.5">
                {categories.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/category/${c.slug}`}
                      onClick={onClose}
                      className="link-underline text-sm text-charcoal"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {query && (
          <div className="mt-8">
            <p className="eyebrow mb-4">
              {results.length > 0
                ? `${results.length} matching piece${results.length === 1 ? "" : "s"}`
                : "No matches — try a metal, stone or category"}
            </p>
            <ul className="divide-y divide-line">
              {results.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/product/${p.slug}`}
                    onClick={onClose}
                    className="group flex items-center gap-4 py-3"
                  >
                    <div className="relative size-16 shrink-0 overflow-hidden bg-beige">
                      <Image
                        src={p.images[0]!}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-base text-ink group-hover:text-gold">
                        {p.title}
                      </p>
                      <p className="truncate text-xs text-muted">{p.subtitle}</p>
                    </div>
                    <span className="text-sm text-ink">{formatPaise(p.price)}</span>
                  </Link>
                </li>
              ))}
            </ul>
            {results.length > 0 && (
              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                onClick={onClose}
                className="link-underline mt-6 inline-block text-[11px] tracking-luxe uppercase text-charcoal"
              >
                See all results
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

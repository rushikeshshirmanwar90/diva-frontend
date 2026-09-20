import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/shop/page-header";
import { LinkPendingOverlay } from "@/components/ui/link-pending";
import { categories } from "@/lib/data/categories";
import { products } from "@/lib/data/products";
import { byCategory } from "@/lib/data/product-helpers";

export const metadata: Metadata = {
  title: "Categories",
  description:
    "Every category in the DIVA catalogue — rings, earrings, necklaces, bangles and more — each hallmarked and insured on delivery.",
};

/**
 * `/categories` — every category the admin has created, one tile each.
 *
 * This is the page the header's "Categories" tab links to (its hover panel
 * on desktop is a shortcut into the same list, not a substitute for it — a
 * tap or a touch device has no hover, so the tab itself must go somewhere).
 * Each tile carries a live piece count from the catalogue, the way the
 * Collections index does for occasions.
 */
export default async function CategoriesPage() {
  const [categoryList, catalogue] = await Promise.all([categories(), products()]);
  const counts = new Map(
    categoryList.map((c) => [c.slug, byCategory(catalogue, c.slug).length] as const),
  );

  return (
    <>
      <PageHeader
        eyebrow="Shop by category"
        title="Categories"
        description="Every piece in the DIVA catalogue, sorted by what it is rather than when you'd wear it."
        trail={[{ label: "Categories" }]}
      />

      <div className="mx-auto max-w-[90rem] px-5 pb-16 lg:px-10">
        {categoryList.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted">
            No categories yet — check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {categoryList.map((category, i) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="group relative"
              >
                <div className="relative aspect-4/5 overflow-hidden bg-beige">
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 24vw"
                      priority={i < 4}
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/10 to-transparent" />
                  <LinkPendingOverlay />
                  <div className="absolute inset-x-0 bottom-0 p-4 lg:p-5">
                    <p className="font-display text-xl leading-tight font-light text-white lg:text-2xl">
                      {category.name}
                    </p>
                    {category.blurb && (
                      <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-white/70">
                        {category.blurb}
                      </p>
                    )}
                    <span className="mt-3 inline-flex items-center gap-1.5 text-[10px] tracking-luxe uppercase text-white">
                      {counts.get(category.slug) ?? 0} pieces
                      <ArrowRight
                        width={12}
                        height={12}
                        className="text-gold transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

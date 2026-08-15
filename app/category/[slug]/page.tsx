import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shop/page-header";
import { ShopView } from "@/components/shop/shop-view";
import { getCategory } from "@/lib/data/categories";
import { productsByCategory } from "@/lib/data/products";
import { filtersFromParams } from "@/lib/filters";

/**
 * No `generateStaticParams` here — see the comment on it in
 * `app/product/[slug]/page.tsx`. Pre-rendering would freeze this page's
 * product listing at build time, defeating the `cache: "no-store"` fetch in
 * `lib/data/catalogue.ts` that's meant to reflect a dead backend on every
 * request.
 */
export async function generateMetadata({
  params,
}: PageProps<"/category/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: "Category not found" };
  return {
    title: category.name,
    description: `${category.name} — ${category.blurb}. BIS hallmarked, insured delivery, 15-day returns.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps<"/category/[slug]">) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();

  const pool = await productsByCategory(slug);
  const initialFilters = filtersFromParams(await searchParams);

  return (
    <>
      <PageHeader
        eyebrow={`${pool.length} pieces`}
        title={category.name}
        description={category.blurb}
        trail={[{ label: "All jewellery", href: "/shop" }, { label: category.name }]}
        image={category.bannerImage}
      />
      <ShopView pool={pool} initialFilters={initialFilters} includeCategory={false} />
    </>
  );
}

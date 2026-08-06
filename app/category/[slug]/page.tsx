import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shop/page-header";
import { ShopView } from "@/components/shop/shop-view";
import { categories, getCategory } from "@/lib/data/categories";
import { productsByCategory } from "@/lib/data/products";
import { filtersFromParams } from "@/lib/filters";

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/category/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
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
  const category = getCategory(slug);
  if (!category) notFound();

  const pool = productsByCategory(slug);
  const initialFilters = filtersFromParams(await searchParams);

  return (
    <>
      <PageHeader
        eyebrow={`${pool.length} pieces`}
        title={category.name}
        description={category.blurb}
        trail={[{ label: "All jewellery", href: "/shop" }, { label: category.name }]}
        image={category.image}
      />
      <ShopView pool={pool} initialFilters={initialFilters} includeCategory={false} />
    </>
  );
}

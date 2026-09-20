import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shop/page-header";
import { ShopView } from "@/components/shop/shop-view";
import { byGender, getGenderCollection } from "@/lib/data/genders";
import { products } from "@/lib/data/products";
import { filtersFromParams } from "@/lib/filters";

/**
 * `/for/women` and `/for/men` — the gender edits. A fixed pair of slugs
 * (`lib/data/genders.ts`), but not pre-rendered, for the same reason as the
 * occasion pages: the listing must reflect the live catalogue on every request.
 */
export async function generateMetadata({
  params,
}: PageProps<"/for/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const collection = getGenderCollection(slug);
  if (!collection) return { title: "Collection not found" };
  return { title: collection.title, description: collection.description };
}

export default async function GenderCollectionPage({
  params,
  searchParams,
}: PageProps<"/for/[slug]">) {
  const { slug } = await params;
  const collection = getGenderCollection(slug);
  if (!collection) notFound();

  const pool = byGender(await products(), collection);
  const initialFilters = filtersFromParams(await searchParams);

  return (
    <>
      <PageHeader
        eyebrow={collection.tagline}
        title={collection.title}
        description={collection.description}
        trail={[{ label: collection.title }]}
        image={collection.image}
      />
      <ShopView pool={pool} initialFilters={initialFilters} />
    </>
  );
}

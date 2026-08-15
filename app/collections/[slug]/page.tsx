import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shop/page-header";
import { ShopView } from "@/components/shop/shop-view";
import { getCollection } from "@/lib/data/categories";
import { productsByCollection } from "@/lib/data/products";
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
}: PageProps<"/collections/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollection(slug);
  if (!collection) return { title: "Collection not found" };
  return { title: collection.name, description: collection.description };
}

export default async function CollectionPage({
  params,
  searchParams,
}: PageProps<"/collections/[slug]">) {
  const { slug } = await params;
  const collection = await getCollection(slug);
  if (!collection) notFound();

  const pool = await productsByCollection(slug);
  const initialFilters = filtersFromParams(await searchParams);

  return (
    <>
      <PageHeader
        eyebrow={collection.tagline}
        title={collection.name}
        description={collection.description}
        trail={[
          { label: "Collections", href: "/collections" },
          { label: collection.name },
        ]}
        image={collection.image}
      />
      <ShopView pool={pool} initialFilters={initialFilters} />
    </>
  );
}

import type { Metadata } from "next";
import { PageHeader } from "@/components/shop/page-header";
import { ShopView } from "@/components/shop/shop-view";
import { products } from "@/lib/data/products";
import { filtersFromParams } from "@/lib/filters";

export const metadata: Metadata = {
  title: "All jewellery",
  description:
    "Browse every hallmarked piece — rings, earrings, necklaces, bracelets and bridal sets — filterable by price, metal, stone and occasion.",
};

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  const params = await searchParams;
  const initialFilters = filtersFromParams(params);

  return (
    <>
      <PageHeader
        eyebrow={`${products.length} pieces`}
        title="All jewellery"
        description="Every piece is BIS hallmarked with a verifiable HUID. Filter by what matters to you — weight, metal, stone or budget."
        trail={[{ label: "All jewellery" }]}
      />
      <ShopView pool={products} initialFilters={initialFilters} />
    </>
  );
}

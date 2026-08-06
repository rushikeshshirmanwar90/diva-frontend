import { Hero } from "@/components/home/hero";
import { CategoryRail } from "@/components/home/category-rail";
import { CollectionBanner } from "@/components/home/collection-banner";
import { PriceTiles } from "@/components/home/price-tiles";
import { CraftStory } from "@/components/home/craft-story";
import { Testimonials } from "@/components/home/testimonials";
import { InstagramStrip } from "@/components/home/instagram-strip";
import { JournalPreview } from "@/components/home/journal-preview";
import { NewsletterBand } from "@/components/home/newsletter-band";
import { ProductGrid, ProductRail } from "@/components/product/product-grid";
import { SectionHeading } from "@/components/ui/section-heading";
import { getCollection } from "@/lib/data/categories";
import { products, productsByBadge, productsByCollection } from "@/lib/data/products";

export default function HomePage() {
  const bestsellers = productsByBadge("bestseller").slice(0, 4);
  const newArrivals = [...products]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);
  const wedding = getCollection("wedding-edit")!;
  const daily = getCollection("daily-wear")!;

  return (
    <>
      <Hero />
      <CategoryRail />

      <section className="mx-auto max-w-[90rem] px-5 pb-8 lg:px-10">
        <SectionHeading
          eyebrow="Most loved"
          title="Signature pieces"
          href="/shop?sort=popular"
          linkLabel="Shop bestsellers"
          align="between"
        />
        <ProductGrid products={bestsellers} className="mt-10" />
      </section>

      <CollectionBanner
        collection={wedding}
        productCount={productsByCollection(wedding.slug).length}
      />

      <section className="mx-auto max-w-[90rem] px-5 py-12 lg:px-10">
        <SectionHeading
          eyebrow="Just arrived"
          title="New this season"
          href="/shop?sort=newest"
          linkLabel="See all new"
          align="between"
        />
        <div className="mt-10">
          <ProductRail products={newArrivals} />
        </div>
      </section>

      <PriceTiles />
      <CraftStory />

      <CollectionBanner
        collection={daily}
        reverse
        productCount={productsByCollection(daily.slug).length}
      />

      <Testimonials />
      <InstagramStrip />
      <NewsletterBand />
      <JournalPreview />
    </>
  );
}

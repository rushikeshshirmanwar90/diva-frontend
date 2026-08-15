import { Hero } from "@/components/home/hero";
import { CategoryRail } from "@/components/home/category-rail";
import { CollectionBanner } from "@/components/home/collection-banner";
import { PriceTiles } from "@/components/home/price-tiles";
import { CraftStory } from "@/components/home/craft-story";
import { Testimonials } from "@/components/home/testimonials";
import { InstagramStrip } from "@/components/home/instagram-strip";
import { NewsletterBand } from "@/components/home/newsletter-band";
import { ProductGrid, ProductRail } from "@/components/product/product-grid";
import { SectionHeading } from "@/components/ui/section-heading";
import { collections } from "@/lib/data/categories";
import { products, productsByBadge, productsByCollection } from "@/lib/data/products";
import { getHeroSlides } from "@/lib/data/hero";

export default async function HomePage() {
  const [catalogue, bestsellers, heroSlides] = await Promise.all([
    products(),
    productsByBadge("bestseller"),
    getHeroSlides(),
  ]);

  const featured = bestsellers.slice(0, 4);
  const newArrivals = [...catalogue]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);
  /**
   * The two banner slots take whichever edits exist, rather than the named
   * "wedding-edit" and "daily-wear" this page used to assume. Those were demo
   * slugs; a store that has not created them would have crashed on the
   * non-null assertion that used to be here. Each banner renders only if there
   * is a collection to put in it.
   */
  const edits = await collections();
  const [wedding, daily] = edits;

  const [weddingCount, dailyCount] = await Promise.all([
    wedding ? productsByCollection(wedding.slug) : Promise.resolve([]),
    daily ? productsByCollection(daily.slug) : Promise.resolve([]),
  ]);

  return (
    <>
      <Hero slides={heroSlides} />
      <CategoryRail />

      <section className="mx-auto max-w-[90rem] px-5 pb-8 lg:px-10">
        <SectionHeading
          eyebrow="Most loved"
          title="Signature pieces"
          href="/shop?sort=popular"
          linkLabel="Shop bestsellers"
          align="between"
        />
        <ProductGrid products={featured} className="mt-10" />
      </section>

      {wedding && (
        <CollectionBanner collection={wedding} productCount={weddingCount.length} />
      )}

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

      {daily && (
        <CollectionBanner collection={daily} reverse productCount={dailyCount.length} />
      )}

      <Testimonials />
      <InstagramStrip />
      <NewsletterBand />
    </>
  );
}

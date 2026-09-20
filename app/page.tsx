import { Hero } from "@/components/home/hero";
import { CategoryRail } from "@/components/home/category-rail";
import { CollectionBanner } from "@/components/home/collection-banner";
import { PriceTiles } from "@/components/home/price-tiles";
import { Testimonials } from "@/components/home/testimonials";
import { InstagramStrip } from "@/components/home/instagram-strip";
import { NewsletterBand } from "@/components/home/newsletter-band";
import { RecentlyViewedRail } from "@/components/home/recently-viewed-rail";
import { ProductGrid, ProductRail } from "@/components/product/product-grid";
import { SectionHeading } from "@/components/ui/section-heading";
import { getOccasionCollection } from "@/lib/data/occasions";
import { products, productsByBadge, productsByOccasion } from "@/lib/data/products";
import { getHeroSlides } from "@/lib/data/hero";
import { getFeaturedTestimonials } from "@/lib/data/testimonials";

export default async function HomePage() {
  const [catalogue, bestsellers, heroSlides, testimonialSection] = await Promise.all([
    products(),
    productsByBadge("bestseller"),
    getHeroSlides(),
    getFeaturedTestimonials(),
  ]);

  const featured = bestsellers.slice(0, 4);
  const newArrivals = [...catalogue]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);
  /**
   * The banner slots are the Wedding and Daily Wear occasion edits. Both are
   * fixed entries in `lib/data/occasions.ts` rather than admin-created
   * collections, so they always exist — the only question is how many pieces
   * have been tagged into each.
   */
  const wedding = getOccasionCollection("wedding");
  const daily = getOccasionCollection("daily-wear");

  const [weddingCount, dailyCount] = await Promise.all([
    productsByOccasion("wedding"),
    productsByOccasion("daily-wear"),
  ]);

  return (
    <>
      <Hero slides={heroSlides} />
      <CategoryRail />

      <section className="mx-auto max-w-[90rem] px-5 pb-8 lg:px-10">
        <ProductGrid products={featured} className="mt-10" />
      </section>

      {/* {wedding && (
        <CollectionBanner collection={wedding} productCount={weddingCount.length} />
      )} */}

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

      <RecentlyViewedRail />

      <PriceTiles />
      {/* 
      {daily && (
        <CollectionBanner collection={daily} reverse productCount={dailyCount.length} />
      )} */}

      <Testimonials {...testimonialSection} />
    </>
  );
}

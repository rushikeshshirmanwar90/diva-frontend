import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Gallery } from "@/components/product/gallery";
import { BuyBox } from "@/components/product/buy-box";
import { ProductDetails } from "@/components/product/product-details";
import { ReviewsSection } from "@/components/product/reviews-section";
import { ProductRail } from "@/components/product/product-grid";
import { SectionHeading } from "@/components/ui/section-heading";
import { RecentlyViewed } from "@/components/product/recently-viewed";
import { getCategory } from "@/lib/data/categories";
import { getProduct, relatedProducts } from "@/lib/data/products";
import { getProductReviews } from "@/lib/data/catalogue";
import { toYouTubeEmbedUrl } from "@/lib/youtube";
import { cn } from "@/lib/cn";

/**
 * No `generateStaticParams` here on purpose. Pre-rendering this page would
 * freeze its content at build time — a `cache: "no-store"` fetch inside a
 * statically generated page never re-runs after the build, so "the backend
 * is down" would never show up here even though `lib/data/catalogue.ts` is
 * built to reflect that on every request. See `lib/data/catalogue.ts`'s
 * `get()` for the full reasoning.
 */
export async function generateMetadata({
  params,
}: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Piece not found" };

  // Only the parts that exist: a plated piece has no certification or gross
  // weight, and "undefined." in a meta description is worse than a short one.
  const description = [product.subtitle, product.attributes.certification]
    .filter(Boolean)
    .join(". ");

  return {
    title: product.title,
    description: description || product.title,
    ...(product.images[0] ? { openGraph: { images: [product.images[0]] } } : {}),
  };
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const category = await getCategory(product.categorySlug);
  const related = await relatedProducts(product, 6);
  const reviews = await getProductReviews(product.slug);
  const videoEmbedUrl = toYouTubeEmbedUrl(product.videoUrl);

  return (
    <div className="mx-auto max-w-[90rem] px-5 pt-8 lg:px-10">
      <Breadcrumbs
        trail={[
          { label: "All jewellery", href: "/shop" },
          ...(category
            ? [{ label: category.name, href: `/category/${category.slug}` }]
            : []),
          { label: product.title },
        ]}
      />

      <div className="mt-8 grid gap-12 lg:grid-cols-2 lg:gap-16">
        <Gallery
          images={product.images}
          title={product.title}
          videoUrl={product.videoUrl}
        />
        <div className="lg:pt-2">
          <BuyBox product={product} />
        </div>
      </div>

      <div
        className={cn(
          "mt-20",
          videoEmbedUrl
            ? "grid items-start gap-12 lg:grid-cols-2 lg:gap-16"
            : "mx-auto max-w-3xl",
        )}
      >
        <ProductDetails product={product} />

        {videoEmbedUrl && (
          <div className="overflow-hidden border border-line bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-line bg-beige/50 px-5 py-3.5">
              <span className="eyebrow text-gold">Jewellery in motion</span>
              <span className="text-[10px] tracking-luxe uppercase text-muted">
                YouTube Short
              </span>
            </div>
            <div className="relative aspect-[9/16] max-h-[520px] w-full mx-auto flex items-center justify-center bg-charcoal">
              <iframe
                src={`${videoEmbedUrl}?autoplay=0&rel=0&modestbranding=1&playsinline=1`}
                title={`${product.title} video`}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-24">
        <ReviewsSection product={product} reviews={reviews} />
      </div>

      <section className="mt-24">
        <SectionHeading
          eyebrow="Styled together"
          title="You may also like"
          href={category ? `/category/${category.slug}` : "/shop"}
          linkLabel="More like this"
          align="between"
        />
        <div className="mt-10">
          <ProductRail products={related} />
        </div>
      </section>

      <RecentlyViewed excludeSlug={product.slug} />
    </div>
  );
}

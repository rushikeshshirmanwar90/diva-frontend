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
        <Gallery images={product.images} title={product.title} />
        <div className="lg:pt-2">
          <BuyBox product={product} />
        </div>
      </div>

      <div className="mt-20 grid gap-16 lg:grid-cols-2 lg:gap-16">
        <ProductDetails product={product} />
        <div className="bg-beige p-8 lg:p-12">
          <p className="eyebrow">Made in India</p>
          <h2 className="mt-4 font-display text-2xl leading-snug font-light text-ink">
            How this piece was made
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            {product.attributes.stone === "Uncut Polki"
              ? "Set by hand in our Jaipur atelier, where each uncut stone is foiled from behind before the bezel is closed over it. Nine karigars, four of them second generation."
              : product.attributes.metal === "22K Gold"
                ? "Hand-finished in Thanjavur, where the repoussé and granulation work on 22K gold has been done the same way for four generations."
                : "Cast, set and finished in our Bengaluru workshop, then tumble-polished for four hours before it is hallmarked."}
          </p>
          <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-line pt-8">
            {[
              ["Gross weight", product.attributes.grossWeight],
              ["Purity", product.attributes.purity],
              ["Hallmark", product.attributes.huid],
              ["Certification", product.attributes.certification],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[10px] tracking-luxe uppercase text-muted">{k}</dt>
                <dd className="mt-1 text-sm text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
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

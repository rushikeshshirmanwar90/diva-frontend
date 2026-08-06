import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { reviews } from "@/lib/data/content";
import { getProduct } from "@/lib/data/products";
import { Rating } from "@/components/ui/rating";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "My reviews",
  robots: { index: false },
};

export default function MyReviewsPage() {
  // Two of the demo reviews stand in as "yours".
  const mine = reviews.slice(0, 2);
  const awaiting = ["zoya-classic-gold-hoops", "chandni-crescent-pendant"]
    .map(getProduct)
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div className="space-y-14">
      <section>
        <h2 className="font-display text-2xl font-light text-ink">Your reviews</h2>
        <ul className="mt-8 divide-y divide-line border-y border-line">
          {mine.map((r) => {
            const product = getProduct(r.productSlug);
            return (
              <li key={r.id} className="flex gap-5 py-6">
                {product && (
                  <Link
                    href={`/product/${product.slug}`}
                    className="relative size-20 shrink-0 overflow-hidden bg-beige"
                  >
                    <Image
                      src={product.images[0]!}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </Link>
                )}
                <div className="min-w-0 flex-1">
                  <Rating value={r.rating} />
                  <p className="mt-2 font-display text-lg font-light text-ink">
                    {r.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{r.body}</p>
                  <p className="mt-3 text-[11px] text-muted">
                    On {product?.title} · {formatDate(r.date)} · Published
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="font-display text-2xl font-light text-ink">Awaiting your review</h2>
        <p className="mt-2 text-sm text-muted">
          Delivered pieces you have not written about yet.
        </p>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2">
          {awaiting.map((p) => (
            <li key={p.slug} className="flex items-center gap-4 border border-line p-5">
              <div className="relative size-20 shrink-0 overflow-hidden bg-beige">
                <Image
                  src={p.images[0]!}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg leading-snug font-light text-ink">
                  {p.title}
                </p>
                <button
                  type="button"
                  className="mt-2 text-[10px] tracking-luxe uppercase text-gold hover:underline"
                >
                  Write a review
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

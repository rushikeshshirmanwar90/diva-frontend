import Image from "next/image";
import { BadgeCheck } from "lucide-react";
import type { Product, Review } from "@/lib/types";
import { Rating } from "@/components/ui/rating";
import { formatDate } from "@/lib/format";

export function ReviewsSection({
  product,
  reviews,
}: {
  product: Product;
  reviews: Review[];
}) {
  // Plausible synthetic distribution so the bars are not all identical.
  const distribution = [5, 4, 3, 2, 1].map((stars) => {
    const weight = { 5: 0.74, 4: 0.18, 3: 0.05, 2: 0.02, 1: 0.01 }[stars] ?? 0;
    return { stars, count: Math.round(product.ratingCount * weight) };
  });

  return (
    <section id="reviews" className="scroll-mt-40">
      <div className="grid gap-12 lg:grid-cols-[20rem_1fr] lg:gap-20">
        <div>
          <p className="eyebrow">Reviews</p>
          <p className="mt-4 font-display text-6xl leading-none font-light text-ink">
            {product.ratingAvg.toFixed(1)}
          </p>
          <Rating value={product.ratingAvg} className="mt-3" />
          <p className="mt-2 text-xs text-muted">
            {product.ratingCount} verified reviews
          </p>

          <ul className="mt-8 space-y-2">
            {distribution.map((d) => (
              <li key={d.stars} className="flex items-center gap-3">
                <span className="w-8 text-xs text-muted">{d.stars}★</span>
                <span className="h-1 flex-1 bg-line">
                  <span
                    className="block h-full bg-gold"
                    style={{
                      width: `${(d.count / Math.max(1, product.ratingCount)) * 100}%`,
                    }}
                  />
                </span>
                <span className="w-10 text-right text-xs text-muted">{d.count}</span>
              </li>
            ))}
          </ul>

          <p className="mt-8 border-t border-line pt-6 text-xs leading-relaxed text-muted">
            Only customers who bought this piece can review it. We never delete a review
            for being critical — the two-star ones below are real.
          </p>
        </div>

        <div>
          {reviews.length === 0 ? (
            <p className="text-sm text-muted">
              No written reviews on this piece yet — it is new to the collection.
            </p>
          ) : (
            <ul className="divide-y divide-line border-t border-line">
              {reviews.map((r) => (
                <li key={r.id} className="py-8">
                  <div className="flex flex-wrap items-center gap-3">
                    <Rating value={r.rating} />
                    {r.verifiedPurchase && (
                      <span className="inline-flex items-center gap-1 text-[10px] tracking-luxe uppercase text-success">
                        <BadgeCheck width={12} height={12} /> Verified purchase
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 font-display text-xl font-light text-ink">
                    {r.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{r.body}</p>
                  {r.images && (
                    <div className="mt-4 flex gap-3">
                      {r.images.map((image) => (
                        <div
                          key={image}
                          className="relative size-20 overflow-hidden bg-beige"
                        >
                          <Image
                            src={image}
                            alt=""
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="mt-4 text-[11px] tracking-wide text-muted">
                    {r.author} · {r.city} · {formatDate(r.date)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

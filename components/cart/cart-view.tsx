"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Minus, Plus, ShoppingBag, Tag, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store/store";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { OrderSummary } from "@/components/cart/order-summary";
import { formatPaise } from "@/lib/format";
import { coupons } from "@/lib/data/content";

export function CartView() {
  const {
    hydrated,
    lines,
    totals,
    setQty,
    removeLine,
    toggleWishlist,
    coupon,
    applyCoupon,
    removeCoupon,
  } = useStore();
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  if (!hydrated) {
    return <div className="min-h-[50vh]" />;
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-[90rem] px-5 pt-8 lg:px-10">
        <Breadcrumbs trail={[{ label: "Your bag" }]} />
        <EmptyState
          icon={<ShoppingBag width={24} height={24} strokeWidth={1.3} />}
          title="Your bag is empty"
          body="Nothing here yet. Pieces you add are held for 30 days, and your wishlist keeps them longer."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[90rem] px-5 pt-8 pb-20 lg:px-10">
      <Breadcrumbs trail={[{ label: "Your bag" }]} />
      <div className="mt-6 flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="font-display text-4xl font-light text-ink lg:text-[3rem]">
          Your bag
        </h1>
        <p className="text-xs text-muted">
          {totals.itemCount} {totals.itemCount === 1 ? "piece" : "pieces"} ·{" "}
          {formatPaise(totals.subtotal)}
        </p>
      </div>

      <div className="mt-10 grid gap-14 lg:grid-cols-[1fr_24rem] lg:gap-16">
        <div>
          <ul className="divide-y divide-line border-y border-line">
            {lines.map((line) => (
              <li key={line.key} className="flex gap-5 py-7 sm:gap-7">
                <Link
                  href={`/product/${line.product.slug}`}
                  className="relative size-28 shrink-0 overflow-hidden bg-beige sm:size-36"
                >
                  <Image
                    src={line.product.images[0]!}
                    alt=""
                    fill
                    sizes="144px"
                    className="object-cover"
                  />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="eyebrow">{line.product.attributes.metal}</p>
                      <Link
                        href={`/product/${line.product.slug}`}
                        className="mt-1 block font-display text-xl leading-snug font-light text-ink hover:text-gold"
                      >
                        {line.product.title}
                      </Link>
                      <p className="mt-1 text-xs text-muted">
                        {line.product.variantLabel}: {line.variant.label} ·{" "}
                        {line.variant.weightGrams} g · SKU {line.variant.sku}
                      </p>
                      <p className="mt-1.5 text-xs text-success">
                        {line.variant.stock > 0
                          ? line.variant.stock <= 3
                            ? `Only ${line.variant.stock} left in this size`
                            : "In stock · ships in 48 hours"
                          : "Made to order · 6–8 weeks"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-medium text-ink">
                        {formatPaise(line.lineTotal)}
                      </p>
                      {line.unitMrp > line.unitPrice && (
                        <p className="text-xs text-muted line-through">
                          {formatPaise(line.unitMrp * line.qty)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-auto flex flex-wrap items-center gap-5 pt-5">
                    <div className="flex items-center border border-line">
                      <button
                        type="button"
                        onClick={() => setQty(line.key, line.qty - 1)}
                        aria-label="Decrease quantity"
                        className="flex size-9 items-center justify-center hover:text-gold"
                      >
                        <Minus width={13} height={13} />
                      </button>
                      <span className="w-9 text-center text-sm">{line.qty}</span>
                      <button
                        type="button"
                        onClick={() => setQty(line.key, line.qty + 1)}
                        aria-label="Increase quantity"
                        className="flex size-9 items-center justify-center hover:text-gold"
                      >
                        <Plus width={13} height={13} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        toggleWishlist(line.product.slug);
                        removeLine(line.key);
                      }}
                      className="inline-flex items-center gap-2 text-[10px] tracking-luxe uppercase text-muted hover:text-gold"
                    >
                      <Heart width={13} height={13} /> Move to wishlist
                    </button>

                    <button
                      type="button"
                      onClick={() => removeLine(line.key)}
                      className="inline-flex items-center gap-2 text-[10px] tracking-luxe uppercase text-muted hover:text-sale"
                    >
                      <Trash2 width={13} height={13} /> Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Coupons */}
          <div className="mt-10 border border-line p-6">
            <div className="flex items-center gap-2">
              <Tag width={15} height={15} strokeWidth={1.4} className="text-gold" />
              <p className="text-[11px] tracking-luxe uppercase text-ink">
                Offers & coupons
              </p>
            </div>

            {coupon ? (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 bg-beige px-4 py-3">
                <p className="text-sm text-ink">
                  <span className="font-medium">{coupon.code}</span> applied —{" "}
                  {coupon.label}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    removeCoupon();
                    setMessage(null);
                  }}
                  className="text-[10px] tracking-luxe uppercase text-sale hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const result = applyCoupon(code);
                  setMessage({ ok: result.ok, text: result.message });
                  if (result.ok) setCode("");
                }}
                className="mt-4 flex gap-3"
              >
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Enter code"
                  aria-label="Coupon code"
                  className="flex-1 border border-line px-4 py-3 text-sm tracking-wide text-ink outline-none focus:border-gold"
                />
                <Button type="submit" variant="outline">
                  Apply
                </Button>
              </form>
            )}

            {message && (
              <p
                className={`mt-3 text-xs ${message.ok ? "text-success" : "text-sale"}`}
              >
                {message.text}
              </p>
            )}

            <ul className="mt-5 space-y-2 border-t border-line pt-4">
              {coupons.map((c) => (
                <li key={c.code} className="flex flex-wrap justify-between gap-2 text-xs">
                  <span className="text-ink">
                    <button
                      type="button"
                      onClick={() => setCode(c.code)}
                      className="font-medium tracking-wide text-gold hover:underline"
                    >
                      {c.code}
                    </button>{" "}
                    — {c.label}
                  </span>
                  <span className="text-muted">
                    Min. {formatPaise(c.minCartValue)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <ButtonLink href="/shop" variant="ghost" className="mt-8 px-0">
            ← Continue shopping
          </ButtonLink>
        </div>

        <aside className="lg:sticky lg:top-40 lg:self-start">
          <OrderSummary totals={totals} coupon={coupon} />
          <ButtonLink href="/checkout" variant="gold" size="lg" className="mt-6 w-full">
            Proceed to checkout
          </ButtonLink>
          <p className="mt-4 text-center text-[10px] tracking-wide text-muted">
            Gold rate locked for 30 minutes once you reach checkout
          </p>
        </aside>
      </div>
    </div>
  );
}

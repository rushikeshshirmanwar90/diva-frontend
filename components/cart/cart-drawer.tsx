"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useStore } from "@/lib/store/store";
import { ButtonLink } from "@/components/ui/button";
import { formatPaise, FREE_SHIPPING_THRESHOLD } from "@/lib/format";

export function CartDrawer() {
  const { cartOpen, setCartOpen, lines, totals, setQty, removeLine } = useStore();

  useEffect(() => {
    document.body.style.overflow = cartOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setCartOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [setCartOpen]);

  if (!cartOpen) return null;

  const toFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - totals.taxable);
  const progress = Math.min(100, (totals.taxable / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-label="Shopping bag">
      <button
        type="button"
        aria-label="Close bag"
        onClick={() => setCartOpen(false)}
        className="absolute inset-0 animate-fade-in bg-charcoal/40"
      />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-md animate-fade-in flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <div>
            <p className="eyebrow">Your bag</p>
            <p className="font-display text-xl font-light text-ink">
              {totals.itemCount} {totals.itemCount === 1 ? "piece" : "pieces"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCartOpen(false)}
            aria-label="Close bag"
            className="text-charcoal hover:text-gold"
          >
            <X width={20} height={20} strokeWidth={1.5} />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-beige text-gold">
              <ShoppingBag width={22} height={22} strokeWidth={1.4} />
            </div>
            <p className="font-display text-xl font-light text-ink">
              Your bag is empty
            </p>
            <p className="mt-2 text-sm text-muted">
              Pieces you add will be held here for 30 days.
            </p>
            <ButtonLink
              href="/shop"
              className="mt-7"
              onClick={() => setCartOpen(false)}
            >
              Browse jewellery
            </ButtonLink>
          </div>
        ) : (
          <>
            {toFreeShipping > 0 ? (
              <div className="border-b border-line px-6 py-4">
                <p className="text-xs text-muted">
                  Add{" "}
                  <span className="font-medium text-ink">
                    {formatPaise(toFreeShipping)}
                  </span>{" "}
                  more for complimentary insured shipping
                </p>
                <div className="mt-2 h-0.5 bg-line">
                  <div
                    className="h-full bg-gold transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="border-b border-line px-6 py-4 text-xs text-success">
                ✦ Complimentary insured shipping unlocked
              </p>
            )}

            <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
              {lines.map((line) => (
                <li key={line.key} className="flex gap-4 py-5">
                  <Link
                    href={`/product/${line.product.slug}`}
                    onClick={() => setCartOpen(false)}
                    className="relative size-24 shrink-0 overflow-hidden bg-beige"
                  >
                    <Image
                      src={line.product.images[0]!}
                      alt=""
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/product/${line.product.slug}`}
                      onClick={() => setCartOpen(false)}
                      className="font-display text-base leading-snug text-ink hover:text-gold"
                    >
                      {line.product.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted">
                      {line.product.variantLabel}: {line.variant.label}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center border border-line">
                        <button
                          type="button"
                          onClick={() => setQty(line.key, line.qty - 1)}
                          aria-label="Decrease quantity"
                          className="flex size-8 items-center justify-center text-charcoal hover:text-gold"
                        >
                          <Minus width={13} height={13} />
                        </button>
                        <span className="w-8 text-center text-sm">{line.qty}</span>
                        <button
                          type="button"
                          onClick={() => setQty(line.key, line.qty + 1)}
                          aria-label="Increase quantity"
                          className="flex size-8 items-center justify-center text-charcoal hover:text-gold"
                        >
                          <Plus width={13} height={13} />
                        </button>
                      </div>
                      <span className="text-sm font-medium text-ink">
                        {formatPaise(line.lineTotal)}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLine(line.key)}
                    aria-label={`Remove ${line.product.title}`}
                    className="self-start text-muted transition-colors hover:text-sale"
                  >
                    <Trash2 width={15} height={15} strokeWidth={1.5} />
                  </button>
                </li>
              ))}
            </ul>

            <div className="border-t border-line px-6 py-5">
              <dl className="space-y-1.5 text-sm">
                <Row label="Subtotal" value={formatPaise(totals.subtotal)} />
                <Row label="GST (3%)" value={formatPaise(totals.gst)} />
                <Row
                  label="Shipping"
                  value={totals.shipping === 0 ? "Free" : formatPaise(totals.shipping)}
                />
              </dl>
              <div className="mt-3 flex items-baseline justify-between border-t border-line pt-3">
                <span className="text-[11px] tracking-luxe uppercase text-muted">
                  Total
                </span>
                <span className="font-display text-2xl font-light text-ink">
                  {formatPaise(totals.total)}
                </span>
              </div>
              <div className="mt-5 grid gap-2.5">
                <ButtonLink
                  href="/checkout"
                  variant="gold"
                  size="lg"
                  onClick={() => setCartOpen(false)}
                  className="w-full"
                >
                  Proceed to checkout
                </ButtonLink>
                <ButtonLink
                  href="/cart"
                  variant="outline"
                  onClick={() => setCartOpen(false)}
                  className="w-full"
                >
                  View full bag
                </ButtonLink>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success";
}) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className={tone === "success" ? "text-success" : "text-ink"}>{value}</dd>
    </div>
  );
}

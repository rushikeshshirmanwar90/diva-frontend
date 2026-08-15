"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Heart,
  MapPin,
  Minus,
  Plus,
  RotateCcw,
  ShoppingBag,
  Truck,
} from "lucide-react";
import type { Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/ui/price";
import { Rating } from "@/components/ui/rating";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store/store";
import { GST_RATE } from "@/lib/format";
import { cn } from "@/lib/cn";

export function BuyBox({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, isWishlisted, markViewed, notify } = useStore();
  const firstAvailable =
    product.variants.find((v) => v.stock > 0) ?? product.variants[0]!;
  const [variantId, setVariantId] = useState(firstAvailable.id);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    markViewed(product.slug);
  }, [markViewed, product.slug]);

  const variant = product.variants.find((v) => v.id === variantId) ?? firstAvailable;
  const unitPrice = product.price + variant.priceDelta;
  const unitMrp = product.mrp + variant.priceDelta;
  const saved = isWishlisted(product.slug);


  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {product.badges.map((b) => (
          <Badge key={b} tone={b} />
        ))}
        <span className="text-[10px] tracking-luxe uppercase text-muted">
          {product.attributes.certification}
        </span>
      </div>

      <h1 className="mt-4 font-display text-3xl leading-tight font-light text-ink lg:text-[2.6rem]">
        {product.title}
      </h1>
      <p className="mt-2 text-sm text-muted">{product.subtitle}</p>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <Rating value={product.ratingAvg} count={product.ratingCount} />
        <Link
          href="#reviews"
          className="link-underline text-[11px] tracking-luxe uppercase text-charcoal"
        >
          Read reviews
        </Link>
      </div>

      <div className="mt-7 border-y border-line py-6">
        <Price price={unitPrice} mrp={unitMrp} size="lg" />
        {/*
          No itemised breakdown: this is a fixed-price catalogue, so there is no
          metal value or making charge to itemise. The old version split the
          price into invented percentages, which is a fabricated number shown to
          a customer as if it were a fact about their purchase.
        */}
        <p className="mt-2 text-xs text-muted">
          Inclusive of {Math.round(GST_RATE * 100)}% GST · free insured delivery
        </p>
      </div>

      {/* Variant picker */}
      <div className="mt-7">
        <div className="flex items-baseline justify-between">
          <p className="text-[11px] tracking-luxe uppercase text-ink">
            {product.variantLabel}
          </p>
          <span className="text-[11px] text-muted">
            {variant.stock > 0
              ? variant.stock <= 3
                ? `Only ${variant.stock} left`
                : "In stock"
              : "Made to order · 6–8 weeks"}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {product.variants.map((v) => {
            const isActive = v.id === variant.id;
            const soldOut = v.stock === 0;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setVariantId(v.id)}
                className={cn(
                  "relative min-w-14 border px-4 py-2.5 text-sm transition-all",
                  isActive
                    ? "border-charcoal bg-charcoal text-white"
                    : "border-line text-charcoal hover:border-charcoal",
                  soldOut && !isActive && "text-muted/60",
                )}
              >
                {v.label}
                {soldOut && (
                  <span className="absolute inset-x-1 top-1/2 h-px -rotate-12 bg-muted/40" />
                )}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-muted">
          SKU {variant.sku}
          {product.attributes.metal ? ` · ${product.attributes.metal}` : ""}
        </p>
      </div>

      {/* Quantity + actions */}
      <div className="mt-7 flex flex-wrap items-stretch gap-3">
        <div className="flex items-center border border-line">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            className="flex size-12 items-center justify-center text-charcoal hover:text-gold"
          >
            <Minus width={14} height={14} />
          </button>
          <span className="w-10 text-center text-sm">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(5, q + 1))}
            aria-label="Increase quantity"
            className="flex size-12 items-center justify-center text-charcoal hover:text-gold"
          >
            <Plus width={14} height={14} />
          </button>
        </div>

        <Button
          variant="gold"
          size="lg"
          className="flex-1"
          onClick={() => addToCart(product.slug, variant.id, qty)}
        >
          <ShoppingBag width={15} height={15} />
          {variant.stock > 0 ? "Add to bag" : "Pre-order"}
        </Button>

        <Button
          variant="outline"
          size="lg"
          aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
          onClick={() => toggleWishlist(product.slug)}
          className="px-5"
        >
          <Heart
            width={16}
            height={16}
            className={saved ? "fill-gold text-gold" : undefined}
          />
        </Button>
      </div>

      <PincodeCheck onNotify={notify} />

      <ul className="mt-8 grid gap-4 border-t border-line pt-8 sm:grid-cols-3">
        {[
          { icon: Truck, label: "Insured delivery", sub: "2–4 working days" },
          { icon: RotateCcw, label: "15-day returns", sub: "Free size exchange" },
          { icon: BadgeCheck, label: product.attributes.huid, sub: "BIS verifiable" },
        ].map(({ icon: Icon, label, sub }) => (
          <li key={label} className="flex gap-3">
            <Icon width={18} height={18} strokeWidth={1.3} className="mt-0.5 shrink-0 text-gold" />
            <div>
              <p className="text-[10px] tracking-luxe uppercase text-ink">{label}</p>
              <p className="mt-0.5 text-[11px] text-muted">{sub}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Purely local — a real pincode check hits the Shiprocket serviceability API. */
function PincodeCheck({
  onNotify,
}: {
  onNotify: (message: string) => void;
}) {
  const [pincode, setPincode] = useState("");
  const [result, setResult] = useState<string | null>(null);

  return (
    <div className="mt-6 border border-line p-5">
      <div className="flex items-center gap-2">
        <MapPin width={15} height={15} strokeWidth={1.4} className="text-gold" />
        <p className="text-[11px] tracking-luxe uppercase text-ink">
          Check delivery date
        </p>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!/^\d{6}$/.test(pincode)) {
            setResult("Enter a valid 6-digit pincode.");
            return;
          }
          const days = 2 + (Number(pincode.slice(-1)) % 4);
          const date = new Date();
          date.setDate(date.getDate() + days);
          setResult(
            `Delivers by ${date.toLocaleDateString("en-IN", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })} · free insured shipping`,
          );
          onNotify("Serviceable — insured delivery available");
        }}
        className="mt-3 flex gap-3"
      >
        <input
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          placeholder="560001"
          aria-label="Pincode"
          className="w-32 border-b border-line bg-transparent pb-1.5 text-sm text-ink outline-none focus:border-gold"
        />
        <button
          type="submit"
          className="text-[10px] tracking-luxe uppercase text-gold hover:underline"
        >
          Check
        </button>
      </form>
      {result && <p className="mt-3 text-xs text-success">{result}</p>}
    </div>
  );
}

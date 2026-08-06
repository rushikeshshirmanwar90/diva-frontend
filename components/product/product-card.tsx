"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/ui/price";
import { Rating } from "@/components/ui/rating";
import { useStore } from "@/lib/store/store";
import { cn } from "@/lib/cn";
import { discountPercent } from "@/lib/format";

export function ProductCard({
  product,
  priority = false,
  className,
}: {
  product: Product;
  priority?: boolean;
  className?: string;
}) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const saved = isWishlisted(product.slug);
  const hover = product.images[1] ?? product.images[0];
  const inStock = product.variants.some((v) => v.stock > 0);
  const firstAvailable =
    product.variants.find((v) => v.stock > 0) ?? product.variants[0];
  const off = discountPercent(product.price, product.mrp);

  return (
    <article className={cn("group", className)}>
      <div className="relative aspect-4/5 overflow-hidden bg-beige">
        <Image
          src={product.images[0]!}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={priority}
          className="object-cover transition-all duration-700 ease-out group-hover:scale-[1.04] group-hover:opacity-0"
        />
        <Image
          src={hover!}
          alt=""
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="scale-[1.04] object-cover opacity-0 transition-all duration-700 ease-out group-hover:scale-100 group-hover:opacity-100"
        />

        {/* Whole-image click target, kept as a sibling so the buttons below stay valid HTML */}
        <Link
          href={`/product/${product.slug}`}
          className="absolute inset-0 z-10"
          aria-label={product.title}
        />

        <div className="pointer-events-none absolute top-3 left-3 z-20 flex flex-col items-start gap-1.5">
          {product.badges.map((b) => (
            <Badge key={b} tone={b} />
          ))}
          {off >= 10 && <Badge tone="sale">{off}% off</Badge>}
        </div>

        <button
          type="button"
          onClick={() => toggleWishlist(product.slug)}
          aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
          aria-pressed={saved}
          className="absolute top-3 right-3 z-20 flex size-9 items-center justify-center rounded-full bg-white/85 backdrop-blur transition hover:bg-white"
        >
          <Heart
            width={15}
            height={15}
            strokeWidth={1.6}
            className={saved ? "fill-gold text-gold" : "text-charcoal"}
          />
        </button>

        {!inStock ? (
          <div className="absolute inset-x-0 bottom-0 z-20 bg-charcoal/85 py-2 text-center text-[10px] tracking-luxe uppercase text-white">
            Made to order
          </div>
        ) : (
          <button
            type="button"
            onClick={() => firstAvailable && addToCart(product.slug, firstAvailable.id)}
            className="absolute bottom-4 left-1/2 z-20 hidden -translate-x-1/2 translate-y-2 items-center gap-2 bg-white px-5 py-3 text-[10px] tracking-luxe whitespace-nowrap uppercase text-charcoal opacity-0 shadow-[0_10px_30px_rgba(0,0,0,0.14)] transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100 lg:flex"
          >
            <ShoppingBag width={13} height={13} /> Add to bag
          </button>
        )}
      </div>

      <div className="pt-4">
        <p className="eyebrow">{product.attributes.metal}</p>
        <h3 className="mt-1.5 font-display text-lg leading-snug font-normal text-ink">
          <Link href={`/product/${product.slug}`} className="hover:text-gold">
            {product.title}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-1 text-xs text-muted">{product.subtitle}</p>
        <div className="mt-2.5">
          <Price price={product.price} mrp={product.mrp} size="sm" />
        </div>
        <Rating
          value={product.ratingAvg}
          count={product.ratingCount}
          className="mt-2"
        />
      </div>
    </article>
  );
}

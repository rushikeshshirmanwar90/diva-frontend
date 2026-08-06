import type { Coupon, Product, Variant } from "@/lib/types";
import {
  FREE_SHIPPING_THRESHOLD,
  GST_RATE,
  SHIPPING_CHARGE,
} from "@/lib/format";

export type ResolvedLine = {
  key: string;
  product: Product;
  variant: Variant;
  qty: number;
  unitPrice: number;
  unitMrp: number;
  lineTotal: number;
};

export type CartTotals = {
  itemCount: number;
  subtotal: number;
  savings: number;
  couponDiscount: number;
  taxable: number;
  gst: number;
  shipping: number;
  total: number;
};

export function couponDiscountFor(subtotal: number, coupon: Coupon | null) {
  if (!coupon || subtotal < coupon.minCartValue) return 0;
  if (coupon.type === "flat") return Math.min(coupon.value, subtotal);
  const raw = Math.round((subtotal * coupon.value) / 100);
  return coupon.maxDiscount ? Math.min(raw, coupon.maxDiscount) : raw;
}

/**
 * The one place cart arithmetic happens. In production this computation moves
 * to the server (implementation.md §4 "server-authoritative pricing") — the
 * shape stays the same so the UI does not change.
 */
export function computeTotals(
  lines: ResolvedLine[],
  coupon: Coupon | null,
): CartTotals {
  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const mrpTotal = lines.reduce((sum, l) => sum + l.unitMrp * l.qty, 0);
  const couponDiscount = couponDiscountFor(subtotal, coupon);
  const taxable = subtotal - couponDiscount;
  const gst = Math.round(taxable * GST_RATE);
  const shipping =
    taxable === 0 || taxable >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_CHARGE;

  return {
    itemCount: lines.reduce((n, l) => n + l.qty, 0),
    subtotal,
    savings: Math.max(0, mrpTotal - subtotal),
    couponDiscount,
    taxable,
    gst,
    shipping,
    total: taxable + gst + shipping,
  };
}

/** Money helpers. Everything is paise (integers) per implementation.md §5.1. */

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** 12990000 → "₹1,29,900" */
export function formatPaise(paise: number): string {
  return inr.format(Math.round(paise / 100));
}

/** ₹ amount → paise, for authoring mock data readably. */
export function rupees(amount: number): number {
  return Math.round(amount * 100);
}

export function discountPercent(price: number, mrp: number): number {
  if (mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** GST on jewellery — 3% for the demo. Real rates need §11 question 3 answered. */
export const GST_RATE = 0.03;

/**
 * Free shipping above this cart value (paise).
 *
 * Currently 0, which makes shipping free on every order. `SHIPPING_CHARGE` is
 * kept at its real value so restoring the policy is a one-line change back to
 * `rupees(2000)`.
 *
 * These are only what the storefront *displays*. The amount actually charged
 * comes from the backend's store settings document
 * (`shipping.freeShippingThresholdPaise` / `flatRatePaise`), which
 * `order.service.ts` uses to build `grandTotalPaise` — the figure PhonePe
 * collects. The two must be changed together, or the cart quotes one number
 * and the gateway takes another.
 */
export const FREE_SHIPPING_THRESHOLD = rupees(0);
export const SHIPPING_CHARGE = rupees(99);

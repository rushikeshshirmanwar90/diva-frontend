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

/** Free shipping above this cart value (paise). */
export const FREE_SHIPPING_THRESHOLD = rupees(2000);
export const SHIPPING_CHARGE = rupees(99);

/**
 * Shapes for the demo storefront.
 *
 * These mirror the collections in `implementation.md` §5 closely enough that
 * swapping the mock data for `openapi-typescript` generated types later is a
 * find-and-replace, not a rewrite. Money is always paise (integers).
 */

export type Metal =
  | "22K Gold"
  | "18K Gold"
  | "14K Rose Gold"
  | "Platinum"
  | "925 Silver";

export type Stone =
  | "Diamond"
  | "Ruby"
  | "Emerald"
  | "Sapphire"
  | "Pearl"
  | "Uncut Polki"
  | "None";

export type Gender = "Women" | "Men" | "Unisex" | "Kids";

export type Occasion =
  | "Bridal"
  | "Festive"
  | "Daily Wear"
  | "Office"
  | "Gifting"
  | "Party";

export type Variant = {
  id: string;
  /** Size / length label shown on the PDP, e.g. "16" or "18 in". */
  label: string;
  sku: string;
  stock: number;
  /** Added to the parent price, in paise. Weight-driven in real life. */
  priceDelta: number;
  weightGrams: number;
};

export type Product = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  categorySlug: string;
  collectionSlugs: string[];
  /** Base price in paise, before variant delta. */
  price: number;
  /** Struck-through list price in paise. */
  mrp: number;
  images: string[];
  attributes: {
    metal: Metal;
    purity: string;
    stone: Stone;
    stoneWeight?: string;
    grossWeight: string;
    gender: Gender;
    occasions: Occasion[];
    huid: string;
    certification: string;
  };
  variantLabel: string;
  variants: Variant[];
  ratingAvg: number;
  ratingCount: number;
  badges: Array<"new" | "bestseller" | "limited">;
  /** ISO date — drives the "New Arrivals" sort. */
  createdAt: string;
};

export type Category = {
  slug: string;
  name: string;
  blurb: string;
  image: string;
  displayOrder: number;
};

export type Collection = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
};

export type Review = {
  id: string;
  productSlug: string;
  author: string;
  city: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verifiedPurchase: boolean;
  images?: string[];
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  body: string[];
  image: string;
  author: string;
  readMinutes: number;
  publishedAt: string;
  tag: string;
};

export type Testimonial = {
  id: string;
  name: string;
  city: string;
  quote: string;
  rating: number;
};

export type Coupon = {
  code: string;
  label: string;
  type: "percent" | "flat";
  value: number;
  minCartValue: number;
  maxDiscount?: number;
};

export type DemoOrder = {
  orderNumber: string;
  placedAt: string;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "SHIPPED"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED"
    | "CANCELLED";
  items: Array<{
    productSlug: string;
    title: string;
    variantLabel: string;
    image: string;
    price: number;
    qty: number;
  }>;
  total: number;
  courier?: string;
  awb?: string;
  timeline: Array<{ label: string; date: string; done: boolean }>;
};

export type Address = {
  id: string;
  label: string;
  name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
};

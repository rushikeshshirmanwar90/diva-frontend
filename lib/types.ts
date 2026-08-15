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
  /** Size / colour label shown on the PDP, e.g. "16" or "Rose Gold". */
  label: string;
  sku: string;
  stock: number;
  /**
   * Added to the parent price, in paise.
   *
   * Always 0 now that the catalogue is fixed-price: every colour and size of a
   * design costs the same. Kept because the cart and PDP arithmetic reads it,
   * and because a future per-variant price would land here rather than needing
   * a new field threaded through those call sites.
   */
  priceDelta: number;
  /** The colour token, for variants that vary by finish rather than size. */
  colour?: string;
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
  /**
   * Everything here is optional, because the catalogue is fixed-price plated
   * jewellery and the backend simply does not store the bullion specification
   * any more — no purity, no gross weight, no HUID, no stone grading.
   *
   * The UI renders whatever is present and omits the rest, rather than printing
   * "—" down a spec table. `metal` now carries the variant's **finish** (Gold,
   * Rose Gold, Oxidised) since that is what a customer is choosing between.
   */
  attributes: {
    metal?: string;
    purity?: string;
    stone?: string;
    stoneWeight?: string;
    grossWeight?: string;
    gender?: Gender;
    occasions: Occasion[];
    huid?: string;
    certification?: string;
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
  /** Square tile — nav rails, category grids. */
  image: string;
  /** Wide hero — the category landing page's header banner. */
  bannerImage: string;
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
  /** Optional: the backend does not store a reviewer location. */
  city?: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verifiedPurchase: boolean;
  images?: string[];
  helpfulCount?: number;
  /** The seller’s response, shown beneath the review. */
  reply?: { body: string; at: string } | null;
};

export type HeroCta = { label: string; href: string };

export type HeroSlide = {
  id: string;
  heading: string;
  subtitle: string;
  image: string;
  imageAlt: string;
  cta: HeroCta;
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


import "server-only";
import { cache } from "react";
import type { Category, Collection, Occasion, Product, Review, Variant } from "@/lib/types";
import { backendUrl } from "@/lib/domain";

/**
 * The catalogue, from the backend.
 *
 * This replaced the hand-written array in `products.ts`. The storefront now
 * shows exactly what has been added through the admin console and nothing else
 * — which is also what makes a real order possible, since the checkout sends
 * MongoDB ids and the demo data's `"neck-navratna-16"` was never one.
 *
 * Server-only on purpose. It talks to the backend directly rather than through
 * the BFF proxy: the proxy exists so the *browser* never learns the backend's
 * address, and a server component is already on the right side of that line.
 *
 * Every export is wrapped in React's `cache`, so a page that asks for the
 * catalogue in three components fetches once per request.
 */

// ---------------------------------------------------------------------------
// Backend shapes — only the fields this module reads
// ---------------------------------------------------------------------------

type ApiImage = { url: string; alt: string };

type ApiVariant = {
  _id: string;
  sku: string;
  colour: string;
  size?: string;
  stock: number;
  reservedStock: number;
  isActive: boolean;
};

type ApiProduct = {
  _id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  categoryIds: string[];
  collectionIds?: string[];
  images: ApiImage[];
  pricePaise: number;
  compareAtPricePaise?: number | null;
  variants: ApiVariant[];
  attributes?: { gender?: string; occasions?: string[]; certification?: string };
  ratingAvg: number;
  ratingCount: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  createdAt: string;
};

type ApiCategory = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: ApiImage;
  // Wide hero for the category landing page — distinct from `image`, which
  // is the square tile used in nav rails and category grids. Present on both
  // `GET /categories` and `GET /categories/:slug`.
  bannerImage?: ApiImage;
  displayOrder: number;
};

type ApiCollection = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  bannerImage?: ApiImage;
};

type ApiReview = {
  _id: string;
  rating: number;
  title?: string;
  body?: string;
  images?: ApiImage[];
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  reply?: { body: string; repliedAt: string } | null;
  createdAt: string;
  authorName: string;
};

type Envelope<T> = { success: true; data: T } | { success: false; error: { message: string } };

// ---------------------------------------------------------------------------
// Fetching
// ---------------------------------------------------------------------------

/**
 * Returns `null` rather than throwing when the backend is unreachable.
 *
 * The storefront is also a click-through demo that has to render with nothing
 * running behind it. A dead backend should produce an empty shelf, not a 500 on
 * the home page — and it must produce that empty shelf on *every* request the
 * backend is down for, not just the first one.
 *
 * `cache: "no-store"` rather than `next: { revalidate }` is what makes that
 * true: Next's ISR-style cache does not evict an entry when a background
 * revalidation fails, it just keeps serving the last successful response
 * indefinitely — so a backend that goes down *after* a successful load would
 * silently keep showing stale (eventually wrong) catalogue data instead of
 * ever reaching the `catch` below again. Every read now hits the backend for
 * real, which is the only way to know it is actually down.
 */
async function get<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(backendUrl(path), {
      cache: "no-store",
      headers: { accept: "application/json" },
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as Envelope<T>;
    return payload.success ? payload.data : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Mapping
// ---------------------------------------------------------------------------

/** `ROSE_GOLD` → `Rose Gold`. Mirrors the admin console's own label helper. */
function titleCase(token: string): string {
  return token
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Backend occasion tokens → the storefront's vocabulary.
 *
 * The two lists were written independently and do not line up one-to-one:
 * `WEDDING` and `ENGAGEMENT` both read as "Bridal" to a shopper, and `GIFT`
 * appears as "Gifting". Anything unrecognised is dropped rather than shown raw,
 * because `DAILY_WEAR` in a filter chip looks like a bug.
 */
const OCCASION_LABELS: Record<string, Occasion> = {
  DAILY_WEAR: "Daily Wear",
  WEDDING: "Bridal",
  ENGAGEMENT: "Bridal",
  FESTIVAL: "Festive",
  PARTY: "Party",
  OFFICE: "Office",
  GIFT: "Gifting",
};

const GENDER_LABELS: Record<string, Product["attributes"]["gender"]> = {
  WOMEN: "Women",
  MEN: "Men",
  UNISEX: "Unisex",
  KIDS: "Kids",
};

/**
 * One buyable option.
 *
 * The label is the size when a design has sizes, and the finish when it does
 * not — a shopper picking between "Gold" and "Rose Gold" needs to see those
 * words, and a ring in size 14 needs to see the number.
 */
function toVariant(variant: ApiVariant): Variant {
  return {
    id: variant._id,
    label: variant.size?.trim() || titleCase(variant.colour),
    sku: variant.sku,
    // What the shopper can actually buy: held stock belongs to open checkouts.
    stock: Math.max(0, variant.stock - variant.reservedStock),
    priceDelta: 0,
    colour: variant.colour,
  };
}

/** id → slug for both taxonomies, so a product can name the edits it is in. */
type SlugMaps = { categories: Map<string, string>; collections: Map<string, string> };

function toProduct(product: ApiProduct, slugs: SlugMaps): Product {
  const variants = product.variants.filter((variant) => variant.isActive).map(toVariant);
  const colours = [...new Set(product.variants.map((variant) => variant.colour))];

  const badges: Product["badges"] = [];
  if (product.isNewArrival) badges.push("new");
  if (product.isFeatured) badges.push("bestseller");

  return {
    id: product._id,
    slug: product.slug,
    title: product.title,
    subtitle: product.shortDescription ?? "",
    description: product.description ?? "",
    categorySlug: slugs.categories.get(product.categoryIds?.[0] ?? "") ?? "",
    collectionSlugs: (product.collectionIds ?? [])
      .map((id) => slugs.collections.get(id))
      .filter((slug): slug is string => Boolean(slug)),
    price: product.pricePaise,
    // No compare-at price means no strike-through: equal values render as one.
    mrp: product.compareAtPricePaise ?? product.pricePaise,
    images: product.images?.map((image) => image.url) ?? [],
    attributes: {
      // The finish, where the metal used to be. One colour reads as a fact
      // about the piece; several would be a lie on a card that shows one line.
      metal: colours.length === 1 && colours[0] ? titleCase(colours[0]) : undefined,
      gender: product.attributes?.gender ? GENDER_LABELS[product.attributes.gender] : undefined,
      occasions: (product.attributes?.occasions ?? [])
        .map((occasion) => OCCASION_LABELS[occasion])
        .filter((occasion): occasion is Occasion => Boolean(occasion)),
      certification: product.attributes?.certification,
    },
    // Sizes are the axis when they exist; otherwise the shopper picks a finish.
    variantLabel: product.variants.some((variant) => variant.size?.trim()) ? "Size" : "Colour",
    variants,
    ratingAvg: product.ratingAvg ?? 0,
    ratingCount: product.ratingCount ?? 0,
    badges,
    createdAt: product.createdAt,
  };
}

function toCategory(category: ApiCategory): Category {
  return {
    slug: category.slug,
    name: category.name,
    blurb: category.description ?? "",
    image: category.image?.url ?? "",
    // Falls back to the tile rather than an empty string — a category
    // without a dedicated banner yet still gets a header image instead of a
    // bare charcoal band.
    bannerImage: category.bannerImage?.url || category.image?.url || "",
    displayOrder: category.displayOrder ?? 0,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const getCategories = cache(async (): Promise<Category[]> => {
  const categories = await get<ApiCategory[]>("/categories");
  return (categories ?? []).map(toCategory);
});

export const getCollections = cache(async (): Promise<Collection[]> => {
  const collections = await get<ApiCollection[]>("/collections");

  return (collections ?? []).map((collection) => ({
    slug: collection.slug,
    name: collection.name,
    // The backend keeps one description; the storefront shows a short tagline
    // above a longer blurb. Rather than inventing a second string, the same one
    // is used and the layout simply reads a little tighter.
    tagline: collection.description ?? "",
    description: collection.description ?? "",
    image: collection.bannerImage?.url ?? "",
  }));
});

/**
 * Every live product.
 *
 * One request, then filtered in memory. A store of this size does not need a
 * query per category page, and holding the whole list lets the existing helpers
 * stay the simple array operations they already were.
 */
export const getCatalogue = cache(async (): Promise<Product[]> => {
  const [listed, slugs] = await Promise.all([
    get<{ items: ApiProduct[] } | ApiProduct[]>("/products?limit=100&sort=newest"),
    getSlugMaps(),
  ]);

  // The endpoint returns a bare array; the paginated envelope is tolerated too
  // so a future `meta`-carrying response does not silently yield nothing.
  const items = Array.isArray(listed) ? listed : (listed?.items ?? []);

  return items.map((product) => toProduct(product, slugs));
});

const getSlugMaps = cache(async (): Promise<SlugMaps> => {
  const [categories, collections] = await Promise.all([
    get<ApiCategory[]>("/categories"),
    get<ApiCollection[]>("/collections"),
  ]);

  return {
    categories: new Map((categories ?? []).map((entry) => [entry._id, entry.slug])),
    collections: new Map((collections ?? []).map((entry) => [entry._id, entry.slug])),
  };
});

/**
 * One product, by slug, with the fields only the detail endpoint carries.
 *
 * The listing projection trims `description` and the full variant set, so a
 * product page asks for its own copy rather than rendering the summary.
 */
export const getProduct = cache(async (slug: string): Promise<Product | undefined> => {
  const [detail, slugs] = await Promise.all([
    get<ApiProduct>(`/products/${encodeURIComponent(slug)}`),
    getSlugMaps(),
  ]);

  if (!detail) return undefined;

  return toProduct(detail, slugs);
});

/**
 * Approved reviews for one product.
 *
 * Only approved ones are ever returned — the backend enforces that, not this
 * call — so nothing unmoderated can reach a page by forgetting a filter here.
 */
export const getProductReviews = cache(async (slug: string): Promise<Review[]> => {
  const reviews = await get<ApiReview[]>(`/products/${encodeURIComponent(slug)}/reviews`);

  return (reviews ?? []).map((review) => ({
    id: review._id,
    productSlug: slug,
    author: review.authorName,
    rating: review.rating,
    title: review.title ?? "",
    body: review.body ?? "",
    date: review.createdAt,
    verifiedPurchase: review.isVerifiedPurchase,
    images: review.images?.map((image) => image.url),
    helpfulCount: review.helpfulCount,
    reply: review.reply ? { body: review.reply.body, at: review.reply.repliedAt } : null,
  }));
});

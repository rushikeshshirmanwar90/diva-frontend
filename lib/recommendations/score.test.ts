import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_WEIGHTS,
  DIVERSITY_SHARE,
  contentSimilarity,
  diversify,
  isPurchasable,
  priceProximity,
  ratingPrior,
  recommend,
  scoreCandidates,
  type Signals,
} from "./score.ts";
import type { Product } from "../types.ts";

/**
 * Run with `npm test` (Node's built-in runner; no framework to install).
 *
 * Every product below is built from `piece()` so a test states only the facts
 * it is about — everything else is a neutral default, which keeps a failing
 * assertion pointing at the rule that broke rather than at fixture noise.
 */

let counter = 0;

function piece(overrides: Partial<Product> & { slug: string }): Product {
  counter += 1;
  return {
    id: `id-${overrides.slug}`,
    title: overrides.slug,
    subtitle: "",
    description: "",
    categorySlug: "rings",
    collectionSlugs: [],
    price: 200_000,
    mrp: 200_000,
    images: [],
    attributes: { occasions: [] },
    variantLabel: "Colour",
    variants: [{ id: "v", label: "Gold", sku: "SKU", stock: 5, priceDelta: 0, colour: "GOLD" }],
    ratingAvg: 0,
    ratingCount: 0,
    badges: [],
    // Distinct, ascending, so tie-breaks are deterministic in tests too.
    createdAt: new Date(2026, 0, 1 + counter).toISOString(),
    ...overrides,
  };
}

const noSignals: Signals = { coPurchased: [], coViewed: [], volume: { orders: 0, visitors: 0 } };

describe("priceProximity", () => {
  it("is 1 for identical prices and within the full band", () => {
    assert.equal(priceProximity(1000, 1000), 1);
    assert.equal(priceProximity(1000, 1200), 1);
    assert.equal(priceProximity(1200, 1000), 1);
  });

  it("is 0 at three times the price or more", () => {
    assert.equal(priceProximity(1000, 3000), 0);
    assert.equal(priceProximity(1000, 9000), 0);
  });

  it("tapers between the band and the limit, symmetrically", () => {
    const up = priceProximity(1000, 2000);
    const down = priceProximity(2000, 1000);
    assert.ok(up > 0 && up < 1);
    assert.ok(Math.abs(up - down) < 1e-9);
  });

  it("is 0 when either price is missing", () => {
    assert.equal(priceProximity(0, 1000), 0);
    assert.equal(priceProximity(1000, 0), 0);
  });
});

describe("ratingPrior", () => {
  it("is neutral with no reviews", () => {
    assert.equal(ratingPrior(5, 0), 0);
    assert.equal(ratingPrior(0, 10), 0);
  });

  it("trusts a rating more as reviews accumulate", () => {
    const few = ratingPrior(5, 1);
    const many = ratingPrior(5, 50);
    assert.ok(many > few);
    assert.ok(many < 1);
  });

  it("penalises a poor rating rather than rewarding any rating", () => {
    assert.ok(ratingPrior(2, 20) < 0);
    assert.ok(ratingPrior(4.5, 20) > 0);
  });
});

describe("contentSimilarity", () => {
  it("recognises every shared attribute", () => {
    const source = piece({
      slug: "s",
      collectionSlugs: ["bridal", "festive"],
      attributes: { metal: "Gold", gender: "Women", occasions: ["Wedding", "Festival"] },
    });
    const twin = piece({
      slug: "t",
      collectionSlugs: ["bridal"],
      attributes: { metal: "Gold", gender: "Women", occasions: ["Wedding"] },
    });

    const c = contentSimilarity(source, twin);
    assert.equal(c.sameCategory, true);
    assert.equal(c.sharedCollections, 1);
    assert.equal(c.sameFinish, true);
    assert.equal(c.sameGender, true);
    assert.equal(c.occasionJaccard, 0.5);
    assert.equal(c.priceProximity, 1);
  });

  it("does not count two missing attributes as a match", () => {
    const a = piece({ slug: "a", categorySlug: "", attributes: { occasions: [] } });
    const b = piece({ slug: "b", categorySlug: "", attributes: { occasions: [] } });
    const c = contentSimilarity(a, b);
    assert.equal(c.sameCategory, false);
    assert.equal(c.sameFinish, false);
    assert.equal(c.sameGender, false);
    assert.equal(c.occasionJaccard, 0);
  });
});

describe("scoreCandidates", () => {
  it("never recommends the product itself or anything out of stock", () => {
    const source = piece({ slug: "source" });
    const soldOut = piece({
      slug: "sold-out",
      variants: [{ id: "v", label: "Gold", sku: "X", stock: 0, priceDelta: 0, colour: "GOLD" }],
    });
    const fine = piece({ slug: "fine" });

    const slugs = scoreCandidates(source, [source, soldOut, fine], noSignals).map((s) => s.product.slug);
    assert.deepEqual(slugs, ["fine"]);
    assert.equal(isPurchasable(soldOut), false);
  });

  it("ranks the closest content match first when there is no behaviour", () => {
    const source = piece({
      slug: "source",
      categorySlug: "necklaces",
      attributes: { metal: "Rose Gold", occasions: ["Wedding"] },
    });
    const twin = piece({
      slug: "twin",
      categorySlug: "necklaces",
      attributes: { metal: "Rose Gold", occasions: ["Wedding"] },
    });
    const sameCategoryOnly = piece({
      slug: "same-category",
      categorySlug: "necklaces",
      attributes: { metal: "Oxidised", occasions: ["Daily Wear"] },
      price: 50_000,
    });
    const unrelated = piece({
      slug: "unrelated",
      categorySlug: "anklets",
      attributes: { metal: "Silver", occasions: ["Office"] },
      price: 2_000_000,
    });

    const slugs = scoreCandidates(source, [twin, unrelated, sameCategoryOnly], noSignals).map(
      (s) => s.product.slug,
    );
    assert.deepEqual(slugs, ["twin", "same-category", "unrelated"]);
  });

  it("lets a strong co-purchase beat a perfect content match", () => {
    const source = piece({ slug: "source", categorySlug: "necklaces", attributes: { metal: "Gold", occasions: [] } });
    const twin = piece({ slug: "twin", categorySlug: "necklaces", attributes: { metal: "Gold", occasions: [] } });
    const boughtTogether = piece({
      slug: "earrings",
      categorySlug: "earrings",
      attributes: { metal: "Gold", occasions: [] },
    });

    const signals: Signals = {
      coPurchased: [{ slug: "earrings", count: 8 }],
      coViewed: [],
      volume: { orders: 10, visitors: 0 },
    };

    const ranked = scoreCandidates(source, [twin, boughtTogether], signals);
    assert.equal(ranked[0]!.product.slug, "earrings");
    assert.ok(ranked[0]!.parts.coPurchase > ranked[1]!.parts.content - ranked[0]!.parts.content);
  });

  it("discounts a single co-purchase on a high-volume product", () => {
    const source = piece({ slug: "source" });
    const a = piece({ slug: "a", categorySlug: "earrings" });

    const lowVolume = scoreCandidates(source, [a], {
      coPurchased: [{ slug: "a", count: 1 }],
      coViewed: [],
      volume: { orders: 2, visitors: 0 },
    })[0]!.parts.coPurchase;

    const highVolume = scoreCandidates(source, [a], {
      coPurchased: [{ slug: "a", count: 1 }],
      coViewed: [],
      volume: { orders: 300, visitors: 0 },
    })[0]!.parts.coPurchase;

    assert.ok(lowVolume > highVolume * 10, `expected ${lowVolume} ≫ ${highVolume}`);
  });

  it("weights co-purchase above co-view for the same share", () => {
    const source = piece({ slug: "source" });
    const a = piece({ slug: "a", categorySlug: "x" });
    const b = piece({ slug: "b", categorySlug: "x" });

    const ranked = scoreCandidates(source, [a, b], {
      coPurchased: [{ slug: "a", count: 3 }],
      coViewed: [{ slug: "b", count: 3 }],
      volume: { orders: 6, visitors: 6 },
    });

    assert.equal(ranked[0]!.product.slug, "a");
    assert.ok(ranked[0]!.parts.coPurchase > ranked[1]!.parts.coView);
  });

  it("uses a quality prior only to break near-ties", () => {
    const source = piece({ slug: "source" });
    const plain = piece({ slug: "plain" });
    const loved = piece({ slug: "loved", ratingAvg: 4.9, ratingCount: 40, badges: ["bestseller"] });
    const otherCategory = piece({ slug: "other", categorySlug: "bangles", ratingAvg: 5, ratingCount: 100, badges: ["bestseller"] });

    const slugs = scoreCandidates(source, [plain, loved, otherCategory], noSignals).map((s) => s.product.slug);
    // Same-category pieces first (content), the better-rated one ahead of the plain one.
    assert.deepEqual(slugs, ["loved", "plain", "other"]);
  });

  it("is deterministic on exact ties", () => {
    const source = piece({ slug: "source" });
    const a = piece({ slug: "a" });
    const b = piece({ slug: "b" });

    const first = scoreCandidates(source, [a, b], noSignals).map((s) => s.product.slug);
    const second = scoreCandidates(source, [b, a], noSignals).map((s) => s.product.slug);
    assert.deepEqual(first, second);
  });

  it("ignores signals for products no longer in the catalogue", () => {
    const source = piece({ slug: "source" });
    const a = piece({ slug: "a" });
    const ranked = scoreCandidates(source, [a], {
      coPurchased: [{ slug: "deleted-product", count: 50 }],
      coViewed: [],
      volume: { orders: 50, visitors: 0 },
    });
    assert.equal(ranked.length, 1);
    assert.equal(ranked[0]!.parts.coPurchase, 0);
  });
});

describe("diversify", () => {
  it("caps the source category at the diversity share while other categories remain", () => {
    const source = piece({ slug: "source", categorySlug: "rings" });
    const rings = Array.from({ length: 8 }, (_, i) =>
      piece({ slug: `ring-${i}`, categorySlug: "rings", attributes: { metal: `F${i}`, occasions: [] } }),
    );
    const others = Array.from({ length: 4 }, (_, i) =>
      piece({ slug: `bangle-${i}`, categorySlug: "bangles", attributes: { metal: `F${i}`, occasions: [] } }),
    );

    const limit = 8;
    const picked = diversify(source, scoreCandidates(source, [...rings, ...others], noSignals), limit);
    const ringCount = picked.filter((p) => p.categorySlug === "rings").length;

    assert.equal(picked.length, limit);
    assert.equal(ringCount, Math.ceil(limit * DIVERSITY_SHARE));
  });

  it("avoids repeating a category + finish pair while alternatives exist", () => {
    const source = piece({ slug: "source", categorySlug: "rings", attributes: { metal: "Gold", occasions: [] } });
    const gold1 = piece({ slug: "gold-1", attributes: { metal: "Gold", occasions: [] } });
    const gold2 = piece({ slug: "gold-2", attributes: { metal: "Gold", occasions: [] } });
    const rose = piece({ slug: "rose", attributes: { metal: "Rose Gold", occasions: [] } });

    const picked = diversify(source, scoreCandidates(source, [gold1, gold2, rose], noSignals), 2);
    const finishes = picked.map((p) => p.attributes.metal);
    assert.deepEqual(new Set(finishes).size, 2);
  });

  it("still fills the rail from a small single-category catalogue", () => {
    const source = piece({ slug: "source" });
    const rings = Array.from({ length: 5 }, (_, i) => piece({ slug: `ring-${i}` }));

    const picked = diversify(source, scoreCandidates(source, rings, noSignals), 8);
    assert.equal(picked.length, 5);
  });

  it("keeps best-first order within the rules", () => {
    const source = piece({ slug: "source", categorySlug: "rings" });
    const best = piece({ slug: "best", categorySlug: "rings", ratingAvg: 5, ratingCount: 50 });
    const good = piece({ slug: "good", categorySlug: "rings", ratingAvg: 4, ratingCount: 50 });
    const other = piece({ slug: "other", categorySlug: "bangles" });

    const picked = diversify(source, scoreCandidates(source, [good, other, best], noSignals), 3);
    assert.equal(picked[0]!.slug, "best");
  });

  it("returns nothing for a zero limit", () => {
    const source = piece({ slug: "source" });
    assert.deepEqual(diversify(source, scoreCandidates(source, [piece({ slug: "a" })], noSignals), 0), []);
  });
});

describe("recommend", () => {
  it("returns at most `limit` purchasable products, never the source", () => {
    const source = piece({ slug: "source" });
    const catalogue = [source, ...Array.from({ length: 20 }, (_, i) => piece({ slug: `p-${i}`, categorySlug: i % 3 === 0 ? "rings" : `cat-${i % 3}` }))];

    const result = recommend(source, catalogue, null, { limit: 6 });
    assert.equal(result.length, 6);
    assert.ok(!result.some((p) => p.slug === "source"));
    assert.ok(result.every(isPurchasable));
  });

  it("works with no signals at all (cold start)", () => {
    const source = piece({ slug: "source" });
    const result = recommend(source, [source, piece({ slug: "a" }), piece({ slug: "b" })], null);
    assert.equal(result.length, 2);
  });

  it("honours custom weights", () => {
    const source = piece({ slug: "source", categorySlug: "rings", price: 100_000 });
    const sameCategoryFarPrice = piece({ slug: "same-cat", categorySlug: "rings", price: 2_000_000 });
    const otherCategorySamePrice = piece({ slug: "same-price", categorySlug: "bangles", price: 100_000 });

    const priceOnly = { ...DEFAULT_WEIGHTS, sameCategory: 0, priceProximity: 10 };
    const result = recommend(source, [sameCategoryFarPrice, otherCategorySamePrice], null, { weights: priceOnly });
    assert.equal(result[0]!.slug, "same-price");
  });
});

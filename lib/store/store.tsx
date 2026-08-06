"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import type { Coupon } from "@/lib/types";
import { coupons } from "@/lib/data/content";
import { getProduct } from "@/lib/data/products";
import { computeTotals, type CartTotals, type ResolvedLine } from "@/lib/totals";
import {
  getServerSnapshot,
  getSnapshot,
  mutate,
  subscribe,
} from "@/lib/store/persisted";

/**
 * Client-side demo store. Cart, wishlist, recently-viewed and coupons live in
 * localStorage — there is no network call anywhere in this app. Each action maps
 * 1:1 onto an endpoint from implementation.md §6 Phase 4 when the backend lands.
 */

type Toast = { id: number; message: string; href?: string; linkLabel?: string };

type StoreValue = {
  hydrated: boolean;
  lines: ResolvedLine[];
  totals: CartTotals;
  addToCart: (productSlug: string, variantId: string, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  removeLine: (key: string) => void;
  clearCart: () => void;

  wishlist: string[];
  toggleWishlist: (productSlug: string) => void;
  isWishlisted: (productSlug: string) => boolean;

  recentlyViewed: string[];
  markViewed: (productSlug: string) => void;

  coupon: Coupon | null;
  applyCoupon: (code: string) => { ok: boolean; message: string };
  removeCoupon: () => void;

  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;

  toasts: Toast[];
  notify: (message: string, opts?: { href?: string; linkLabel?: string }) => void;

  placeOrder: () => string;
};

const StoreContext = createContext<StoreValue | null>(null);

function lineKey(productSlug: string, variantId: string) {
  return `${productSlug}::${variantId}`;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const persisted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const { cart, wishlist, viewed, couponCode, loaded } = persisted;

  const [cartOpen, setCartOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback(
    (message: string, opts?: { href?: string; linkLabel?: string }) => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, message, ...opts }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
    },
    [],
  );

  const lines = useMemo<ResolvedLine[]>(
    () =>
      cart.flatMap((line) => {
        const product = getProduct(line.productSlug);
        if (!product) return [];
        const variant =
          product.variants.find((v) => v.id === line.variantId) ?? product.variants[0];
        if (!variant) return [];
        const unitPrice = product.price + variant.priceDelta;
        return [
          {
            key: lineKey(product.slug, variant.id),
            product,
            variant,
            qty: line.qty,
            unitPrice,
            unitMrp: product.mrp + variant.priceDelta,
            lineTotal: unitPrice * line.qty,
          },
        ];
      }),
    [cart],
  );

  const coupon = useMemo(
    () => coupons.find((c) => c.code === couponCode) ?? null,
    [couponCode],
  );

  const totals = useMemo(() => computeTotals(lines, coupon), [lines, coupon]);

  const addToCart = useCallback(
    (productSlug: string, variantId: string, qty = 1) => {
      mutate((current) => {
        const existing = current.cart.find(
          (l) => l.productSlug === productSlug && l.variantId === variantId,
        );
        return {
          cart: existing
            ? current.cart.map((l) =>
                l === existing ? { ...l, qty: Math.min(10, l.qty + qty) } : l,
              )
            : [...current.cart, { productSlug, variantId, qty }],
        };
      });
      setCartOpen(true);
    },
    [],
  );

  const setQty = useCallback((key: string, qty: number) => {
    mutate((current) => ({
      cart: current.cart
        .map((l) =>
          lineKey(l.productSlug, l.variantId) === key
            ? { ...l, qty: Math.max(0, Math.min(10, qty)) }
            : l,
        )
        .filter((l) => l.qty > 0),
    }));
  }, []);

  const removeLine = useCallback((key: string) => {
    mutate((current) => ({
      cart: current.cart.filter((l) => lineKey(l.productSlug, l.variantId) !== key),
    }));
  }, []);

  const clearCart = useCallback(() => {
    mutate(() => ({ cart: [], couponCode: null }));
  }, []);

  const toggleWishlist = useCallback(
    (productSlug: string) => {
      const has = wishlist.includes(productSlug);
      mutate((current) => ({
        wishlist: has
          ? current.wishlist.filter((s) => s !== productSlug)
          : [productSlug, ...current.wishlist],
      }));
      notify(has ? "Removed from wishlist" : "Saved to your wishlist", {
        href: has ? undefined : "/wishlist",
        linkLabel: has ? undefined : "View wishlist",
      });
    },
    [notify, wishlist],
  );

  const isWishlisted = useCallback(
    (productSlug: string) => wishlist.includes(productSlug),
    [wishlist],
  );

  const markViewed = useCallback((productSlug: string) => {
    mutate((current) =>
      current.viewed[0] === productSlug
        ? {}
        : {
            viewed: [
              productSlug,
              ...current.viewed.filter((s) => s !== productSlug),
            ].slice(0, 8),
          },
    );
  }, []);

  const applyCoupon = useCallback(
    (code: string) => {
      const found = coupons.find(
        (c) => c.code.toLowerCase() === code.trim().toLowerCase(),
      );
      if (!found) return { ok: false, message: "That code isn't recognised." };
      if (totals.subtotal < found.minCartValue) {
        return {
          ok: false,
          message: `Valid on carts above ₹${Math.round(
            found.minCartValue / 100,
          ).toLocaleString("en-IN")}.`,
        };
      }
      mutate(() => ({ couponCode: found.code }));
      return { ok: true, message: `${found.code} applied — ${found.label}.` };
    },
    [totals.subtotal],
  );

  const removeCoupon = useCallback(() => {
    mutate(() => ({ couponCode: null }));
  }, []);

  const placeOrder = useCallback(() => {
    const orderNumber = `DIVA-2026-${10000 + Math.floor(Math.random() * 89999)}`;
    mutate(() => ({ cart: [], couponCode: null }));
    return orderNumber;
  }, []);

  const value: StoreValue = {
    hydrated: loaded,
    lines,
    totals,
    addToCart,
    setQty,
    removeLine,
    clearCart,
    wishlist,
    toggleWishlist,
    isWishlisted,
    recentlyViewed: viewed,
    markViewed,
    coupon,
    applyCoupon,
    removeCoupon,
    cartOpen,
    setCartOpen,
    toasts,
    notify,
    placeOrder,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}

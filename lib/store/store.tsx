"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useProductLookup, useProductLookupById } from "@/lib/data/catalogue-context";
import { computeTotals, type CartTotals, type ResolvedLine } from "@/lib/totals";
import { useAuth } from "@/lib/auth/auth-context";
import { addToWishlist, getWishlist, removeFromWishlist } from "@/lib/api/wishlist";
import {
  getServerSnapshot,
  getSnapshot,
  mutate,
  subscribe,
} from "@/lib/store/persisted";

/**
 * Client-side store. Cart, recently-viewed and coupons live in localStorage —
 * there is no account for those to sync to, so there is nothing a server copy
 * would buy. The wishlist is the exception: signed out, it is the same
 * localStorage array it has always been; signed in, `/api/v1/wishlist` is the
 * source of truth instead, so a piece saved on a phone shows up on a laptop.
 * See the wishlist section below for how that handoff works.
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

  /** The staged coupon code, unvalidated — the backend prices it for real at checkout. */
  coupon: string | null;
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
  const { cart, wishlist: localWishlist, viewed, couponCode, loaded } = persisted;

  /**
   * Cart lines persist as slugs, so each one is resolved against the live
   * catalogue on render. A line whose product has since been deleted or
   * unpublished resolves to nothing and drops out — which is the correct
   * outcome, and is why the totals below can never price a stale item.
   */
  const getProduct = useProductLookup();

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

  // ---------------------------------------------------------------------
  // Wishlist: localStorage for guests, the account for signed-in customers.
  // ---------------------------------------------------------------------

  const { status: authStatus } = useAuth();
  const getProductById = useProductLookupById();

  /** Slugs, once loaded from `/api/v1/wishlist`. Null = not loaded (yet, or signed out). */
  const [serverWishlist, setServerWishlist] = useState<string[] | null>(null);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Guards the one-time merge below against StrictMode's double-invoke and
  // against re-running on every unrelated re-render while authenticated.
  const mergedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      if (authStatus !== "authenticated") {
        // Signed out (or back to loading, e.g. after logout): the server
        // list no longer applies, and the next sign-in should merge fresh.
        if (!cancelled) setServerWishlist(null);
        mergedRef.current = false;
        return;
      }

      if (mergedRef.current) return;
      mergedRef.current = true;

      setWishlistLoading(true);
      try {
        const remote = await getWishlist();
        const remoteIds = new Set(remote.map((item) => item.productId));

        /**
         * Whatever was saved while signed out is merged in once, then
         * dropped from localStorage — from here on the account is the only
         * copy, so it can't drift back out of sync with a stale local list.
         */
        const guestSlugs = getSnapshot().wishlist;
        const merges = guestSlugs.flatMap((slug) => {
          const product = getProduct(slug);
          if (!product || remoteIds.has(product.id)) return [];
          return [addToWishlist(product.id).catch(() => null)];
        });

        if (merges.length > 0) await Promise.all(merges);
        if (cancelled) return;

        mutate(() => ({ wishlist: [] }));

        const finalRemote = merges.length > 0 ? await getWishlist() : remote;
        if (cancelled) return;

        const slugs = finalRemote
          .map((item) => getProductById(item.productId)?.slug)
          .filter((slug): slug is string => Boolean(slug));

        setServerWishlist(slugs);
      } catch {
        // Offline or the backend is unreachable — fall back to whatever was
        // saved locally rather than showing an empty wishlist.
        if (!cancelled) setServerWishlist(null);
      } finally {
        if (!cancelled) setWishlistLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authStatus]);

  const wishlist = useMemo(
    () => (authStatus === "authenticated" ? (serverWishlist ?? []) : localWishlist),
    [authStatus, serverWishlist, localWishlist],
  );

  const toggleWishlist = useCallback(
    (productSlug: string) => {
      if (authStatus === "authenticated") {
        const product = getProduct(productSlug);
        if (!product) return;

        const has = (serverWishlist ?? []).includes(productSlug);

        setServerWishlist((current) => {
          const base = current ?? [];
          return has ? base.filter((s) => s !== productSlug) : [productSlug, ...base];
        });

        const request = has
          ? removeFromWishlist(product.id)
          : addToWishlist(product.id);

        request.catch(() => {
          setServerWishlist((current) => {
            const base = current ?? [];
            return has ? [productSlug, ...base] : base.filter((s) => s !== productSlug);
          });
          notify("Could not update your wishlist. Please try again.");
        });

        notify(has ? "Removed from wishlist" : "Saved to your wishlist", {
          href: has ? undefined : "/wishlist",
          linkLabel: has ? undefined : "View wishlist",
        });
        return;
      }

      const has = localWishlist.includes(productSlug);
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
    [authStatus, serverWishlist, localWishlist, getProduct, notify],
  );

  const isWishlisted = useCallback(
    (productSlug: string) => wishlist.includes(productSlug),
    [wishlist],
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
    [cart, getProduct],
  );

  const coupon = couponCode;

  const totals = useMemo(() => computeTotals(lines), [lines]);

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

  /**
   * Stages a code, unchecked. The frontend has no independent view of the
   * backend's `Coupon` collection to validate against, so validating here
   * would mean re-encoding (and drifting from) the real rules — the code is
   * priced for real at checkout (`createOrder`'s `couponCode`), and an
   * invalid one surfaces there as a clear rejection instead of a fake local
   * "approval" that the order then contradicts.
   */
  const applyCoupon = useCallback((code: string) => {
    const normalised = code.trim().toUpperCase();
    if (!normalised) return { ok: false, message: "Enter a code." };

    mutate(() => ({ couponCode: normalised }));
    return { ok: true, message: `${normalised} will be applied at checkout.` };
  }, []);

  const removeCoupon = useCallback(() => {
    mutate(() => ({ couponCode: null }));
  }, []);

  const placeOrder = useCallback(() => {
    const orderNumber = `DIVA-2026-${10000 + Math.floor(Math.random() * 89999)}`;
    mutate(() => ({ cart: [], couponCode: null }));
    return orderNumber;
  }, []);

  const value: StoreValue = {
    hydrated: loaded && !wishlistLoading,
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

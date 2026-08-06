/**
 * localStorage-backed state, exposed as a React external store.
 *
 * Using `useSyncExternalStore` rather than a load-in-`useEffect` is deliberate:
 * the server and the hydration render both see `EMPTY`, so there is no hydration
 * mismatch, and React switches to the real snapshot immediately after mount
 * without a cascading setState-inside-an-effect.
 */

export type CartLine = { productSlug: string; variantId: string; qty: number };

export type PersistedState = {
  cart: CartLine[];
  wishlist: string[];
  viewed: string[];
  couponCode: string | null;
  /** False until localStorage has been read — used to avoid flashing empty UI. */
  loaded: boolean;
};

const EMPTY: PersistedState = {
  cart: [],
  wishlist: [],
  viewed: [],
  couponCode: null,
  loaded: false,
};

const KEY = "diva.store.v1";

let state: PersistedState = EMPTY;
let started = false;
const listeners = new Set<() => void>();

function readFromStorage(): PersistedState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY, loaded: true };
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      cart: Array.isArray(parsed.cart) ? parsed.cart : [],
      wishlist: Array.isArray(parsed.wishlist) ? parsed.wishlist : [],
      viewed: Array.isArray(parsed.viewed) ? parsed.viewed : [],
      couponCode: typeof parsed.couponCode === "string" ? parsed.couponCode : null,
      loaded: true,
    };
  } catch {
    return { ...EMPTY, loaded: true };
  }
}

function writeToStorage(next: PersistedState) {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        cart: next.cart,
        wishlist: next.wishlist,
        viewed: next.viewed,
        couponCode: next.couponCode,
      }),
    );
  } catch {
    // Private browsing or a full quota — the session simply won't persist.
  }
}

export function subscribe(onStoreChange: () => void) {
  // First subscriber triggers the read. React re-checks the snapshot straight
  // after subscribing, so no explicit notification is needed here.
  if (!started) {
    started = true;
    state = readFromStorage();
  }
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

export function getSnapshot(): PersistedState {
  return state;
}

export function getServerSnapshot(): PersistedState {
  return EMPTY;
}

/** Apply a change and notify subscribers. Safe to call from event handlers. */
export function mutate(
  updater: (current: PersistedState) => Partial<PersistedState>,
): void {
  const patch = updater(state);
  // An empty patch means "nothing to do" — don't churn subscribers.
  if (Object.keys(patch).length === 0) return;
  const next = { ...state, ...patch, loaded: true };
  state = next;
  writeToStorage(next);
  for (const listener of listeners) listener();
}

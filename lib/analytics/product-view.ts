/**
 * The product-page view beacon.
 *
 * Fire-and-forget: nothing here is awaited by the page, nothing here can
 * throw into it, and a blocked or failed request is simply a view that was
 * not counted. The customer's experience must not depend on analytics.
 *
 * Identity is an opaque random id minted once per browser and kept in
 * localStorage. It is not a fingerprint, is not sent anywhere else, and lets
 * the dashboard tell "50 views" from "50 people" — which is the number a
 * merchandiser actually wants.
 */

const VISITOR_KEY = "diva_vid";
const SEEN_KEY = "diva_seen";

function visitorId(): string | null {
  try {
    const existing = localStorage.getItem(VISITOR_KEY);
    if (existing) return existing;

    const fresh = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, fresh);
    return fresh;
  } catch {
    // Private mode with storage disabled: the view goes uncounted rather than
    // counted under a new "visitor" on every page.
    return null;
  }
}

/**
 * Once per product per tab session. React's development double-invoke of
 * effects, a `Back` to the same page, and the gallery re-mounting the buy box
 * are all one visit; the server dedupes too, but not sending is cheaper.
 */
function alreadySeenThisSession(slug: string): boolean {
  try {
    const seen = new Set<string>(JSON.parse(sessionStorage.getItem(SEEN_KEY) ?? "[]"));
    if (seen.has(slug)) return true;
    seen.add(slug);
    sessionStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
    return false;
  } catch {
    return false;
  }
}

export function recordProductView(slug: string): void {
  if (typeof window === "undefined") return;
  if (alreadySeenThisSession(slug)) return;

  const id = visitorId();
  if (!id) return;

  const body = JSON.stringify({
    visitorId: id,
    ...(document.referrer ? { referrer: document.referrer } : {}),
  });

  /**
   * `keepalive` lets the request outlive a navigation away — a customer who
   * lands, glances and taps Back is the exact visitor a bounce metric needs
   * counted. `sendBeacon` cannot set a JSON content type, so plain fetch.
   */
  void fetch(`/api/bff/products/${encodeURIComponent(slug)}/view`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
    keepalive: true,
    credentials: "same-origin",
  }).catch(() => {
    // Deliberately swallowed — see the module comment.
  });
}

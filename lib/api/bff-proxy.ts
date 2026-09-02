import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { backendUrl } from "@/lib/domain";

/**
 * Shared body for every `app/api/bff/**` route.
 *
 * The browser talks only to this origin; each route under `app/api/bff`
 * forwards its one fixed backend path (e.g. `/auth/login`, or
 * `/orders/${orderNumber}` for a dynamic segment) through `bffProxy`. That
 * buys three things:
 *
 *  1. **Session cookies work on unrelated domains.** The web auth scheme uses
 *     httpOnly cookies, and a cookie set by `api.diva.in` is simply not sent to
 *     `diva.com` — different registrable domains cannot share one, whatever
 *     `SameSite` says. Proxying makes the cookie first-party to the storefront,
 *     which removes the `COOKIE_DOMAIN` constraint entirely.
 *  2. **No CORS and no preflight.** Same-origin requests skip the OPTIONS round
 *     trip that every credentialed cross-origin mutation would otherwise pay.
 *  3. **The backend origin is not public.** It can sit on a private network
 *     with only this process able to reach it.
 *
 * What this is *not* is a security boundary of its own. It forwards
 * authentication rather than performing it — every rule still lives in the
 * backend, and a request that reaches here unauthenticated is rejected there.
 */

/**
 * Headers that must not be copied from the incoming request.
 *
 * `host` would make the backend build absolute URLs pointing at the storefront.
 * `connection`, `content-length` and the transfer headers describe *this* hop
 * and are recomputed by fetch — forwarding them produces truncated bodies and
 * hard-to-read 400s.
 */
const STRIPPED_REQUEST_HEADERS = new Set([
  "host",
  "connection",
  "content-length",
  "transfer-encoding",
  "keep-alive",
  "upgrade",
  "accept-encoding",
]);

/** Same idea in reverse: these describe the backend hop, not ours. */
const STRIPPED_RESPONSE_HEADERS = new Set([
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "connection",
  "keep-alive",
]);

/** Removes any `Domain=…` attribute so the cookie is host-only to this origin. */
function stripDomain(cookie: string): string {
  return cookie
    .split(";")
    .filter((part) => !/^\s*domain=/i.test(part))
    .join(";");
}

/**
 * Forwards `request` to `${API_ORIGIN}/api/v1${backendPath}`, preserving the
 * query string, and relays the response (including cookies) back verbatim.
 */
export async function bffProxy(request: NextRequest, backendPath: string): Promise<NextResponse> {
  const target = new URL(backendUrl(backendPath));
  target.search = request.nextUrl.search;

  const headers = new Headers();
  for (const [key, value] of request.headers) {
    if (!STRIPPED_REQUEST_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  }

  // Lets the backend log the real client rather than this server.
  const forwardedFor = request.headers.get("x-forwarded-for");
  headers.set(
    "x-forwarded-for",
    forwardedFor ?? request.headers.get("x-real-ip") ?? "unknown",
  );
  headers.set("x-forwarded-host", request.nextUrl.host);

  const hasBody = request.method !== "GET" && request.method !== "HEAD";

  let upstream: Response;

  try {
    upstream = await fetch(target, {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      redirect: "manual",
      cache: "no-store",
    });
  } catch (error) {
    console.error(`[bff] ${request.method} ${target.pathname} failed`, error);

    // Shaped like the backend's envelope so the client's error handling is
    // identical whether the API answered or was unreachable.
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVICE_UNAVAILABLE",
          message: "We could not reach our servers. Please try again in a moment.",
        },
      },
      { status: 503 },
    );
  }

  const responseHeaders = new Headers();
  for (const [key, value] of upstream.headers) {
    if (!STRIPPED_RESPONSE_HEADERS.has(key.toLowerCase()) && key.toLowerCase() !== "set-cookie") {
      responseHeaders.set(key, value);
    }
  }

  /**
   * Cookies need `getSetCookie()`, not `get()`.
   *
   * A login response sets three cookies, and `headers.get("set-cookie")` joins
   * them into one comma-separated string that browsers parse as a single
   * malformed cookie — so the session silently fails to establish. `Domain` is
   * stripped from each so they bind to the storefront host, which is the point
   * of proxying in the first place.
   */
  for (const cookie of upstream.headers.getSetCookie()) {
    responseHeaders.append("set-cookie", stripDomain(cookie));
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

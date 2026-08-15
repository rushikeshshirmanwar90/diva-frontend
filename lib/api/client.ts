/**
 * Browser-side API client.
 *
 * Every call goes to `/api/bff/*` on this origin, which relays to the backend.
 * Nothing in the browser knows the backend's address, and no request is ever
 * cross-origin — see `app/api/bff/[...path]/route.ts` for why that matters.
 *
 * Written once against the `{ success, data }` envelope so no caller repeats
 * the unwrapping, and so a failure is always a thrown `ApiError` with a `code`
 * to branch on rather than a shape each call site has to inspect.
 */

export type ApiFailure = {
  code: string;
  message: string;
  details?: Array<{ path: string; message: string }>;
};

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: ApiFailure["details"];

  constructor(status: number, failure: ApiFailure) {
    super(failure.message);
    this.name = "ApiError";
    this.status = status;
    this.code = failure.code;
    this.details = failure.details;
  }
}

type Envelope<T> =
  | { success: true; data: T; meta?: Record<string, unknown> }
  | { success: false; error: ApiFailure };

/**
 * Reads the CSRF token the backend set as a readable cookie and echoes it in a
 * header — the double-submit pattern.
 *
 * The cookie alone proves nothing: a form on another site can *cause* it to be
 * sent but, thanks to the same-origin policy, cannot *read* it to build the
 * matching header. Omitting this makes every mutation fail with a 403.
 */
function csrfToken(): string | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(/(?:^|;\s*)diva_csrf=([^;]+)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

type FetchInit = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
};

/** Requests that must never trigger a refresh — refreshing them would be circular. */
function isAuthPath(path: string): boolean {
  return (
    path.startsWith("/auth/refresh") ||
    path.startsWith("/auth/login") ||
    path.startsWith("/auth/logout")
  );
}

/**
 * The in-flight refresh, shared by every caller that hits a 401 at once.
 *
 * A page that fires four requests in parallel produces four simultaneous 401s
 * the moment the 15-minute access token lapses. Without this they would each
 * POST `/auth/refresh`, and because refresh tokens rotate, the first would
 * invalidate the token the other three are still holding — which the server
 * correctly treats as **token reuse** and punishes by revoking the whole
 * family. The result would be the opposite of what this is for: a hard
 * sign-out triggered by nothing worse than a busy page. Mirrors
 * `diva-backend/app/admin/_lib/api.ts`'s identical mechanism.
 */
let refreshInFlight: Promise<boolean> | null = null;

function refreshSession(): Promise<boolean> {
  refreshInFlight ??= (async () => {
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      const token = csrfToken();
      if (token) headers["X-CSRF-Token"] = token;

      const response = await fetch("/api/bff/auth/refresh", {
        method: "POST",
        headers,
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify({ audience: "storefront" }),
      });

      return response.ok;
    } catch {
      // Offline, or the server is down. Indistinguishable from an expired
      // session here, so treat it as a failed refresh and let the caller
      // fall back to the original 401.
      return false;
    } finally {
      // Cleared regardless of outcome so the *next* 401 gets a fresh attempt
      // rather than replaying this one's stale answer forever.
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

function buildHeaders(method: string, hasBody: boolean): Record<string, string> {
  const headers: Record<string, string> = {};

  if (hasBody) headers["Content-Type"] = "application/json";

  if (method !== "GET") {
    // Read per attempt, never hoisted: a refresh rotates the CSRF cookie, so
    // a replayed request after a refresh must carry the new token, not the
    // one that just expired.
    const token = csrfToken();
    if (token) headers["X-CSRF-Token"] = token;
  }

  return headers;
}

function send(path: string, method: string, body: unknown, signal?: AbortSignal): Promise<Response> {
  return fetch(`/api/bff${path}`, {
    method,
    headers: buildHeaders(method, body !== undefined),
    body: body === undefined ? undefined : JSON.stringify(body),
    // Same-origin, but explicit: without it the session cookie is not attached
    // on some older browsers' default policy.
    credentials: "same-origin",
    signal,
    cache: "no-store",
  });
}

/**
 * One API call, with the 15-minute access token made invisible.
 *
 * Access tokens are deliberately short-lived; the session's real length is
 * the refresh token's (2 days, sliding — see `REFRESH_TOKEN_TTL_DAYS` in
 * diva-backend). So a 401 here is not "signed out", it is routine: refresh
 * once and replay the request. Callers only ever see a real logged-out state
 * when the refresh itself fails, which means the session genuinely ended.
 */
async function request<T>(
  path: string,
  init: FetchInit,
): Promise<{ data: T; meta?: Record<string, unknown> }> {
  const method = init.method ?? "GET";

  let response = await send(path, method, init.body, init.signal);

  if (response.status === 401 && !isAuthPath(path)) {
    if (await refreshSession()) {
      response = await send(path, method, init.body, init.signal);
    }
  }

  // 204 has no body by design; parsing it throws.
  if (response.status === 204) return { data: undefined as T };

  try {
    const payload = (await response.json()) as Envelope<T>;
    if (!payload.success) throw new ApiError(response.status, payload.error);
    return payload;
  } catch (cause) {
    if (cause instanceof ApiError) throw cause;
    throw new ApiError(response.status, {
      code: "INTERNAL_ERROR",
      message: "The server sent an unreadable response. Please try again.",
    });
  }
}

export async function apiFetch<T>(path: string, init: FetchInit = {}): Promise<T> {
  const { data } = await request<T>(path, init);
  return data;
}

/**
 * Same as `apiFetch`, but keeps `meta` — the paginated list endpoints
 * (`/orders`, `/reviews/mine`, …) put `total` there, and a caller rendering
 * page numbers needs it alongside the items.
 */
export async function apiFetchWithMeta<T>(
  path: string,
  init: FetchInit = {},
): Promise<{ data: T; meta: Record<string, unknown> }> {
  const { data, meta } = await request<T>(path, init);
  return { data, meta: meta ?? {} };
}

/** Human-readable message from anything thrown, for rendering in the UI. */
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

/**
 * Whether the real checkout is wired up.
 *
 * The storefront doubles as a click-through demo for the client, and that demo
 * must keep working with no backend running. When this is false the checkout
 * falls back to the simulated order it has always produced.
 */
export const CHECKOUT_ENABLED = process.env.NEXT_PUBLIC_CHECKOUT_ENABLED === "true";

import "server-only";

/**
 * Single source of truth for where diva-frontend's server-side code reaches
 * diva-backend.
 *
 * Three places used to each hardcode the same `process.env.API_ORIGIN ??
 * "http://localhost:4000"` fallback: the BFF proxy the browser talks to
 * (`app/api/bff/[...path]/route.ts`), and the two server-only catalogue
 * readers (`lib/data/catalogue.ts`, `lib/data/hero.ts`). They now all import
 * from here, so pointing the app at a different backend — a staging
 * deployment, a teammate's machine — is a one-line change in this file (or
 * in `.env.local`'s `API_ORIGIN`), not a search-and-replace across three.
 *
 * No `NEXT_PUBLIC_` prefix on the env var: the backend's address must never
 * reach the browser bundle. The browser only ever talks to this origin's own
 * `/api/bff/*`, which is the whole point of the proxy — see that route file
 * for why. `server-only` enforces that at build time if anything ever tries
 * to import this from a client component.
 */

export const API_ORIGIN = "http://localhost:4000";

/**
 * Builds a `/api/v1/...` URL against the backend.
 *
 * `path` may or may not start with `/` — callers pass either a route
 * (`"/hero-slides"`) or path segments already joined
 * (`path.join("/")` from the BFF proxy) without needing to think about it.
 */
export function backendUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_ORIGIN}/api/v1${normalized}`;
}

"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/** Below this, a navigation is quick enough that an overlay would just flash. */
const SHOW_AFTER_MS = 180;

/**
 * Hard ceiling. Nothing should ever leave this on screen, but a veil that
 * cannot clear itself is far worse than one that clears too early — a missed
 * route change would otherwise leave the site looking frozen.
 */
const FAILSAFE_MS = 8000;

function BufferVeil() {
  const [visible, setVisible] = useState(false);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const failsafeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = useCallback(() => {
    if (showTimer.current || failsafeTimer.current) return;
    showTimer.current = setTimeout(() => setVisible(true), SHOW_AFTER_MS);
    failsafeTimer.current = setTimeout(() => setVisible(false), FAILSAFE_MS);
  }, []);

  useEffect(() => {
    /*
      Capture phase, on the document: there is no global "navigation pending"
      signal in the App Router — `useLinkStatus` only reports for the one
      `<Link>` it is rendered inside — so the start of a navigation has to be
      inferred from the click that causes it. Capture runs before any handler
      that might stop propagation.
    */
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      // Let the browser keep its own meanings for modified and non-left clicks.
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as Element | null)?.closest?.("a");
      if (!anchor) return;
      if (anchor.getAttribute("target") && anchor.getAttribute("target") !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      let url: URL;
      try {
        url = new URL((anchor as HTMLAnchorElement).href, window.location.href);
      } catch {
        return;
      }
      // Off-site links leave the app; the browser shows its own progress.
      if (url.origin !== window.location.origin) return;
      // A link to where we already are navigates nowhere.
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return;
      }

      start();
    };

    // Back/forward also re-render a route and can be just as slow.
    const onPopState = () => start();

    document.addEventListener("click", onClick, { capture: true });
    window.addEventListener("popstate", onPopState);

    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      window.removeEventListener("popstate", onPopState);
      if (showTimer.current) clearTimeout(showTimer.current);
      if (failsafeTimer.current) clearTimeout(failsafeTimer.current);
    };
  }, [start]);

  if (!visible) return null;

  return (
    <div
      /*
        `pointer-events-none` deliberately. Blocking input would stop double
        clicks, but the App Router treats navigation as interruptible and a veil
        that ever failed to clear would lock the whole site — the failsafe above
        should prevent that, and this makes it harmless if it ever does not.
      */
      className="pointer-events-none fixed inset-0 z-[90] flex animate-fade-in items-center justify-center bg-beige/75 backdrop-blur-[3px]"
      role="status"
      aria-live="polite"
    >
      <span className="relative flex size-16 items-center justify-center">
        {/* Outer gold hairline, clockwise. */}
        <span className="absolute inset-0 animate-spin rounded-full border border-gold/25 border-t-gold [animation-duration:1.1s]" />
        {/* Inner ring counter-rotating, so the two read as one mechanism. */}
        <span className="absolute inset-[0.45rem] animate-spin rounded-full border border-gold/20 border-b-gold-light [animation-direction:reverse] [animation-duration:1.7s]" />
        {/* Still centre: a small gold lozenge, the brand's recurring motif. */}
        <span className="size-1.5 rotate-45 bg-gold" />
      </span>
      <span className="sr-only">Loading page</span>
    </div>
  );
}

/**
 * Remounts `BufferVeil` on every committed route change, which is what clears
 * the veil.
 *
 * The obvious alternatives both draw a lint error and deserve one: resetting
 * the state from an effect keyed on the pathname repaints the veil once on top
 * of the page it was waiting for before clearing it, and clearing the timers
 * during render writes to refs mid-render. Remounting gets both for free — new
 * state starts hidden, and the old instance's effect cleanup cancels its own
 * timers and listeners.
 */
function KeyedVeil() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  return <BufferVeil key={`${pathname}?${searchParams}`} />;
}

/**
 * `useSearchParams` has to sit inside a Suspense boundary, otherwise it opts
 * every route that renders this — which is all of them, it lives in the root
 * layout — out of static rendering.
 */
export function NavigationBuffer() {
  return (
    <Suspense fallback={null}>
      <KeyedVeil />
    </Suspense>
  );
}

"use client";

import { useLinkStatus } from "next/link";
import { cn } from "@/lib/cn";

/**
 * Immediate feedback on the card you just tapped, for the gap `loading.tsx`
 * cannot cover.
 *
 * A route-level skeleton only appears once the router has the loading boundary
 * client-side, which means it has been prefetched. On a slow connection the
 * click can land first, and then nothing local changes — the tap reads as
 * ignored even though a navigation is under way. This fills exactly that gap
 * and is skipped entirely when the route was already prefetched.
 *
 * Must be rendered inside a `<Link>`; `useLinkStatus` reads that Link's state.
 *
 * The wrapper is always rendered at a fixed size and only its opacity moves,
 * because an element that appears on click would reflow the card underneath
 * the finger that just tapped it.
 */
export function LinkPendingOverlay({ className }: { className?: string }) {
  const { pending } = useLinkStatus();

  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-beige/60 backdrop-blur-[1px] transition-opacity duration-200",
        pending ? "opacity-100" : "opacity-0",
        className,
      )}
    >
      {/* Mounted only while pending, so an idle grid of twenty cards is not
          running twenty rotations behind `opacity: 0`. */}
      {pending && (
        <span className="size-8 animate-spin rounded-full border-2 border-gold/25 border-t-gold" />
      )}
    </span>
  );
}

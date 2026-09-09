"use client";

import { useEffect, useRef, useState } from "react";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Header } from "@/components/layout/header";

/**
 * `position: sticky` on a wrapping div is correct CSS and was verified
 * serving correctly, but a `fixed` bar with a JS-measured spacer is the
 * version nothing upstream can quietly break — it doesn't rely on being
 * inside any particular ancestor chain, so a future wrapper with its own
 * `overflow` or `transform` (the two classic ways a parent kills `sticky`
 * for everything inside it) can never take it down again.
 *
 * The spacer keeps page content from jumping underneath the now-out-of-flow
 * bar, and is re-measured on resize so it tracks the bar's real height —
 * the announcement marquee, the header, and the header's own scroll-compact
 * state all change that height at different times.
 */
export function StickyHeader() {
  const barRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      if (entry) setHeight(entry.contentRect.height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={barRef} className="fixed inset-x-0 top-0 z-50">
        <AnnouncementBar />
        <Header />
      </div>
      {/* Reserves the space the fixed bar above no longer occupies in flow. */}
      <div style={{ height }} aria-hidden />
    </>
  );
}

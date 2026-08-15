import "server-only";
import { cache } from "react";
import type { HeroSlide } from "@/lib/types";
import { backendUrl } from "@/lib/domain";

/**
 * The homepage hero carousel, from the backend.
 *
 * Same shape as `lib/data/catalogue.ts`: server-only, fetched directly from
 * the backend rather than through the BFF (this runs on the server already,
 * so there is no browser to keep the backend's address from), and deduplicated
 * per request (React's `cache`) so a page that reads it twice fetches once.
 *
 * `cache: "no-store"` rather than ISR — see the comment on `get()` in
 * `catalogue.ts` for why: a stale-tolerant cache would keep showing the last
 * slides it fetched even after the backend goes down, instead of the empty
 * fallback below.
 */

type ApiHeroSlide = {
  _id: string;
  heading: string;
  subtitle: string;
  image: { url: string; alt: string };
  cta: { label: string; href: string };
};

type Envelope<T> = { success: true; data: T } | { success: false };

export const getHeroSlides = cache(async (): Promise<HeroSlide[]> => {
  try {
    const response = await fetch(backendUrl("/hero-slides"), {
      cache: "no-store",
      headers: { accept: "application/json" },
    });

    if (!response.ok) return [];

    const payload = (await response.json()) as Envelope<ApiHeroSlide[]>;
    if (!payload.success) return [];

    return payload.data.map((slide) => ({
      id: slide._id,
      heading: slide.heading,
      subtitle: slide.subtitle,
      image: slide.image.url,
      imageAlt: slide.image.alt,
      cta: slide.cta,
    }));
  } catch {
    return [];
  }
});

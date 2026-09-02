import "server-only";
import { cache } from "react";
import type { HeroSlide } from "@/lib/types";
import { backendUrl } from "@/lib/domain";

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
import "server-only";
import { cache } from "react";
import type { Testimonial } from "@/lib/types";
import { backendUrl } from "@/lib/domain";

type ApiFeaturedReview = {
  _id: string;
  rating: number;
  title?: string;
  body?: string;
  authorName: string;
  city?: string;
  product?: { title: string; slug: string } | null;
};

type ApiFeatured = {
  items: ApiFeaturedReview[];
  summary: { ratingAvg: number; ratingCount: number };
};

type Envelope<T> = { success: true; data: T } | { success: false };

export type TestimonialSection = {
  testimonials: Testimonial[];
  /** Store-wide approved review count and average; null until any exist. */
  summary: { ratingAvg: number; ratingCount: number } | null;
};

/**
 * The homepage's "What customers actually say" section.
 *
 * Only reviews staff have starred in the admin. When none are picked — a
 * fresh store, or the backend being unreachable — the list is empty and the
 * homepage leaves the section out entirely rather than padding it with
 * invented quotes.
 */
const NONE: TestimonialSection = { testimonials: [], summary: null };
export const getFeaturedTestimonials = cache(async (): Promise<TestimonialSection> => {
  try {
    const response = await fetch(backendUrl("/reviews/featured"), {
      cache: "no-store",
      headers: { accept: "application/json" },
    });

    if (!response.ok) return NONE;

    const payload = (await response.json()) as Envelope<ApiFeatured>;
    if (!payload.success) return NONE;

    const testimonials = payload.data.items
      .filter((review) => review.body?.trim())
      .map<Testimonial>((review) => ({
        id: review._id,
        name: review.authorName,
        city: review.city ?? review.product?.title ?? "",
        quote: review.body!.trim(),
        rating: review.rating,
      }));

    const summary = payload.data.summary.ratingCount > 0 ? payload.data.summary : null;

    return { testimonials, summary };
  } catch {
    return NONE;
  }
});

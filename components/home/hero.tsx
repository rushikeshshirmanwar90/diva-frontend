"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide, type SwiperClass } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { buttonClass } from "@/components/ui/button";
import { MODEL, isAnimatedImageUrl } from "@/lib/images";
import type { HeroSlide } from "@/lib/types";
import { cn } from "@/lib/cn";

/**
 * Shown when the admin has not added any hero slides yet — a fresh deployment
 * should not open onto an empty band of charcoal. Once at least one real
 * slide exists, this never renders; see `HomePage` for where slides are
 * fetched.
 */
const FALLBACK_SLIDE: HeroSlide = {
  id: "fallback",
  heading: "Gold that outlives\nthe occasion",
  subtitle:
    "Hallmarked 22K and 18K jewellery, hand-finished in Bengaluru and Jaipur.",
  image: MODEL.layeredOlive,
  imageAlt: "Layered gold chains worn with an olive silk dress",
  cta: { label: "Shop the collection", href: "/shop" },
};

/**
 * Trust figures, shown under every slide rather than made part of any one of
 * them — they describe the business, not a promotion, so they should not
 * disappear when the slide rotates.
 */
const STATS = [
  { k: "28 yrs", v: "of making" },
  { k: "1,40,000+", v: "pieces delivered" },
  { k: "4.8/5", v: "across 6,200 reviews" },
];

export function Hero({ slides }: { slides: HeroSlide[] }) {
  const items = slides.length > 0 ? slides : [FALLBACK_SLIDE];
  const multi = items.length > 1;

  const swiperRef = useRef<SwiperClass | null>(null);
  const [active, setActive] = useState(0);

  return (
    <section className="relative">
      {/*
        No mobile min-height: below `lg` the hero is as tall as the banner plus
        the copy under it. Forcing `78svh` here is what made a 2:1 banner get
        `object-cover`-ed into a portrait box, throwing away ~70% of its width.
      */}
      <div className="relative w-full overflow-hidden bg-charcoal lg:min-h-[86vh]">
        <Swiper
          modules={[Autoplay]}
          autoplay={multi ? { delay: 6000, disableOnInteraction: false } : false}
          loop={multi}
          speed={700}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          onSlideChange={(swiper) => setActive(swiper.realIndex)}
          className="h-full w-full"
        >
          {items.map((slide) => (
            <SwiperSlide key={slide.id}>
              <HeroSlideContent slide={slide} />
            </SwiperSlide>
          ))}
        </Swiper>

        {multi && (
          <>
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => swiperRef.current?.slidePrev()}
              className="absolute top-1/2 left-4 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/30 p-2.5 text-white transition-colors hover:border-white hover:bg-white/10 lg:flex"
            >
              <ChevronLeft width={18} height={18} />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => swiperRef.current?.slideNext()}
              className="absolute top-1/2 right-4 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/30 p-2.5 text-white transition-colors hover:border-white hover:bg-white/10 lg:flex"
            >
              <ChevronRight width={18} height={18} />
            </button>

            <div className="absolute inset-x-0 bottom-7 z-10 flex justify-center gap-2">
              {items.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Go to slide ${index + 1}`}
                  onClick={() => swiperRef.current?.slideToLoop(index)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    index === active ? "w-6 bg-gold" : "w-1.5 bg-white/40 hover:bg-white/70",
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function HeroSlideContent({ slide }: { slide: HeroSlide }) {
  return (
    /*
      The whole slide is the link, not just the button.

      It has to be one link rather than a wrapper around the existing one: the
      CTA was an `<a>`, and an `<a>` inside an `<a>` is invalid and behaves
      unpredictably. The stretched-link trick (`::after { inset: 0 }` on the
      CTA) does not work here either — it resolves against the nearest
      positioned ancestor, and the copy container below needs `relative` to
      paint above the absolutely-positioned banner on desktop, so the hit area
      would stop at the text block and never cover the artwork.

      So the CTA is a span now. It still looks and hovers like a button via
      `group-hover`, and this way the accessible name is set once, deliberately,
      instead of being the concatenation of a heading, a subtitle and three
      statistics.
    */
    <Link
      href={slide.cta.href}
      aria-label={`${slide.heading.replace(/\s+/g, " ").trim()} — ${slide.cta.label}`}
      className="group relative block w-full focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-gold lg:min-h-[86vh]"
    >
      {/*
        Two different jobs at two different sizes.

        Below `lg` this is a banner in normal flow: a 2:1 box with
        `object-contain`, so the whole banner is visible and the copy sits
        underneath it. `contain` rather than `cover` because slides come from
        the admin at mixed ratios (2.000 and 1.203 in the current set) and
        Swiper needs every slide the same height — `cover` would crop whatever
        does not match, which is the bug this replaces. Anything not 2:1 gets
        charcoal bars that blend into the section behind it.

        From `lg` it goes back to filling the hero as a background layer, where
        the box (1.86) and the banners (2.00) are close enough that `cover`
        loses almost nothing.
      */}
      <div className="relative aspect-[2/1] w-full bg-charcoal lg:absolute lg:inset-0 lg:aspect-auto">
        <Image
          src={slide.image}
          alt={slide.imageAlt}
          fill
          priority
          sizes="100vw"
          unoptimized={isAnimatedImageUrl(slide.image)}
          className="object-contain object-center lg:object-cover lg:object-[60%_center]"
        />
      </div>

      {/*
        Desktop-only scrim. It exists to make white copy legible over the
        artwork, which is only a problem when the copy is *on* the artwork —
        below `lg` the copy now sits beneath the banner, so there is nothing to
        darken. Dropping it on mobile also retires the collision it was hiding:
        these banners carry their own burnt-in headline, and the old
        charcoal/85 fade was covering the whole image to stop that headline
        showing through behind `slide.heading`.
      */}
      <div className="hidden lg:absolute lg:inset-0 lg:block lg:bg-gradient-to-r lg:from-charcoal/85 lg:via-charcoal/45 lg:to-transparent" />

      {/* `pb-16` leaves room for the pagination dots pinned to the hero's
          bottom edge, which on mobile would otherwise land on the stats. */}
      <div className="relative mx-auto flex max-w-[90rem] items-center px-5 pt-10 pb-16 lg:min-h-[86vh] lg:px-10 lg:py-0">
        <div className="max-w-xl animate-fade-up">
          <h1 className="font-display text-[2rem] leading-[1.05] font-light whitespace-pre-line text-white sm:text-5xl lg:text-[4.25rem]">
            {slide.heading}
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75 sm:text-base lg:mt-6">
            {slide.subtitle}
          </p>
          <div className="mt-7 flex flex-wrap gap-3 lg:mt-10">
            {/* Looks like the button it replaces; the surrounding link is what
                actually navigates. `group-hover` keeps the hover affordance
                alive when the pointer is anywhere on the slide. */}
            <span
              className={buttonClass(
                "gold",
                "lg",
                "group-hover:bg-gold-dark group-focus-visible:bg-gold-dark",
              )}
            >
              {slide.cta.label}
            </span>
          </div>

          {/* Tighter rhythm below `lg`: these gaps were tuned to fill a 78svh
              box, and now that the copy is stacked under the banner rather
              than centred in one, the desktop spacing just reads as drift. */}
          <dl className="mt-9 grid max-w-md grid-cols-3 gap-3 border-t border-white/15 pt-5 sm:gap-6 lg:mt-14 lg:pt-7">
            {STATS.map((s) => (
              <div key={s.k} className="min-w-0">
                <dt className="break-words font-display text-base font-light text-gold-light sm:text-2xl">
                  {s.k}
                </dt>
                <dd className="mt-1 text-[10px] tracking-[0.18em] uppercase text-white/55">
                  {s.v}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Link>
  );
}

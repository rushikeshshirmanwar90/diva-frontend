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

export function Hero({ slides }: { slides: HeroSlide[] }) {
  const items = slides.length > 0 ? slides : [FALLBACK_SLIDE];
  const multi = items.length > 1;

  const swiperRef = useRef<SwiperClass | null>(null);
  const [active, setActive] = useState(0);

  return (
    <section className="relative">
      {/*
        Below `lg` this is exactly as tall as the banner and nothing more — the
        height comes from the slide's 2:1 image, and all of the copy is overlaid
        on top of it. `bg-charcoal` is only the backdrop for a slide whose
        artwork is not 2:1 and therefore gets side bars.
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

            {/* Bottom-right of the banner below `lg`, opposite the copy in the
                bottom-left, so the two share one line instead of the dots
                needing a strip of their own under the image. */}
            <div className="absolute right-5 bottom-4 z-10 flex gap-2 lg:inset-x-0 lg:right-auto lg:bottom-7 lg:justify-center">
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

        Below `lg` this is the hero: a 2:1 box in normal flow, so the slide is
        exactly as tall as the artwork and everything else is layered over it.
        `object-contain` keeps it uncropped — the mobile box is portrait (0.59)
        against landscape banners (2.00), so `cover` would scale to the height
        and throw away ~70% of the width. `contain` also covers the admin
        uploading mixed ratios (2.000 and 1.203 in the current set); Swiper
        needs every slide the same height, and anything not 2:1 gets side bars
        in the section's charcoal.

        From `lg` it fills the hero as a background layer, where the box (1.86)
        and the banners (2.00) are close enough that `cover` loses almost
        nothing.
      */}
      <div className="relative aspect-[2/1] w-full lg:absolute lg:inset-0 lg:aspect-auto">
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
        One scrim, two shapes.

        Below `lg` it is a band rising from the banner's own bottom edge. The
        stops are explicit rather than the default even spread because the copy
        occupies roughly 15–75% up the band, and an even fade left the heading
        sitting at ~40% opacity — white type on the pale lower half of the
        artwork, effectively unreadable. Holding ~0.9 to the 60% mark and only
        releasing above the copy keeps the type legible while leaving the top
        45% of the banner completely untouched.

        From `lg` it is the original left-to-right fade across the full hero,
        which is where the copy sits at that size.
      */}
      <div className="absolute inset-x-0 bottom-0 h-[55%] bg-[linear-gradient(to_top,rgba(26,26,26,0.96)_0%,rgba(26,26,26,0.9)_60%,rgba(26,26,26,0.6)_80%,transparent_100%)] lg:inset-0 lg:h-auto lg:bg-gradient-to-r lg:from-charcoal/85 lg:via-charcoal/45 lg:to-transparent" />

      {/*
        Pinned to the banner's bottom-left below `lg`, so the hero is the image
        and nothing else — being absolute means it contributes no height, and
        the slide ends exactly where the artwork does.

        From `lg` it goes back to a normal-flow flex child that centres itself
        against `min-h-[86vh]`, which is the desktop composition untouched.
      */}
      <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[90rem] px-5 pb-4 lg:static lg:flex lg:min-h-[86vh] lg:items-center lg:px-10 lg:pb-0">
        <div className="max-w-xl animate-fade-up">
          {/*
            `line-clamp-1` below `sm`: there is roughly 60px of usable band at
            the foot of a 195px banner, and a heading that wraps to three lines
            would climb straight over the artwork it is supposed to caption.
            `whitespace-normal` stops a `\n` in the copy forcing that wrap.
          */}
          <h1 className="line-clamp-1 font-display text-sm leading-tight font-light whitespace-normal text-white sm:line-clamp-none sm:text-5xl sm:leading-[1.05] sm:whitespace-pre-line lg:text-[4.25rem]">
            {slide.heading}
          </h1>

          {/* Hidden below `sm`. The banner artwork already carries a headline
              of its own; a subtitle under it in the same 60px band would be a
              third restatement of the same product name. */}
          <p className="hidden max-w-md leading-relaxed text-white/70 sm:mt-4 sm:block sm:text-base lg:mt-6">
            {slide.subtitle}
          </p>

          <div className="mt-2 flex flex-wrap gap-3 sm:mt-7 lg:mt-10">
            {/* Looks like the button it replaces; the surrounding link is what
                actually navigates. `group-hover` keeps the hover affordance
                alive when the pointer is anywhere on the slide.

                `sm` size with `sm:`-prefixed overrides back up to the old `lg`
                padding — `buttonClass` takes one size, so a responsive button
                has to come from the className rather than the size argument. */}
            <span
              className={buttonClass(
                "gold",
                "sm",
                "sm:px-8 sm:py-4 sm:text-xs group-hover:bg-gold-dark group-focus-visible:bg-gold-dark",
              )}
            >
              {slide.cta.label}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

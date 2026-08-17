"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide, type SwiperClass } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { ButtonLink } from "@/components/ui/button";
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
      <div className="relative min-h-[78vh] w-full overflow-hidden bg-charcoal lg:min-h-[86vh]">
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
    <div className="relative min-h-[78vh] w-full lg:min-h-[86vh]">
      <Image
        src={slide.image}
        alt={slide.imageAlt}
        fill
        priority
        sizes="100vw"
        unoptimized={isAnimatedImageUrl(slide.image)}
        className="object-cover object-[60%_center]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-charcoal/85 via-charcoal/45 to-transparent" />

      <div className="relative mx-auto flex min-h-[78vh] max-w-[90rem] items-center px-5 lg:min-h-[86vh] lg:px-10">
        <div className="max-w-xl animate-fade-up">
          <h1 className="font-display text-[2.75rem] leading-[1.05] font-light whitespace-pre-line text-white sm:text-6xl lg:text-[4.25rem]">
            {slide.heading}
          </h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-white/75 sm:text-base">
            {slide.subtitle}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href={slide.cta.href} variant="gold" size="lg">
              {slide.cta.label}
            </ButtonLink>
          </div>

          <dl className="mt-14 grid max-w-md grid-cols-3 gap-6 border-t border-white/15 pt-7">
            {STATS.map((s) => (
              <div key={s.k}>
                <dt className="font-display text-2xl font-light text-gold-light">{s.k}</dt>
                <dd className="mt-1 text-[10px] tracking-[0.18em] uppercase text-white/55">
                  {s.v}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

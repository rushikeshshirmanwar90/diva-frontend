"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide, type SwiperClass } from "swiper/react";
import "swiper/css";
import { useStore } from "@/lib/store/store";
import { useProductLookup } from "@/lib/data/catalogue-context";
import { ProductCard } from "@/components/product/product-card";
import { SectionHeading } from "@/components/ui/section-heading";

/** Shown on the home page; the product page keeps its own grid in `RecentlyViewed`. */
const MAX_ITEMS = 10;

/**
 * "Recently viewed" on the home page, as a swiper.
 *
 * Unlike `ProductRail`, which becomes a grid below `lg`, this stays a rail
 * at every width: the list is personal and grows with every product page
 * the shopper opens, and a grid of ten cards would push the rest of the home
 * page a screen and a half further down. The next card peeks in from the
 * right edge so the swipe advertises itself. Renders nothing until the store
 * has hydrated, and nothing at all for a first-time visitor.
 */
export function RecentlyViewedRail() {
  const { recentlyViewed, hydrated } = useStore();
  const getProduct = useProductLookup();
  const swiperRef = useRef<SwiperClass | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const items = recentlyViewed
    .map(getProduct)
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .slice(0, MAX_ITEMS);

  if (!hydrated || items.length === 0) return null;

  const syncEdges = (swiper: SwiperClass) => {
    setAtStart(swiper.isBeginning);
    setAtEnd(swiper.isEnd);
  };

  return (
    <section
      aria-label="Recently viewed"
      className="mx-auto max-w-[90rem] px-5 py-12 lg:px-10"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading
          eyebrow="Pick up where you left off"
          title="Recently viewed"
          align="left"
          className="min-w-0"
        />
        <div className="hidden gap-2 lg:flex">
          <button
            type="button"
            aria-label="Previous"
            disabled={atStart}
            onClick={() => swiperRef.current?.slidePrev()}
            className="flex size-10 items-center justify-center rounded-full border border-charcoal/25 text-charcoal transition-colors hover:border-charcoal hover:bg-charcoal hover:text-white disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronLeft width={16} height={16} />
          </button>
          <button
            type="button"
            aria-label="Next"
            disabled={atEnd}
            onClick={() => swiperRef.current?.slideNext()}
            className="flex size-10 items-center justify-center rounded-full border border-charcoal/25 text-charcoal transition-colors hover:border-charcoal hover:bg-charcoal hover:text-white disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronRight width={16} height={16} />
          </button>
        </div>
      </div>

      <div className="mt-10 border-t border-line pt-10">
        <Swiper
          slidesPerView="auto"
          spaceBetween={20}
          breakpoints={{ 640: { spaceBetween: 32 }, 1024: { spaceBetween: 24 } }}
          speed={500}
          grabCursor
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            syncEdges(swiper);
          }}
          onSlideChange={syncEdges}
          onReachBeginning={syncEdges}
          onReachEnd={syncEdges}
          onResize={syncEdges}
        >
          {items.map((product) => (
            <SwiperSlide
              key={product.id}
              className="w-[62vw]! sm:w-[18rem]! lg:w-[22rem]!"
            >
              <ProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

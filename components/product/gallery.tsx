"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Expand, Play } from "lucide-react";
import { Swiper, SwiperSlide, type SwiperClass } from "swiper/react";
import "swiper/css";
import { cn } from "@/lib/cn";
import { toYouTubeEmbedUrl, toYouTubeThumbnail } from "@/lib/youtube";

export function Gallery({
  images,
  title,
  videoUrl,
}: {
  images: string[];
  title: string;
  videoUrl?: string | null;
}) {
  /**
   * Two pieces of state where there used to be one `number | "video"`.
   *
   * Swiper owns the image index now, and that index has to survive the video
   * pane: the pane replaces the carousel in the DOM, so the carousel unmounts
   * and remounts, and a single union-typed `active` had nowhere to hold "which
   * image were we on" while it was storing `"video"`.
   */
  const [imageIndex, setImageIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  const swiperRef = useRef<SwiperClass | null>(null);

  const embedUrl = toYouTubeEmbedUrl(videoUrl);
  const videoThumbnail = toYouTubeThumbnail(videoUrl) || images[0];
  const hasVideo = Boolean(embedUrl);
  const isVideo = showVideo && hasVideo;

  /**
   * Thumbnails drive the carousel rather than re-rendering the main image
   * themselves, so a tap and a swipe both end up in the same place — the old
   * version had the thumbnails as the *only* way to change image, which is
   * what made the main pane feel dead under a finger.
   */
  const showImage = (index: number) => {
    setShowVideo(false);
    setZoomed(false);
    setImageIndex(index);
    // Guarded because the instance is already gone while the video pane is up;
    // the carousel picks this index back up via `initialSlide` when it remounts.
    if (swiperRef.current && !swiperRef.current.destroyed) {
      swiperRef.current.slideTo(index);
    }
  };

  const openVideo = () => {
    setShowVideo(true);
    setZoomed(false);
  };

  return (
    /*
      `min-w-0` is required, not cosmetic. This is a grid item on the product
      page, so it defaults to `min-width: auto` — floored at min-content — and
      Swiper's `.swiper-slide { width: 100% }` around an `aspect-4/5` box is
      circular under min-content sizing: the percentage needs a definite
      wrapper width, the wrapper width needs the slide's content width. Chrome
      resolves the cycle by clamping to 2^25, which made the carousel
      33,554,384px wide and pushed every hit target off-screen.
    */
    <div className="flex min-w-0 flex-col-reverse gap-4 lg:flex-row">
      <ul className="no-scrollbar flex gap-3 overflow-x-auto lg:w-24 lg:flex-col lg:overflow-visible">
        {images.map((image, i) => {
          const current = !isVideo && imageIndex === i;
          return (
            <li key={image + i} className="shrink-0">
              <button
                type="button"
                onClick={() => showImage(i)}
                aria-label={`View image ${i + 1}`}
                aria-current={current}
                className={cn(
                  "relative block size-20 overflow-hidden bg-beige transition-all lg:w-24 lg:h-28",
                  current
                    ? "ring-1 ring-gold ring-offset-2"
                    : "opacity-70 hover:opacity-100",
                )}
              >
                <Image src={image} alt="" fill sizes="96px" className="object-cover" />
              </button>
            </li>
          );
        })}

        {hasVideo && (
          <li className="shrink-0">
            <button
              type="button"
              onClick={openVideo}
              aria-label="View product video short"
              aria-current={isVideo}
              className={cn(
                "group relative block size-20 overflow-hidden bg-charcoal transition-all lg:w-24 lg:h-28",
                isVideo
                  ? "ring-1 ring-gold ring-offset-2"
                  : "opacity-80 hover:opacity-100",
              )}
            >
              {videoThumbnail && (
                <Image
                  src={videoThumbnail}
                  alt={`${title} video thumbnail`}
                  fill
                  sizes="96px"
                  className="object-cover opacity-60 transition-transform duration-300 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/40 text-white">
                <span className="flex size-7 items-center justify-center rounded-full bg-gold text-white shadow-md transition-transform group-hover:scale-110">
                  <Play width={12} height={12} className="ml-0.5 fill-white text-white" />
                </span>
                <span className="text-[9px] font-medium tracking-luxe uppercase">
                  Video
                </span>
              </div>
            </button>
          </li>
        )}
      </ul>

      {/*
        `min-w-0` again, for the same cycle one level down: at `lg` the row
        layout makes this the flex item (`flex: 1 1 0%`), and a flex item is
        also floored at min-content unless told otherwise. Without it the
        carousel blows up to 2^25 on desktop while mobile looks fine.
      */}
      <div className="relative min-w-0 flex-1">
        {isVideo && embedUrl ? (
          <div className="relative aspect-4/5 w-full overflow-hidden bg-charcoal shadow-inner">
            <iframe
              src={`${embedUrl}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
              title={`${title} video short`}
              className="h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : (
          <>
            <Swiper
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
              }}
              initialSlide={imageIndex}
              onSlideChange={(swiper) => {
                setImageIndex(swiper.activeIndex);
                /*
                  Swiping out of a zoomed image resets the zoom rather than
                  carrying scale 1.7 onto the next one.

                  Note this deliberately leaves swipe enabled while zoomed.
                  Locking the track would be defensible — at 1.7x a drag reads
                  as "pan the enlarged image", and there is no panning here —
                  but a gesture that does nothing is the exact complaint this
                  component started with, so a swipe always goes somewhere.
                */
                setZoomed(false);
              }}
              spaceBetween={0}
              slidesPerView={1}
              className="w-full"
            >
              {images.map((image, i) => (
                <SwiperSlide key={image + i}>
                  <div
                    className={cn(
                      // `w-full` gives the aspect ratio an explicit inline
                      // size to derive height from, instead of leaving it to
                      // be inferred through the slide's percentage width.
                      "relative aspect-4/5 w-full overflow-hidden bg-beige",
                      zoomed ? "cursor-zoom-out" : "cursor-zoom-in",
                    )}
                    onClick={() => setZoomed((z) => !z)}
                  >
                    <Image
                      src={image}
                      alt={title}
                      fill
                      /* Only the first slide is above the fold. */
                      priority={i === 0}
                      sizes="(max-width: 1024px) 100vw, 45vw"
                      className={cn(
                        "object-cover transition-transform duration-700 ease-out",
                        zoomed && imageIndex === i && "scale-[1.7]",
                      )}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {hasVideo && (
              <button
                type="button"
                onClick={openVideo}
                className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-full bg-charcoal/85 px-3.5 py-2 text-[10px] tracking-luxe uppercase text-white shadow-lg backdrop-blur transition-all duration-200 hover:bg-gold hover:text-white active:scale-95"
              >
                <span className="flex size-4 items-center justify-center rounded-full bg-gold text-white">
                  <Play width={9} height={9} className="ml-0.5 fill-white text-white" />
                </span>
                Watch Short
              </button>
            )}

            {/* A counter rather than only a zoom hint, because with swipe
                enabled the pane has to say how much there is to swipe through
                — but "1 / 1" is just noise, so single-image products keep the
                original hint. */}
            <span className="pointer-events-none absolute right-4 bottom-4 z-10 flex items-center gap-2 bg-white/85 px-3 py-2 text-[10px] tracking-luxe uppercase text-charcoal backdrop-blur">
              <Expand width={12} height={12} />
              {zoomed
                ? "Tap to shrink"
                : images.length > 1
                  ? `${imageIndex + 1} / ${images.length}`
                  : "Tap to zoom"}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

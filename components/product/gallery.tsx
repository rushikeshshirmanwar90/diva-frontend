"use client";

import { useState } from "react";
import Image from "next/image";
import { Expand, Play } from "lucide-react";
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
  const [active, setActive] = useState<number | "video">(0);
  const [zoomed, setZoomed] = useState(false);

  const embedUrl = toYouTubeEmbedUrl(videoUrl);
  const videoThumbnail = toYouTubeThumbnail(videoUrl) || images[0];
  const hasVideo = Boolean(embedUrl);

  const isVideo = active === "video";
  const src = typeof active === "number" ? images[active] : images[0];

  return (
    <div className="flex flex-col-reverse gap-4 lg:flex-row">
      <ul className="no-scrollbar flex gap-3 overflow-x-auto lg:w-24 lg:flex-col lg:overflow-visible">
        {images.map((image, i) => (
          <li key={image + i} className="shrink-0">
            <button
              type="button"
              onClick={() => {
                setActive(i);
                setZoomed(false);
              }}
              aria-label={`View image ${i + 1}`}
              aria-current={active === i}
              className={cn(
                "relative block size-20 overflow-hidden bg-beige transition-all lg:w-24 lg:h-28",
                active === i
                  ? "ring-1 ring-gold ring-offset-2"
                  : "opacity-70 hover:opacity-100",
              )}
            >
              <Image src={image} alt="" fill sizes="96px" className="object-cover" />
            </button>
          </li>
        ))}

        {hasVideo && (
          <li className="shrink-0">
            <button
              type="button"
              onClick={() => {
                setActive("video");
                setZoomed(false);
              }}
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

      <div className="relative flex-1">
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
            <div
              className={cn(
                "relative aspect-4/5 overflow-hidden bg-beige",
                zoomed ? "cursor-zoom-out" : "cursor-zoom-in",
              )}
              onClick={() => setZoomed((z) => !z)}
            >
              {src && (
                <Image
                  key={src}
                  src={src}
                  alt={title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className={cn(
                    "animate-fade-in object-cover transition-transform duration-700 ease-out",
                    zoomed && "scale-[1.7]",
                  )}
                />
              )}
            </div>

            {hasVideo && (
              <button
                type="button"
                onClick={() => {
                  setActive("video");
                  setZoomed(false);
                }}
                className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-full bg-charcoal/85 px-3.5 py-2 text-[10px] tracking-luxe uppercase text-white shadow-lg backdrop-blur transition-all duration-200 hover:bg-gold hover:text-white active:scale-95"
              >
                <span className="flex size-4 items-center justify-center rounded-full bg-gold text-white">
                  <Play width={9} height={9} className="ml-0.5 fill-white text-white" />
                </span>
                Watch Short
              </button>
            )}

            <span className="pointer-events-none absolute right-4 bottom-4 flex items-center gap-2 bg-white/85 px-3 py-2 text-[10px] tracking-luxe uppercase text-charcoal backdrop-blur">
              <Expand width={12} height={12} />
              {zoomed ? "Click to shrink" : "Click to zoom"}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

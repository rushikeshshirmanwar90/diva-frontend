"use client";

import { useState } from "react";
import Image from "next/image";
import { Expand } from "lucide-react";
import { cn } from "@/lib/cn";

export function Gallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const src = images[active]!;

  return (
    <div className="flex flex-col-reverse gap-4 lg:flex-row">
      <ul className="no-scrollbar flex gap-3 overflow-x-auto lg:w-24 lg:flex-col lg:overflow-visible">
        {images.map((image, i) => (
          <li key={image + i} className="shrink-0">
            <button
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === active}
              className={cn(
                "relative block size-20 overflow-hidden bg-beige transition-all lg:w-24 lg:h-28",
                i === active
                  ? "ring-1 ring-gold ring-offset-2"
                  : "opacity-70 hover:opacity-100",
              )}
            >
              <Image src={image} alt="" fill sizes="96px" className="object-cover" />
            </button>
          </li>
        ))}
      </ul>

      <div className="relative flex-1">
        <div
          className={cn(
            "relative aspect-4/5 overflow-hidden bg-beige",
            zoomed ? "cursor-zoom-out" : "cursor-zoom-in",
          )}
          onClick={() => setZoomed((z) => !z)}
        >
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
        </div>
        <span className="pointer-events-none absolute right-4 bottom-4 flex items-center gap-2 bg-white/85 px-3 py-2 text-[10px] tracking-luxe uppercase text-charcoal backdrop-blur">
          <Expand width={12} height={12} />
          {zoomed ? "Click to shrink" : "Click to zoom"}
        </span>
      </div>
    </div>
  );
}

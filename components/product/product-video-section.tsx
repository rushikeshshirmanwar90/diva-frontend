"use client";

import { toYouTubeEmbedUrl } from "@/lib/youtube";

export function ProductVideoSection({
  title,
  videoUrl,
}: {
  title: string;
  videoUrl: string;
}) {
  const embedUrl = toYouTubeEmbedUrl(videoUrl);
  if (!embedUrl) return null;

  return (
    <section className="mt-20 border-t border-line/80 pt-16">
      <div className="mx-auto max-w-5xl">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="eyebrow">Jewellery in motion</p>
            <h2 className="mt-3 font-display text-3xl font-light text-ink sm:text-4xl">
              See {title} in Real Life
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Experience the natural luster, proportions, and craftsmanship on video.
              Every facet and curve is designed to catch the light beautifully in everyday wear.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="flex items-center gap-2 border border-line bg-beige/40 px-3.5 py-2 text-xs text-charcoal">
                ✦ 100% authentic piece
              </span>
              <span className="flex items-center gap-2 border border-line bg-beige/40 px-3.5 py-2 text-xs text-charcoal">
                ✦ Natural studio lighting
              </span>
              <span className="flex items-center gap-2 border border-line bg-beige/40 px-3.5 py-2 text-xs text-charcoal">
                ✦ True-to-scale fit
              </span>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="relative aspect-[9/16] w-full max-w-[320px] overflow-hidden rounded-2xl bg-charcoal shadow-2xl border border-line">
              <iframe
                src={`${embedUrl}?autoplay=0&rel=0&modestbranding=1&playsinline=1`}
                title={`${title} video short`}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

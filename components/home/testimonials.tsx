import { Quote } from "lucide-react";
import { Rating } from "@/components/ui/rating";
import type { TestimonialSection } from "@/lib/data/testimonials";

/**
 * Column count follows how many reviews staff picked: four in a row reads as
 * a wall of quotes, but two lonely cards stretched across four columns do not.
 */
function columnsFor(count: number) {
  if (count <= 1) return "sm:grid-cols-1 lg:grid-cols-1 lg:max-w-2xl lg:mx-auto";
  if (count === 2) return "sm:grid-cols-2 lg:grid-cols-2 lg:max-w-4xl lg:mx-auto";
  if (count === 3 || count === 6) return "sm:grid-cols-2 lg:grid-cols-3";
  return "sm:grid-cols-2 lg:grid-cols-4";
}

export function Testimonials({ testimonials, summary }: TestimonialSection) {
  const eyebrow = summary
    ? `${summary.ratingCount.toLocaleString("en-IN")} ${summary.ratingCount === 1 ? "review" : "reviews"} · ${summary.ratingAvg.toFixed(1)} average`
    : "From our customers";

  return (
    <section className="bg-charcoal">
      <div className="mx-auto max-w-[90rem] px-5 py-24 lg:px-10">
        <div className="text-center">
          <p className="text-[10px] tracking-[0.32em] uppercase text-gold-light">
            {eyebrow}
          </p>
          <h2 className="mt-4 font-display text-3xl leading-tight font-light text-white md:text-[2.6rem]">
            What customers actually say
          </h2>
        </div>

        <div className={`mt-14 grid gap-px bg-white/10 ${columnsFor(testimonials.length)}`}>
          {testimonials.map((t) => (
            <figure key={t.id} className="flex flex-col gap-5 bg-charcoal p-8">
              <Quote width={20} height={20} strokeWidth={1.3} className="text-gold" />
              <blockquote className="flex-1 text-sm leading-relaxed text-white/80">
                {t.quote}
              </blockquote>
              <figcaption>
                <Rating value={t.rating} className="[&>span:last-of-type]:text-white/50" />
                <p className="mt-3 text-[11px] tracking-luxe uppercase text-white">
                  {t.name}
                </p>
                {t.city && (
                  <p className="text-[10px] tracking-wide text-white/45">{t.city}</p>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

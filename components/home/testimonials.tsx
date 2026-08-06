import { Quote } from "lucide-react";
import { testimonials } from "@/lib/data/content";
import { Rating } from "@/components/ui/rating";

export function Testimonials() {
  return (
    <section className="bg-charcoal">
      <div className="mx-auto max-w-[90rem] px-5 py-24 lg:px-10">
        <div className="text-center">
          <p className="text-[10px] tracking-[0.32em] uppercase text-gold-light">
            6,200 reviews · 4.8 average
          </p>
          <h2 className="mt-4 font-display text-3xl leading-tight font-light text-white md:text-[2.6rem]">
            What customers actually say
          </h2>
        </div>

        <div className="mt-14 grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
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
                <p className="text-[10px] tracking-wide text-white/45">{t.city}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

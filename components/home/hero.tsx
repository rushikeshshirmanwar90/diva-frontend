import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";
import { MODEL } from "@/lib/images";

export function Hero() {
  return (
    <section className="relative">
      <div className="relative min-h-[78vh] w-full overflow-hidden bg-charcoal lg:min-h-[86vh]">
        <Image
          src={MODEL.layeredOlive}
          alt="Layered gold chains worn with an olive silk dress"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[60%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/85 via-charcoal/45 to-transparent" />

        <div className="relative mx-auto flex min-h-[78vh] max-w-[90rem] items-center px-5 lg:min-h-[86vh] lg:px-10">
          <div className="max-w-xl animate-fade-up">
            <p className="text-[10px] tracking-[0.32em] uppercase text-gold-light">
              The Festive Radiance Edit · 2026
            </p>
            <h1 className="mt-6 font-display text-[2.75rem] leading-[1.05] font-light text-white sm:text-6xl lg:text-[4.25rem]">
              Gold that outlives
              <br />
              the occasion
            </h1>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-white/75 sm:text-base">
              Hallmarked 22K and 18K jewellery, hand-finished in Bengaluru and Jaipur.
              Metal value, making charges and GST printed on every page — before you
              add to bag.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <ButtonLink href="/shop" variant="gold" size="lg">
                Shop the collection
              </ButtonLink>
              <ButtonLink
                href="/collections/wedding-edit"
                size="lg"
                className="border border-white/40 bg-transparent text-white hover:border-white hover:bg-white hover:text-charcoal"
              >
                The Wedding Edit
              </ButtonLink>
            </div>

            <dl className="mt-14 grid max-w-md grid-cols-3 gap-6 border-t border-white/15 pt-7">
              {[
                { k: "28 yrs", v: "of making" },
                { k: "1,40,000+", v: "pieces delivered" },
                { k: "4.8/5", v: "across 6,200 reviews" },
              ].map((s) => (
                <div key={s.k}>
                  <dt className="font-display text-2xl font-light text-gold-light">
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
      </div>
    </section>
  );
}

import Image from "next/image";
import { NewsletterForm } from "@/components/home/newsletter-form";
import { STILL } from "@/lib/images";

export function NewsletterBand() {
  return (
    <section className="relative overflow-hidden bg-charcoal">
      <Image
        src={STILL.hangingPendants}
        alt=""
        fill
        sizes="100vw"
        className="object-cover opacity-25"
      />
      <div className="relative mx-auto max-w-[90rem] px-5 py-20 lg:px-10">
        <div className="max-w-xl">
          <p className="text-[10px] tracking-[0.32em] uppercase text-gold-light">
            One letter a month
          </p>
          <h2 className="mt-4 font-display text-3xl leading-tight font-light text-white md:text-[2.5rem]">
            New pieces, gold-rate notes,
            <br />
            and nothing else
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/65">
            First look at limited runs, plus a monthly note on where the gold rate has
            moved and what that means if you are saving for something. Unsubscribe in
            one click.
          </p>
          <NewsletterForm dark className="mt-8" />
        </div>
      </div>
    </section>
  );
}

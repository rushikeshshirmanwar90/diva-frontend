import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/shop/page-header";
import { ButtonLink } from "@/components/ui/button";
import { MODEL, STILL } from "@/lib/images";

export const metadata: Metadata = {
  title: "Our story",
  description:
    "Diva has made fine jewellery in Bengaluru and Jaipur since 1998, on one rule: a customer should be able to reconstruct the price of a piece from first principles.",
};

const milestones = [
  {
    year: "1998",
    title: "One counter on Lavelle Road",
    body: "Started by Sushila Giri with eleven pieces in a borrowed vitrine and a hand-written price book that listed metal rate and making charge separately. That book is still in the office.",
  },
  {
    year: "2006",
    title: "The Thanjavur workshop",
    body: "Rather than buy from wholesalers, we brought four repoussé karigars onto payroll. Temple work has been made in-house ever since — the same four families, now second generation.",
  },
  {
    year: "2014",
    title: "Jaipur, for polki",
    body: "Uncut stone setting is its own craft and cannot be learned quickly. We opened a nine-person atelier in Jaipur rather than pretend otherwise.",
  },
  {
    year: "2021",
    title: "HUID from day one",
    body: "When BIS made unique identity numbers mandatory, we were already tagging every piece. Compliance cost us two weeks instead of two quarters.",
  },
  {
    year: "2026",
    title: "Three counters, one price list",
    body: "Bengaluru, Chennai and Hyderabad, plus the website you're reading. The price is the same in all four, and it always breaks down the same way.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Since 1998"
        title="We would rather explain the price than defend it"
        description="Twenty-eight years of making jewellery in India, on one rule that has never changed."
        trail={[{ label: "Our story" }]}
        image={MODEL.chokerPortrait}
      />

      <section className="mx-auto max-w-[90rem] px-5 pb-20 lg:px-10">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-24">
          <div className="relative">
            <div className="relative aspect-4/5 overflow-hidden bg-beige">
              <Image
                src={STILL.templeSet}
                alt="Twenty-two karat temple work with cabochon rubies"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-muted">
              Repoussé and granulation on 22K, Thanjavur workshop. Roughly 180 hours of
              handwork per bridal set.
            </p>
          </div>

          <div>
            <p className="eyebrow">The rule</p>
            <h2 className="mt-4 font-display text-3xl leading-tight font-light text-ink lg:text-[2.6rem]">
              A price you can rebuild yourself
            </h2>
            <div className="mt-6 space-y-5 text-sm leading-relaxed text-muted">
              <p>
                Most jewellery in India is sold as a single number. You are told a total,
                you negotiate a little, and you leave without knowing what you paid for
                metal, what you paid for work, and what you paid in tax.
              </p>
              <p>
                We print all four. Metal value at today&apos;s rate for the stated purity,
                stone value where there is a stone, making charges as a percentage you can
                check, and GST. If our making charge looks high on a piece, ask us — there
                will be a specific answer about specific hours, or we will drop it.
              </p>
              <p>
                The second rule follows from the first: we never hard-sell. Nobody at Diva
                works on commission. If the honest advice is that 18K suits your setting
                better than 22K and costs less, that is the advice you will get.
              </p>
            </div>

            <dl className="mt-10 grid grid-cols-2 gap-8 border-t border-line pt-8 sm:grid-cols-4">
              {[
                ["28", "years"],
                ["140k+", "pieces made"],
                ["61", "karigars on payroll"],
                ["4.8", "average rating"],
              ].map(([k, v]) => (
                <div key={v}>
                  <dt className="font-display text-3xl font-light text-gold">{k}</dt>
                  <dd className="mt-1 text-[10px] tracking-luxe uppercase text-muted">
                    {v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="bg-beige">
        <div className="mx-auto max-w-4xl px-5 py-20 lg:px-10">
          <p className="eyebrow text-center">The long version</p>
          <h2 className="mt-4 text-center font-display text-3xl leading-tight font-light text-ink lg:text-[2.6rem]">
            Twenty-eight years, five turning points
          </h2>

          <ol className="mt-14 space-y-12">
            {milestones.map((m) => (
              <li key={m.year} className="grid gap-4 sm:grid-cols-[7rem_1fr] sm:gap-10">
                <p className="font-display text-3xl leading-none font-light text-gold">
                  {m.year}
                </p>
                <div className="border-l border-line pl-6 sm:pl-8">
                  <h3 className="font-display text-xl font-light text-ink">{m.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{m.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-[90rem] px-5 py-20 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-3">
          {[
            {
              image: STILL.chandelierEarrings,
              title: "Jaipur · polki setting",
              body: "Nine karigars. Uncut stones are foiled by hand before the bezel closes over them, which is why the glow is warm rather than white.",
            },
            {
              image: STILL.goldRingsOnStone,
              title: "Bengaluru · casting & finishing",
              body: "Every cast piece is tumble-polished for four hours before hallmarking. It is the step most workshops shorten and the one you can feel.",
            },
            {
              image: MODEL.braceletWrist,
              title: "Three counters · one price",
              body: "Bengaluru, Chennai and Hyderabad. Free cleaning and re-polishing for life, and a purity assay any time you want one.",
            },
          ].map((c) => (
            <div key={c.title}>
              <div className="relative aspect-4/3 overflow-hidden bg-beige">
                <Image
                  src={c.image}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 30vw"
                  className="object-cover"
                />
              </div>
              <h3 className="mt-5 font-display text-xl font-light text-ink">
                {c.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{c.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/shop" variant="gold" size="lg">
            Browse the collection
          </ButtonLink>
          <ButtonLink href="/contact" variant="outline" size="lg">
            Visit a counter
          </ButtonLink>
        </div>
      </section>
    </>
  );
}

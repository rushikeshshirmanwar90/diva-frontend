import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";
import { MODEL, STILL } from "@/lib/images";

const points = [
  {
    n: "01",
    title: "Weighed in front of you",
    body: "Gross weight, net weight and stone weight are printed on every product page and on the invoice. No rounding in our favour.",
  },
  {
    n: "02",
    title: "Hallmarked, then shipped",
    body: "Every gold piece is BIS hallmarked with a HUID you can verify yourself before you accept delivery.",
  },
  {
    n: "03",
    title: "Made by people we name",
    body: "Twenty-two karat repoussé from Thanjavur, polki setting from Jaipur. Our karigars are on payroll, not piece-rate.",
  },
];

export function CraftStory() {
  return (
    <section className="mx-auto max-w-[90rem] px-5 py-24 lg:px-10">
      <div className="grid gap-14 lg:grid-cols-2 lg:gap-24">
        <div className="relative">
          <div className="relative aspect-4/5 overflow-hidden bg-beige">
            <Image
              src={MODEL.braceletWrist}
              alt="A gold bracelet being tried on"
              fill
              sizes="(max-width: 1024px) 100vw, 44vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -right-4 -bottom-10 hidden aspect-square w-48 overflow-hidden border-8 border-white bg-beige lg:block">
            <Image
              src={STILL.goldRingsOnStone}
              alt=""
              fill
              sizes="12rem"
              className="object-cover"
            />
          </div>
        </div>

        <div className="lg:pt-8">
          <p className="eyebrow">Why Diva</p>
          <h2 className="mt-4 font-display text-4xl leading-tight font-light text-ink lg:text-[3rem]">
            Transparent to the last
            <br />
            0.01 gram
          </h2>
          <p className="mt-6 max-w-lg text-sm leading-relaxed text-muted">
            We started in 1998 with one counter on Lavelle Road and a rule that has not
            changed: a customer should be able to reconstruct the price of a piece from
            first principles. Metal rate, weight, making charge, stone value, tax.
          </p>

          <ol className="mt-10 space-y-8">
            {points.map((p) => (
              <li key={p.n} className="flex gap-6">
                <span className="font-display text-2xl leading-none font-light text-gold">
                  {p.n}
                </span>
                <div className="border-l border-line pl-6">
                  <p className="text-[11px] tracking-luxe uppercase text-ink">
                    {p.title}
                  </p>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
                    {p.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <ButtonLink href="/about" variant="outline" className="mt-10">
            Read our story
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

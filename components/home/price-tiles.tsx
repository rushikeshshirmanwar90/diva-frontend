import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";

const tiers = [
  { label: "Under ₹25,000", sub: "Everyday gold", query: "0-25000" },
  { label: "₹25,000 – ₹50,000", sub: "Gifting favourites", query: "25000-50000" },
  { label: "₹50,000 – ₹1,00,000", sub: "Diamond pieces", query: "50000-100000" },
  { label: "Above ₹1,00,000", sub: "Bridal & heirloom", query: "100000-9999999" },
];

export function PriceTiles() {
  return (
    <section className="bg-beige">
      <div className="mx-auto max-w-[90rem] px-5 py-20 lg:px-10">
        <SectionHeading
          eyebrow="Start from a number"
          title="Shop by budget"
          description="Every price on the site is the price you pay — GST included at checkout, no separate making-charge surprise."
        />
        <div className="mt-12 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {tiers.map((t) => (
            <Link
              key={t.query}
              href={`/shop?price=${t.query}`}
              className="group flex flex-col justify-between gap-10 bg-white p-8 transition-colors hover:bg-charcoal"
            >
              <div>
                <p className="eyebrow transition-colors group-hover:text-gold-light">
                  {t.sub}
                </p>
                <p className="mt-3 font-display text-2xl leading-tight font-light text-ink transition-colors group-hover:text-white">
                  {t.label}
                </p>
              </div>
              <ArrowUpRight
                width={20}
                height={20}
                strokeWidth={1.3}
                className="text-gold transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

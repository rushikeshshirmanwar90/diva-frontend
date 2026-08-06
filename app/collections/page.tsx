import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/shop/page-header";
import { collections } from "@/lib/data/categories";
import { productsByCollection } from "@/lib/data/products";

export const metadata: Metadata = {
  title: "Collections",
  description:
    "Curated edits — the Wedding Edit, Festive Radiance, Daily Wear, the Gifting Suite and Limited Edition runs from our Jaipur atelier.",
};

export default function CollectionsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Curated edits"
        title="Collections"
        description="Five edits, each built around how a piece will actually be worn rather than what it is made of."
        trail={[{ label: "Collections" }]}
      />

      <div className="mx-auto max-w-[90rem] px-5 pb-16 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-2">
          {collections.map((c, i) => (
            <Link
              key={c.slug}
              href={`/collections/${c.slug}`}
              className={`group relative overflow-hidden bg-charcoal ${
                i === 0 ? "lg:col-span-2" : ""
              }`}
            >
              <div
                className={`relative ${i === 0 ? "aspect-16/9 lg:aspect-21/9" : "aspect-4/3"}`}
              >
                <Image
                  src={c.image}
                  alt=""
                  fill
                  priority={i < 2}
                  sizes={i === 0 ? "100vw" : "(max-width: 1024px) 100vw, 45vw"}
                  className="object-cover opacity-80 transition-transform duration-[900ms] ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-8 lg:p-10">
                  <p className="text-[10px] tracking-[0.3em] uppercase text-gold-light">
                    {c.tagline}
                  </p>
                  <h2 className="mt-3 font-display text-3xl leading-tight font-light text-white lg:text-4xl">
                    {c.name}
                  </h2>
                  <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/70">
                    {c.description}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 text-[10px] tracking-luxe uppercase text-white">
                    {productsByCollection(c.slug).length} pieces
                    <ArrowRight
                      width={14}
                      height={14}
                      className="text-gold transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

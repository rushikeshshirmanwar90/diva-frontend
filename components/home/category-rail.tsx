import Image from "next/image";
import Link from "next/link";
import { categories } from "@/lib/data/categories";
import { SectionHeading } from "@/components/ui/section-heading";

export function CategoryRail() {
  return (
    <section className="mx-auto max-w-[90rem] px-5 py-20 lg:px-10">
      <SectionHeading
        eyebrow="Find your piece"
        title="Shop by category"
        description="Nine categories, from a 2.9-gram everyday hoop to a 68-gram bridal set."
      />

      <div className="no-scrollbar mt-12 -mx-5 flex snap-x gap-4 overflow-x-auto px-5 lg:mx-0 lg:grid lg:grid-cols-5 lg:gap-5 lg:overflow-visible lg:px-0">
        {categories.map((c, i) => (
          <Link
            key={c.slug}
            href={`/category/${c.slug}`}
            className="group w-40 shrink-0 snap-start sm:w-48 lg:w-auto"
          >
            <div className="relative aspect-3/4 overflow-hidden bg-beige">
              <Image
                src={c.image}
                alt={c.name}
                fill
                sizes="(max-width: 1024px) 12rem, 18vw"
                priority={i < 5}
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="font-display text-xl leading-tight font-light text-white">
                  {c.name}
                </p>
                <p className="mt-0.5 text-[10px] leading-snug text-white/70">
                  {c.blurb}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";
import { isAnimatedImageUrl } from "@/lib/images";
import type { Collection } from "@/lib/types";

export function CollectionBanner({
  collection,
  reverse = false,
  productCount,
}: {
  collection: Collection;
  reverse?: boolean;
  productCount: number;
}) {
  return (
    <section className="mx-auto max-w-[90rem] px-5 py-16 lg:px-10">
      <div
        className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-20 ${
          reverse ? "lg:[&>*:first-child]:order-2" : ""
        }`}
      >
        <div className="relative aspect-4/5 overflow-hidden bg-beige sm:aspect-16/11 lg:aspect-4/5">
          <Image
            src={collection.image}
            alt={collection.name}
            fill
            sizes="(max-width: 1024px) 100vw, 44vw"
            unoptimized={isAnimatedImageUrl(collection.image)}
            className="object-cover"
          />
        </div>
        <div className={reverse ? "lg:pr-10" : "lg:pl-10"}>
          <p className="eyebrow">{collection.tagline}</p>
          <h2 className="mt-4 font-display text-4xl leading-tight font-light text-ink lg:text-[3rem]">
            {collection.name}
          </h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-muted">
            {collection.description}
          </p>
          <p className="mt-6 text-[11px] tracking-luxe uppercase text-gold">
            {productCount} pieces in this edit
          </p>
          <ButtonLink href={`/collections/${collection.slug}`} className="mt-8">
            Explore the edit
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

import Image from "next/image";
import Link from "next/link";
import { categories } from "@/lib/data/categories";
import { SectionHeading } from "@/components/ui/section-heading";
import { LinkPendingOverlay } from "@/components/ui/link-pending";

const WORDS = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];
/** "Nine" reads better than "9" in running copy; past twelve the numeral is clearer. */
const countWord = (n: number) => WORDS[n] ?? String(n);

export async function CategoryRail() {
  const list = await categories();

  return (
    <section className="mx-auto max-w-[90rem] px-5 py-20 lg:px-10">
      <SectionHeading
        eyebrow="Find your piece"
        title="Shop by category"
        description={`${countWord(list.length)} categories, from a 2.9-gram everyday hoop to a 68-gram bridal set.`}
      />

      {/*
        A grid on every size now, rather than a side-scrolling rail below `lg`.
        The rail hid most of the nine categories off the right edge behind a
        gesture with no affordance — a grid shows them all and lets the page
        scroll the one direction it already scrolls.
      */}
      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 lg:gap-5">
        {list.map((c, i) => (
          <Link
            key={c.slug}
            href={`/category/${c.slug}`}
            className="group"
          >
            <div className="relative aspect-3/4 overflow-hidden bg-beige">
              {c.image ? (
                <Image
                  src={c.image}
                  alt={c.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 18vw"
                  priority={i < 5}
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent" />
              <LinkPendingOverlay />
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

import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { categories } from "@/lib/data/categories";
import { MODEL } from "@/lib/images";

export default function NotFound() {
  return (
    <div className="grid min-h-[70vh] lg:grid-cols-2">
      <div className="flex items-center px-5 py-20 lg:px-16">
        <div className="max-w-md">
          <p className="font-display text-7xl leading-none font-light text-gold">404</p>
          <h1 className="mt-6 font-display text-3xl leading-tight font-light text-ink lg:text-4xl">
            This piece isn&apos;t here
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            The page may have moved, or a limited run may have sold through and been
            retired. Either way, there is plenty else worth looking at.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/shop" variant="gold">
              Browse jewellery
            </ButtonLink>
            <ButtonLink href="/" variant="outline">
              Back to home
            </ButtonLink>
          </div>

          <div className="mt-12">
            <p className="eyebrow mb-4">Or jump to a category</p>
            <ul className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/category/${c.slug}`}
                    className="inline-block bg-beige px-4 py-2 text-xs text-charcoal transition-colors hover:bg-charcoal hover:text-white"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="relative hidden bg-beige lg:block">
        <Image
          src={MODEL.layeredPendants}
          alt=""
          fill
          sizes="50vw"
          className="object-cover"
        />
      </div>
    </div>
  );
}

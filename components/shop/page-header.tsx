import Image from "next/image";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export function PageHeader({
  eyebrow,
  title,
  description,
  trail,
  image,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  trail: Array<{ label: string; href?: string }>;
  image?: string;
}) {
  if (image) {
    return (
      <header className="relative mb-12 min-h-[26rem] overflow-hidden bg-charcoal">
        <Image
          src={image}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/40 to-charcoal/20" />
        <div className="relative mx-auto flex min-h-[26rem] max-w-[90rem] flex-col justify-end px-5 py-12 lg:px-10">
          <div className="[&_a]:text-white/60 [&_li>span]:text-white [&_svg]:text-white/30">
            <Breadcrumbs trail={trail} />
          </div>
          {eyebrow && (
            <p className="mt-6 text-[10px] tracking-[0.32em] uppercase text-gold-light">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-3 max-w-2xl font-display text-4xl leading-tight font-light text-white lg:text-[3.4rem]">
            {title}
          </h1>
          {description && (
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/70">
              {description}
            </p>
          )}
        </div>
      </header>
    );
  }

  return (
    <header className="mx-auto mb-12 max-w-[90rem] px-5 pt-8 lg:px-10">
      <Breadcrumbs trail={trail} />
      {eyebrow && <p className="eyebrow mt-6">{eyebrow}</p>}
      <h1 className="mt-3 font-display text-4xl leading-tight font-light text-ink lg:text-[3.2rem]">
        {title}
      </h1>
      {description && (
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
          {description}
        </p>
      )}
    </header>
  );
}

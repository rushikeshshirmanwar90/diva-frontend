import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

export function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  linkLabel = "View all",
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  align?: "center" | "left" | "between";
  className?: string;
}) {
  const heading = (
    <div className={cn(align === "center" && "text-center", "max-w-2xl")}>
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h2 className="font-display text-3xl leading-tight font-light text-ink md:text-[2.6rem]">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-sm leading-relaxed text-muted">{description}</p>
      )}
    </div>
  );

  if (align === "between") {
    return (
      <div
        className={cn(
          "flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6",
          className,
        )}
      >
        {heading}
        {href && (
          <Link
            href={href}
            className="link-underline inline-flex items-center gap-2 text-[11px] tracking-luxe uppercase text-charcoal"
          >
            {linkLabel} <ArrowRight width={14} height={14} />
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className={cn(align === "center" && "flex flex-col items-center", className)}>
      {heading}
      {href && (
        <Link
          href={href}
          className="link-underline mt-5 inline-flex items-center gap-2 text-[11px] tracking-luxe uppercase text-charcoal"
        >
          {linkLabel} <ArrowRight width={14} height={14} />
        </Link>
      )}
    </div>
  );
}

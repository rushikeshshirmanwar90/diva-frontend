import Link from "next/link";
import { cn } from "@/lib/cn";

export function Logo({
  className,
  tagline = true,
}: {
  className?: string;
  tagline?: boolean;
}) {
  return (
    <Link href="/" className={cn("group block text-center", className)}>
      <span className="block font-display text-[1.7rem] leading-none font-light tracking-[0.42em] text-ink transition-colors group-hover:text-gold">
        DIVA
      </span>
      {tagline && (
        <span className="mt-1 block text-[8px] tracking-[0.3em] uppercase text-muted">
          Fine Jewellery · Est. 1998
        </span>
      )}
    </Link>
  );
}

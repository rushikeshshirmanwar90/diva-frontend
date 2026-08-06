import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Breadcrumbs({
  trail,
}: {
  trail: Array<{ label: string; href?: string }>;
}) {
  return (
    <nav aria-label="Breadcrumb" className="text-[11px] tracking-wide text-muted">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link href="/" className="hover:text-gold">
            Home
          </Link>
        </li>
        {trail.map((item) => (
          <li key={item.label} className="flex items-center gap-1.5">
            <ChevronRight width={12} height={12} className="text-line" />
            {item.href ? (
              <Link href={item.href} className="hover:text-gold">
                {item.label}
              </Link>
            ) : (
              <span className="text-ink">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

import { discountPercent, formatPaise } from "@/lib/format";
import { cn } from "@/lib/cn";

export function Price({
  price,
  mrp,
  className,
  size = "md",
}: {
  price: number;
  mrp?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const off = mrp ? discountPercent(price, mrp) : 0;
  const scale = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-2xl",
  }[size];

  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-2", className)}>
      <span className={cn("font-medium text-ink", scale)}>{formatPaise(price)}</span>
      {mrp && off > 0 && (
        <>
          <span className="text-xs text-muted line-through">{formatPaise(mrp)}</span>
          <span className="text-xs font-medium text-sale">{off}% off</span>
        </>
      )}
    </span>
  );
}

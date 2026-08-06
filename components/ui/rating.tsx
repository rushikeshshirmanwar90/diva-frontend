import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

export function Rating({
  value,
  count,
  size = 13,
  className,
}: {
  value: number;
  count?: number;
  size?: number;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className="flex" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            width={size}
            height={size}
            className={
              i <= Math.round(value)
                ? "fill-gold text-gold"
                : "fill-transparent text-line"
            }
            strokeWidth={1.5}
          />
        ))}
      </span>
      <span className="text-xs text-muted">
        {value.toFixed(1)}
        {count !== undefined && ` (${count})`}
      </span>
      <span className="sr-only">
        Rated {value} out of 5{count !== undefined && ` from ${count} reviews`}
      </span>
    </span>
  );
}

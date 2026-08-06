import { cn } from "@/lib/cn";

const tones = {
  new: "bg-charcoal text-white",
  bestseller: "bg-gold text-white",
  limited: "bg-white text-charcoal ring-1 ring-charcoal/20",
  sale: "bg-sale text-white",
} as const;

const labels = {
  new: "New in",
  bestseller: "Bestseller",
  limited: "Limited edition",
  sale: "Sale",
} as const;

export function Badge({
  tone,
  children,
  className,
}: {
  tone: keyof typeof tones;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block px-2.5 py-1 text-[9px] font-medium tracking-luxe uppercase",
        tones[tone],
        className,
      )}
    >
      {children ?? labels[tone]}
    </span>
  );
}

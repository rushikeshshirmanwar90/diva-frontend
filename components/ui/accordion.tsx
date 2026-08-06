import { Plus } from "lucide-react";

/** Native <details> so it works without JavaScript and without a client bundle. */
export function Accordion({
  items,
  defaultOpenFirst = false,
}: {
  items: Array<{ q: string; a: React.ReactNode }>;
  defaultOpenFirst?: boolean;
}) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item, i) => (
        <details
          key={item.q}
          open={defaultOpenFirst && i === 0}
          className="group px-1 py-1"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left">
            <span className="font-display text-lg font-light text-ink">{item.q}</span>
            <Plus
              width={16}
              height={16}
              className="shrink-0 text-gold transition-transform duration-300 group-open:rotate-45"
            />
          </summary>
          <div className="pb-6 pr-10 text-sm leading-relaxed text-muted">{item.a}</div>
        </details>
      ))}
    </div>
  );
}

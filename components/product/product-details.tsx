import type { Product } from "@/lib/types";
import { Accordion } from "@/components/ui/accordion";

export function ProductDetails({ product }: { product: Product }) {
  const a = product.attributes;

  const specs: Array<[string, string]> = [
    ["Metal", a.metal],
    ["Purity", a.purity],
    ["Gross weight", a.grossWeight],
    ["Stone", a.stone === "None" ? "No stone" : a.stone],
    ...(a.stoneWeight ? ([["Stone detail", a.stoneWeight]] as Array<[string, string]>) : []),
    ["Wearer", a.gender],
    ["Occasion", a.occasions.join(", ")],
    ["Hallmark", a.huid],
    ["Certification", a.certification],
    ["Country of origin", "India"],
  ];

  return (
    <Accordion
      defaultOpenFirst
      items={[
        {
          q: "Description",
          a: <p>{product.description}</p>,
        },
        {
          q: "Specifications",
          a: (
            <dl className="grid gap-x-10 gap-y-3 sm:grid-cols-2">
              {specs.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-line/70 pb-2">
                  <dt className="text-[10px] tracking-luxe uppercase text-muted">{k}</dt>
                  <dd className="text-right text-sm text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          ),
        },
        {
          q: "Shipping & returns",
          a: (
            <ul className="space-y-2">
              <li>
                Insured, fully tracked delivery in 2–4 working days for in-stock pieces.
                Made-to-order and bridal work takes 6–8 weeks from design freeze.
              </li>
              <li>
                Returns accepted within 15 days of delivery with the hallmark tag
                unbroken. Refunds are credited within 5 working days of receipt.
              </li>
              <li>One free size exchange within 30 days, including two-way courier.</li>
              <li>Photo ID matching the order name is required at delivery.</li>
            </ul>
          ),
        },
        {
          q: "Care instructions",
          a: (
            <ul className="space-y-2">
              <li>Perfume and hairspray first, jewellery second — with a gap.</li>
              <li>
                Store each piece in its own pouch. Uncut stones scratch polished gold.
              </li>
              <li>
                {a.stone === "Uncut Polki" || a.stone === "Pearl"
                  ? "Never use an ultrasonic cleaner on this piece — polki foil and pearl nacre are both destroyed by it. Dry brush only."
                  : "Free ultrasonic cleaning and re-polishing for life at any Diva counter."}
              </li>
            </ul>
          ),
        },
      ]}
    />
  );
}

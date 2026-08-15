import type { CartTotals } from "@/lib/totals";
import { formatPaise } from "@/lib/format";

export function OrderSummary({
  totals,
  coupon,
  title = "Order summary",
}: {
  totals: CartTotals;
  /** A staged, unvalidated code — its actual discount is only known once the backend prices it. */
  coupon?: string | null;
  title?: string;
}) {
  return (
    <div className="bg-beige p-7">
      <p className="text-[11px] tracking-luxe uppercase text-ink">{title}</p>

      <dl className="mt-6 space-y-3 text-sm">
        <Row
          label={`Subtotal (${totals.itemCount} ${totals.itemCount === 1 ? "piece" : "pieces"})`}
          value={formatPaise(totals.subtotal)}
        />
        {totals.savings > 0 && (
          <Row
            label="Discount on MRP"
            value={`− ${formatPaise(totals.savings)}`}
            tone="success"
          />
        )}
        <Row label="GST (3%)" value={formatPaise(totals.gst)} />
        <Row
          label="Insured shipping"
          value={totals.shipping === 0 ? "Complimentary" : formatPaise(totals.shipping)}
          tone={totals.shipping === 0 ? "success" : undefined}
        />
      </dl>

      <div className="mt-6 flex items-baseline justify-between border-t border-line pt-5">
        <span className="text-[11px] tracking-luxe uppercase text-muted">
          Total payable
        </span>
        <span className="font-display text-3xl font-light text-ink">
          {formatPaise(totals.total)}
        </span>
      </div>

      {totals.savings > 0 && (
        <p className="mt-3 text-xs text-success">
          You save {formatPaise(totals.savings)} on this order
        </p>
      )}

      {coupon && (
        <p className="mt-3 text-xs text-muted">
          Code <span className="text-ink">{coupon}</span> will be applied at checkout.
        </p>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success";
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className={tone === "success" ? "text-success" : "text-ink"}>{value}</dd>
    </div>
  );
}

"use client";

import { Check, CircleDashed, ExternalLink, Truck } from "lucide-react";
import type { Order, Tracking } from "@/lib/api/checkout";
import { cn } from "@/lib/cn";

/**
 * Where an order is, at a glance.
 *
 * Five stops — placed, confirmed, shipped, out for delivery, delivered — and
 * the order's own `statusHistory` says which have happened and when. The
 * courier's scans sit beneath as detail, not as the source of truth: a
 * courier feed can be late or empty (a parcel sent outside Shiprocket has no
 * scans at all), but the store always knows what it has done with the order.
 *
 * Cancelled, refunded and returned orders do not fit a forward-only track,
 * so they get a short statement instead of a bar stuck at "confirmed".
 */

type Step = {
  key: string;
  label: string;
  /** Order statuses that mean this step has happened. */
  statuses: string[];
  hint: string;
};

const STEPS: Step[] = [
  { key: "placed", label: "Placed", statuses: ["PENDING"], hint: "Order received" },
  {
    key: "confirmed",
    label: "Confirmed",
    statuses: ["PAYMENT_SUCCESS", "CONFIRMED", "SHIPMENT_CREATED"],
    hint: "Being checked and packed",
  },
  { key: "shipped", label: "Shipped", statuses: ["SHIPPED"], hint: "With the courier" },
  {
    key: "out",
    label: "Out for delivery",
    statuses: ["OUT_FOR_DELIVERY"],
    hint: "Arriving today",
  },
  { key: "delivered", label: "Delivered", statuses: ["DELIVERED"], hint: "Signed for" },
];

/** Step index each live status maps to. Anything later on the track is "reached". */
const STATUS_STEP: Record<string, number> = {
  PENDING: 0,
  PAYMENT_INITIATED: 0,
  PAYMENT_FAILED: 0,
  PAYMENT_SUCCESS: 1,
  CONFIRMED: 1,
  SHIPMENT_CREATED: 1,
  SHIPPED: 2,
  OUT_FOR_DELIVERY: 3,
  DELIVERED: 4,
  RETURN_REQUESTED: 4,
  RETURN_PICKED: 4,
};

const OFF_TRACK: Record<string, { title: string; body: string }> = {
  CANCELLED: {
    title: "This order was cancelled",
    body: "Nothing will be shipped. If a payment was taken, it is refunded to the original method within 5–7 working days.",
  },
  REFUNDED: {
    title: "Refunded",
    body: "The amount has been returned to the payment method you used.",
  },
  ABANDONED: {
    title: "This checkout was not completed",
    body: "No payment was taken and nothing was reserved. Add the pieces to your bag again to order.",
  },
  PAYMENT_FAILED: {
    title: "Payment did not go through",
    body: "Nothing was charged. You can retry from your bag, or place the order again.",
  },
};

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function OrderTracker({ order, tracking }: { order: Order; tracking: Tracking | null }) {
  const offTrack = OFF_TRACK[order.status];
  const isReturn = order.status === "RETURN_REQUESTED" || order.status === "RETURN_PICKED";
  const reached = STATUS_STEP[order.status] ?? 0;

  /** When each step happened, from the order's own history (oldest first). */
  const reachedAt = new Map<string, string>();
  for (const event of order.statusHistory ?? []) {
    const step = STEPS.find((s) => s.statuses.includes(event.status));
    if (step && !reachedAt.has(step.key)) reachedAt.set(step.key, event.at);
  }

  const eta = tracking?.estimatedDeliveryAt;

  return (
    <section className="border border-line">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-beige/50 px-6 py-4">
        <p className="flex items-center gap-2 text-[10px] tracking-luxe uppercase text-gold">
          <Truck width={14} height={14} /> Order tracking
        </p>
        {!offTrack && order.status !== "DELIVERED" && eta && (
          <p className="text-xs text-muted">
            Expected by{" "}
            <span className="text-ink">
              {new Date(eta).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
            </span>
          </p>
        )}
        {order.status === "DELIVERED" && order.deliveredAt && (
          <p className="text-xs text-muted">
            Delivered <span className="text-ink">{formatWhen(order.deliveredAt)}</span>
          </p>
        )}
      </div>

      <div className="px-6 py-6">
        {offTrack ? (
          <div>
            <p className="text-sm text-ink">{offTrack.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">{offTrack.body}</p>
          </div>
        ) : (
          <ol className="grid grid-cols-5 gap-2">
            {STEPS.map((step, index) => {
              const done = index <= reached;
              const current = index === reached;
              const when = reachedAt.get(step.key);
              return (
                <li key={step.key} className="relative text-center">
                  {/* Connector to the previous stop */}
                  {index > 0 && (
                    <span
                      aria-hidden
                      className={cn(
                        "absolute top-3 right-1/2 left-[-50%] h-px",
                        done ? "bg-gold" : "bg-line",
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      "relative mx-auto flex size-6 items-center justify-center rounded-full border text-[10px]",
                      done ? "border-gold bg-gold text-charcoal" : "border-line bg-white text-muted",
                      current && order.status !== "DELIVERED" && "ring-4 ring-gold/15",
                    )}
                  >
                    {done ? (
                      <Check width={12} height={12} strokeWidth={3} />
                    ) : (
                      <CircleDashed width={12} height={12} />
                    )}
                  </span>
                  <p
                    className={cn(
                      "mt-2 text-[10px] tracking-luxe uppercase",
                      done ? "text-ink" : "text-muted",
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="mt-0.5 hidden text-[11px] text-muted sm:block">
                    {when ? formatWhen(when) : current ? step.hint : ""}
                  </p>
                </li>
              );
            })}
          </ol>
        )}

        {isReturn && (
          <p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-muted">
            {order.status === "RETURN_REQUESTED"
              ? "A return has been requested. The courier will collect the parcel; keep it in its original packaging."
              : "The return has been collected. Your refund is issued once it reaches us and is checked."}
          </p>
        )}

        {/* Courier detail */}
        {tracking && (tracking.courierName || tracking.awbCode || tracking.events.length > 0) && (
          <div className="mt-6 border-t border-line pt-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-ink">
                {tracking.courierName ?? "Courier"}
                {tracking.awbCode && <span className="text-muted"> · AWB {tracking.awbCode}</span>}
              </p>
              {tracking.trackingUrl && (
                <a
                  href={tracking.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-gold hover:underline"
                >
                  Track on courier site <ExternalLink width={11} height={11} />
                </a>
              )}
            </div>

            {tracking.events.length > 0 && (
              <ol className="mt-4 space-y-3">
                {tracking.events.map((event, index) => (
                  <li key={`${event.occurredAt}-${index}`} className="flex items-start gap-3 text-xs">
                    <span
                      className={cn(
                        "mt-1 size-1.5 shrink-0 rounded-full",
                        index === 0 ? "bg-gold" : "bg-line",
                      )}
                    />
                    <span>
                      <span className="block text-ink">{event.status.replace(/_/g, " ")}</span>
                      <span className="text-muted">
                        {formatWhen(event.occurredAt)}
                        {event.location ? ` · ${event.location}` : ""}
                        {event.description ? ` — ${event.description}` : ""}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

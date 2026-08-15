"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Loader2, Truck } from "lucide-react";
import {
  cancelOrder,
  getOrder,
  getTracking,
  type Order,
  type Tracking,
} from "@/lib/api/checkout";
import { errorMessage } from "@/lib/api/client";
import { formatDate, formatPaise } from "@/lib/format";
import { Button, ButtonLink } from "@/components/ui/button";

/** Mirrors `CUSTOMER_CANCELLABLE` in diva-backend's `lib/orders/state-machine.ts`. */
const CUSTOMER_CANCELLABLE = new Set([
  "PENDING",
  "PAYMENT_FAILED",
  "PAYMENT_SUCCESS",
  "CONFIRMED",
]);

export function OrderDetailView({ orderNumber }: { orderNumber: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [tracking, setTracking] = useState<Tracking | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const data = await getOrder(orderNumber);
        if (cancelled) return;
        setOrder(data);
      } catch (cause) {
        if (!cancelled) setLoadError(errorMessage(cause));
        return;
      }

      // Not every order has a shipment yet — no tracking is not an error.
      try {
        const data = await getTracking(orderNumber);
        if (!cancelled) setTracking(data);
      } catch {
        if (!cancelled) setTracking(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [orderNumber]);

  const handleCancel = async () => {
    setCancelling(true);
    setCancelError(null);

    try {
      setOrder(await cancelOrder(orderNumber));
    } catch (cause) {
      setCancelError(errorMessage(cause));
    } finally {
      setCancelling(false);
    }
  };

  if (loadError) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20 text-center">
        <p className="text-sm text-muted">{loadError}</p>
        <ButtonLink href="/account/orders" variant="outline" size="md" className="mt-6">
          Back to orders
        </ButtonLink>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 width={22} height={22} className="animate-spin text-muted" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 lg:px-0">
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-2 text-[10px] tracking-luxe uppercase text-muted hover:text-gold"
      >
        <ChevronLeft width={13} height={13} /> All orders
      </Link>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-light text-ink">
            {order.orderNumber}
          </h1>
          <p className="mt-1 text-sm text-muted">Placed {formatDate(order.createdAt)}</p>
        </div>
        <p className="text-[11px] tracking-luxe uppercase text-gold">
          {order.status.replace(/_/g, " ")}
        </p>
      </div>

      {cancelError && (
        <p
          role="alert"
          className="mt-6 border border-[#c0392b]/30 bg-[#c0392b]/5 p-3 text-xs text-[#c0392b]"
        >
          {cancelError}
        </p>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_20rem]">
        <div>
          <ul className="divide-y divide-line border-y border-line">
            {order.items.map((item, index) => (
              <li key={`${item.sku}-${index}`} className="flex items-center gap-4 py-5">
                <Link
                  href={`/product/${item.slug}`}
                  className="relative size-20 shrink-0 overflow-hidden bg-beige"
                >
                  {item.imageUrl && (
                    <Image src={item.imageUrl} alt="" fill sizes="80px" className="object-cover" />
                  )}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/product/${item.slug}`}
                    className="font-display text-lg font-light text-ink hover:text-gold"
                  >
                    {item.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted">
                    {item.size ? `Size ${item.size} · ` : ""}Qty {item.quantity}
                  </p>
                </div>
                <span className="text-sm text-ink">{formatPaise(item.lineTotalPaise)}</span>
              </li>
            ))}
          </ul>

          {tracking && (
            <div className="mt-8 border border-line p-6">
              <p className="flex items-center gap-2 text-[10px] tracking-luxe uppercase text-gold">
                <Truck width={14} height={14} /> Tracking
              </p>
              <p className="mt-2 text-sm text-ink">
                {tracking.courierName ?? "Courier"}
                {tracking.awbCode && ` · AWB ${tracking.awbCode}`}
              </p>
              {tracking.trackingUrl && (
                <a
                  href={tracking.trackingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block text-xs text-gold hover:underline"
                >
                  Track shipment
                </a>
              )}
              {tracking.events.length > 0 && (
                <ol className="mt-5 space-y-3 border-t border-line pt-5">
                  {tracking.events.map((event, index) => (
                    <li key={index} className="flex items-start gap-3 text-xs">
                      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-gold" />
                      <span>
                        <span className="block text-ink">
                          {event.status.replace(/_/g, " ")}
                        </span>
                        <span className="text-muted">
                          {formatDate(event.occurredAt)}
                          {event.location ? ` · ${event.location}` : ""}
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}

          {CUSTOMER_CANCELLABLE.has(order.status) && (
            <Button
              variant="outline"
              size="md"
              className="mt-8"
              onClick={() => void handleCancel()}
              disabled={cancelling}
            >
              {cancelling && <Loader2 width={14} height={14} className="animate-spin" />}
              Cancel order
            </Button>
          )}
        </div>

        <aside>
          <h2 className="text-[10px] tracking-luxe uppercase text-muted">Shipping to</h2>
          <p className="mt-3 text-sm text-ink">{order.shippingAddress.fullName}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            {order.shippingAddress.line1}
            {order.shippingAddress.line2 && <>, {order.shippingAddress.line2}</>}
            <br />
            {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
            {order.shippingAddress.pincode}
            <br />
            {order.shippingAddress.phone}
          </p>

          <h2 className="mt-8 text-[10px] tracking-luxe uppercase text-muted">
            Order total
          </h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="text-ink">{formatPaise(order.totals.subtotalPaise)}</dd>
            </div>
            {order.totals.discountPaise > 0 && (
              <div className="flex justify-between">
                <dt className="text-muted">Discount</dt>
                <dd className="text-gold">-{formatPaise(order.totals.discountPaise)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted">Shipping</dt>
              <dd className="text-ink">
                {order.totals.shippingPaise === 0
                  ? "Free"
                  : formatPaise(order.totals.shippingPaise)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">GST</dt>
              <dd className="text-ink">{formatPaise(order.totals.gstPaise)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-2 text-sm">
              <dt className="text-ink">Total</dt>
              <dd className="text-ink">{formatPaise(order.totals.grandTotalPaise)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}

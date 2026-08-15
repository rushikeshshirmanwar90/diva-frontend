"use client";

import { useEffect, useState } from "react";
import { Mail, MapPin, Package } from "lucide-react";
import { getOrder, type Order } from "@/lib/api/checkout";

/**
 * The three-tile "what happens next" block on `/order-confirmed`.
 *
 * Fetches the real order rather than trusting anything in the URL — the
 * `order` query param is just what the redirect happened to carry, and in
 * demo mode (`CHECKOUT_ENABLED=false`) it's a client-generated number that
 * was never created server-side. `undefined` = loading, `null` = the order
 * couldn't be resolved (demo mode, or a stale/foreign order number), each
 * rendered distinctly rather than guessed at.
 */
export function OrderConfirmationSummary({ orderNumber }: { orderNumber: string }) {
  const [order, setOrder] = useState<Order | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const result = await getOrder(orderNumber);
        if (!cancelled) setOrder(result);
      } catch {
        if (!cancelled) setOrder(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [orderNumber]);

  if (order === undefined) {
    return (
      <div className="grid gap-px bg-line sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-36 animate-pulse bg-white" />
        ))}
      </div>
    );
  }

  if (order === null) {
    return (
      <div className="border border-line bg-white p-7">
        <Package width={20} height={20} strokeWidth={1.3} className="text-gold" />
        <p className="mt-4 text-[10px] tracking-luxe uppercase text-ink">Quality check</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Weighed, hallmarked and photographed within 48 hours. A confirmation email is
          on its way with your delivery details.
        </p>
      </div>
    );
  }

  const eta = new Date(order.createdAt);
  eta.setDate(eta.getDate() + 4);

  const tiles = [
    {
      icon: Package,
      title: "Quality check",
      body: "Weighed, hallmarked and photographed within 48 hours.",
    },
    {
      icon: MapPin,
      title: "Delivering to",
      body: `${order.shippingAddress.line1}, ${order.shippingAddress.city} ${order.shippingAddress.pincode}`,
    },
    {
      icon: Mail,
      title: "Expected by",
      body: eta.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
    },
  ];

  return (
    <div className="grid gap-px bg-line sm:grid-cols-3">
      {tiles.map(({ icon: Icon, title, body }) => (
        <div key={title} className="bg-white p-7">
          <Icon width={20} height={20} strokeWidth={1.3} className="text-gold" />
          <p className="mt-4 text-[10px] tracking-luxe uppercase text-ink">{title}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
        </div>
      ))}
    </div>
  );
}

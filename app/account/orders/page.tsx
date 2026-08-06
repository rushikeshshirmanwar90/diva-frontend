import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { demoOrders } from "@/lib/data/content";
import { formatDate, formatPaise } from "@/lib/format";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "My orders",
  robots: { index: false },
};

const statusTone: Record<string, string> = {
  DELIVERED: "text-success",
  CANCELLED: "text-sale",
  SHIPPED: "text-gold",
};

export default function OrdersPage() {
  return (
    <div>
      <h2 className="font-display text-2xl font-light text-ink">Your orders</h2>
      <p className="mt-2 text-sm text-muted">
        Invoices, tracking and return requests all live here.
      </p>

      <ul className="mt-10 space-y-8">
        {demoOrders.map((order) => (
          <li key={order.orderNumber} className="border border-line">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line bg-beige/50 px-6 py-4">
              <div>
                <p className="text-sm text-ink">{order.orderNumber}</p>
                <p className="mt-0.5 text-xs text-muted">
                  Placed {formatDate(order.placedAt)}
                  {order.awb && ` · AWB ${order.awb} (${order.courier})`}
                </p>
              </div>
              <div className="text-right">
                <p
                  className={cn(
                    "text-[10px] tracking-luxe uppercase",
                    statusTone[order.status] ?? "text-charcoal",
                  )}
                >
                  {order.status.replace(/_/g, " ")}
                </p>
                <p className="mt-0.5 text-sm text-ink">{formatPaise(order.total)}</p>
              </div>
            </div>

            <ul className="divide-y divide-line px-6">
              {order.items.map((item) => (
                <li key={item.productSlug} className="flex items-center gap-4 py-5">
                  <Link
                    href={`/product/${item.productSlug}`}
                    className="relative size-20 shrink-0 overflow-hidden bg-beige"
                  >
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/product/${item.productSlug}`}
                      className="font-display text-lg font-light text-ink hover:text-gold"
                    >
                      {item.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted">
                      {item.variantLabel} · Qty {item.qty}
                    </p>
                  </div>
                  <span className="text-sm text-ink">{formatPaise(item.price)}</span>
                </li>
              ))}
            </ul>

            <div className="border-t border-line px-6 py-6">
              <ol className="flex flex-wrap gap-x-8 gap-y-4">
                {order.timeline.map((step) => (
                  <li key={step.label} className="flex items-start gap-3">
                    <span
                      className={cn(
                        "mt-1 size-2 shrink-0 rounded-full",
                        step.done ? "bg-gold" : "bg-line",
                      )}
                    />
                    <span>
                      <span
                        className={cn(
                          "block text-[10px] tracking-luxe uppercase",
                          step.done ? "text-ink" : "text-muted",
                        )}
                      >
                        {step.label}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-muted">
                        {step.date}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>

              <div className="mt-6 flex flex-wrap gap-5">
                <button
                  type="button"
                  className="text-[10px] tracking-luxe uppercase text-charcoal hover:text-gold"
                >
                  Download invoice
                </button>
                {order.status === "DELIVERED" && (
                  <button
                    type="button"
                    className="text-[10px] tracking-luxe uppercase text-charcoal hover:text-gold"
                  >
                    Request return
                  </button>
                )}
                {order.status === "SHIPPED" && (
                  <button
                    type="button"
                    className="text-[10px] tracking-luxe uppercase text-charcoal hover:text-gold"
                  >
                    Track shipment
                  </button>
                )}
                <button
                  type="button"
                  className="text-[10px] tracking-luxe uppercase text-charcoal hover:text-gold"
                >
                  Need help
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

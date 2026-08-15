"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Package } from "lucide-react";
import { listOrders, type Order } from "@/lib/api/checkout";
import { errorMessage } from "@/lib/api/client";
import { formatDate, formatPaise } from "@/lib/format";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/cn";

const PAGE_SIZE = 10;

const statusTone: Record<string, string> = {
  DELIVERED: "text-success",
  CANCELLED: "text-sale",
  PAYMENT_FAILED: "text-sale",
  ABANDONED: "text-sale",
  REFUNDED: "text-sale",
  SHIPPED: "text-gold",
  OUT_FOR_DELIVERY: "text-gold",
};

export function OrdersListView() {
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setOrders(null);
      setError(null);

      try {
        const result = await listOrders(page, PAGE_SIZE);
        if (cancelled) return;
        setOrders(result.items);
        setTotal(result.total);
      } catch (cause) {
        if (cancelled) return;
        setError(errorMessage(cause));
        setOrders([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <h2 className="font-display text-2xl font-light text-ink">Your orders</h2>
      <p className="mt-2 text-sm text-muted">
        Invoices, tracking and return requests all live here.
      </p>

      {error && (
        <p
          role="alert"
          className="mt-6 border border-[#c0392b]/30 bg-[#c0392b]/5 p-3 text-xs text-[#c0392b]"
        >
          {error}
        </p>
      )}

      {orders === null ? (
        <div className="mt-10 flex justify-center py-10 text-muted">
          <Loader2 width={20} height={20} className="animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={<Package width={24} height={24} strokeWidth={1.3} />}
            title="No orders yet"
            body="Pieces you buy will show up here, with tracking and invoices."
          />
        </div>
      ) : (
        <>
          <ul className="mt-10 space-y-6">
            {orders.map((order) => (
              <li key={order.orderNumber} className="border border-line">
                <Link
                  href={`/account/orders/${order.orderNumber}`}
                  className="flex flex-wrap items-center justify-between gap-4 bg-beige/50 px-6 py-4 transition-colors hover:bg-beige"
                >
                  <div>
                    <p className="text-sm text-ink">{order.orderNumber}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      Placed {formatDate(order.createdAt)} · {order.items.length}{" "}
                      {order.items.length === 1 ? "piece" : "pieces"}
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
                    <p className="mt-0.5 text-sm text-ink">
                      {formatPaise(order.totals.grandTotalPaise)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-6">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="text-[10px] tracking-luxe uppercase text-charcoal hover:text-gold disabled:opacity-30"
              >
                Previous
              </button>
              <span className="text-[11px] text-muted">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="text-[10px] tracking-luxe uppercase text-charcoal hover:text-gold disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

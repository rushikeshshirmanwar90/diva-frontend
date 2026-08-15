"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { listOrders, type Order } from "@/lib/api/checkout";
import { errorMessage } from "@/lib/api/client";
import { formatDate, formatPaise } from "@/lib/format";
import { Button } from "@/components/ui/button";

/**
 * The account overview: real profile fields, an inline edit form, and a
 * preview of the two most recent real orders. `app/account/layout.tsx`
 * already redirects a guest to `/login` before this ever mounts, so `user`
 * here is only null for the one render before that redirect fires.
 */
export function AccountProfileView() {
  const { user, updateProfile } = useAuth();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [recentOrders, setRecentOrders] = useState<Order[] | null>(null);
  const [orderCount, setOrderCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const { items, total } = await listOrders(1, 2);
        if (cancelled) return;
        setRecentOrders(items);
        setOrderCount(total);
      } catch {
        if (!cancelled) {
          setRecentOrders([]);
          setOrderCount(0);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!user) return null;

  const startEditing = () => {
    setName(user.name);
    setPhone(user.phone ?? "");
    setMarketingOptIn(user.marketingOptIn);
    setError(null);
    setEditing(true);
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await updateProfile({
        name: name.trim(),
        phone: phone.trim() || undefined,
        marketingOptIn,
      });
      setEditing(false);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setSaving(false);
    }
  };

  const profile: [string, string][] = [
    ["Full name", user.name],
    ["Email", user.email],
    ["Mobile", user.phone || "Not added"],
  ];

  return (
    <div className="space-y-14">
      <section>
        <div className="grid gap-px bg-line sm:grid-cols-2">
          <div className="bg-white py-7">
            <p className="font-display text-3xl font-light text-ink">
              {orderCount ?? "—"}
            </p>
            <p className="mt-1 text-[10px] tracking-luxe uppercase text-muted">
              Orders placed
            </p>
          </div>
          <div className="bg-white py-7">
            <p className="font-display text-3xl font-light text-ink">
              {formatDate(user.createdAt)}
            </p>
            <p className="mt-1 text-[10px] tracking-luxe uppercase text-muted">
              Member since
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between border-b border-line pb-4">
          <h2 className="font-display text-2xl font-light text-ink">
            Personal details
          </h2>
          {!editing && (
            <button
              type="button"
              onClick={startEditing}
              className="text-[10px] tracking-luxe uppercase text-gold hover:underline"
            >
              Edit
            </button>
          )}
        </div>

        {editing ? (
          <form className="mt-6 space-y-6" onSubmit={handleSave} noValidate>
            {error && (
              <p
                role="alert"
                className="border border-[#c0392b]/30 bg-[#c0392b]/5 p-3 text-xs text-[#c0392b]"
              >
                {error}
              </p>
            )}
            <label className="block">
              <span className="text-[10px] tracking-luxe uppercase text-muted">
                Full name
              </span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                disabled={saving}
                className="mt-2 w-full border-b border-line bg-transparent pb-2.5 text-sm text-ink outline-none transition-colors focus:border-gold disabled:opacity-50"
              />
            </label>
            <label className="block">
              <span className="text-[10px] tracking-luxe uppercase text-muted">
                Mobile
              </span>
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                disabled={saving}
                className="mt-2 w-full border-b border-line bg-transparent pb-2.5 text-sm text-ink outline-none transition-colors focus:border-gold disabled:opacity-50"
              />
            </label>
            <label className="flex items-start gap-3 text-xs leading-relaxed text-muted">
              <input
                type="checkbox"
                checked={marketingOptIn}
                onChange={(event) => setMarketingOptIn(event.target.checked)}
                disabled={saving}
                className="mt-0.5 accent-[#c9a227]"
              />
              <span>
                Send me one letter a month about new pieces and where the gold rate
                has moved.
              </span>
            </label>
            <div className="flex items-center gap-5">
              <Button type="submit" variant="gold" size="md" disabled={saving}>
                {saving && <Loader2 width={14} height={14} className="animate-spin" />}
                Save changes
              </Button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                disabled={saving}
                className="text-[10px] tracking-luxe uppercase text-muted hover:text-charcoal disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <dl className="mt-6 grid gap-x-12 gap-y-5 sm:grid-cols-2">
            {profile.map(([k, v]) => (
              <div key={k} className="border-b border-line/70 pb-3">
                <dt className="text-[10px] tracking-luxe uppercase text-muted">{k}</dt>
                <dd className="mt-1 text-sm text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      <section>
        <div className="flex items-baseline justify-between border-b border-line pb-4">
          <h2 className="font-display text-2xl font-light text-ink">Recent orders</h2>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-2 text-[10px] tracking-luxe uppercase text-gold hover:underline"
          >
            All orders <ArrowRight width={12} height={12} />
          </Link>
        </div>

        {recentOrders === null ? (
          <p className="mt-6 text-sm text-muted">Loading…</p>
        ) : recentOrders.length === 0 ? (
          <p className="mt-6 text-sm text-muted">
            No orders yet — your pieces will show up here once you check out.
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-line">
            {recentOrders.map((order) => (
              <li
                key={order.orderNumber}
                className="flex flex-wrap justify-between gap-4 py-5"
              >
                <div>
                  <Link
                    href={`/account/orders/${order.orderNumber}`}
                    className="text-sm text-ink hover:text-gold"
                  >
                    {order.orderNumber}
                  </Link>
                  <p className="mt-1 text-xs text-muted">
                    {formatDate(order.createdAt)} · {order.items.length}{" "}
                    {order.items.length === 1 ? "piece" : "pieces"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-ink">
                    {formatPaise(order.totals.grandTotalPaise)}
                  </p>
                  <p className="mt-1 text-[10px] tracking-luxe uppercase text-gold">
                    {order.status.replace(/_/g, " ")}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { demoOrders } from "@/lib/data/content";
import { CONTACT } from "@/lib/data/site";
import { formatPaise, formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "My account",
  robots: { index: false },
};

const profile = [
  ["Full name", "Mahesh Giri"],
  ["Email", CONTACT.email],
  ["Mobile", CONTACT.phone],
  ["Date of birth", "14 May 1996"],
  ["Anniversary", "Not added"],
  ["Ring size", "13 (Indian)"],
];

export default function AccountProfilePage() {
  const stats = [
    { label: "Orders placed", value: String(demoOrders.length) },
    {
      label: "Lifetime spend",
      value: formatPaise(demoOrders.reduce((s, o) => s + o.total, 0)),
    },
    { label: "Member since", value: "March 2024" },
  ];

  return (
    <div className="space-y-14">
      <section>
        <div className="grid gap-px bg-line sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="bg-white py-7">
              <p className="font-display text-3xl font-light text-ink">{s.value}</p>
              <p className="mt-1 text-[10px] tracking-luxe uppercase text-muted">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between border-b border-line pb-4">
          <h2 className="font-display text-2xl font-light text-ink">
            Personal details
          </h2>
          <button
            type="button"
            className="text-[10px] tracking-luxe uppercase text-gold hover:underline"
          >
            Edit
          </button>
        </div>
        <dl className="mt-6 grid gap-x-12 gap-y-5 sm:grid-cols-2">
          {profile.map(([k, v]) => (
            <div key={k} className="border-b border-line/70 pb-3">
              <dt className="text-[10px] tracking-luxe uppercase text-muted">{k}</dt>
              <dd className="mt-1 text-sm text-ink">{v}</dd>
            </div>
          ))}
        </dl>
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
        <ul className="mt-6 divide-y divide-line">
          {demoOrders.slice(0, 2).map((o) => (
            <li key={o.orderNumber} className="flex flex-wrap justify-between gap-4 py-5">
              <div>
                <p className="text-sm text-ink">{o.orderNumber}</p>
                <p className="mt-1 text-xs text-muted">
                  {formatDate(o.placedAt)} · {o.items.length}{" "}
                  {o.items.length === 1 ? "piece" : "pieces"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-ink">{formatPaise(o.total)}</p>
                <p className="mt-1 text-[10px] tracking-luxe uppercase text-gold">
                  {o.status.replace(/_/g, " ")}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

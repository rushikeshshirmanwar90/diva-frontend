"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CreditCard,
  Loader2,
  ShieldAlert,
  Smartphone,
} from "lucide-react";
import { useStore } from "@/lib/store/store";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Logo } from "@/components/layout/logo";
import { formatPaise } from "@/lib/format";
import { cn } from "@/lib/cn";

/**
 * A stand-in for PhonePe's hosted payment page.
 *
 * `checkout-view.tsx` sends the browser here only when
 * `NEXT_PUBLIC_CHECKOUT_ENABLED` is off. With it on, `payWithPhonePe` sets
 * `window.location.href` to PhonePe's own domain directly — this route is never
 * part of that path and holds no gateway logic of any kind.
 *
 * It exists because the honest alternative — skipping straight to a confirmed
 * order, which is what this app did before — never shows what "click Pay"
 * looks like. PhonePe's OAuth validates server-side, so there is no way to
 * reach their actual hosted page without real merchant credentials; this is
 * what stands in until those exist.
 *
 * Deliberately **not** styled like PhonePe: no purple, no wordmark, a
 * permanent "Test mode" badge and an explicit disclaimer on the form itself.
 * A screenshot of this should never be mistakable for the genuine gateway.
 *
 * Never talks to diva-backend. The "order" placed on success is the same
 * client-only `placeOrder()` the old demo flow used, called only once payment
 * "succeeds" — mirroring how the real flow creates the order first and only
 * then involves the gateway, just without a server round trip.
 */

type Stage = "form" | "processing" | "declined";

const methods = [
  { id: "upi" as const, label: "UPI", icon: Smartphone, hint: "Any UPI app" },
  { id: "card" as const, label: "Card", icon: CreditCard, hint: "Visa, Mastercard, RuPay" },
  { id: "netbanking" as const, label: "Net banking", icon: Building2, hint: "58 banks" },
];

/** How long the simulated call to a bank takes — long enough to read as
 *  "something happened", short enough not to feel stuck. */
const SETTLE_DELAY_MS = 1400;

export function SandboxGatewayView() {
  const router = useRouter();
  const { hydrated, lines, totals, placeOrder } = useStore();

  const [stage, setStage] = useState<Stage>("form");
  const [method, setMethod] = useState<(typeof methods)[number]["id"]>("upi");

  if (!hydrated) return <div className="min-h-[70vh]" />;

  // Only in the form stage: past that point `placeOrder()` has already
  // emptied the cart, and this guard must not flash the empty state during
  // the brief window before the redirect to /order-confirmed lands.
  if (lines.length === 0 && stage === "form") {
    return (
      <div className="mx-auto max-w-[90rem] px-5 lg:px-10">
        <EmptyState
          icon={<ShieldAlert width={24} height={24} strokeWidth={1.3} />}
          title="Nothing to pay for"
          body="This test gateway has no order to complete — your bag is empty, or this order already went through."
          href="/checkout"
          cta="Back to checkout"
        />
      </div>
    );
  }

  const succeed = () => {
    setStage("processing");
    window.setTimeout(() => {
      const orderNumber = placeOrder();
      router.replace(`/order-confirmed?order=${orderNumber}`);
    }, SETTLE_DELAY_MS);
  };

  const decline = () => {
    setStage("processing");
    window.setTimeout(() => setStage("declined"), SETTLE_DELAY_MS);
  };

  if (stage === "declined") {
    return (
      <Shell>
        <div className="mt-10 text-center">
          <span className="inline-flex size-14 items-center justify-center rounded-full bg-[#c0392b] text-white">
            <AlertTriangle width={24} height={24} strokeWidth={1.4} />
          </span>
          <h1 className="mt-6 font-display text-2xl font-light text-ink">Payment declined</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Simulated decline — nothing was charged, and your bag is untouched.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button variant="gold" onClick={() => setStage("form")}>
              Try again
            </Button>
            <ButtonLink href="/cart" variant="outline">
              Back to bag
            </ButtonLink>
          </div>
        </div>
      </Shell>
    );
  }

  if (stage === "processing") {
    return (
      <Shell>
        <div className="mt-10 text-center">
          <Loader2
            width={32}
            height={32}
            strokeWidth={1.4}
            className="mx-auto animate-spin text-gold"
          />
          <h1 className="mt-6 font-display text-2xl font-light text-ink">
            Processing your payment
          </h1>
          <p className="mt-3 text-sm text-muted">Please don&apos;t close this window.</p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mt-8 flex items-center justify-between border-b border-line pb-6">
        <div>
          <p className="text-[10px] tracking-luxe uppercase text-muted">Paying</p>
          <p className="mt-1 font-display text-2xl text-ink">{formatPaise(totals.total)}</p>
        </div>
        <p className="text-right text-xs text-muted">
          to <span className="text-ink">DIVA — The Indian Jewel</span>
        </p>
      </div>

      <div className="mt-6 flex items-start gap-2 bg-[#c0392b]/5 p-3 text-[11px] leading-relaxed text-[#c0392b]">
        <ShieldAlert width={14} height={14} strokeWidth={1.6} className="mt-0.5 shrink-0" />
        Simulated screen for demos. Not PhonePe&apos;s real gateway — no money moves and no
        payment provider is contacted.
      </div>

      <div className="mt-6">
        <p className="text-[10px] tracking-luxe uppercase text-muted">Pay using</p>
        <div className="mt-3 space-y-2">
          {methods.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMethod(m.id)}
              className={cn(
                "flex w-full items-center gap-3 border p-4 text-left transition-colors",
                method === m.id
                  ? "border-charcoal bg-beige/60"
                  : "border-line hover:border-charcoal/40",
              )}
            >
              <m.icon width={16} height={16} strokeWidth={1.5} className="text-gold" />
              <span className="flex-1">
                <span className="block text-sm text-ink">{m.label}</span>
                <span className="text-xs text-muted">{m.hint}</span>
              </span>
              <span
                className={cn(
                  "flex size-4 shrink-0 items-center justify-center rounded-full border",
                  method === m.id ? "border-gold" : "border-line",
                )}
              >
                {method === m.id && <span className="size-2 rounded-full bg-gold" />}
              </span>
            </button>
          ))}
        </div>
      </div>

      <Button variant="gold" size="lg" className="mt-8 w-full" onClick={succeed}>
        Pay {formatPaise(totals.total)}
      </Button>

      <div className="mt-4 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={decline}
          className="text-muted underline decoration-dotted underline-offset-4 hover:text-ink"
        >
          Simulate a declined payment
        </button>
        <Link href="/checkout" className="inline-flex items-center gap-1 text-muted hover:text-ink">
          <ArrowLeft width={12} height={12} /> Cancel
        </Link>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-t border-line bg-beige/40 py-14">
      <div className="mx-auto max-w-md border border-line bg-white px-6 py-8 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.15)] sm:px-8">
        <div className="flex items-center justify-between">
          <Logo tagline={false} className="text-left" />
          <span className="rounded-full bg-charcoal px-2.5 py-1 text-[9px] font-semibold tracking-luxe uppercase text-white">
            Test mode
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronLeft,
  Clock,
  Gift,
  Lock,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { useStore } from "@/lib/store/store";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { OrderSummary } from "@/components/cart/order-summary";
import { Logo } from "@/components/layout/logo";
import { demoAddresses } from "@/lib/data/content";
import { formatPaise } from "@/lib/format";
import { cn } from "@/lib/cn";

const steps = ["Address", "Payment"] as const;

const paymentMethods = [
  {
    id: "upi",
    label: "UPI",
    sub: "GPay, PhonePe, Paytm — pay from any UPI app",
    badge: "Most used",
  },
  { id: "card", label: "Credit / debit card", sub: "Visa, Mastercard, RuPay, Amex" },
  { id: "netbanking", label: "Net banking", sub: "58 banks supported" },
  {
    id: "emi",
    label: "No-cost EMI",
    sub: "3, 6 or 9 months on orders above ₹25,000",
  },
];

export function CheckoutView() {
  const router = useRouter();
  const { hydrated, lines, totals, coupon, placeOrder } = useStore();
  const [step, setStep] = useState(0);
  const [addressId, setAddressId] = useState(demoAddresses[0]!.id);
  const [payment, setPayment] = useState("upi");
  const [giftNote, setGiftNote] = useState(false);
  const [placing, setPlacing] = useState(false);

  if (!hydrated) return <div className="min-h-[60vh]" />;

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-[90rem] px-5 lg:px-10">
        <EmptyState
          icon={<ShoppingBag width={24} height={24} strokeWidth={1.3} />}
          title="Nothing to check out"
          body="Your bag is empty. Add a piece and the rate will be locked for 30 minutes from this screen."
        />
      </div>
    );
  }

  const placeDemoOrder = () => {
    setPlacing(true);
    const orderNumber = placeOrder();
    // Stands in for the PhonePe redirect + server-to-server status check (§7).
    setTimeout(() => router.push(`/order-confirmed?order=${orderNumber}`), 900);
  };

  return (
    <div className="border-t border-line">
      <div className="mx-auto max-w-6xl px-5 py-10 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <Logo tagline={false} className="text-left" />
          <p className="inline-flex items-center gap-2 text-[10px] tracking-luxe uppercase text-muted">
            <Lock width={12} height={12} className="text-gold" /> Secure checkout
          </p>
        </div>

        {/* Step indicator */}
        <ol className="mt-10 flex items-center gap-3">
          {steps.map((label, i) => (
            <li key={label} className="flex flex-1 items-center gap-3">
              <button
                type="button"
                onClick={() => i < step && setStep(i)}
                className="flex items-center gap-3 text-left"
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full border text-xs transition-colors",
                    i < step
                      ? "border-gold bg-gold text-white"
                      : i === step
                        ? "border-charcoal text-charcoal"
                        : "border-line text-muted",
                  )}
                >
                  {i < step ? <Check width={13} height={13} strokeWidth={3} /> : i + 1}
                </span>
                <span
                  className={cn(
                    "hidden text-[10px] tracking-luxe uppercase sm:inline",
                    i <= step ? "text-ink" : "text-muted",
                  )}
                >
                  {label}
                </span>
              </button>
              {i < steps.length - 1 && (
                <span
                  className={cn(
                    "h-px flex-1",
                    i < step ? "bg-gold" : "bg-line",
                  )}
                />
              )}
            </li>
          ))}
        </ol>

        <div className="mt-12 grid gap-14 lg:grid-cols-[1fr_22rem] lg:gap-16">
          <div>
            {step === 0 && (
              <section>
                <h1 className="font-display text-3xl font-light text-ink">
                  Where should it go?
                </h1>
                <p className="mt-2 text-sm text-muted">
                  Photo ID matching the name below is required at delivery — this is an
                  insured jewellery shipment.
                </p>

                <ul className="mt-8 space-y-4">
                  {demoAddresses.map((a) => (
                    <li key={a.id}>
                      <button
                        type="button"
                        onClick={() => setAddressId(a.id)}
                        className={cn(
                          "flex w-full gap-4 border p-5 text-left transition-colors",
                          addressId === a.id
                            ? "border-charcoal bg-beige/60"
                            : "border-line hover:border-charcoal/40",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-1 flex size-4 shrink-0 items-center justify-center rounded-full border",
                            addressId === a.id ? "border-gold" : "border-line",
                          )}
                        >
                          {addressId === a.id && (
                            <span className="size-2 rounded-full bg-gold" />
                          )}
                        </span>
                        <span className="flex-1">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] tracking-luxe uppercase text-gold">
                              {a.label}
                            </span>
                            {a.isDefault && (
                              <span className="text-[9px] tracking-luxe uppercase text-muted">
                                Default
                              </span>
                            )}
                          </span>
                          <span className="mt-1.5 block text-sm text-ink">{a.name}</span>
                          <span className="mt-1 block text-sm leading-relaxed text-muted">
                            {a.line1}, {a.line2}
                            <br />
                            {a.city}, {a.state} {a.pincode}
                            <br />
                            {a.phone}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>

                <p className="mt-6 text-xs text-muted">
                  Saved addresses are demo data.{" "}
                  <Link href="/account/addresses" className="text-gold hover:underline">
                    Manage addresses
                  </Link>
                </p>

                <label className="mt-8 flex cursor-pointer items-start gap-3 border border-line p-5">
                  <input
                    type="checkbox"
                    checked={giftNote}
                    onChange={(e) => setGiftNote(e.target.checked)}
                    className="mt-0.5 accent-[#c9a227]"
                  />
                  <span>
                    <span className="flex items-center gap-2 text-sm text-ink">
                      <Gift width={14} height={14} className="text-gold" /> Add a
                      handwritten gift note
                    </span>
                    <span className="mt-1 block text-xs text-muted">
                      Written by our team in Bengaluru and tucked into the box. The
                      invoice is emailed to you instead of being enclosed.
                    </span>
                  </span>
                </label>

                {giftNote && (
                  <textarea
                    rows={3}
                    placeholder="Your message, up to 200 characters"
                    maxLength={200}
                    className="mt-4 w-full border border-line p-4 text-sm text-ink outline-none focus:border-gold"
                  />
                )}

                <Button
                  variant="gold"
                  size="lg"
                  className="mt-8 w-full sm:w-auto"
                  onClick={() => setStep(1)}
                >
                  Continue to payment
                </Button>
              </section>
            )}

            {step === 1 && (
              <section>
                <h1 className="font-display text-3xl font-light text-ink">Payment</h1>
                <p className="mt-2 inline-flex items-center gap-2 text-sm text-muted">
                  <Clock width={14} height={14} className="text-gold" />
                  Gold rate locked at ₹7,412/g for the next 29 minutes
                </p>

                <ul className="mt-8 space-y-4">
                  {paymentMethods.map((m) => (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => setPayment(m.id)}
                        className={cn(
                          "flex w-full items-center gap-4 border p-5 text-left transition-colors",
                          payment === m.id
                            ? "border-charcoal bg-beige/60"
                            : "border-line hover:border-charcoal/40",
                        )}
                      >
                        <span
                          className={cn(
                            "flex size-4 shrink-0 items-center justify-center rounded-full border",
                            payment === m.id ? "border-gold" : "border-line",
                          )}
                        >
                          {payment === m.id && (
                            <span className="size-2 rounded-full bg-gold" />
                          )}
                        </span>
                        <span className="flex-1">
                          <span className="flex flex-wrap items-center gap-2 text-sm text-ink">
                            {m.label}
                            {m.badge && (
                              <span className="bg-gold px-2 py-0.5 text-[9px] tracking-luxe uppercase text-white">
                                {m.badge}
                              </span>
                            )}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted">{m.sub}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex items-start gap-3 bg-beige p-5">
                  <ShieldCheck
                    width={18}
                    height={18}
                    strokeWidth={1.4}
                    className="mt-0.5 shrink-0 text-gold"
                  />
                  <p className="text-xs leading-relaxed text-muted">
                    You will be redirected to PhonePe&apos;s secure gateway to complete
                    payment — card and UPI details are never entered on or stored by
                    Diva.{" "}
                    <span className="text-ink">
                      This is a front-end demo: no payment is taken and no data leaves
                      your browser.
                    </span>
                  </p>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Button variant="outline" size="lg" onClick={() => setStep(0)}>
                    <ChevronLeft width={14} height={14} /> Back
                  </Button>
                  <Button
                    variant="gold"
                    size="lg"
                    disabled={placing}
                    onClick={placeDemoOrder}
                  >
                    {placing
                      ? "Placing order…"
                      : `Pay ${formatPaise(totals.total)}`}
                  </Button>
                </div>
              </section>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <ul className="mb-6 divide-y divide-line border-y border-line">
              {lines.map((line) => (
                <li key={line.key} className="flex items-center gap-4 py-4">
                  <div className="relative size-16 shrink-0 overflow-hidden bg-beige">
                    <Image
                      src={line.product.images[0]!}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-ink">{line.product.title}</p>
                    <p className="text-xs text-muted">
                      {line.variant.label} · Qty {line.qty}
                    </p>
                  </div>
                  <span className="text-sm text-ink">
                    {formatPaise(line.lineTotal)}
                  </span>
                </li>
              ))}
            </ul>

            <OrderSummary totals={totals} coupon={coupon} title="You're paying" />

            <ButtonLink href="/cart" variant="ghost" className="mt-4 w-full">
              Edit bag
            </ButtonLink>
          </aside>
        </div>
      </div>
    </div>
  );
}

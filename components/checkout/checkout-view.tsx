"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  Clock,
  Gift,
  Loader2,
  Lock,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { useStore } from "@/lib/store/store";
import { useAuth } from "@/lib/auth/auth-context";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { OrderSummary } from "@/components/cart/order-summary";
import { Logo } from "@/components/layout/logo";
import { AddressForm } from "@/components/account/address-form";
import { createAddress, listAddresses, type Address } from "@/lib/api/addresses";
import { formatPaise } from "@/lib/format";
import { cn } from "@/lib/cn";
import { CHECKOUT_ENABLED, errorMessage } from "@/lib/api/client";
import {
  checkServiceability,
  createOrder,
  initiatePayment,
  type Serviceability,
} from "@/lib/api/checkout";

/**
 * Three-step checkout: address → payment → PhonePe.
 *
 * The payment step does **not** collect a payment method. PhonePe's hosted page
 * does that, and duplicating the choice here would mean asking the customer to
 * pick UPI twice. The list below is presentational — it says what is accepted,
 * and is not a form control.
 *
 * `CHECKOUT_ENABLED` gates the real flow. With it off the component behaves
 * exactly as the demo always has, because this storefront is still shown to the
 * client as a click-through preview and must work with no backend running.
 */

const steps = ["Address", "Payment"] as const;

/** Presentational only — PhonePe's page is where the method is actually chosen. */
const acceptedMethods = [
  { id: "upi", label: "UPI", sub: "GPay, PhonePe, Paytm — pay from any UPI app" },
  { id: "card", label: "Credit / debit card", sub: "Visa, Mastercard, RuPay, Amex" },
  { id: "netbanking", label: "Net banking", sub: "58 banks supported" },
  { id: "wallet", label: "Wallets", sub: "PhonePe wallet and linked balances" },
];

export function CheckoutView() {
  const router = useRouter();
  const { hydrated, lines, totals, coupon } = useStore();
  const { status: authStatus } = useAuth();

  const [step, setStep] = useState(0);

  /** `null` = not fetched yet, distinct from "fetched and empty". */
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [addressId, setAddressId] = useState<string | null>(null);
  const [addingAddress, setAddingAddress] = useState(false);

  const [giftNote, setGiftNote] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * `POST /orders` requires a session (`requireAuth` in
   * `checkout.controller.ts`) — a guest reaching the pay button would only
   * find that out as a 401. Catching it here, before the address step, is a
   * better place to ask someone to sign in than after they have typed one in.
   */
  useEffect(() => {
    if (CHECKOUT_ENABLED && authStatus === "guest") {
      router.replace("/login?redirect=/checkout");
    }
  }, [authStatus, router]);

  useEffect(() => {
    if (!CHECKOUT_ENABLED || authStatus !== "authenticated") return;
    let cancelled = false;

    void (async () => {
      try {
        const list = await listAddresses();
        if (cancelled) return;
        setAddresses(list);
        setAddressId((current) => current ?? list.find((a) => a.isDefault)?._id ?? list[0]?._id ?? null);
      } catch {
        if (!cancelled) setAddresses([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authStatus]);

  const address = addresses?.find((a) => a._id === addressId) ?? null;

  /**
   * The serviceability answer, tagged with the pincode it describes.
   *
   * Storing the pincode alongside the result means "are we still checking?" is
   * *derived* rather than a second piece of state that has to be kept in step
   * with the first — the usual source of a spinner that never stops. A `result`
   * of null with a matching pincode means the lookup was attempted and failed,
   * which is distinct from not having asked yet.
   */
  const [lookup, setLookup] = useState<{
    pincode: string;
    result: Serviceability | null;
  } | null>(null);

  const shipping = address && lookup?.pincode === address.pincode ? lookup.result : null;
  const checkingPincode = CHECKOUT_ENABLED && !!address && lookup?.pincode !== address.pincode;

  /**
   * Confirms the pincode is deliverable, before the customer pays.
   *
   * Discovering after payment that nobody delivers there means refunding a
   * completed order and telling someone their jewellery is not coming. One call
   * at the address step avoids the situation entirely.
   *
   * Re-runs when the selected address or the cart value changes, so the
   * estimate on screen always describes what is actually selected.
   */
  useEffect(() => {
    if (!CHECKOUT_ENABLED || !hydrated || lines.length === 0 || !address) return;

    const pincode = address.pincode;
    let cancelled = false;

    void (async () => {
      let result: Serviceability | null = null;

      try {
        result = await checkServiceability(pincode, totals.total);
      } catch (cause) {
        /**
         * A failed lookup does not block checkout. The pincode is validated
         * again server-side at order creation, so the worst case is a clear
         * rejection one step later — better than refusing to sell because a
         * third-party lookup timed out.
         */
        console.warn("[checkout] Serviceability check failed", cause);
      }

      // A slower earlier request must not overwrite a newer address's answer.
      if (cancelled) return;

      setLookup({ pincode, result });
      if (result && !result.serviceable) {
        setError(result.reason ?? "We cannot deliver to this pincode.");
      }
    })();

    return () => {
      cancelled = true;
    };
    // `address` is a fresh object from `.find()` every render; depending on the
    // primitive pincode (not the object) is what keeps this from re-running on
    // every unrelated render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address?.pincode, hydrated, lines.length, totals.total]);

  if (!hydrated) return <div className="min-h-[60vh]" />;
  if (CHECKOUT_ENABLED && (authStatus === "loading" || authStatus === "guest")) {
    return <div className="min-h-[60vh]" />;
  }

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

  /**
   * Creates the order, then hands the browser to PhonePe.
   *
   * Two calls, not one, and deliberately so: the order exists and holds stock
   * before the gateway is involved, so a customer who abandons the PhonePe page
   * comes back to a resumable order rather than nothing. Nothing is marked paid
   * here — confirmation comes from PhonePe's webhook and our status check, both
   * server-side.
   */
  const payWithPhonePe = async () => {
    if (!address) {
      setError("Please select or add a delivery address.");
      setStep(0);
      return;
    }

    setPlacing(true);
    setError(null);

    try {
      // Re-checked at the moment of payment, not just when the address was
      // picked — a customer can sit on this screen for a while.
      const deliverable = await checkServiceability(address.pincode, totals.total).catch(
        () => null,
      );

      if (deliverable && !deliverable.serviceable) {
        setLookup({ pincode: address.pincode, result: deliverable });
        setError(deliverable.reason ?? "We cannot deliver to this pincode.");
        setStep(0);
        setPlacing(false);
        return;
      }

      const order = await createOrder({
        items: lines.map((line) => ({
          productId: line.product.id,
          variantId: line.variant.id,
          quantity: line.qty,
        })),
        addressId: address._id,
        couponCode: coupon ?? undefined,
        giftNote: giftNote && giftMessage.trim() ? giftMessage.trim() : undefined,
      });

      const payment = await initiatePayment(order.orderNumber);

      /**
       * `window.location`, not `router.push`. PhonePe is a different origin;
       * the Next router only navigates within this app and would do nothing.
       */
      window.location.href = payment.redirectUrl;
    } catch (cause) {
      setError(errorMessage(cause));
      setPlacing(false);
    }
  };

  /**
   * With no real credentials, there is nowhere for `window.location.href` to
   * send the browser — PhonePe's OAuth validates server-side, so a made-up
   * client id 401s rather than opening any page. `/checkout/sandbox-gateway`
   * is what stands in: a clearly-labelled simulator, not a skip straight to
   * "order confirmed", so a click on Pay still shows *something* happening.
   */
  const onPay = () => {
    if (CHECKOUT_ENABLED) {
      void payWithPhonePe();
      return;
    }
    setPlacing(true);
    router.push("/checkout/sandbox-gateway");
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
                <span className={cn("h-px flex-1", i < step ? "bg-gold" : "bg-line")} />
              )}
            </li>
          ))}
        </ol>

        {error && (
          <div
            role="alert"
            className="mt-8 flex items-start gap-3 border border-[#c0392b]/30 bg-[#c0392b]/5 p-4"
          >
            <AlertTriangle
              width={16}
              height={16}
              strokeWidth={1.6}
              className="mt-0.5 shrink-0 text-[#c0392b]"
            />
            <p className="text-sm text-[#c0392b]">{error}</p>
          </div>
        )}

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

                {CHECKOUT_ENABLED ? (
                  addresses === null ? (
                    <div className="mt-8 flex justify-center py-10 text-muted">
                      <Loader2 width={20} height={20} className="animate-spin" />
                    </div>
                  ) : addingAddress || addresses.length === 0 ? (
                    <div className="mt-8">
                      <AddressForm
                        onCancel={() => setAddingAddress(false)}
                        onSaved={(saved) => {
                          setAddresses((current) => [...(current ?? []), saved]);
                          setAddressId(saved._id);
                          setAddingAddress(false);
                        }}
                        save={(input) => createAddress(input)}
                      />
                    </div>
                  ) : (
                    <>
                      <ul className="mt-8 space-y-4">
                        {addresses.map((a) => (
                          <li key={a._id}>
                            <button
                              type="button"
                              onClick={() => setAddressId(a._id)}
                              className={cn(
                                "flex w-full gap-4 border p-5 text-left transition-colors",
                                addressId === a._id
                                  ? "border-charcoal bg-beige/60"
                                  : "border-line hover:border-charcoal/40",
                              )}
                            >
                              <span
                                className={cn(
                                  "mt-1 flex size-4 shrink-0 items-center justify-center rounded-full border",
                                  addressId === a._id ? "border-gold" : "border-line",
                                )}
                              >
                                {addressId === a._id && (
                                  <span className="size-2 rounded-full bg-gold" />
                                )}
                              </span>
                              <span className="flex-1">
                                <span className="flex flex-wrap items-center gap-2">
                                  <span className="text-[10px] tracking-luxe uppercase text-gold">
                                    {a.label || a.type}
                                  </span>
                                  {a.isDefault && (
                                    <span className="text-[9px] tracking-luxe uppercase text-muted">
                                      Default
                                    </span>
                                  )}
                                </span>
                                <span className="mt-1.5 block text-sm text-ink">
                                  {a.fullName}
                                </span>
                                <span className="mt-1 block text-sm leading-relaxed text-muted">
                                  {a.line1}
                                  {a.line2 ? `, ${a.line2}` : ""}
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

                      <button
                        type="button"
                        onClick={() => setAddingAddress(true)}
                        className="mt-4 inline-flex items-center gap-2 text-[10px] tracking-luxe uppercase text-gold hover:underline"
                      >
                        <Plus width={12} height={12} /> Add a new address
                      </button>
                    </>
                  )
                ) : (
                  <div className="mt-8 border border-line bg-beige p-5 text-xs leading-relaxed text-muted">
                    This build is a front-end demo: address collection and the delivery
                    check are real once checkout is live. The next screen simulates a
                    payment gateway.
                  </div>
                )}

                {/* Delivery estimate for the selected pincode */}
                {CHECKOUT_ENABLED && address && (
                  <div className="mt-6 flex items-start gap-3 bg-beige p-4">
                    {checkingPincode ? (
                      <>
                        <Loader2
                          width={16}
                          height={16}
                          className="mt-0.5 shrink-0 animate-spin text-gold"
                        />
                        <p className="text-xs text-muted">
                          Checking delivery to {address.pincode}…
                        </p>
                      </>
                    ) : shipping?.serviceable ? (
                      <>
                        <Truck
                          width={16}
                          height={16}
                          strokeWidth={1.5}
                          className="mt-0.5 shrink-0 text-gold"
                        />
                        <p className="text-xs leading-relaxed text-muted">
                          Delivers to {shipping.pincode} in{" "}
                          <span className="text-ink">
                            {shipping.estimatedDays
                              ? `${shipping.estimatedDays.min}–${shipping.estimatedDays.max} days`
                              : "3–7 days"}
                          </span>
                          {shipping.courierName && ` via ${shipping.courierName}`}.{" "}
                          {shipping.shippingChargePaise === 0
                            ? "Insured shipping is free on this order."
                            : `Insured shipping ${formatPaise(shipping.shippingChargePaise)}.`}
                        </p>
                      </>
                    ) : shipping ? (
                      <>
                        <AlertTriangle
                          width={16}
                          height={16}
                          strokeWidth={1.5}
                          className="mt-0.5 shrink-0 text-[#c0392b]"
                        />
                        <p className="text-xs text-[#c0392b]">
                          {shipping.reason ?? "We cannot deliver to this pincode."}
                        </p>
                      </>
                    ) : null}
                  </div>
                )}

                {CHECKOUT_ENABLED && addresses && addresses.length > 0 && !addingAddress && (
                  <p className="mt-6 text-xs text-muted">
                    <Link href="/account/addresses" className="text-gold hover:underline">
                      Manage saved addresses
                    </Link>
                  </p>
                )}

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
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    placeholder="Your message, up to 200 characters"
                    maxLength={200}
                    className="mt-4 w-full border border-line p-4 text-sm text-ink outline-none focus:border-gold"
                  />
                )}

                <Button
                  variant="gold"
                  size="lg"
                  className="mt-8 w-full sm:w-auto"
                  disabled={
                    (CHECKOUT_ENABLED && !address) || (shipping ? !shipping.serviceable : false)
                  }
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
                  Your price is held for 30 minutes from this screen
                </p>

                <p className="mt-8 text-[10px] tracking-luxe uppercase text-muted">
                  Accepted on the next screen
                </p>

                {/* Not a form control: PhonePe's hosted page collects the method. */}
                <ul className="mt-4 space-y-3">
                  {acceptedMethods.map((m) => (
                    <li
                      key={m.id}
                      className="flex items-center gap-4 border border-line p-5"
                    >
                      <Check
                        width={14}
                        height={14}
                        strokeWidth={2}
                        className="shrink-0 text-gold"
                      />
                      <span className="flex-1">
                        <span className="block text-sm text-ink">{m.label}</span>
                        <span className="mt-0.5 block text-xs text-muted">{m.sub}</span>
                      </span>
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
                    {CHECKOUT_ENABLED ? (
                      <>
                        You will be redirected to PhonePe&apos;s secure gateway to complete
                        payment — card and UPI details are never entered on or stored by
                        Diva.
                      </>
                    ) : (
                      <span className="text-ink">
                        This build is a front-end demo: the next screen simulates a
                        payment gateway for preview purposes. No real gateway is
                        contacted, no payment is taken, and no data leaves your browser.
                      </span>
                    )}
                  </p>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    disabled={placing}
                    onClick={() => setStep(0)}
                  >
                    <ChevronLeft width={14} height={14} /> Back
                  </Button>
                  <Button variant="gold" size="lg" disabled={placing} onClick={onPay}>
                    {placing ? (
                      <>
                        <Loader2 width={14} height={14} className="animate-spin" />
                        {CHECKOUT_ENABLED ? "Taking you to PhonePe…" : "Opening test gateway…"}
                      </>
                    ) : (
                      `Pay ${formatPaise(totals.total)}`
                    )}
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
                  <span className="text-sm text-ink">{formatPaise(line.lineTotal)}</span>
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

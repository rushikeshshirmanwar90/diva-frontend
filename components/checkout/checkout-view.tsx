"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Banknote,
  Check,
  ChevronLeft,
  Clock,
  Gift,
  Loader2,
  Lock,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
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
import { errorMessage } from "@/lib/api/client";
import {
  checkServiceability,
  createOrder,
  initiatePayment,
  type CheckoutPaymentMethod,
  type Serviceability,
} from "@/lib/api/checkout";

/**
 * Two-step checkout: address → payment.
 *
 * The payment step collects one thing only: pay online, or cash on delivery.
 * It does **not** ask for UPI vs card — PhonePe's hosted page does that, and
 * duplicating the choice here would mean asking the customer to pick UPI
 * twice. The `acceptedMethods` list under the online option is presentational,
 * not a form control.
 *
 * A COD order never leaves this app. The server confirms it on creation, so
 * the success redirect happens here rather than on the payment-return page.
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
  const { hydrated, lines, totals, coupon, clearCart } = useStore();
  const { status: authStatus } = useAuth();

  const [step, setStep] = useState(0);

  /** `null` = not fetched yet, distinct from "fetched and empty". */
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [addressId, setAddressId] = useState<string | null>(null);
  const [addingAddress, setAddingAddress] = useState(false);

  const [giftNote, setGiftNote] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>("PHONEPE");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * `POST /orders` requires a session (`requireAuth` in
   * `checkout.controller.ts`) — a guest reaching the pay button would only
   * find that out as a 401. Catching it here, before the address step, is a
   * better place to ask someone to sign in than after they have typed one in.
   */
  useEffect(() => {
    if (authStatus === "guest") {
      router.replace("/login?redirect=/checkout");
    }
  }, [authStatus, router]);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
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
  const checkingPincode = !!address && lookup?.pincode !== address.pincode;

  /**
   * Unknown until the serviceability answer is in; treated as offered so a
   * failed lookup does not silently hide the option. The server re-checks the
   * same policy at order creation and answers with a clear message if not.
   */
  const codAvailable = shipping ? shipping.codAvailable : true;
  const codUnavailableReason = shipping?.codUnavailableReason;

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
    if (!hydrated || lines.length === 0 || !address) return;

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
      // A cart edit can push the total over the COD cap while COD is selected.
      if (result && !result.codAvailable) {
        setPaymentMethod("PHONEPE");
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
  if (authStatus === "loading" || authStatus === "guest") {
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
   * Creates the order, then either hands the browser to PhonePe or — for cash
   * on delivery — goes straight to the confirmation page.
   *
   * Prepaid is two calls, not one, and deliberately so: the order exists and
   * holds stock before the gateway is involved, so a customer who abandons the
   * PhonePe page comes back to a resumable order rather than nothing. Nothing
   * is marked paid here — confirmation comes from PhonePe's webhook and our
   * status check, both server-side.
   *
   * COD is one call. The server confirms the order in the same request (there
   * is no payment to wait for), so `status` comes back CONFIRMED and the local
   * bag can be cleared immediately.
   */
  const placeOrder = async () => {
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

      if (paymentMethod === "COD" && deliverable && !deliverable.codAvailable) {
        setLookup({ pincode: address.pincode, result: deliverable });
        setPaymentMethod("PHONEPE");
        setError(
          deliverable.codUnavailableReason ??
            "Cash on delivery is not available for this order. Please pay online.",
        );
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
        paymentMethod,
      });

      if (paymentMethod === "COD") {
        clearCart();
        router.replace(`/order-confirmed?order=${order.orderNumber}`);
        return;
      }

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
                      ? "border-gold bg-gold text-charcoal"
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

                {addresses === null ? (
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
                )}

                {/* Delivery estimate for the selected pincode */}
                {address && (
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
                          Insured shipping is complimentary.
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

                {addresses && addresses.length > 0 && !addingAddress && (
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
                  disabled={!address || (shipping ? !shipping.serviceable : false)}
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
                  How would you like to pay?
                </p>

                <div role="radiogroup" aria-label="Payment method" className="mt-4 space-y-4">
                  {/* Pay online */}
                  <button
                    type="button"
                    role="radio"
                    aria-checked={paymentMethod === "PHONEPE"}
                    onClick={() => setPaymentMethod("PHONEPE")}
                    className={cn(
                      "flex w-full gap-4 border p-5 text-left transition-colors",
                      paymentMethod === "PHONEPE"
                        ? "border-charcoal bg-beige/60"
                        : "border-line hover:border-charcoal/40",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-1 flex size-4 shrink-0 items-center justify-center rounded-full border",
                        paymentMethod === "PHONEPE" ? "border-gold" : "border-line",
                      )}
                    >
                      {paymentMethod === "PHONEPE" && (
                        <span className="size-2 rounded-full bg-gold" />
                      )}
                    </span>
                    <span className="flex-1">
                      <span className="flex items-center gap-2 text-sm text-ink">
                        <Smartphone width={14} height={14} className="text-gold" />
                        Pay online
                      </span>
                      <span className="mt-1 block text-xs text-muted">
                        UPI, cards, net banking and wallets via PhonePe&apos;s secure page.
                      </span>

                      {paymentMethod === "PHONEPE" && (
                        // Not a form control: PhonePe's hosted page collects the method.
                        <ul className="mt-4 space-y-2 border-t border-line pt-4">
                          {acceptedMethods.map((m) => (
                            <li key={m.id} className="flex items-center gap-3">
                              <Check
                                width={12}
                                height={12}
                                strokeWidth={2}
                                className="shrink-0 text-gold"
                              />
                              <span className="text-xs text-ink">{m.label}</span>
                              <span className="hidden text-xs text-muted sm:inline">
                                · {m.sub}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </span>
                  </button>

                  {/* Cash on delivery */}
                  <button
                    type="button"
                    role="radio"
                    aria-checked={paymentMethod === "COD"}
                    aria-disabled={!codAvailable}
                    disabled={!codAvailable}
                    onClick={() => setPaymentMethod("COD")}
                    className={cn(
                      "flex w-full gap-4 border p-5 text-left transition-colors",
                      !codAvailable
                        ? "cursor-not-allowed border-line opacity-60"
                        : paymentMethod === "COD"
                          ? "border-charcoal bg-beige/60"
                          : "border-line hover:border-charcoal/40",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-1 flex size-4 shrink-0 items-center justify-center rounded-full border",
                        paymentMethod === "COD" ? "border-gold" : "border-line",
                      )}
                    >
                      {paymentMethod === "COD" && (
                        <span className="size-2 rounded-full bg-gold" />
                      )}
                    </span>
                    <span className="flex-1">
                      <span className="flex items-center gap-2 text-sm text-ink">
                        <Banknote width={14} height={14} className="text-gold" />
                        Cash on delivery
                      </span>
                      <span className="mt-1 block text-xs text-muted">
                        {codAvailable
                          ? `Pay ${formatPaise(totals.total)} to the courier when your order arrives — cash or UPI at the door.`
                          : (codUnavailableReason ?? "Not available for this order.")}
                      </span>
                    </span>
                  </button>
                </div>

                {/* Only the online path needs the reassurance about where card details go. */}
                {paymentMethod === "PHONEPE" && (
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
                      Diva.
                    </p>
                  </div>
                )}

                <div className="mt-8 flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    disabled={placing}
                    onClick={() => setStep(0)}
                  >
                    <ChevronLeft width={14} height={14} /> Back
                  </Button>
                  <Button
                    variant="gold"
                    size="lg"
                    disabled={placing}
                    onClick={() => void placeOrder()}
                  >
                    {placing ? (
                      <>
                        <Loader2 width={14} height={14} className="animate-spin" />
                        {paymentMethod === "COD" ? "Placing your order…" : "Taking you to PhonePe…"}
                      </>
                    ) : paymentMethod === "COD" ? (
                      `Place order · ${formatPaise(totals.total)}`
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

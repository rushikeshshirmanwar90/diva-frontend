"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { useStore } from "@/lib/store/store";
import { errorMessage } from "@/lib/api/client";
import { paymentStatus, type PaymentStatus } from "@/lib/api/checkout";
import { formatPaise } from "@/lib/format";

/**
 * Confirms a payment after the PhonePe redirect.
 *
 * This page never decides anything. It polls our status endpoint, which asks
 * PhonePe directly — the customer landing here means only that their browser
 * came back, and the URL they came back with is theirs to edit. Meanwhile
 * PhonePe's webhook is doing the same work server-side; whichever arrives first
 * settles the order, and both are safe to run twice.
 *
 * Polling stops at a hard ceiling. A payment still pending after that is not
 * lost — the reconciliation sweep resolves it and the customer is emailed — so
 * the honest thing to show is "we are still confirming", not a spinner forever.
 */

const POLL_INTERVAL_MS = 2500;
const MAX_ATTEMPTS = 24; // ~60 seconds

export function PaymentReturnView() {
  const router = useRouter();
  const params = useSearchParams();
  const { clearCart } = useStore();

  const reference = params.get("ref");

  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exhausted, setExhausted] = useState(false);

  // Guards against React 19 double-invoking the effect in development and
  // firing two polling loops at a rate-limited endpoint.
  const started = useRef(false);

  useEffect(() => {
    if (!reference || started.current) return;
    started.current = true;

    const controller = new AbortController();
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      attempts += 1;

      try {
        const result = await paymentStatus(reference, controller.signal);
        setStatus(result);

        if (result.status === "SUCCESS") {
          // The order is server-side now; the local bag has served its purpose.
          clearCart();
          router.replace(`/order-confirmed?order=${result.orderNumber}`);
          return;
        }

        if (result.status === "FAILED") return;
      } catch (cause) {
        if (controller.signal.aborted) return;
        setError(errorMessage(cause));
        return;
      }

      if (attempts >= MAX_ATTEMPTS) {
        setExhausted(true);
        return;
      }

      timer = setTimeout(poll, POLL_INTERVAL_MS);
    };

    void poll();

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [reference, clearCart, router]);

  if (!reference) {
    return (
      <Shell
        icon={<AlertTriangle width={26} height={26} strokeWidth={1.4} />}
        tone="error"
        title="We could not identify this payment"
        body="The payment reference is missing from this link. If money left your account, it will be confirmed or returned automatically — please check your orders in a few minutes."
      >
        <ButtonLink href="/account/orders" variant="gold" size="lg">
          View my orders
        </ButtonLink>
      </Shell>
    );
  }

  if (error) {
    return (
      <Shell
        icon={<AlertTriangle width={26} height={26} strokeWidth={1.4} />}
        tone="error"
        title="We could not reach our servers"
        body={error}
      >
        <Button variant="gold" size="lg" onClick={() => window.location.reload()}>
          <RefreshCw width={14} height={14} /> Try again
        </Button>
      </Shell>
    );
  }

  if (status?.status === "FAILED") {
    return (
      <Shell
        icon={<AlertTriangle width={26} height={26} strokeWidth={1.4} />}
        tone="error"
        title="That payment did not go through"
        body={
          status.failureMessage ??
          "Your bank did not complete the payment. Nothing has been charged."
        }
      >
        <p className="mb-6 text-xs text-muted">
          Your bag is still intact and the items are held for you. Order{" "}
          <span className="text-ink">{status.orderNumber}</span>
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <ButtonLink href="/checkout" variant="gold" size="lg">
            Try paying again
          </ButtonLink>
          <ButtonLink href="/cart" variant="outline" size="lg">
            Back to bag
          </ButtonLink>
        </div>
      </Shell>
    );
  }

  if (exhausted) {
    return (
      <Shell
        icon={<Loader2 width={26} height={26} strokeWidth={1.4} />}
        tone="neutral"
        title="Still confirming your payment"
        body="Your bank is taking longer than usual. This is normal and nothing is lost — we will confirm it automatically and email you the moment it settles."
      >
        <p className="mb-6 text-xs text-muted">
          Reference <span className="text-ink">{reference}</span>
        </p>
        <ButtonLink href="/account/orders" variant="gold" size="lg">
          View my orders
        </ButtonLink>
      </Shell>
    );
  }

  return (
    <Shell
      icon={<Loader2 width={26} height={26} strokeWidth={1.4} className="animate-spin" />}
      tone="neutral"
      title="Confirming your payment"
      body="Please keep this page open — this usually takes a few seconds. Do not press back or refresh."
    >
      {status && (
        <p className="text-xs text-muted">
          {formatPaise(status.amountPaise)} · Order{" "}
          <span className="text-ink">{status.orderNumber}</span>
        </p>
      )}
    </Shell>
  );
}

function Shell({
  icon,
  tone,
  title,
  body,
  children,
}: {
  icon: React.ReactNode;
  tone: "neutral" | "error" | "success";
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="border-t border-line">
      <div className="mx-auto max-w-xl px-5 py-20 text-center lg:px-10">
        <Logo tagline={false} className="mx-auto" />

        <span
          className={
            tone === "error"
              ? "mt-12 inline-flex size-14 items-center justify-center rounded-full bg-[#c0392b] text-white"
              : tone === "success"
                ? "mt-12 inline-flex size-14 items-center justify-center rounded-full bg-gold text-white"
                : "mt-12 inline-flex size-14 items-center justify-center rounded-full bg-charcoal text-white"
          }
        >
          {icon}
        </span>

        <h1 className="mt-8 font-display text-3xl font-light text-ink">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">{body}</p>

        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentReturnView } from "@/components/checkout/payment-return-view";

export const metadata: Metadata = {
  title: "Confirming your payment",
  robots: { index: false },
};

/**
 * Where PhonePe sends the browser back to.
 *
 * The URL is fully under the customer's control, so nothing on this page is
 * trusted: it reads a reference from the query string and asks *our* server
 * what the gateway says. Arriving here proves only that the customer came back.
 */
export default function PaymentReturnPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh]" />}>
      <PaymentReturnView />
    </Suspense>
  );
}

export const dynamic = "force-dynamic";

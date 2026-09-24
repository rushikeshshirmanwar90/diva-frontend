import type { Metadata } from "next";
import { Suspense } from "react";
import { ConfirmAccountDeletionForm } from "@/components/auth/confirm-account-deletion-form";

export const metadata: Metadata = {
  title: "Confirm account deletion",
  robots: { index: false },
};

export default function ConfirmAccountDeletionPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh]" />}>
      <ConfirmAccountDeletionForm />
    </Suspense>
  );
}

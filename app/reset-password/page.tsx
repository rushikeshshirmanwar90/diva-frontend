import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Choose a new password",
  robots: { index: false },
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh]" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AuthShell, Field } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { resetPassword } from "@/lib/api/auth";
import { ApiError, errorMessage } from "@/lib/api/client";

/** The page the reset email links to: `/reset-password?token=…`. */
export function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (password !== confirm) {
      setFieldErrors({ confirm: "The two passwords don't match." });
      return;
    }
    setSubmitting(true);
    setError(null);
    setFieldErrors({});
    try {
      await resetPassword(token, password);
      router.push("/login?reset=1");
    } catch (cause) {
      if (cause instanceof ApiError && cause.details) {
        setFieldErrors(Object.fromEntries(cause.details.map((d) => [d.path, d.message])));
      }
      setError(errorMessage(cause));
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <AuthShell
        eyebrow="Reset your password"
        title="This link is incomplete"
        intro="Open the link from the email we sent you, or request a new one."
        footer={
          <Link href="/forgot-password" className="link-underline text-charcoal">
            Request a new link
          </Link>
        }
      >
        <div />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Almost there"
      title="Choose a new password"
      intro="You'll be signed out everywhere else once it's set."
      footer={
        <>
          Link expired?{" "}
          <Link href="/forgot-password" className="link-underline text-charcoal">
            Request a new one
          </Link>
        </>
      }
    >
      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        {error && (
          <p role="alert" className="border border-[#c0392b]/30 bg-[#c0392b]/5 p-3 text-xs text-[#c0392b]">
            {error}
          </p>
        )}
        <Field
          label="New password"
          type="password"
          name="password"
          placeholder="At least 10 characters"
          autoComplete="new-password"
          value={password}
          onChange={setPassword}
          error={fieldErrors.password}
          required
          disabled={submitting}
        />
        <Field
          label="Confirm password"
          type="password"
          name="confirm"
          placeholder="Once more"
          autoComplete="new-password"
          value={confirm}
          onChange={setConfirm}
          error={fieldErrors.confirm}
          required
          disabled={submitting}
        />
        <Button type="submit" variant="gold" size="lg" className="w-full" disabled={submitting || !password || !confirm}>
          {submitting && <Loader2 width={14} height={14} className="animate-spin" />}
          Set new password
        </Button>
      </form>
    </AuthShell>
  );
}

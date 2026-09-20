"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Loader2, MailCheck } from "lucide-react";
import { AuthShell, Field } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { DEFAULT_CONTACT as CONTACT } from "@/lib/data/contact-defaults";
import { forgotPassword } from "@/lib/api/auth";
import { errorMessage } from "@/lib/api/client";

/**
 * Asks for the address, then says "check your email" whether or not an
 * account exists — the backend answers identically either way so this page
 * cannot be used to check who is a customer.
 */
export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await forgotPassword(email.trim().toLowerCase());
      setSent(true);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <AuthShell
        eyebrow="Check your email"
        title="Reset link sent"
        intro={`If there is an account for ${email.trim().toLowerCase()}, a link to choose a new password is on its way. It works for 30 minutes.`}
        footer={
          <>
            Nothing arrived?{" "}
            <button type="button" onClick={() => setSent(false)} className="link-underline text-charcoal">
              Try another address
            </button>
          </>
        }
      >
        <div className="flex items-center gap-3 border border-line bg-beige/50 p-4 text-sm text-charcoal">
          <MailCheck width={18} height={18} strokeWidth={1.5} className="shrink-0 text-gold" />
          Check your spam folder too — the sender is Diva.
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Forgot your password?"
      title="Reset your password"
      intro="Enter the email you registered with and we'll send a link to choose a new one."
      footer={
        <>
          Remembered it?{" "}
          <Link href="/login" className="link-underline text-charcoal">
            Sign in
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
          label="Email"
          type="email"
          name="email"
          placeholder={CONTACT.email}
          autoComplete="username"
          value={email}
          onChange={setEmail}
          required
          disabled={submitting}
        />
        <Button type="submit" variant="gold" size="lg" className="w-full" disabled={submitting || !email.trim()}>
          {submitting && <Loader2 width={14} height={14} className="animate-spin" />}
          Send reset link
        </Button>
      </form>
    </AuthShell>
  );
}

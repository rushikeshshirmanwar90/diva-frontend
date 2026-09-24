"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Loader2, MailCheck } from "lucide-react";
import { AuthShell, Field } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { DEFAULT_CONTACT as CONTACT } from "@/lib/data/contact-defaults";
import { requestAccountDeletion } from "@/lib/api/auth";
import { errorMessage } from "@/lib/api/client";

/**
 * The public, no-login "delete my account" page — the URL app-store listings
 * point at for account deletion.
 *
 * Asks for the address, then says "check your email" whether or not an
 * account exists, for the same reason `ForgotPasswordForm` does: the backend
 * answers identically either way so this page cannot be used to check who is
 * a customer. Deletion only happens once the emailed link is opened and
 * confirmed on `/delete-account/confirm` — never from this form directly.
 */
export function DeleteAccountForm() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await requestAccountDeletion(email.trim().toLowerCase());
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
        title="Confirmation link sent"
        intro={`If there is a DIVA account for ${email.trim().toLowerCase()}, a link to confirm deletion is on its way. It works for 30 minutes and nothing is deleted until you open it and confirm.`}
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
      eyebrow="Delete your account"
      title="How to delete your account"
      intro="You can close your DIVA account and remove your personal data at any time, whether or not you still have the app installed. It takes three steps."
      footer={
        <>
          Changed your mind?{" "}
          <Link href="/login" className="link-underline text-charcoal">
            Sign in instead
          </Link>
        </>
      }
    >
      <ol className="space-y-5">
        {[
          {
            title: "Enter your email",
            body: "Type the address your DIVA account is registered with, in the form below, and submit it.",
          },
          {
            title: "Open the confirmation email",
            body: "We'll send a link to that address within a couple of minutes. It stays valid for 30 minutes.",
          },
          {
            title: "Confirm the deletion",
            body: "Click the link and press the confirm button on the page it opens. Your account is deleted immediately — this step is the only one that actually removes anything.",
          },
        ].map((step, index) => (
          <li key={step.title} className="flex gap-4">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-charcoal/25 text-[11px] text-charcoal">
              {index + 1}
            </span>
            <div>
              <p className="text-sm text-ink">{step.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-8 border border-[#c0392b]/30 bg-[#c0392b]/5 p-4 text-xs leading-relaxed text-charcoal">
        Deleting your account permanently closes it and signs you out
        everywhere. Order and invoice records are kept as long as Indian tax
        law requires; everything else tied to your account — addresses,
        wishlist, saved details — is removed. This cannot be undone.
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
        {error && (
          <p role="alert" className="border border-[#c0392b]/30 bg-[#c0392b]/5 p-3 text-xs text-[#c0392b]">
            {error}
          </p>
        )}
        <Field
          label="Email — step 1"
          type="email"
          name="email"
          placeholder={CONTACT.email}
          autoComplete="username"
          value={email}
          onChange={setEmail}
          required
          disabled={submitting}
        />
        <Button type="submit" variant="solid" size="lg" className="w-full" disabled={submitting || !email.trim()}>
          {submitting && <Loader2 width={14} height={14} className="animate-spin" />}
          Send deletion link
        </Button>
      </form>
    </AuthShell>
  );
}

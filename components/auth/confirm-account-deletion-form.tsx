"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { confirmAccountDeletion } from "@/lib/api/auth";
import { errorMessage } from "@/lib/api/client";

/**
 * The page the deletion email links to: `/delete-account/confirm?token=…`.
 *
 * Deliberately does not delete on page load. Opening the link only gets you
 * here — the account is removed on the explicit button press below, not on
 * the `GET` that loads this page. Link-preview bots and mail-security
 * scanners fetch email links automatically; an action that fires on load
 * would let one of those silently delete an account before its owner ever
 * saw this page.
 */
export function ConfirmAccountDeletionForm() {
  const token = useSearchParams().get("token") ?? "";

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await confirmAccountDeletion(token);
      setDone(true);
    } catch (cause) {
      setError(errorMessage(cause));
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <AuthShell
        eyebrow="Delete your account"
        title="This link is incomplete"
        intro="Open the link from the email we sent you, or request a new one."
        footer={
          <Link href="/delete-account" className="link-underline text-charcoal">
            Request a new link
          </Link>
        }
      >
        <div />
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell
        eyebrow="Account deleted"
        title="Your account has been deleted"
        intro="You're signed out everywhere. If this wasn't you, contact support right away — otherwise, no further action is needed."
        footer={
          <Link href="/" className="link-underline text-charcoal">
            Back to DIVA
          </Link>
        }
      >
        <div />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Last step"
      title="Confirm account deletion"
      intro="This permanently closes your account and signs you out everywhere. This cannot be undone."
      footer={
        <>
          Changed your mind?{" "}
          <Link href="/" className="link-underline text-charcoal">
            Return to DIVA
          </Link>
        </>
      }
    >
      <div className="space-y-6">
        {error && (
          <p role="alert" className="border border-[#c0392b]/30 bg-[#c0392b]/5 p-3 text-xs text-[#c0392b]">
            {error}
          </p>
        )}
        <div className="border border-[#c0392b]/30 bg-[#c0392b]/5 p-4 text-xs leading-relaxed text-charcoal">
          Order and invoice records are kept as long as Indian tax law requires;
          everything else tied to your account — addresses, wishlist, saved
          details — is removed.
        </div>
        <Button
          type="button"
          variant="solid"
          size="lg"
          className="w-full"
          onClick={handleConfirm}
          disabled={submitting}
        >
          {submitting && <Loader2 width={14} height={14} className="animate-spin" />}
          Permanently delete my account
        </Button>
      </div>
    </AuthShell>
  );
}

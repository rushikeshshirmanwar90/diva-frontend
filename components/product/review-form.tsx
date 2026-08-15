"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Loader2, Star } from "lucide-react";
import { apiFetch, errorMessage, ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useAuth } from "@/lib/auth/auth-context";

/**
 * "Write a review" — the button and the form behind it.
 *
 * Closed by default. A review form permanently open above the reviews pushes
 * the reviews themselves off the screen, and most visitors are here to read
 * them rather than write one.
 *
 * Reviews go live immediately (backend default status is APPROVED), so a
 * successful submit calls `router.refresh()` to re-fetch this server-rendered
 * page — the review then appears next to the others without a manual reload,
 * modulo the catalogue's normal ~60s revalidation window.
 *
 * Signed-out visitors never see the form at all — a "sign in to write a
 * review" link stands in its place from the start, rather than letting them
 * fill the whole thing out and learn they needed an account only when
 * submit comes back 401. The 401 handling below stays anyway, as a fallback
 * for a session that expires while the form is open.
 */
export function ReviewForm({ productId, productTitle }: { productId: string; productTitle: string }) {
  const router = useRouter();
  const { status } = useAuth();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [needsSignIn, setNeedsSignIn] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNeedsSignIn(false);

    if (rating === 0) {
      setError("Choose a star rating.");
      return;
    }

    setSubmitting(true);

    try {
      await apiFetch("/reviews", {
        method: "POST",
        body: {
          productId,
          rating,
          title: title.trim() || undefined,
          body: body.trim() || undefined,
        },
      });

      setDone(true);
      router.refresh();
    } catch (caught) {
      // 401 is not a failure of the form — it means nobody is signed in, and
      // the answer is a link, not an error message.
      if (caught instanceof ApiError && caught.status === 401) {
        setNeedsSignIn(true);
      } else {
        setError(errorMessage(caught));
      }
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="mt-8 border border-line bg-beige/40 p-6">
        <p className="flex items-center gap-2 text-sm text-ink">
          <Check width={16} height={16} className="text-gold" />
          Thank you — your review has been submitted.
        </p>
        <p className="mt-2 text-xs text-muted">
          It&apos;s live now — refresh in a moment if you don&apos;t see it below yet.
        </p>
      </div>
    );
  }

  if (!open) {
    // Briefly unknown while the session cookie is checked — nothing renders
    // rather than flashing the wrong one of the two states below.
    if (status === "loading") return null;

    if (status !== "authenticated") {
      return (
        <div className="mt-8 border-l-2 border-gold bg-beige/40 px-4 py-3 text-sm text-ink">
          <Link href="/login" className="link-underline text-gold">
            Sign in
          </Link>{" "}
          to write a review — it keeps reviews tied to real customers.
        </div>
      );
    }

    return (
      <div className="mt-8">
        <Button type="button" variant="outline" onClick={() => setOpen(true)}>
          Write a review
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-8 border border-line p-6">
      <p className="font-display text-xl font-light text-ink">Review {productTitle}</p>

      <div className="mt-5">
        <p className="text-[11px] tracking-luxe uppercase text-muted">Your rating</p>
        <div className="mt-2 flex gap-1" onMouseLeave={() => setHovered(0)}>
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHovered(value)}
              aria-label={`${value} star${value > 1 ? "s" : ""}`}
              // `aria-pressed` rather than a radio group: the control is a row
              // of buttons, and a screen reader needs to hear which is chosen.
              aria-pressed={rating === value}
              className="p-0.5"
            >
              <Star
                width={26}
                height={26}
                className={cn(
                  "transition-colors",
                  (hovered || rating) >= value
                    ? "fill-gold text-gold"
                    : "fill-transparent text-line",
                )}
              />
            </button>
          ))}
        </div>
      </div>

      <label className="mt-5 block">
        <span className="text-[11px] tracking-luxe uppercase text-muted">Title</span>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={120}
          placeholder="Sums up your experience"
          className="mt-2 w-full border border-line px-4 py-3 text-sm outline-none focus:border-gold"
        />
      </label>

      <label className="mt-4 block">
        <span className="text-[11px] tracking-luxe uppercase text-muted">Your review</span>
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          maxLength={4000}
          rows={5}
          placeholder="How does it look and feel? Would you buy it again?"
          className="mt-2 w-full resize-y border border-line px-4 py-3 text-sm outline-none focus:border-gold"
        />
      </label>

      {needsSignIn && (
        <p className="mt-4 border-l-2 border-gold bg-beige/40 px-4 py-3 text-sm text-ink">
          Please{" "}
          <Link href="/login" className="link-underline text-gold">
            sign in
          </Link>{" "}
          to post a review — it keeps reviews tied to real customers.
        </p>
      )}

      {error && (
        <p className="mt-4 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="mt-6 flex items-center gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? <Loader2 width={16} height={16} className="animate-spin" /> : null}
          {submitting ? "Submitting…" : "Submit review"}
        </Button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-[11px] tracking-luxe uppercase text-muted hover:text-ink"
        >
          Cancel
        </button>
      </div>

      <p className="mt-4 text-xs text-muted">
        Your review is published immediately and appears under your name.
      </p>
    </form>
  );
}

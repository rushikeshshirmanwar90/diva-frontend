"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Star } from "lucide-react";
import {
  deleteReview,
  listMyReviews,
  submitReview,
  type MyReview,
} from "@/lib/api/reviews";
import { errorMessage } from "@/lib/api/client";
import { Rating } from "@/components/ui/rating";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";

const statusLabel: Record<MyReview["status"], string> = {
  PENDING: "Awaiting moderation",
  APPROVED: "Published",
  REJECTED: "Not published",
};

const statusTone: Record<MyReview["status"], string> = {
  PENDING: "text-muted",
  APPROVED: "text-success",
  REJECTED: "text-sale",
};

export function ReviewsView() {
  const [reviews, setReviews] = useState<MyReview[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const reload = async () => {
    try {
      const { items } = await listMyReviews();
      setReviews(items);
    } catch (cause) {
      setError(errorMessage(cause));
      setReviews([]);
    }
  };

  useEffect(() => {
    void (async () => {
      await reload();
    })();
  }, []);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setError(null);

    try {
      await deleteReview(id);
      setReviews((current) => current?.filter((r) => r._id !== id) ?? null);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setDeletingId(null);
      setConfirmingDeleteId(null);
    }
  };

  return (
    <div>
      <h2 className="font-display text-2xl font-light text-ink">Your reviews</h2>
      <p className="mt-2 text-sm text-muted">
        Everything you have written about pieces you bought.
      </p>

      {error && (
        <p
          role="alert"
          className="mt-6 border border-[#c0392b]/30 bg-[#c0392b]/5 p-3 text-xs text-[#c0392b]"
        >
          {error}
        </p>
      )}

      {reviews === null ? (
        <div className="mt-10 flex justify-center py-10 text-muted">
          <Loader2 width={20} height={20} className="animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={<Star width={24} height={24} strokeWidth={1.3} />}
            title="You haven't reviewed anything yet"
            body="Reviews you write on a product page will show up here, along with their moderation status."
          />
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-line border-y border-line">
          {reviews.map((review) => (
            <li key={review._id} className="flex gap-5 py-6">
              <Link
                href={`/product/${review.productId.slug}`}
                className="relative size-20 shrink-0 overflow-hidden bg-beige"
              >
                {review.productId.images[0] && (
                  <Image
                    src={review.productId.images[0].url}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                )}
              </Link>
              <div className="min-w-0 flex-1">
                {editingId === review._id ? (
                  <EditReviewForm
                    review={review}
                    onCancel={() => setEditingId(null)}
                    onSaved={async () => {
                      setEditingId(null);
                      await reload();
                    }}
                  />
                ) : (
                  <>
                    <Rating value={review.rating} />
                    {review.title && (
                      <p className="mt-2 font-display text-lg font-light text-ink">
                        {review.title}
                      </p>
                    )}
                    {review.body && (
                      <p className="mt-1 text-sm leading-relaxed text-muted">
                        {review.body}
                      </p>
                    )}
                    <p className="mt-3 text-[11px] text-muted">
                      On{" "}
                      <Link
                        href={`/product/${review.productId.slug}`}
                        className="hover:text-gold"
                      >
                        {review.productId.title}
                      </Link>{" "}
                      · {formatDate(review.createdAt)} ·{" "}
                      <span className={cn(statusTone[review.status])}>
                        {statusLabel[review.status]}
                      </span>
                    </p>
                    {review.status === "REJECTED" && review.rejectionReason && (
                      <p className="mt-1 text-[11px] text-sale">{review.rejectionReason}</p>
                    )}
                    {review.reply && (
                      <div className="mt-3 border-l-2 border-gold/40 pl-4">
                        <p className="text-[10px] tracking-luxe uppercase text-gold">
                          Diva replied
                        </p>
                        <p className="mt-1 text-sm text-muted">{review.reply.body}</p>
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-5">
                      <button
                        type="button"
                        onClick={() => setEditingId(review._id)}
                        className="text-[10px] tracking-luxe uppercase text-charcoal hover:text-gold"
                      >
                        Edit
                      </button>
                      {confirmingDeleteId === review._id ? (
                        <span className="flex items-center gap-4">
                          <span className="text-[10px] tracking-luxe uppercase text-muted">
                            Remove this review?
                          </span>
                          <button
                            type="button"
                            onClick={() => void handleDelete(review._id)}
                            disabled={deletingId === review._id}
                            className="inline-flex items-center gap-1.5 text-[10px] tracking-luxe uppercase text-sale hover:underline disabled:opacity-50"
                          >
                            {deletingId === review._id && (
                              <Loader2 width={11} height={11} className="animate-spin" />
                            )}
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmingDeleteId(null)}
                            disabled={deletingId === review._id}
                            className="text-[10px] tracking-luxe uppercase text-muted hover:text-charcoal disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmingDeleteId(review._id)}
                          className="text-[10px] tracking-luxe uppercase text-charcoal hover:text-sale"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EditReviewForm({
  review,
  onCancel,
  onSaved,
}: {
  review: MyReview;
  onCancel: () => void;
  onSaved: () => void | Promise<void>;
}) {
  const [rating, setRating] = useState(review.rating);
  const [title, setTitle] = useState(review.title ?? "");
  const [body, setBody] = useState(review.body ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await submitReview({
        productId: review.productId._id,
        rating,
        title: title.trim() || undefined,
        body: body.trim() || undefined,
      });
      await onSaved();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && (
        <p
          role="alert"
          className="border border-[#c0392b]/30 bg-[#c0392b]/5 p-3 text-xs text-[#c0392b]"
        >
          {error}
        </p>
      )}

      <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={n === rating}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onClick={() => setRating(n)}
            disabled={saving}
            className="disabled:opacity-50"
          >
            <Star
              width={18}
              height={18}
              strokeWidth={1.5}
              className={n <= rating ? "fill-gold text-gold" : "fill-transparent text-line"}
            />
          </button>
        ))}
      </div>

      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Title (optional)"
        disabled={saving}
        className="w-full border-b border-line bg-transparent pb-2 text-sm text-ink outline-none transition-colors focus:border-gold disabled:opacity-50"
      />

      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="Your review"
        rows={3}
        disabled={saving}
        className="w-full border border-line p-3 text-sm text-ink outline-none transition-colors focus:border-gold disabled:opacity-50"
      />

      <div className="flex items-center gap-5">
        <Button type="submit" variant="gold" size="sm" disabled={saving}>
          {saving && <Loader2 width={13} height={13} className="animate-spin" />}
          Save changes
        </Button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="text-[10px] tracking-luxe uppercase text-muted hover:text-charcoal disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

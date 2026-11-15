"use client";

import { useEffect, useState } from "react";
import { ChevronRight, Loader2, LocateFixed, MapPin, Plus, Search, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { getCurrentPlace, LocationError, searchPlaces, type LocationErrorReason, type PickedPlace } from "@/lib/current-location";

/**
 * Step 1 of adding an address — Blinkit's "Select delivery location", without
 * a map: search with live suggestions, "Use current location", or skip to
 * typing it in. Picking anything hands a place to the details step.
 */
export function LocationPicker({
  onPick,
  onManual,
  onCancel,
  className,
}: {
  onPick: (place: PickedPlace) => void;
  onManual: () => void;
  onCancel?: () => void;
  className?: string;
}) {
  const [query, setQuery] = useState("");
  // Results remember which query they answer, so stale ones never show.
  const [answer, setAnswer] = useState<{ q: string; places: PickedPlace[] } | null>(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<{ message: string; reason: LocationErrorReason } | null>(null);

  // Debounced type-ahead; the newest query cancels the one before it.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      searchPlaces(q, controller.signal)
        .then((places) => setAnswer({ q, places }))
        .catch(() => {
          if (!controller.signal.aborted) setAnswer({ q, places: [] });
        });
    }, 350);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const trimmed = query.trim();
  const results = answer?.q === trimmed ? answer.places : null;
  const searching = trimmed.length >= 3 && results === null;
  const showingResults = trimmed.length >= 3;

  const locate = async () => {
    setLocating(true);
    setError(null);
    try {
      onPick(await getCurrentPlace());
    } catch (cause) {
      setError(
        cause instanceof LocationError
          ? { message: cause.message, reason: cause.reason }
          : { message: "Couldn't detect your location. Please try again.", reason: "unavailable" },
      );
    } finally {
      setLocating(false);
    }
  };

  return (
    <div className={cn("border border-line bg-white", className)}>
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <h3 className="font-display text-2xl text-ink">Select delivery location</h3>
        {onCancel && (
          <button type="button" aria-label="Close" onClick={onCancel} className="flex size-8 items-center justify-center text-charcoal hover:text-gold-deep">
            <X width={20} height={20} strokeWidth={1.6} />
          </button>
        )}
      </div>

      <div className="px-5">
        <label className="flex h-12 items-center gap-2.5 border border-line bg-beige px-3.5 transition-colors focus-within:border-gold">
          <Search width={18} height={18} strokeWidth={1.8} className="shrink-0 text-muted" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search for area, street name…"
            aria-label="Search for area or street name"
            autoComplete="off"
            className="h-full min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-muted [&::-webkit-search-cancel-button]:hidden"
          />
          {searching ? (
            <Loader2 width={16} height={16} className="shrink-0 animate-spin text-muted motion-reduce:animate-none" aria-hidden />
          ) : query ? (
            <button type="button" aria-label="Clear search" onClick={() => setQuery("")} className="shrink-0 text-muted hover:text-charcoal">
              <X width={16} height={16} />
            </button>
          ) : null}
        </label>
      </div>

      {showingResults ? (
        <div className="mt-2 pb-2" aria-live="polite">
          {results === null ? null : results.length === 0 ? (
            <div className="space-y-3 px-5 py-6">
              <p className="text-sm text-muted">No matches for “{trimmed}”. Try a nearby area or landmark.</p>
              <button type="button" onClick={onManual} className="text-[10px] font-medium tracking-luxe uppercase text-gold-deep hover:underline">
                Add address manually
              </button>
            </div>
          ) : (
            <ul>
              {results.map((place) => (
                <li key={place.id} className="border-t border-line first:border-t-0">
                  <button
                    type="button"
                    onClick={() => onPick(place)}
                    className="flex w-full items-start gap-3.5 px-5 py-3.5 text-left transition-colors hover:bg-beige"
                  >
                    <MapPin width={18} height={18} strokeWidth={1.6} className="mt-0.5 shrink-0 text-muted" aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-medium text-ink">{place.title}</span>
                      {place.subtitle && <span className="mt-0.5 line-clamp-2 block text-xs leading-snug text-muted">{place.subtitle}</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="mt-4 space-y-3 px-5 pb-5">
          <button
            type="button"
            onClick={() => void locate()}
            disabled={locating}
            aria-busy={locating}
            className="group flex min-h-[68px] w-full items-center gap-3.5 border border-gold bg-beige px-3.5 text-left transition-colors hover:bg-beige-dark disabled:cursor-default"
          >
            <span className="flex size-10 shrink-0 items-center justify-center bg-charcoal text-gold">
              {locating ? (
                <Loader2 width={18} height={18} className="animate-spin motion-reduce:animate-none" aria-hidden />
              ) : (
                <LocateFixed width={20} height={20} strokeWidth={1.8} aria-hidden />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-medium text-gold-deep">{locating ? "Detecting your location…" : "Use current location"}</span>
              <span className="mt-0.5 block text-xs text-muted">{locating ? "This takes a few seconds" : "Using GPS"}</span>
            </span>
            {!locating && (
              <ChevronRight width={18} height={18} className="text-gold-deep transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden />
            )}
          </button>

          {error && (
            <div role="alert" className="space-y-1.5 border-l-2 border-[#c0392b] bg-[#c0392b]/5 px-3 py-2.5">
              <p className="text-xs leading-snug text-[#c0392b]">{error.message}</p>
              {error.reason === "unavailable" && (
                <button type="button" onClick={() => void locate()} className="text-[10px] font-medium tracking-luxe uppercase text-charcoal underline underline-offset-2">
                  Try again
                </button>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={onManual}
            disabled={locating}
            className="group flex min-h-[60px] w-full items-center gap-3.5 border border-line bg-white px-3.5 text-left transition-colors hover:bg-beige disabled:opacity-50"
          >
            <span className="flex size-10 shrink-0 items-center justify-center border border-line text-charcoal">
              <Plus width={18} height={18} strokeWidth={1.6} aria-hidden />
            </span>
            <span className="flex-1 text-[15px] text-ink">Add address manually</span>
            <ChevronRight width={18} height={18} className="text-muted" aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}

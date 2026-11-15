"use client";

import { useState, type FormEvent } from "react";
import { Briefcase, ChevronDown, CircleCheck, Home, Loader2, MapPin, X } from "lucide-react";
import { ApiError, errorMessage } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { Address, AddressInput } from "@/lib/api/addresses";
import type { PickedPlace } from "@/lib/current-location";
import { LocationPicker } from "@/components/account/location-picker";
import { ComboboxField } from "@/components/ui/combobox-field";
import { INDIA_STATES, citiesOf, matchCity, matchState, searchCities } from "@/lib/address-regions";
import { usePincode } from "@/lib/use-pincode";
import { useAuth } from "@/lib/auth/auth-context";

const EMPTY_FORM: AddressInput = {
  label: "",
  type: "HOME",
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  isDefault: false,
};

const TYPES = [
  { value: "HOME", label: "Home", Icon: Home },
  { value: "WORK", label: "Work", Icon: Briefcase },
  { value: "OTHER", label: "Other", Icon: MapPin },
] as const;

const WRAPPER = "col-span-full sm:col-span-1";

/** The summary card's text for an address that already exists. */
function summaryOf(a: Pick<AddressInput, "line2" | "city" | "state" | "pincode">) {
  const [first, ...rest] = (a.line2 ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return {
    title: first || a.city || "Delivery location",
    subtitle: [...rest, first ? a.city : null, a.state].filter(Boolean).join(", ") + (a.pincode ? ` ${a.pincode}` : ""),
  };
}

/**
 * Shared by `/account/addresses` and checkout. A new address starts at
 * "Select delivery location" (search or GPS, Blinkit-style); an existing one
 * opens straight on "Enter complete address" with a Change link back.
 */
export function AddressForm({
  initial,
  save,
  onSaved,
  onCancel,
}: {
  initial?: Address;
  save: (input: AddressInput) => Promise<Address>;
  onSaved: (address: Address) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<AddressInput>(
    initial
      ? {
          label: initial.label ?? "",
          type: initial.type,
          fullName: initial.fullName,
          phone: initial.phone,
          alternatePhone: initial.alternatePhone ?? "",
          line1: initial.line1,
          line2: initial.line2 ?? "",
          landmark: initial.landmark ?? "",
          city: initial.city,
          state: initial.state,
          pincode: initial.pincode,
          country: initial.country,
          isDefault: initial.isDefault,
        }
      : EMPTY_FORM,
  );
  // A new address is usually for the account holder — start from their profile.
  const { user } = useAuth();
  const [prefilled, setPrefilled] = useState(false);
  if (!initial && user && !prefilled) {
    setPrefilled(true);
    setForm((current) => ({
      ...current,
      fullName: current.fullName || user.name || "",
      phone: current.phone || user.phone || "",
    }));
  }
  const [step, setStep] = useState<"locate" | "details">(initial ? "details" : "locate");
  const [place, setPlace] = useState<{ title: string; subtitle: string } | null>(initial ? summaryOf(initial) : null);
  const [focusFlat, setFocusFlat] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof AddressInput>(key: K, value: AddressInput[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  // The pincode is the source of truth for the state. City is only filled
  // when it's empty or the state changed, so a picked suburb or town stays.
  const pincodeStatus = usePincode(form.pincode, (info) =>
    setForm((current) =>
      info.state !== current.state
        ? { ...current, state: info.state, city: info.city }
        : current.city
          ? current
          : { ...current, city: info.city },
    ),
  );

  const chooseState = (state: string) =>
    setForm((current) => ({
      ...current,
      state,
      city: citiesOf(state).includes(current.city) ? current.city : "",
    }));

  const pick = (picked: PickedPlace) => {
    setForm((current) => {
      const state = matchState(picked.fields.state) || current.state;
      return {
        ...current,
        line2: picked.fields.line2 || current.line2,
        state,
        city: matchCity(state, picked.fields.city) || current.city,
        pincode: picked.fields.pincode || current.pincode,
      };
    });
    setPlace({ title: picked.title, subtitle: picked.subtitle });
    setFocusFlat(true);
    setStep("details");
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setFieldErrors({});

    try {
      const saved = await save({
        ...form,
        alternatePhone: form.alternatePhone || undefined,
        line2: form.line2 || undefined,
        landmark: form.landmark || undefined,
        // "Home" and "Work" are their own label; only "Other" gets a custom name.
        label: form.type === "OTHER" ? form.label || undefined : undefined,
      });
      await onSaved(saved);
    } catch (cause) {
      if (cause instanceof ApiError && cause.details) {
        setFieldErrors(Object.fromEntries(cause.details.map((d) => [d.path, d.message])));
      }
      setError(errorMessage(cause));
    } finally {
      setSaving(false);
    }
  };

  if (step === "locate") {
    return (
      <LocationPicker
        className={WRAPPER}
        onPick={pick}
        onManual={() => {
          setPlace(null);
          setStep("details");
        }}
        onCancel={initial ? () => setStep("details") : onCancel}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn(WRAPPER, "border border-line bg-white")} noValidate>
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <h3 className="font-display text-2xl text-ink">{initial ? "Edit address" : "Enter complete address"}</h3>
        <button
          type="button"
          aria-label="Close"
          onClick={onCancel}
          disabled={saving}
          className="flex size-8 items-center justify-center text-charcoal hover:text-gold-deep disabled:opacity-50"
        >
          <X width={20} height={20} strokeWidth={1.6} />
        </button>
      </div>

      <div className="space-y-6 px-5 pb-6">
        {/* Where it's going — with a way back to change it */}
        <div className="flex items-center gap-3 border border-line bg-beige p-3.5">
          <span className="flex size-9 shrink-0 items-center justify-center bg-charcoal text-gold">
            <MapPin width={17} height={17} strokeWidth={1.8} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-medium text-ink">{place ? place.title : "Location not set"}</p>
            <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-muted">
              {place ? place.subtitle : "Search or use GPS to fill this in faster"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setStep("locate")}
            disabled={saving}
            aria-label={place ? "Change location" : "Select location"}
            className="shrink-0 border border-gold px-3 py-2 text-[10px] font-medium tracking-luxe uppercase text-charcoal transition-colors hover:bg-gold disabled:opacity-50"
          >
            {place ? "Change" : "Select"}
          </button>
        </div>

        {error && (
          <p role="alert" className="border border-[#c0392b]/30 bg-[#c0392b]/5 p-3 text-xs text-[#c0392b]">
            {error}
          </p>
        )}

        <TextField
          label="Area / Sector / Locality"
          value={form.line2 ?? ""}
          onChange={(v) => set("line2", v)}
          autoComplete="address-line2"
          disabled={saving}
          error={fieldErrors.line2}
        />
        <TextField
          label="Flat / House no. / Building"
          value={form.line1}
          onChange={(v) => set("line1", v)}
          placeholder="e.g. Flat 402, Lotus Residency"
          required
          autoFocus={focusFlat}
          autoComplete="address-line1"
          disabled={saving}
          error={fieldErrors.line1}
        />
        <TextField
          label="Nearby landmark (optional)"
          value={form.landmark ?? ""}
          onChange={(v) => set("landmark", v)}
          placeholder="e.g. Opposite City Mall"
          disabled={saving}
          error={fieldErrors.landmark}
        />
        <div>
          <TextField
            label="Pincode"
            value={form.pincode}
            onChange={(v) => set("pincode", v.replace(/\D/g, "").slice(0, 6))}
            placeholder="6-digit pincode"
            required
            inputMode="numeric"
            autoComplete="postal-code"
            disabled={saving}
            error={fieldErrors.pincode ?? (pincodeStatus.kind === "not-found" ? "We couldn't find this pincode. Please check it." : undefined)}
          />
          <p aria-live="polite" className="mt-1.5 min-h-4 text-[11px]">
            {pincodeStatus.kind === "checking" ? (
              <span className="inline-flex items-center gap-1.5 text-muted">
                <Loader2 width={12} height={12} className="animate-spin motion-reduce:animate-none" aria-hidden />
                Checking pincode…
              </span>
            ) : pincodeStatus.kind === "found" ? (
              <span className="inline-flex items-center gap-1.5 text-success">
                <CircleCheck width={13} height={13} strokeWidth={2} aria-hidden />
                {pincodeStatus.info.city}, {pincodeStatus.info.state}
              </span>
            ) : null}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-[10px] tracking-luxe uppercase text-muted">
              State<span className="text-[#c0392b]" aria-hidden> *</span>
            </span>
            <span className="relative mt-2 block">
              <select
                value={form.state}
                onChange={(event) => chooseState(event.target.value)}
                required
                disabled={saving}
                autoComplete="address-level1"
                aria-invalid={Boolean(fieldErrors.state)}
                className={cn(
                  "w-full appearance-none border-b bg-transparent pr-6 pb-2.5 text-sm outline-none transition-colors focus:border-gold disabled:opacity-50",
                  form.state ? "text-ink" : "text-muted/70",
                  fieldErrors.state ? "border-[#c0392b]" : "border-line",
                )}
              >
                <option value="" disabled>
                  Select state
                </option>
                {/* Keep an unlisted saved value visible rather than silently dropping it. */}
                {form.state && !INDIA_STATES.includes(form.state) && <option value={form.state}>{form.state}</option>}
                {INDIA_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
              <ChevronDown width={16} height={16} strokeWidth={1.6} className="pointer-events-none absolute top-0.5 right-0 text-muted" aria-hidden />
            </span>
            {fieldErrors.state && <small className="mt-1.5 block text-[11px] text-[#c0392b]">{fieldErrors.state}</small>}
          </label>
          <ComboboxField
            label="City"
            value={form.city}
            onChange={(city) => set("city", city)}
            search={(q) => searchCities(form.state, q)}
            placeholder="Select city"
            disabled={saving || !form.state}
            disabledPlaceholder="Pick state first"
            required
            error={fieldErrors.city}
            allowCustom
          />
        </div>

        <fieldset className="space-y-6 border-t border-line pt-5">
          <legend className="sr-only">Receiver details</legend>
          <div className="space-y-1">
            <p className="text-[10px] font-medium tracking-luxe uppercase text-charcoal" aria-hidden>
              Receiver details
            </p>
            {!initial && user && (
              <p className="text-xs text-muted">Filled from your account. Change it if someone else will receive the order.</p>
            )}
          </div>
          <TextField label="Full name" value={form.fullName} onChange={(v) => set("fullName", v)} required autoComplete="name" disabled={saving} error={fieldErrors.fullName} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="Phone" value={form.phone} onChange={(v) => set("phone", v)} required inputMode="tel" autoComplete="tel" disabled={saving} error={fieldErrors.phone} />
            <TextField
              label="Alternate phone (optional)"
              value={form.alternatePhone ?? ""}
              onChange={(v) => set("alternatePhone", v)}
              inputMode="tel"
              disabled={saving}
              error={fieldErrors.alternatePhone}
            />
          </div>
        </fieldset>

        <fieldset className="space-y-2.5">
          <legend className="mb-2.5 text-[10px] font-medium tracking-luxe uppercase text-charcoal">Save address as</legend>
          <div role="radiogroup" className="flex flex-wrap gap-2">
            {TYPES.map(({ value, label, Icon }) => {
              const active = form.type === value;
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  disabled={saving}
                  onClick={() => set("type", value)}
                  className={cn(
                    "flex min-h-11 items-center gap-1.5 border px-4 text-sm transition-colors disabled:opacity-50",
                    active ? "border-charcoal bg-charcoal text-white" : "border-line text-charcoal hover:border-charcoal/40",
                  )}
                >
                  <Icon width={15} height={15} strokeWidth={1.7} className={active ? "text-gold" : "text-muted"} aria-hidden />
                  {label}
                </button>
              );
            })}
          </div>
          {form.type === "OTHER" && (
            <TextField label="Name this address" value={form.label ?? ""} onChange={(v) => set("label", v)} placeholder="e.g. Mom's place" disabled={saving} />
          )}
        </fieldset>

        <label className="flex items-center gap-3 text-xs text-muted">
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={(event) => set("isDefault", event.target.checked)}
            disabled={saving}
            className="accent-[#c9a227]"
          />
          Set as default address
        </label>

        <Button type="submit" variant="gold" size="lg" disabled={saving} className="w-full justify-center">
          {saving && <Loader2 width={14} height={14} className="animate-spin" />}
          Save address
        </Button>
      </div>
    </form>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  required,
  disabled,
  error,
  autoFocus,
  autoComplete,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  autoFocus?: boolean;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <label className="block">
      <span className="text-[10px] tracking-luxe uppercase text-muted">
        {label}
        {required && (
          <span className="text-[#c0392b]" aria-hidden>
            {" "}*
          </span>
        )}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={Boolean(error)}
        className={cn(
          "mt-2 w-full border-b bg-transparent pb-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-gold disabled:opacity-50",
          error ? "border-[#c0392b]" : "border-line",
        )}
      />
      {error && <small className="mt-1.5 block text-[11px] text-[#c0392b]">{error}</small>}
    </label>
  );
}

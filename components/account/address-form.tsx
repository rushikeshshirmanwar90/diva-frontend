"use client";

import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { ApiError, errorMessage } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { Address, AddressInput } from "@/lib/api/addresses";

const EMPTY_FORM: AddressInput = {
  label: "",
  type: "HOME",
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  isDefault: false,
};

/**
 * Shared by `/account/addresses` (edit an existing address, or add one) and
 * checkout (add the first address when the account has none) — one form,
 * one validation error map, instead of two copies drifting apart.
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof AddressInput>(key: K, value: AddressInput[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

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
        label: form.label || undefined,
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

  return (
    <form
      onSubmit={handleSubmit}
      className="col-span-full space-y-5 border border-line p-6 sm:col-span-1"
      noValidate
    >
      {error && (
        <p role="alert" className="border border-[#c0392b]/30 bg-[#c0392b]/5 p-3 text-xs text-[#c0392b]">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <TextField label="Label" value={form.label ?? ""} onChange={(v) => set("label", v)} placeholder="Home" disabled={saving} />
        <label className="block">
          <span className="text-[10px] tracking-luxe uppercase text-muted">Type</span>
          <select
            value={form.type}
            onChange={(event) => set("type", event.target.value as AddressInput["type"])}
            disabled={saving}
            className="mt-2 w-full border-b border-line bg-transparent pb-2.5 text-sm text-ink outline-none focus:border-gold disabled:opacity-50"
          >
            <option value="HOME">Home</option>
            <option value="WORK">Work</option>
            <option value="OTHER">Other</option>
          </select>
        </label>
      </div>

      <TextField label="Full name" value={form.fullName} onChange={(v) => set("fullName", v)} required disabled={saving} error={fieldErrors.fullName} />
      <div className="grid grid-cols-2 gap-4">
        <TextField label="Phone" value={form.phone} onChange={(v) => set("phone", v)} required disabled={saving} error={fieldErrors.phone} />
        <TextField label="Alternate phone" value={form.alternatePhone ?? ""} onChange={(v) => set("alternatePhone", v)} disabled={saving} error={fieldErrors.alternatePhone} />
      </div>
      <TextField label="Address line 1" value={form.line1} onChange={(v) => set("line1", v)} required disabled={saving} error={fieldErrors.line1} />
      <TextField label="Address line 2" value={form.line2 ?? ""} onChange={(v) => set("line2", v)} disabled={saving} />
      <div className="grid grid-cols-2 gap-4">
        <TextField label="City" value={form.city} onChange={(v) => set("city", v)} required disabled={saving} error={fieldErrors.city} />
        <TextField label="State" value={form.state} onChange={(v) => set("state", v)} required disabled={saving} error={fieldErrors.state} />
      </div>
      <TextField label="Pincode" value={form.pincode} onChange={(v) => set("pincode", v)} required disabled={saving} error={fieldErrors.pincode} />

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

      <div className="flex items-center gap-5 pt-2">
        <Button type="submit" variant="gold" size="sm" disabled={saving}>
          {saving && <Loader2 width={13} height={13} className="animate-spin" />}
          Save address
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

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  required,
  disabled,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] tracking-luxe uppercase text-muted">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={cn(
          "mt-2 w-full border-b bg-transparent pb-2.5 text-sm text-ink outline-none transition-colors focus:border-gold disabled:opacity-50",
          error ? "border-[#c0392b]" : "border-line",
        )}
      />
      {error && <small className="mt-1.5 block text-[11px] text-[#c0392b]">{error}</small>}
    </label>
  );
}

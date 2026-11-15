"use client";

import { useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Check, ChevronDown, Plus } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * A searchable dropdown in the form's underlined style (ARIA combobox +
 * listbox, arrow keys / Enter / Escape). `allowCustom` adds a "Use “…”"
 * option so a value missing from the list never blocks the form.
 */
export function ComboboxField({
  label,
  value,
  onChange,
  search,
  placeholder = "Search",
  disabled,
  disabledPlaceholder,
  required,
  error,
  allowCustom,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  search: (query: string) => readonly string[];
  placeholder?: string;
  disabled?: boolean;
  disabledPlaceholder?: string;
  required?: boolean;
  error?: string;
  allowCustom?: boolean;
}) {
  const id = useId();
  const listId = `${id}-list`;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const typed = query.trim();
  const options = useMemo(() => (open ? search(query) : []), [open, query, search]);
  const exact = options.some((o) => o.toLowerCase() === typed.toLowerCase());
  // Real matches first, so Enter never picks half-typed text over a listed city.
  const items = [...options.map((o) => ({ custom: false, value: o })), ...(allowCustom && typed.length >= 2 && !exact ? [{ custom: true, value: typed }] : [])];

  const openList = () => {
    if (disabled) return;
    setQuery("");
    setActive(0);
    setOpen(true);
  };
  const choose = (next: string) => {
    onChange(next);
    setOpen(false);
    setQuery("");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!open && (event.key === "ArrowDown" || event.key === "Enter")) {
      event.preventDefault();
      openList();
      return;
    }
    if (!open) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => Math.min(i + 1, items.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (items[active]) choose(items[active].value);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      setQuery("");
    }
  };

  return (
    <div className="relative">
      <label htmlFor={id} className="text-[10px] tracking-luxe uppercase text-muted">
        {label}
        {required && (
          <span className="text-[#c0392b]" aria-hidden>
            {" "}*
          </span>
        )}
      </label>
      <div
        className={cn(
          "mt-2 flex items-center gap-2 border-b pb-2.5 transition-colors focus-within:border-gold",
          error ? "border-[#c0392b]" : "border-line",
          disabled && "opacity-50",
        )}
      >
        <input
          ref={inputRef}
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && items[active] ? `${listId}-${active}` : undefined}
          aria-invalid={Boolean(error)}
          required={required}
          disabled={disabled}
          autoComplete="off"
          value={open ? query : value}
          placeholder={open ? value || placeholder : disabled && disabledPlaceholder ? disabledPlaceholder : placeholder}
          onChange={(event) => {
            if (!open) setOpen(true);
            setQuery(event.target.value);
            setActive(0);
          }}
          onFocus={openList}
          onClick={() => !open && openList()}
          onBlur={() => {
            setOpen(false);
            setQuery("");
          }}
          onKeyDown={onKeyDown}
          className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted/70 disabled:cursor-not-allowed"
        />
        <ChevronDown
          width={16}
          height={16}
          strokeWidth={1.6}
          className={cn("shrink-0 text-muted transition-transform motion-reduce:transition-none", open && "rotate-180")}
          aria-hidden
        />
      </div>

      {open && (
        <ul
          id={listId}
          role="listbox"
          // Keep focus in the input while clicking an option.
          onMouseDown={(event) => event.preventDefault()}
          className="absolute inset-x-0 top-full z-30 mt-1 max-h-64 overflow-y-auto border border-line bg-white shadow-[0_12px_32px_-12px_rgba(26,26,26,0.25)]"
        >
          {items.length === 0 ? (
            <li className="px-4 py-3 text-sm text-muted">No matches for “{typed}”.</li>
          ) : (
            items.map((item, i) => {
              const selected = !item.custom && item.value === value;
              return (
                <li
                  key={`${item.custom ? "custom-" : ""}${item.value}`}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={selected}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => choose(item.value)}
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 px-4 py-2.5 text-sm",
                    i === active ? "bg-beige" : "bg-white",
                    item.custom ? "border-t border-line text-gold-deep" : "text-ink",
                    selected && "font-medium",
                  )}
                >
                  {item.custom && <Plus width={14} height={14} aria-hidden />}
                  <span className="flex-1">{item.custom ? `Use “${item.value}”` : item.value}</span>
                  {selected && <Check width={14} height={14} className="text-gold-deep" aria-hidden />}
                </li>
              );
            })
          )}
        </ul>
      )}
      {error && <small className="mt-1.5 block text-[11px] text-[#c0392b]">{error}</small>}
    </div>
  );
}

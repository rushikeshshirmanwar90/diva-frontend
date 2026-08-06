"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CONTACT } from "@/lib/data/site";

const topics = [
  "A specific piece",
  "Bridal appointment",
  "Order or delivery",
  "Return or exchange",
  "Buyback or valuation",
  "Something else",
];

/** Demo only — nothing is submitted anywhere. */
export function ContactForm() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="mt-8 border border-line bg-beige p-8">
        <p className="font-display text-2xl font-light text-ink">
          Thank you — message noted
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          In the finished site this reaches the support desk and you would hear back
          within four working hours. In this demo nothing was sent.
        </p>
        <Button variant="outline" className="mt-6" onClick={() => setSent(false)}>
          Write another
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
      className="mt-8 space-y-7"
    >
      <div className="grid gap-7 sm:grid-cols-2">
        <Input label="Your name" placeholder="Mahesh Giri" required />
        <Input label="Mobile or email" placeholder={CONTACT.phone} required />
      </div>

      <label className="block">
        <span className="text-[10px] tracking-luxe uppercase text-muted">
          What is this about
        </span>
        <select
          defaultValue={topics[0]}
          className="mt-2 w-full border-b border-line bg-transparent pb-2.5 text-sm text-ink outline-none focus:border-gold"
        >
          {topics.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-[10px] tracking-luxe uppercase text-muted">Message</span>
        <textarea
          rows={5}
          required
          placeholder="What are you looking for, and roughly what budget?"
          className="mt-2 w-full border border-line bg-transparent p-4 text-sm text-ink outline-none focus:border-gold"
        />
      </label>

      <Button type="submit" variant="gold" size="lg">
        Send message
      </Button>
      <p className="text-[10px] leading-relaxed text-muted/80">
        Front-end demo — this form is not connected to anything and no data leaves your
        browser.
      </p>
    </form>
  );
}

function Input({
  label,
  placeholder,
  required,
}: {
  label: string;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[10px] tracking-luxe uppercase text-muted">{label}</span>
      <input
        required={required}
        placeholder={placeholder}
        className="mt-2 w-full border-b border-line bg-transparent pb-2.5 text-sm text-ink outline-none focus:border-gold"
      />
    </label>
  );
}

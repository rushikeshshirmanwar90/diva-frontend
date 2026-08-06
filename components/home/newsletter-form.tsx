"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

/** Demo only — nothing is submitted anywhere. */
export function NewsletterForm({
  className,
  placeholder = "Your email address",
  dark = false,
}: {
  className?: string;
  placeholder?: string;
  dark?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <p
        className={cn(
          "text-sm",
          dark ? "text-gold-light" : "text-success",
          className,
        )}
      >
        Thank you — look for our first note on the 1st of the month.
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (email.includes("@")) setDone(true);
      }}
      className={cn("flex max-w-sm items-center gap-3 border-b pb-2",
        dark ? "border-white/30" : "border-charcoal/25", className)}
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholder}
        aria-label="Email address"
        className={cn(
          "w-full bg-transparent text-sm outline-none",
          dark
            ? "text-white placeholder:text-white/50"
            : "text-ink placeholder:text-muted",
        )}
      />
      <button
        type="submit"
        aria-label="Subscribe"
        className={cn(
          "shrink-0 transition-colors",
          dark ? "text-white hover:text-gold-light" : "text-charcoal hover:text-gold",
        )}
      >
        <ArrowRight width={17} height={17} />
      </button>
    </form>
  );
}

"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { useStore } from "@/lib/store/store";

export function Toaster() {
  const { toasts } = useStore();
  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[80] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-6">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex animate-fade-up items-center gap-3 bg-charcoal px-4 py-3 text-sm text-white shadow-xl"
          role="status"
        >
          <Check width={15} height={15} className="shrink-0 text-gold" />
          <span className="flex-1">{t.message}</span>
          {t.href && (
            <Link
              href={t.href}
              className="shrink-0 text-[10px] tracking-luxe uppercase text-gold underline-offset-4 hover:underline"
            >
              {t.linkLabel ?? "View"}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}

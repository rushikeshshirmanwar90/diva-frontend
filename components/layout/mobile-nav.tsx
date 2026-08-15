"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ChevronRight, X } from "lucide-react";
import { useCategories, useCollections } from "@/lib/data/catalogue-context";
import { Logo } from "@/components/layout/logo";

export function MobileNav({ onClose }: { onClose: () => void }) {
  const categories = useCategories();
  const collections = useCollections();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="absolute inset-0 bg-charcoal/40"
      />
      <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm animate-fade-in flex-col bg-white">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <Logo tagline={false} className="text-left" />
          <button type="button" onClick={onClose} aria-label="Close menu">
            <X width={20} height={20} strokeWidth={1.5} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-5 py-6">
          <Section title="Shop by category">
            {categories.map((c) => (
              <Row key={c.slug} href={`/category/${c.slug}`} onClose={onClose}>
                {c.name}
              </Row>
            ))}
            <Row href="/shop" onClose={onClose}>
              Shop all
            </Row>
          </Section>

          <Section title="Collections">
            {collections.map((c) => (
              <Row key={c.slug} href={`/collections/${c.slug}`} onClose={onClose}>
                {c.name}
              </Row>
            ))}
          </Section>

          <Section title="More">
            <Row href="/about" onClose={onClose}>
              Our story
            </Row>
            <Row href="/contact" onClose={onClose}>
              Contact & stores
            </Row>
            <Row href="/faq" onClose={onClose}>
              Help & FAQ
            </Row>
            <Row href="/account" onClose={onClose}>
              My account
            </Row>
            <Row href="/wishlist" onClose={onClose}>
              Wishlist
            </Row>
          </Section>
        </nav>

        <div className="border-t border-line px-5 py-4 text-[10px] tracking-luxe uppercase text-muted">
          Insured delivery · 15-day returns
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <p className="eyebrow mb-3">{title}</p>
      <ul className="divide-y divide-line/70">{children}</ul>
    </div>
  );
}

function Row({
  href,
  onClose,
  children,
}: {
  href: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        onClick={onClose}
        className="flex items-center justify-between py-3 font-display text-lg font-light text-ink"
      >
        {children}
        <ChevronRight width={15} height={15} className="text-line" />
      </Link>
    </li>
  );
}

"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  Heart,
  HelpCircle,
  Info,
  Phone,
  Search,
  User,
  X,
} from "lucide-react";
import { useCategories } from "@/lib/data/catalogue-context";
import { Logo } from "@/components/layout/logo";
import {
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
} from "@/components/ui/social-icons";

const moreLinks = [
  { href: "/account", label: "My account", icon: User },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/about", label: "Our story", icon: Info },
  { href: "/contact", label: "Contact & stores", icon: Phone },
  { href: "/faq", label: "Help & FAQ", icon: HelpCircle },
];

export function MobileNav({
  onClose,
  onOpenSearch,
}: {
  onClose: () => void;
  onOpenSearch?: () => void;
}) {
  const categories = useCategories();

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
        className="absolute inset-0 animate-fade-in bg-charcoal/60 backdrop-blur-[2px]"
      />
      <div className="absolute inset-y-0 left-0 flex w-[88%] max-w-[22rem] animate-slide-in-left flex-col bg-white shadow-2xl">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-line bg-white px-5">
          <Logo tagline={false} imageClassName="w-[102px]" className="text-left" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex size-10 items-center justify-center rounded-full text-charcoal transition-colors hover:bg-beige hover:text-gold active:bg-beige-dark"
          >
            <X width={19} height={19} strokeWidth={1.5} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-5 py-5">
          {/* Quick Search trigger */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSearch?.();
            }}
            className="mb-4 flex w-full items-center gap-3 rounded-full border border-line bg-beige/60 px-4 py-2.5 text-xs text-muted transition-all duration-200 hover:border-gold/60 hover:bg-white hover:text-charcoal active:scale-98"
          >
            <Search width={15} height={15} className="shrink-0 text-gold" />
            <span className="truncate">Search jewellery, gold, diamonds...</span>
          </button>

          {/* Quick User Shortcuts */}
          <div className="mb-6 grid grid-cols-2 gap-2">
            <Link
              href="/account"
              onClick={onClose}
              className="flex items-center justify-center gap-2 rounded-sm border border-line/80 bg-beige/30 px-3 py-2 text-xs font-medium text-ink transition-colors hover:border-gold hover:text-gold active:bg-beige"
            >
              <User width={14} height={14} className="text-gold" />
              <span>My Account</span>
            </Link>
            <Link
              href="/wishlist"
              onClick={onClose}
              className="flex items-center justify-center gap-2 rounded-sm border border-line/80 bg-beige/30 px-3 py-2 text-xs font-medium text-ink transition-colors hover:border-gold hover:text-gold active:bg-beige"
            >
              <Heart width={14} height={14} className="text-gold" />
              <span>Wishlist</span>
            </Link>
          </div>

          <p className="eyebrow mb-3">Shop by category</p>
          <ul className="divide-y divide-line/70">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/category/${c.slug}`}
                  onClick={onClose}
                  className="group flex items-center gap-3 py-3 transition-colors active:bg-beige/60"
                >
                  <span className="relative size-12 shrink-0 overflow-hidden rounded-sm bg-beige">
                    {c.image && (
                      <Image
                        src={c.image}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-lg font-light text-ink group-active:text-gold">
                      {c.name}
                    </span>
                    <span className="block truncate text-[11px] text-muted">
                      {c.blurb}
                    </span>
                  </span>
                  <ChevronRight width={15} height={15} className="shrink-0 text-line" />
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href="/shop"
            onClick={onClose}
            className="mt-5 flex items-center justify-center border border-gold px-5 py-3 text-[11px] font-medium tracking-luxe uppercase text-gold transition-colors hover:bg-gold hover:text-white active:bg-gold-dark"
          >
            Shop all jewellery
          </Link>

          <div className="mt-8">
            <p className="eyebrow mb-3">More</p>
            <ul className="divide-y divide-line/70">
              {moreLinks.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onClose}
                    className="flex items-center gap-3 py-3 text-sm text-charcoal transition-colors active:text-gold"
                  >
                    <Icon width={16} height={16} strokeWidth={1.5} className="text-gold" />
                    <span className="flex-1">{label}</span>
                    <ChevronRight width={13} height={13} className="text-line" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="border-t border-line bg-white px-5 py-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]">
          <div className="flex items-center justify-between gap-4">
            <p className="text-[10px] tracking-luxe uppercase text-muted">
              Insured delivery · 15-day returns
            </p>
            <div className="flex shrink-0 gap-2">
              {[
                { Icon: InstagramIcon, label: "Instagram" },
                { Icon: FacebookIcon, label: "Facebook" },
                { Icon: YoutubeIcon, label: "YouTube" },
              ].map(({ Icon, label }) => (
                <span
                  key={label}
                  title={label}
                  className="flex size-7 items-center justify-center border border-line text-charcoal"
                >
                  <Icon size={12} />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

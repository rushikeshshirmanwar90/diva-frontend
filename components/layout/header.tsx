"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Search, ShoppingBag, User, X } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { buildNavItems } from "@/components/layout/nav-links";
import { useCategories } from "@/lib/data/catalogue-context";
import { SearchOverlay } from "@/components/layout/search-overlay";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useStore } from "@/lib/store/store";
import { cn } from "@/lib/cn";

export function Header() {
  const pathname = usePathname();
  const categories = useCategories();
  const navItems = useMemo(
    () => buildNavItems(categories),
    [categories],
  );
  const { totals, wishlist, setCartOpen, hydrated } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openPanel, setOpenPanel] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Any navigation closes every transient surface. Adjusting state during render
  // (rather than in an effect) avoids a second render pass on every route change.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpenPanel(null);
    setMenuOpen(false);
    setSearchOpen(false);
  }

  const iconButton =
    "relative flex size-9 sm:size-10 items-center justify-center rounded-full text-charcoal transition-all duration-200 hover:bg-beige hover:text-gold active:bg-beige-dark";

  return (
    <header
      className={cn(
        "relative bg-white border-b border-line/80 transition-shadow duration-300",
        scrolled ? "shadow-md" : "shadow-xs",
      )}
      onMouseLeave={() => setOpenPanel(null)}
    >
      <div className="mx-auto flex h-16 sm:h-[68px] lg:h-20 max-w-[90rem] items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 lg:px-10">
        <div className="flex flex-1 items-center gap-0.5 sm:gap-1">
          <button
            type="button"
            className={cn(iconButton, "lg:hidden")}
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <HamburgerIcon open={menuOpen} />
          </button>
          <button
            type="button"
            className={cn(iconButton, "hidden lg:flex")}
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
          >
            <Search width={18} height={18} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="hidden text-[10px] tracking-luxe uppercase text-muted hover:text-gold lg:inline transition-colors"
          >
            Search
          </button>
        </div>

        <div className="flex shrink-0 items-center justify-center">
          <Logo className="transition-transform duration-300 active:scale-98" />
        </div>

        <div className="flex flex-1 items-center justify-end gap-0.5 sm:gap-1.5">
          <button
            type="button"
            className={cn(iconButton, "lg:hidden")}
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
          >
            <Search width={18} height={18} strokeWidth={1.5} />
          </button>
          <Link href="/account" className={cn(iconButton, "hidden lg:flex")} aria-label="Account">
            <User width={18} height={18} strokeWidth={1.5} />
          </Link>
          <Link href="/wishlist" className={iconButton} aria-label="Wishlist">
            <Heart width={18} height={18} strokeWidth={1.5} />
            {hydrated && wishlist.length > 0 && <Count value={wishlist.length} />}
          </Link>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className={iconButton}
            aria-label="Shopping bag"
          >
            <ShoppingBag width={18} height={18} strokeWidth={1.5} />
            {hydrated && totals.itemCount > 0 && <Count value={totals.itemCount} />}
          </button>
        </div>
      </div>

      {/* Desktop navigation */}
      <nav className="hidden border-t border-line lg:block">
        <ul className="mx-auto flex max-w-[90rem] items-center justify-center gap-9 px-10">
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <li
                key={item.label}
                onMouseEnter={() => setOpenPanel(item.panel ? item.label : null)}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "block py-4 text-[11px] tracking-luxe uppercase transition-colors",
                    active || openPanel === item.label
                      ? "text-gold"
                      : "text-charcoal hover:text-gold",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {navItems.map((item) =>
          item.panel && openPanel === item.label ? (
            <div
              key={item.label}
              className="absolute inset-x-0 top-full animate-fade-in border-t border-line bg-white shadow-[0_30px_60px_-30px_rgba(0,0,0,0.3)]"
            >
              <div className="mx-auto grid max-w-[90rem] grid-cols-[repeat(3,minmax(0,1fr))_22rem] gap-10 px-10 py-10">
                {item.panel.columns.map((col) => (
                  <div key={col.heading}>
                    <p className="eyebrow mb-4">{col.heading}</p>
                    <ul className="space-y-2.5">
                      {col.links.map((link) => (
                        <li key={link.href + link.label}>
                          <Link
                            href={link.href}
                            className="link-underline text-sm text-charcoal"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                {item.panel.feature && (
                  <Link href={item.panel.feature.href} className="group block">
                    <div className="relative aspect-16/10 overflow-hidden bg-beige">
                      <Image
                        src={item.panel.feature.image}
                        alt=""
                        fill
                        sizes="22rem"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <p className="mt-3 font-display text-lg font-light text-ink">
                      {item.panel.feature.title}
                    </p>
                    <p className="text-xs text-muted">{item.panel.feature.blurb}</p>
                  </Link>
                )}
              </div>
            </div>
          ) : null,
        )}
      </nav>

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
      {menuOpen && (
        <MobileNav
          onClose={() => setMenuOpen(false)}
          onOpenSearch={() => setSearchOpen(true)}
        />
      )}
    </header>
  );
}

/**
 * Three thin bars that morph into an X, rather than swapping the lucide
 * `Menu`/`X` icons outright — a straight swap has no in-between frame, so the
 * open/close never reads as one continuous motion the way this does.
 */
function HamburgerIcon({ open }: { open: boolean }) {
  // `top` never changes — only `transform`, so each bar's animated property
  // is a single, always-composable translate+rotate rather than two
  // properties (top and transform) racing each other during the transition.
  const bar =
    "absolute inset-x-0 top-1/2 h-px bg-current transition-transform duration-300 ease-out";
  return (
    <span className="relative block size-[18px]">
      <span className={cn(bar, open ? "rotate-45" : "-translate-y-[6px]")} />
      <span
        className={cn(
          "absolute inset-x-0 top-1/2 h-px bg-current transition-opacity duration-200",
          open && "opacity-0",
        )}
      />
      <span className={cn(bar, open ? "-rotate-45" : "translate-y-[6px]")} />
    </span>
  );
}

function Count({ value }: { value: number }) {
  return (
    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[9px] font-semibold leading-none text-white shadow-xs">
      {value > 99 ? "99+" : value}
    </span>
  );
}

export function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Close"
      className="flex size-10 items-center justify-center text-charcoal transition-colors hover:text-gold"
    >
      <X width={20} height={20} strokeWidth={1.5} />
    </button>
  );
}

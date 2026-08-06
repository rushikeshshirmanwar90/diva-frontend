"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { navItems } from "@/components/layout/nav-links";
import { SearchOverlay } from "@/components/layout/search-overlay";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useStore } from "@/lib/store/store";
import { cn } from "@/lib/cn";

export function Header() {
  const pathname = usePathname();
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
    "relative flex size-10 items-center justify-center text-charcoal transition-colors hover:text-gold";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 bg-white/95 backdrop-blur transition-shadow duration-300",
        scrolled && "shadow-[0_1px_0_rgba(0,0,0,0.06),0_10px_30px_-20px_rgba(0,0,0,0.25)]",
      )}
      onMouseLeave={() => setOpenPanel(null)}
    >
      <div className="mx-auto flex max-w-[90rem] items-center justify-between gap-4 px-5 lg:px-10">
        <div className="flex flex-1 items-center gap-1">
          <button
            type="button"
            className={cn(iconButton, "lg:hidden")}
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu width={19} height={19} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            className={cn(iconButton, "hidden lg:flex")}
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
          >
            <Search width={18} height={18} strokeWidth={1.5} />
          </button>
          <span className="hidden text-[10px] tracking-luxe uppercase text-muted lg:inline">
            Search
          </span>
        </div>

        <Logo
          className={cn("shrink-0 py-4 transition-all duration-300", scrolled && "py-3")}
        />

        <div className="flex flex-1 items-center justify-end gap-0.5">
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
      {menuOpen && <MobileNav onClose={() => setMenuOpen(false)} />}
    </header>
  );
}

function Count({ value }: { value: number }) {
  return (
    <span className="absolute top-1.5 right-1 flex min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[9px] leading-4 font-medium text-white">
      {value}
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

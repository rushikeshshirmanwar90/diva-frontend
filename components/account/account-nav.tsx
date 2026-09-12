"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  MapPin,
  Package,
  Star,
  User,
} from "lucide-react";
import { cn } from "@/lib/cn";

const links = [
  { href: "/account", label: "Profile", icon: User },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/reviews", label: "My reviews", icon: Star },
];

export function AccountNav() {
  const pathname = usePathname();

  /*
    `min-w-0` below because this is a grid item in `app/account/layout.tsx` and
    the scroller inside reports its full un-wrapped chip width as min-content —
    so `min-width: auto` would floor the nav at that width and push the page
    sideways. Currently the five labels happen to fit; a sixth, or a longer
    one, is all it would take. Same fix as `app/policies/[slug]/page.tsx`.
  */
  return (
    <nav aria-label="Account" className="min-w-0">
      {/*
        Below `lg` this is the only nav in the section — a vertical sidebar
        list stacked full-width above the page content would push every
        account page's actual content below five links and a promo box. A
        horizontal scroller keeps the section switcher to one compact row,
        the same fix `category-rail.tsx` uses for the same bleed-to-edge need.
      */}
      <ul className="no-scrollbar bleed flex gap-2 overflow-x-auto pb-1 lg:hidden">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <li key={href} className="shrink-0">
              <Link
                href={href}
                className={cn(
                  "flex items-center gap-2 border px-4 py-2.5 text-[11px] tracking-luxe whitespace-nowrap uppercase transition-colors",
                  active
                    ? "border-gold bg-gold text-white"
                    : "border-line text-charcoal hover:border-charcoal",
                )}
              >
                <Icon width={13} height={13} strokeWidth={1.5} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>

      <ul className="hidden divide-y divide-line border-y border-line lg:block">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex items-center gap-3 py-4 text-sm transition-colors",
                  active ? "text-gold" : "text-charcoal hover:text-gold",
                )}
              >
                <Icon width={15} height={15} strokeWidth={1.5} />
                {label}
                {active && <span className="ml-auto text-gold">·</span>}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 hidden bg-beige p-6 lg:block">
        <p className="text-[10px] tracking-luxe uppercase text-ink">Diva Circle</p>
        <p className="mt-2 font-display text-3xl font-light text-gold">Gold tier</p>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          ₹1,42,000 spent this year. Spend ₹58,000 more for Platinum — free home trial
          and priority bridal appointments.
        </p>
        <div className="mt-4 h-0.5 bg-line">
          <div className="h-full w-[71%] bg-gold" />
        </div>
      </div>
    </nav>
  );
}

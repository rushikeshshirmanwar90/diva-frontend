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

  return (
    <nav aria-label="Account">
      <ul className="divide-y divide-line border-y border-line">
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

      <div className="mt-8 bg-beige p-6">
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

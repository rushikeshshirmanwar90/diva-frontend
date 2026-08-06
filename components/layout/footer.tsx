import Link from "next/link";
import {
  BadgeCheck,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import {
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
} from "@/components/ui/social-icons";
import { categories, collections } from "@/lib/data/categories";
import { CONTACT } from "@/lib/data/site";
import { NewsletterForm } from "@/components/home/newsletter-form";

const assurances = [
  {
    icon: BadgeCheck,
    title: "BIS hallmarked",
    body: "HUID on every gold piece, verifiable in the BIS Care app.",
  },
  {
    icon: Truck,
    title: "Insured delivery",
    body: "Fully insured and tracked until it is signed for.",
  },
  {
    icon: RotateCcw,
    title: "15-day returns",
    body: "Plus one free size exchange within 30 days.",
  },
  {
    icon: ShieldCheck,
    title: "Lifetime care",
    body: "Free cleaning, polishing and re-rhodium plating.",
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto grid max-w-[90rem] gap-8 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-10">
        {assurances.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex gap-4">
            <Icon
              width={22}
              height={22}
              strokeWidth={1.3}
              className="mt-0.5 shrink-0 text-gold"
            />
            <div>
              <p className="text-[11px] tracking-luxe uppercase text-ink">{title}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">{body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-beige">
        <div className="mx-auto grid max-w-[90rem] gap-12 px-5 py-16 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-10">
          <div>
            <p className="font-display text-2xl font-light tracking-[0.4em] text-ink">
              DIVA
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              Fine jewellery made in Bengaluru and Jaipur since 1998. Every piece is
              hallmarked, priced transparently, and made to be worn — not stored.
            </p>
            <NewsletterForm className="mt-7" />
            <div className="mt-7 flex gap-3">
              {[
                { Icon: InstagramIcon, label: "Instagram" },
                { Icon: FacebookIcon, label: "Facebook" },
                { Icon: YoutubeIcon, label: "YouTube" },
              ].map(({ Icon, label }) => (
                <span
                  key={label}
                  title={label}
                  className="flex size-9 items-center justify-center border border-line text-charcoal transition-colors hover:border-gold hover:text-gold"
                >
                  <Icon size={15} />
                </span>
              ))}
            </div>
          </div>

          <FooterColumn
            heading="Shop"
            links={[
              ...categories.slice(0, 6).map((c) => ({
                label: c.name,
                href: `/category/${c.slug}`,
              })),
              { label: "Shop all", href: "/shop" },
            ]}
          />

          <FooterColumn
            heading="Collections"
            links={collections.map((c) => ({
              label: c.name,
              href: `/collections/${c.slug}`,
            }))}
          />

          <div>
            <p className="eyebrow mb-4">Help</p>
            <ul className="space-y-2.5">
              {[
                { label: "Contact & stores", href: "/contact" },
                { label: "FAQ", href: "/faq" },
                { label: "Shipping", href: "/policies/shipping" },
                { label: "Returns & exchange", href: "/policies/returns" },
                { label: "Privacy policy", href: "/policies/privacy" },
                { label: "Terms of service", href: "/policies/terms" },
                { label: "My account", href: "/account" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="link-underline text-sm text-charcoal">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-7 space-y-2 text-xs text-muted">
              <p className="flex items-center gap-2">
                <Phone width={13} height={13} className="text-gold" />
                <a href={CONTACT.phoneHref} className="hover:text-gold">
                  {CONTACT.phone}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail width={13} height={13} className="text-gold" />
                <a href={CONTACT.emailHref} className="hover:text-gold">
                  {CONTACT.email}
                </a>
              </p>
              <p className="flex items-start gap-2">
                <MapPin width={13} height={13} className="mt-0.5 shrink-0 text-gold" />
                {CONTACT.addressLine}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-line/70">
          <div className="mx-auto flex max-w-[90rem] flex-col gap-3 px-5 py-6 text-[10px] tracking-wide text-muted sm:flex-row sm:items-center sm:justify-between lg:px-10">
            <p>© 2026 Diva Fine Jewellery Pvt. Ltd. · GSTIN 29AABCD1234E1ZQ</p>
            <p className="tracking-luxe uppercase">
              UPI · Cards · Net banking · No-cost EMI
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  heading,
  links,
}: {
  heading: string;
  links: Array<{ label: string; href: string }>;
}) {
  return (
    <div>
      <p className="eyebrow mb-4">{heading}</p>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link href={l.href} className="link-underline text-sm text-charcoal">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

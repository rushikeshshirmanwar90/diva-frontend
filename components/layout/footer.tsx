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
import { getSiteSettings } from "@/lib/data/site";
import { NewsletterForm } from "@/components/home/newsletter-form";

const ICON_MAP: Record<string, typeof BadgeCheck> = {
  BadgeCheck,
  Truck,
  RotateCcw,
  ShieldCheck,
};

export async function Footer() {
  const [categoryList, collectionList, settings] = await Promise.all([
    categories(),
    collections(),
    getSiteSettings(),
  ]);

  const contact = settings.contact;
  const assurances = settings.assurances.map((a, i) => ({
    icon: (a.icon && ICON_MAP[a.icon]) || [BadgeCheck, Truck, RotateCcw, ShieldCheck][i % 4] || ShieldCheck,
    title: a.title,
    body: a.body,
  }));

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
              {settings.storeName || "DIVA"}
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              {settings.footerBlurb}
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
              ...categoryList.slice(0, 6).map((c) => ({
                label: c.name,
                href: `/category/${c.slug}`,
              })),
              { label: "Shop all", href: "/shop" },
            ]}
          />

          <FooterColumn
            heading="Collections"
            links={collectionList.map((c) => ({
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
                <a href={contact.phoneHref} className="hover:text-gold">
                  {contact.phone}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail width={13} height={13} className="text-gold" />
                <a href={contact.emailHref} className="hover:text-gold">
                  {contact.email}
                </a>
              </p>
              <p className="flex items-start gap-2">
                <MapPin width={13} height={13} className="mt-0.5 shrink-0 text-gold" />
                {contact.addressLine}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-line/70">
          <div className="mx-auto flex max-w-[90rem] flex-col gap-3 px-5 py-6 text-[10px] tracking-wide text-muted sm:flex-row sm:items-center sm:justify-between lg:px-10">
            <p>{settings.copyrightText}</p>
            <p className="tracking-luxe uppercase">
              {settings.paymentMethodsNote}
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

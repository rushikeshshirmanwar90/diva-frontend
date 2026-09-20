import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import {
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
} from "@/components/ui/social-icons";
import { categories } from "@/lib/data/categories";
import { occasionCollections } from "@/lib/data/occasions";
import { getSiteSettings } from "@/lib/data/site";

export async function Footer() {
  const [categoryList, settings] = await Promise.all([categories(), getSiteSettings()]);

  const contact = settings.contact;

  return (
    <footer className="mt-24 border-t border-line">
      <div className="bg-beige">
        <div className="mx-auto grid max-w-[90rem] gap-12 px-5 py-16 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-10">
          <div>
            <p className="font-display text-2xl font-light tracking-[0.4em] text-ink">
              {settings.storeName || "DIVA"}
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              {settings.footerBlurb}
            </p>
            <div className="mt-7 flex gap-3">
              {[
                { Icon: InstagramIcon, label: "Instagram" },
                { Icon: FacebookIcon, label: "Facebook" },
                { Icon: YoutubeIcon, label: "YouTube" },
              ].map(({ Icon, label }) => (
                <span
                  key={label}
                  title={label}
                  className="flex size-9 items-center justify-center border border-line text-charcoal transition-colors hover:border-gold hover:text-gold-deep"
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
            links={occasionCollections.map((c) => ({
              label: c.name,
              href: `/collections/${c.slug}`,
            }))}
          />

          <div>
            <p className="eyebrow mb-4">Help</p>
            {/* Managed in the admin console under Settings → Help Links. */}
            <ul className="space-y-2.5">
              {settings.helpLinks.map((l) => (
                <li key={`${l.href}-${l.label}`}>
                  {/^https?:\/\//i.test(l.href) ? (
                    <a
                      href={l.href}
                      className="link-underline text-sm text-charcoal"
                      target={l.openInNewTab ? "_blank" : undefined}
                      rel={l.openInNewTab ? "noopener noreferrer" : undefined}
                    >
                      {l.label}
                    </a>
                  ) : (
                    <Link
                      href={l.href}
                      className="link-underline text-sm text-charcoal"
                      target={l.openInNewTab ? "_blank" : undefined}
                      rel={l.openInNewTab ? "noopener noreferrer" : undefined}
                    >
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            <div className="mt-7 space-y-2 text-xs text-muted">
              <p className="flex items-center gap-2">
                <Phone width={13} height={13} className="text-gold" />
                <a href={contact.phoneHref} className="hover:text-gold-deep">
                  {contact.phone}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail width={13} height={13} className="text-gold" />
                <a href={contact.emailHref} className="hover:text-gold-deep">
                  {contact.email}
                </a>
              </p>
              <p>{contact.addressLine}</p>
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

import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { PageHeader } from "@/components/shop/page-header";
import { ContactForm } from "@/components/contact/contact-form";
import { WhatsappIcon } from "@/components/ui/social-icons";
import { getSiteSettings } from "@/lib/data/site";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const contact = settings.contact;
  return {
    title: "Contact & stores",
    description: `Talk to us on WhatsApp, call ${contact.phone}, or visit our counters in ${settings.contactPage.stores.map((s) => s.city).join(", ")}.`,
  };
}

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const { contact, contactPage, supportHours } = settings;
  const stores = contactPage.stores;

  return (
    <>
      <PageHeader
        eyebrow={contactPage.eyebrow}
        title={contactPage.title}
        description={contactPage.description}
        trail={[{ label: "Contact" }]}
      />

      <div className="mx-auto max-w-[90rem] px-5 pb-20 lg:px-10">
        <div className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: <WhatsappIcon size={20} className="text-gold" />,
              label: "WhatsApp",
              value: contact.whatsapp,
              href: contact.whatsappHref,
              sub: "Fastest — usually under 10 minutes",
            },
            {
              icon: <Phone width={20} height={20} strokeWidth={1.4} className="text-gold" />,
              label: "Call us",
              value: contact.phone,
              href: contact.phoneHref,
              sub: supportHours,
            },
            {
              icon: <Mail width={20} height={20} strokeWidth={1.4} className="text-gold" />,
              label: "Email",
              value: contact.email,
              href: contact.emailHref,
              sub: "Replies within 4 working hours",
            },
            {
              icon: (
                <MessageCircle
                  width={20}
                  height={20}
                  strokeWidth={1.4}
                  className="text-gold"
                />
              ),
              label: "Bridal desk",
              value: contact.email,
              href: `${contact.emailHref}?subject=Bridal%20appointment`,
              sub: "Write “Bridal” in the subject · book 6–8 weeks ahead",
            },
          ].map(({ icon, label, value, href, sub }) => (
            <div key={label} className="bg-white p-7">
              {icon}
              <p className="mt-4 text-[10px] tracking-luxe uppercase text-muted">
                {label}
              </p>
              <p className="mt-1.5 text-sm break-words text-ink">
                <a href={href} className="hover:text-gold">
                  {value}
                </a>
              </p>
              <p className="mt-1 text-xs text-muted">{sub}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 grid gap-16 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div>
            <h2 className="font-display text-3xl font-light text-ink">Send a message</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Tell us what you are looking for and roughly what you want to spend. If we
              do not have it, we will say so — and often we can make it.
            </p>
            <ContactForm />
          </div>

          <div>
            <h2 className="font-display text-3xl font-light text-ink">Our counters</h2>
            <ul className="mt-8 divide-y divide-line border-y border-line">
              {stores.map((s) => (
                <li key={s.city + s.address} className="py-7">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <h3 className="font-display text-2xl font-light text-ink">
                      {s.city}
                    </h3>
                    <span className="bg-beige px-2 py-1 text-[9px] tracking-luxe uppercase text-muted">
                      {s.tag}
                    </span>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm text-muted">
                    <li className="flex gap-3">
                      <MapPin
                        width={14}
                        height={14}
                        className="mt-1 shrink-0 text-gold"
                      />
                      {s.address}
                    </li>
                    <li className="flex gap-3">
                      <Phone width={14} height={14} className="mt-1 shrink-0 text-gold" />
                      {s.phone}
                    </li>
                    <li className="flex gap-3">
                      <Clock width={14} height={14} className="mt-1 shrink-0 text-gold" />
                      {s.hours}
                    </li>
                  </ul>
                  {s.note && <p className="mt-3 text-xs text-ink">{s.note}</p>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

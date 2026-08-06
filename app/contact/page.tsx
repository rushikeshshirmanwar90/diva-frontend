import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { PageHeader } from "@/components/shop/page-header";
import { ContactForm } from "@/components/contact/contact-form";
import { WhatsappIcon } from "@/components/ui/social-icons";
import { CONTACT } from "@/lib/data/site";

export const metadata: Metadata = {
  title: "Contact & stores",
  description: `Talk to us on WhatsApp, call ${CONTACT.phone}, or visit our counters in Bengaluru, Chennai and Hyderabad.`,
};

const stores = [
  {
    city: "Bengaluru",
    tag: "Flagship",
    address: CONTACT.addressLine,
    phone: CONTACT.phone,
    hours: "Mon–Sat 10:30–20:00 · Sun 11:00–18:00",
    note: "Bridal appointments and purity assays available here.",
  },
  {
    city: "Chennai",
    tag: "Counter",
    address: "48 Nungambakkam High Road, Chennai 600034",
    phone: CONTACT.phone,
    hours: "Mon–Sat 10:30–20:00 · Sun closed",
    note: "Temple and 22K collections held in depth.",
  },
  {
    city: "Hyderabad",
    tag: "Counter",
    address: "9 Road No. 12, Banjara Hills, Hyderabad 500034",
    phone: CONTACT.phone,
    hours: "Tue–Sun 11:00–20:00 · Mon closed",
    note: "Polki and diamond bridal, by appointment on weekends.",
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="We answer in under four hours"
        title="Talk to a person"
        description="No chatbots. Messages reach the same team that handles the counters, and bridal enquiries go straight to a senior consultant."
        trail={[{ label: "Contact" }]}
      />

      <div className="mx-auto max-w-[90rem] px-5 pb-20 lg:px-10">
        <div className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: <WhatsappIcon size={20} className="text-gold" />,
              label: "WhatsApp",
              value: CONTACT.whatsapp,
              href: CONTACT.whatsappHref,
              sub: "Fastest — usually under 10 minutes",
            },
            {
              icon: <Phone width={20} height={20} strokeWidth={1.4} className="text-gold" />,
              label: "Call us",
              value: CONTACT.phone,
              href: CONTACT.phoneHref,
              sub: "Mon–Sat, 9:00–21:00 IST",
            },
            {
              icon: <Mail width={20} height={20} strokeWidth={1.4} className="text-gold" />,
              label: "Email",
              value: CONTACT.email,
              href: CONTACT.emailHref,
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
              value: CONTACT.email,
              href: `${CONTACT.emailHref}?subject=Bridal%20appointment`,
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
                <li key={s.city} className="py-7">
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
                  <p className="mt-3 text-xs text-ink">{s.note}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

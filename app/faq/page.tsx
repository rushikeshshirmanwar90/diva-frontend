import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shop/page-header";
import { Accordion } from "@/components/ui/accordion";
import { faqs } from "@/lib/data/content";
import { CONTACT } from "@/lib/data/site";

export const metadata: Metadata = {
  title: "Help & FAQ",
  description:
    "Delivery times, pricing, returns, buyback and hallmarking — the questions we are actually asked, answered plainly.",
};

export default function FaqPage() {
  return (
    <>
      <PageHeader
        eyebrow="Help centre"
        title="Questions, answered plainly"
        description={`If your question is not here, WhatsApp us on ${CONTACT.whatsapp} — a person replies, usually within ten minutes.`}
        trail={[{ label: "Help & FAQ" }]}
      />

      <div className="mx-auto max-w-4xl px-5 pb-20 lg:px-10">
        <div className="space-y-16">
          {faqs.map((group) => (
            <section key={group.group}>
              <h2 className="mb-6 font-display text-2xl font-light text-ink">
                {group.group}
              </h2>
              <Accordion items={group.items.map((i) => ({ q: i.q, a: i.a }))} />
            </section>
          ))}
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {[
            {
              title: "Still stuck?",
              body: "Message the support desk and get a reply within four working hours.",
              href: "/contact",
              cta: "Contact us",
            },
            {
              title: "Planning a wedding?",
              body: "Bridal orders take 6–8 weeks. Here is the timeline we recommend.",
              href: "/blog/bridal-timeline-eight-weeks",
              cta: "Read the guide",
            },
          ].map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="group border border-line p-8 transition-colors hover:border-gold"
            >
              <p className="font-display text-2xl font-light text-ink">{c.title}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted">{c.body}</p>
              <span className="link-underline mt-5 inline-block text-[11px] tracking-luxe uppercase text-charcoal">
                {c.cta} →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

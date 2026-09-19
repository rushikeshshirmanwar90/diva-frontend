import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shop/page-header";
import { Accordion } from "@/components/ui/accordion";
import { getSiteSettings } from "@/lib/data/site";

export const metadata: Metadata = {
  title: "Help & FAQ",
  description:
    "Delivery times, pricing, returns, buyback and hallmarking — the questions we are actually asked, answered plainly.",
};

/**
 * Everything on this page is managed in the admin console under
 * Settings → Help & FAQ Content: the header, the question groups, and the
 * help cards at the bottom.
 *
 * The intro links the store's WhatsApp number wherever the admin writes
 * "WhatsApp us" — the number itself lives in Store & Contact, so a change
 * there is reflected here without editing two places.
 */
export default async function FaqPage() {
  const settings = await getSiteSettings();
  const contact = settings.contact;
  const faqGroups = settings.faqs;
  const help = settings.helpPage;

  const description = help.description.replace(
    /WhatsApp us(?! on)/i,
    `WhatsApp us on ${contact.whatsapp}`,
  );

  return (
    <>
      <PageHeader
        eyebrow={help.eyebrow}
        title={help.title}
        description={description}
        trail={[{ label: "Help & FAQ" }]}
      />

      <div className="mx-auto max-w-4xl px-5 pb-20 lg:px-10">
        <div className="space-y-16">
          {faqGroups.map((group) => (
            <section key={group.group}>
              <h2 className="mb-6 font-display text-2xl font-light text-ink">
                {group.group}
              </h2>
              <Accordion items={group.items.map((i) => ({ q: i.q, a: i.a }))} />
            </section>
          ))}
        </div>

        {help.cards.length > 0 && (
          <div className="mt-16 grid gap-6 sm:grid-cols-2">
            {help.cards.map((c, index) => {
              const external = /^https?:\/\//i.test(c.href);
              const className =
                "group border border-line p-8 transition-colors hover:border-gold";
              const body = (
                <>
                  <p className="font-display text-2xl font-light text-ink">{c.title}</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{c.body}</p>
                  <span className="link-underline mt-5 inline-block text-[11px] tracking-luxe uppercase text-charcoal">
                    {c.cta} →
                  </span>
                </>
              );

              return external ? (
                <a
                  key={`${c.href}-${index}`}
                  href={c.href}
                  className={className}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {body}
                </a>
              ) : (
                <Link key={`${c.href}-${index}`} href={c.href} className={className}>
                  {body}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

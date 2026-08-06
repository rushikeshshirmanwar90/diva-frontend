import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { getPolicy, policies } from "@/lib/data/policies";
import { CONTACT } from "@/lib/data/site";
import { formatDate } from "@/lib/format";

export function generateStaticParams() {
  return policies.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/policies/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const policy = getPolicy(slug);
  if (!policy) return { title: "Policy not found" };
  return { title: policy.title, description: policy.intro };
}

export default async function PolicyPage({ params }: PageProps<"/policies/[slug]">) {
  const { slug } = await params;
  const policy = getPolicy(slug);
  if (!policy) notFound();

  return (
    <div className="mx-auto max-w-[90rem] px-5 pt-8 pb-20 lg:px-10">
      <Breadcrumbs trail={[{ label: policy.title }]} />

      <div className="mt-8 grid gap-14 lg:grid-cols-[16rem_1fr] lg:gap-20">
        <nav aria-label="Policies">
          <p className="eyebrow mb-4">Policies</p>
          <ul className="divide-y divide-line border-y border-line">
            {policies.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/policies/${p.slug}`}
                  className={`block py-3.5 text-sm transition-colors ${
                    p.slug === policy.slug
                      ? "text-gold"
                      : "text-charcoal hover:text-gold"
                  }`}
                >
                  {p.title}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/faq"
                className="block py-3.5 text-sm text-charcoal transition-colors hover:text-gold"
              >
                Help & FAQ
              </Link>
            </li>
          </ul>
        </nav>

        <article className="max-w-2xl">
          <h1 className="font-display text-4xl leading-tight font-light text-ink lg:text-[3rem]">
            {policy.title}
          </h1>
          <p className="mt-3 text-[10px] tracking-luxe uppercase text-muted">
            Last updated {formatDate(policy.updated)}
          </p>
          <p className="mt-6 font-display text-xl leading-relaxed font-light text-ink">
            {policy.intro}
          </p>

          <div className="mt-12 space-y-12">
            {policy.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="font-display text-2xl font-light text-ink">
                  {section.heading}
                </h2>
                <div className="mt-4 space-y-4">
                  {section.body.map((para, i) => (
                    <p key={i} className="text-[15px] leading-[1.85] text-charcoal-soft">
                      {para}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <p className="mt-16 border-t border-line pt-6 text-xs leading-relaxed text-muted">
            Questions about this policy? Write to{" "}
            <a href={CONTACT.emailHref} className="text-gold hover:underline">
              {CONTACT.email}
            </a>{" "}
            or WhatsApp {CONTACT.whatsapp}.
          </p>
        </article>
      </div>
    </div>
  );
}

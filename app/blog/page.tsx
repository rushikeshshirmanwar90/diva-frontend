import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/shop/page-header";
import { blogPosts } from "@/lib/data/content";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "The Journal",
  description:
    "Buying guides, care notes and styling from our workshops — how to read a hallmark, what making charges mean, and how to plan a bridal order.",
};

export default function BlogPage() {
  const [lead, ...rest] = blogPosts;

  return (
    <>
      <PageHeader
        eyebrow="The Journal"
        title="Know what you're buying"
        description="Written by the people who make the pieces. No trend pieces, no filler."
        trail={[{ label: "Journal" }]}
      />

      <div className="mx-auto max-w-[90rem] px-5 pb-20 lg:px-10">
        {lead && (
          <Link href={`/blog/${lead.slug}`} className="group block">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <div className="relative aspect-16/11 overflow-hidden bg-beige">
                <Image
                  src={lead.image}
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div>
                <p className="eyebrow">
                  Latest · {lead.tag} · {lead.readMinutes} min read
                </p>
                <h2 className="mt-4 font-display text-3xl leading-tight font-light text-ink group-hover:text-gold lg:text-[2.8rem]">
                  {lead.title}
                </h2>
                <p className="mt-5 max-w-lg text-sm leading-relaxed text-muted">
                  {lead.excerpt}
                </p>
                <span className="link-underline mt-7 inline-flex items-center gap-2 text-[11px] tracking-luxe uppercase text-charcoal">
                  Read the article <ArrowRight width={14} height={14} />
                </span>
                <p className="mt-4 text-[10px] tracking-wide text-muted">
                  {lead.author} · {formatDate(lead.publishedAt)}
                </p>
              </div>
            </div>
          </Link>
        )}

        <div className="mt-20 grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
              <div className="relative aspect-16/11 overflow-hidden bg-beige">
                <Image
                  src={post.image}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 30vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <p className="eyebrow mt-5">
                {post.tag} · {post.readMinutes} min read
              </p>
              <h3 className="mt-2 font-display text-2xl leading-snug font-light text-ink group-hover:text-gold">
                {post.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{post.excerpt}</p>
              <p className="mt-3 text-[10px] tracking-wide text-muted">
                {formatDate(post.publishedAt)}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

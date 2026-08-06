import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { NewsletterForm } from "@/components/home/newsletter-form";
import { blogPosts, getPost } from "@/lib/data/content";
import { formatDate } from "@/lib/format";

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Article not found" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { images: [post.image], type: "article" },
  };
}

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const more = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <article className="mx-auto max-w-3xl px-5 pt-8 pb-20 lg:px-0">
      <Breadcrumbs
        trail={[{ label: "Journal", href: "/blog" }, { label: post.title }]}
      />

      <header className="mt-8">
        <p className="eyebrow">
          {post.tag} · {post.readMinutes} min read
        </p>
        <h1 className="mt-4 font-display text-4xl leading-tight font-light text-ink lg:text-[3.2rem]">
          {post.title}
        </h1>
        <p className="mt-5 text-base leading-relaxed text-muted">{post.excerpt}</p>
        <p className="mt-6 border-t border-line pt-5 text-[11px] tracking-wide text-muted">
          {post.author} · {formatDate(post.publishedAt)}
        </p>
      </header>

      <div className="relative mt-10 aspect-16/10 overflow-hidden bg-beige">
        <Image
          src={post.image}
          alt=""
          fill
          priority
          sizes="(max-width: 768px) 100vw, 48rem"
          className="object-cover"
        />
      </div>

      <div className="mt-12 space-y-6">
        {post.body.map((para, i) => (
          <p
            key={i}
            className={
              i === 0
                ? "font-display text-xl leading-relaxed font-light text-ink"
                : "text-[15px] leading-[1.85] text-charcoal-soft"
            }
          >
            {para}
          </p>
        ))}
      </div>

      <div className="mt-14 bg-beige p-8">
        <p className="eyebrow">One letter a month</p>
        <p className="mt-3 font-display text-2xl font-light text-ink">
          New pieces and gold-rate notes
        </p>
        <NewsletterForm className="mt-5" />
      </div>

      <section className="mt-16 border-t border-line pt-10">
        <p className="eyebrow">Keep reading</p>
        <ul className="mt-6 space-y-6">
          {more.map((p) => (
            <li key={p.slug}>
              <Link href={`/blog/${p.slug}`} className="group flex items-center gap-5">
                <div className="relative size-20 shrink-0 overflow-hidden bg-beige">
                  <Image
                    src={p.image}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-display text-xl font-light text-ink group-hover:text-gold">
                    {p.title}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {p.tag} · {p.readMinutes} min read
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}

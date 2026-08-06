import Image from "next/image";
import Link from "next/link";
import { blogPosts } from "@/lib/data/content";
import { SectionHeading } from "@/components/ui/section-heading";
import { formatDate } from "@/lib/format";

export function JournalPreview() {
  return (
    <section className="mx-auto max-w-[90rem] px-5 pb-24 lg:px-10">
      <SectionHeading
        eyebrow="The Journal"
        title="Know what you're buying"
        href="/blog"
        linkLabel="All articles"
        align="between"
      />

      <div className="mt-10 grid gap-10 md:grid-cols-3">
        {blogPosts.slice(0, 3).map((post) => (
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
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
              {post.excerpt}
            </p>
            <p className="mt-3 text-[10px] tracking-wide text-muted">
              {formatDate(post.publishedAt)}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

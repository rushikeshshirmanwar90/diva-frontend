import type { MetadataRoute } from "next";
import { categories, collections } from "@/lib/data/categories";
import { products } from "@/lib/data/products";
import { blogPosts } from "@/lib/data/content";
import { policies } from "@/lib/data/policies";

const BASE = "https://diva.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    { path: "", priority: 1 },
    { path: "/shop", priority: 0.9 },
    { path: "/collections", priority: 0.8 },
    { path: "/about", priority: 0.6 },
    { path: "/contact", priority: 0.6 },
    { path: "/blog", priority: 0.7 },
    { path: "/faq", priority: 0.5 },
  ];

  return [
    ...staticRoutes.map((r) => ({
      url: `${BASE}${r.path}`,
      lastModified: new Date(),
      priority: r.priority,
    })),
    ...categories.map((c) => ({
      url: `${BASE}/category/${c.slug}`,
      lastModified: new Date(),
      priority: 0.8,
    })),
    ...collections.map((c) => ({
      url: `${BASE}/collections/${c.slug}`,
      lastModified: new Date(),
      priority: 0.7,
    })),
    ...products.map((p) => ({
      url: `${BASE}/product/${p.slug}`,
      lastModified: new Date(p.createdAt),
      priority: 0.9,
    })),
    ...blogPosts.map((p) => ({
      url: `${BASE}/blog/${p.slug}`,
      lastModified: new Date(p.publishedAt),
      priority: 0.6,
    })),
    ...policies.map((p) => ({
      url: `${BASE}/policies/${p.slug}`,
      lastModified: new Date(p.updated),
      priority: 0.3,
    })),
  ];
}

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone" produces a self-contained server for the Dockerfile in this
  // repo, but its .next layout is not what Vercel's own build pipeline
  // expects (it looks for .next/next-server.js.nft.json directly) — so skip
  // it under Vercel's build, which sets VERCEL=1 automatically.
  output: process.env.VERCEL ? undefined : "standalone",
  reactCompiler: true,
  // Short, guessable URLs for the legal pages — app store listings and OAuth
  // consent screens ask for these — pointing at the canonical policy routes.
  async redirects() {
    return [
      { source: "/privacy-policy", destination: "/policies/privacy", permanent: true },
      { source: "/privacy", destination: "/policies/privacy", permanent: true },
      { source: "/copyright", destination: "/policies/copyright", permanent: true },
      { source: "/copyright-policy", destination: "/policies/copyright", permanent: true },
      { source: "/terms", destination: "/policies/terms", permanent: true },
    ];
  },
  experimental: {
    // Default worker concurrency for static generation can exceed available
    // memory on smaller machines, crashing the build with an OOM rather than
    // a real error. Forcing fewer, larger-batched workers trades some build
    // speed for not crashing.
    staticGenerationMinPagesPerWorker: 50,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.pinimg.com" },
    ],
  },
};

export default nextConfig;

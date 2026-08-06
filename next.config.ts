import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    // Demo imagery is hot-linked from Unsplash. `i.pinimg.com` is allowed so
    // Pinterest URLs can be dropped straight into lib/images.ts, but note that
    // Pinterest images are user-uploaded and usually not licensed for reuse —
    // keep them out of anything that ships to production.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.pinimg.com" },
    ],
  },
};

export default nextConfig;

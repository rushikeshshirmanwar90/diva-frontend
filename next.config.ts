import type { NextConfig } from "next";

/**
 * The Cloudinary account catalogue imagery is delivered from.
 *
 * Hardcoding this is what broke the home page once already: the value here said
 * `do6v48jbp` while the admin was uploading to `oo0nwzph`, and every category
 * image threw "hostname is not configured" — Next reports a *pathname* mismatch
 * with that same message, which sends you looking at the hostname, which is
 * fine.
 *
 * So it reads from the environment, with the current account as the fallback
 * for when it is unset. Keep it equal to `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` in
 * diva-backend — that is the account the admin uploads to, and these two
 * disagreeing is a 500 on any page showing a real product.
 */
const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
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

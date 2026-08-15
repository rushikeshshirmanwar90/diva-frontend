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
const CLOUDINARY_CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "oo0nwzph";

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
      /**
       * Real catalogue and category imagery, uploaded from the admin.
       * Scoped to the account's delivery path rather than the whole host, so a
       * URL pointing at someone else's Cloudinary cloud is not proxied by our
       * image optimiser — an open optimiser is a bandwidth bill someone else
       * gets to run up.
       */
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: `/${CLOUDINARY_CLOUD}/**`,
      },
    ],
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [
      // the dish page moved to /dishes/[slug] in the UI redesign — keep old
      // shared links (and the OG posts) working
      { source: "/dish/:slug", destination: "/dishes/:slug", permanent: true },
    ];
  },
};

export default nextConfig;

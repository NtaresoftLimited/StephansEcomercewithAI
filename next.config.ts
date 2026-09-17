import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: "/products",
        destination: "/shop",
        permanent: true,
      },
      {
        source: "/product/:slug*",
        destination: "/shop/:slug*",
        permanent: true,
      },
      {
        source: "/products/:slug*",
        destination: "/shop/:slug*",
        permanent: true,
      },
      {
        source: "/merchant-feed.xml",
        destination: "/google-merchant-feed.xml",
        permanent: true,
      },
    ];
  },
  // Empty turbopack config to silence the warning
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "erp.stephanspetstore.co.tz",
      },
    ],
    formats: ["image/webp", "image/avif"],
  },
};

module.exports = nextConfig;

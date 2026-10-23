import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [60, 75],
    deviceSizes: [480, 640, 828, 1080, 1280, 1600, 1920],
    minimumCacheTTL: 2678400,
  },
  // Oude WordPress-URL's blijven werken.
  async redirects() {
    return [
      { source: "/jobs/:slug", destination: "/vacatures/:slug", permanent: true },
      { source: "/vacatures/field-service", destination: "/vacatures#field-service", permanent: true },
      { source: "/vacatures/kantoor", destination: "/vacatures#kantoor", permanent: true },
      { source: "/bedankt-voor-je-sollicitatie", destination: "/werken-bij-brand-agency", permanent: true },
      { source: "/hallo-wereld", destination: "/", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/img/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default config;

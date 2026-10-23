import type { NextConfig } from "next";

const noindexHeaders = [
  { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet, noimageindex" },
  { key: "Referrer-Policy", value: "no-referrer" },
];

const nextConfig: NextConfig = {
  images: { formats: ["image/avif", "image/webp"] },
  async headers() {
    return [{ source: "/(.*)", headers: noindexHeaders }];
  },
  async redirects() {
    return [
      // Old WordPress URLs
      { source: "/grafisch-vormgever", destination: "/grafisch-vormgever-wijk-bij-duurstede", permanent: true },
      { source: "/feed", destination: "/", permanent: true },
      {
        source: "/wp-content/uploads/2023/06/AmaezinDesign_AlgemeneVoorwaarden.pdf",
        destination: "/docs/AmaezinDesign_AlgemeneVoorwaarden.pdf",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

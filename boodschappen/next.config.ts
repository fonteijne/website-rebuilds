import type { NextConfig } from "next";

const buildId = process.env.VERCEL_GIT_COMMIT_SHA ?? String(Date.now());

const config: NextConfig = {
  env: { NEXT_PUBLIC_BUILD_ID: buildId },
  reactStrictMode: true,
  poweredByHeader: false,
};

export default config;

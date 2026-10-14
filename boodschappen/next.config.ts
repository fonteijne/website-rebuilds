import { execSync } from "node:child_process";
import type { NextConfig } from "next";

const git = (args: string) => {
  try {
    return execSync(`git ${args}`, { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    return "";
  }
};

const sha = process.env.VERCEL_GIT_COMMIT_SHA ?? git("rev-parse HEAD");
const buildId = sha || String(Date.now());
// Datum van de commit die live staat; zonder git valt dit terug op het bouwmoment.
const buildDate = git("log -1 --format=%cI") || new Date().toISOString();

const config: NextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_ID: buildId,
    NEXT_PUBLIC_BUILD_SHA: sha ? sha.slice(0, 7) : "dev",
    NEXT_PUBLIC_BUILD_DATE: buildDate,
  },
  reactStrictMode: true,
  poweredByHeader: false,
};

export default config;

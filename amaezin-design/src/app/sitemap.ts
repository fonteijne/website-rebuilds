import type { MetadataRoute } from "next";
import { cities, services, site } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/portfolio", "/contact", ...services.map((s) => `/${s.slug}`), ...cities.map((c) => `/${c.slug}`)];
  return paths.map((p) => ({
    url: `${site.url}${p}`,
    changeFrequency: "monthly",
    priority: p === "" ? 1 : p.startsWith("/grafisch-vormgever") ? 0.6 : 0.8,
  }));
}

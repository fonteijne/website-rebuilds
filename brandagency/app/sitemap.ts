import type { MetadataRoute } from "next";
import { cases, jobs, nav, site } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [...nav.map((n) => n.href), "/vacatures", ...cases.map((c) => `/cases/${c.slug}`), ...jobs.map((j) => `/vacatures/${j.slug}`)];
  return paths.map((p) => ({
    url: `${site.url}${p === "/" ? "" : p}`,
    changeFrequency: "monthly",
    priority: p === "/" ? 1 : p.split("/").length > 2 ? 0.6 : 0.8,
  }));
}

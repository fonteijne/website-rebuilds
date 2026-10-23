import type { MetadataRoute } from "next";

// Rebuild staat op Vercel en mag niet geïndexeerd worden.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}

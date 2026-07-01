import type { MetadataRoute } from "next";
import { SPOTS } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const spots = Object.keys(SPOTS).map((slug) => ({
    url: `${SITE_URL}/spots/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));
  return [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly" as const, priority: 1 },
    { url: `${SITE_URL}/tours`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${SITE_URL}/spots`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.9 },
    ...spots,
  ];
}

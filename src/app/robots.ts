import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/tours", "/spots"],
      // Chặn Google index các trang công cụ nội bộ:
      disallow: ["/customers", "/quotes", "/itineraries", "/dashboard", "/tour/new", "/spots/new"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

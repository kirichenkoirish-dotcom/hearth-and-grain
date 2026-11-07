import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/cafe";

// robots.txt — подсказка поисковикам: что можно показывать в поиске, а что нет
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/account", "/admin", "/auth", "/cart", "/checkout", "/demo-complete", "/login", "/order/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

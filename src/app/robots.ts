import type { MetadataRoute } from "next";

const SITE = "https://www.quickuppinstitute.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Private areas: admin panel, internal APIs and students' fee receipts
        disallow: ["/admin", "/api/", "/receipt/"],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}

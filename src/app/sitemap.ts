import type { MetadataRoute } from "next";
import { coursesData, blogsData, eventsData } from "@/data";

const BASE_URL = "https://www.qimd.in";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { url: BASE_URL, priority: 1.0, changeFrequency: "weekly" as const },
    { url: `${BASE_URL}/about`, priority: 0.9, changeFrequency: "monthly" as const },
    { url: `${BASE_URL}/courses`, priority: 0.9, changeFrequency: "weekly" as const },
    { url: `${BASE_URL}/why-qimd`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${BASE_URL}/trainers`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${BASE_URL}/placements`, priority: 0.8, changeFrequency: "weekly" as const },
    { url: `${BASE_URL}/gallery`, priority: 0.7, changeFrequency: "monthly" as const },
    { url: `${BASE_URL}/blog`, priority: 0.8, changeFrequency: "weekly" as const },
    { url: `${BASE_URL}/events`, priority: 0.7, changeFrequency: "weekly" as const },
    { url: `${BASE_URL}/faqs`, priority: 0.7, changeFrequency: "monthly" as const },
    { url: `${BASE_URL}/contact`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${BASE_URL}/admission`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${BASE_URL}/careers`, priority: 0.6, changeFrequency: "weekly" as const },
    { url: `${BASE_URL}/hire-from-us`, priority: 0.6, changeFrequency: "monthly" as const },
    { url: `${BASE_URL}/privacy-policy`, priority: 0.3, changeFrequency: "yearly" as const },
    { url: `${BASE_URL}/terms-and-conditions`, priority: 0.3, changeFrequency: "yearly" as const },
    { url: `${BASE_URL}/refund-policy`, priority: 0.3, changeFrequency: "yearly" as const },
    { url: `${BASE_URL}/sitemap`, priority: 0.4, changeFrequency: "monthly" as const },
  ];

  const coursePages = coursesData.map((course) => ({
    url: `${BASE_URL}/courses/${course.slug}`,
    priority: 0.9,
    changeFrequency: "monthly" as const,
  }));

  const blogPages = blogsData.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    priority: 0.7,
    changeFrequency: "monthly" as const,
    lastModified: new Date(post.publishedAt),
  }));

  const eventPages = eventsData.map((event) => ({
    url: `${BASE_URL}/events/${event.slug}`,
    priority: 0.6,
    changeFrequency: "weekly" as const,
  }));

  return [
    ...staticPages.map((p) => ({ url: p.url, priority: p.priority, changeFrequency: p.changeFrequency, lastModified: new Date() })),
    ...coursePages.map((p) => ({ ...p, lastModified: new Date() })),
    ...blogPages,
    ...eventPages.map((p) => ({ ...p, lastModified: new Date() })),
  ];
}

import type { MetadataRoute } from "next";
import { coursesData, blogsData, eventsData } from "@/data";
import { seoPages } from "@/data/seoPages";
import { db } from "@/lib/db";

// Rebuilt every hour so blogs published from the CRM appear without a redeploy
export const revalidate = 3600;

const BASE_URL = "https://www.quickuppinstitute.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    { url: BASE_URL, priority: 1.0, changeFrequency: "weekly" as const },
    { url: `${BASE_URL}/about/about-qimd`, priority: 0.9, changeFrequency: "monthly" as const },
    { url: `${BASE_URL}/about/our-team`, priority: 0.7, changeFrequency: "monthly" as const },
    { url: `${BASE_URL}/courses`, priority: 0.9, changeFrequency: "weekly" as const },
    { url: `${BASE_URL}/why-qimd`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${BASE_URL}/trainers`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${BASE_URL}/placements`, priority: 0.8, changeFrequency: "weekly" as const },
    { url: `${BASE_URL}/gallery`, priority: 0.7, changeFrequency: "monthly" as const },
    { url: `${BASE_URL}/reviews-testimonials`, priority: 0.7, changeFrequency: "monthly" as const },
    { url: `${BASE_URL}/success-stories`, priority: 0.7, changeFrequency: "monthly" as const },
    { url: `${BASE_URL}/qimd-franchise`, priority: 0.6, changeFrequency: "monthly" as const },
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
    ...seoPages.map((p) => ({ url: `${BASE_URL}/${p.path}`, priority: 0.9, changeFrequency: "monthly" as const })),
  ];

  const coursePages = coursesData.map((course) => ({
    url: `${BASE_URL}/courses/${course.slug}`,
    priority: 0.9,
    changeFrequency: "monthly" as const,
  }));

  // Blogs published from the CRM; the built-in posts only if the CRM has none (same as the blog page)
  let blogPages: { url: string; priority: number; changeFrequency: "monthly"; lastModified: Date }[] = [];
  try {
    const dbBlogs = await db.blog.findMany({
      where: { isActive: true, status: "PUBLISHED", isDeleted: false },
      select: { slug: true, updatedAt: true },
    });
    blogPages = dbBlogs.map((b) => ({ url: `${BASE_URL}/blog/${b.slug}`, priority: 0.7, changeFrequency: "monthly" as const, lastModified: b.updatedAt }));
  } catch (err) {
    console.error("[sitemap] blogs not loaded:", err);
  }
  if (blogPages.length === 0) {
    blogPages = blogsData.map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      priority: 0.7,
      changeFrequency: "monthly" as const,
      lastModified: new Date(post.publishedAt),
    }));
  }

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

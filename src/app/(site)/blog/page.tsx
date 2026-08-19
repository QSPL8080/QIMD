import type { Metadata } from "next";
import { siteConfig } from "@/data";
import { getDynamicBlogs } from "@/lib/getDynamicData";
import BlogContent from "./BlogContent";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: `Blog & Knowledge Hub – ${siteConfig.name}`,
  description:
    "Explore QIMD's Knowledge Hub — trusted insights, practical learning, career guidance, and emerging trends in Digital Marketing, Graphic Design, Video Editing, and AI.",
  alternates: { canonical: "https://www.qimd.in/blog" },
};

export default async function BlogPage() {
  const blogs = await getDynamicBlogs();
  return <BlogContent blogs={blogs} />;
}
import type { Metadata } from "next";
import { siteConfig } from "@/data";
import WhyQimdContent from "./WhyQimdContent";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: `Why QIMD? – ${siteConfig.name}`,
  description: "Discover why QIMD Institute is India's most trusted AI-powered practical training institute. Practical learning, expert trainers, live projects, and 100% placement support.",
  alternates: { canonical: "https://www.qimd.in/why-qimd" },
};

export default function WhyQimdPage() {
  return <WhyQimdContent />;
}

import type { Metadata } from "next";
import { siteConfig } from "@/data";
import { getDynamicTrainers } from "@/lib/getDynamicData";
import AboutContent from "../AboutContent";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: `About QIMD – ${siteConfig.name}`,
  description: `Learn about QIMD Institute – ${siteConfig.tagline}. Based in Hinjewadi, Pune, QIMD offers practical AI-powered training in Digital Marketing, Graphic Design, and Video Editing.`,
  alternates: { canonical: "https://www.qimd.in/about/about-qimd" },
};

export default async function AboutQimdPage() {
  const dynamicTrainers = await getDynamicTrainers();
  return <AboutContent dynamicTrainers={dynamicTrainers} />;
}

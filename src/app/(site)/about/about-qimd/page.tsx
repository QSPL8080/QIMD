import type { Metadata } from "next";
import { siteConfig, trainersData } from "@/data";
import AboutContent from "../AboutContent";

export const metadata: Metadata = {
  title: `About QIMD – ${siteConfig.name}`,
  description: `Learn about QIMD Institute – ${siteConfig.tagline}. Based in Hinjewadi, Pune, QIMD offers practical AI-powered training in Digital Marketing, Graphic Design, and Video Editing.`,
  alternates: { canonical: "https://www.qimd.in/about/about-qimd" },
};

export default function AboutQimdPage() {
  const dynamicTrainers = trainersData as any[];
  return <AboutContent dynamicTrainers={dynamicTrainers} />;
}

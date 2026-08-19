import type { Metadata } from "next";
import { siteConfig } from "@/data";
import { getDynamicJobOpenings } from "@/lib/getDynamicData";
import CareersContent from "./CareersContent";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: `Careers – ${siteConfig.name}`,
  description:
    "Join QIMD Institute! Explore career opportunities for trainers, counsellors, and creative professionals in Hinjewadi, Pune.",
  alternates: { canonical: "https://www.qimd.in/careers" },
};

export default async function CareersPage() {
  const jobOpenings = await getDynamicJobOpenings();
  return <CareersContent jobOpenings={jobOpenings} />;
}

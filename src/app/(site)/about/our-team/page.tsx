import type { Metadata } from "next";
import { siteConfig } from "@/data";
import { getDynamicTrainers } from "@/lib/getDynamicData";
import OurTeamContent from "./OurTeamContent";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: `Our Team – ${siteConfig.name}`,
  description:
    "Meet the experts behind QIMD (Quickupp Institute of Marketing & Design). Experienced trainers, creative thinkers, industry mentors, and career builders dedicated to student success.",
  alternates: { canonical: "https://www.qimd.in/about/our-team" },
};

export default async function OurTeamPage() {
  const trainers = await getDynamicTrainers();
  return <OurTeamContent dynamicTrainers={trainers} />;
}

import type { Metadata } from "next";
import { siteConfig, trainersData } from "@/data";
import OurTeamContent from "./OurTeamContent";

export const metadata: Metadata = {
  title: `Our Team – ${siteConfig.name}`,
  description:
    "Meet the experts behind QIMD (Quickupp Institute of Marketing & Design). Experienced trainers, creative thinkers, industry mentors, and career builders dedicated to student success.",
  alternates: { canonical: "https://www.quickuppinstitute.com/about/our-team" },
};

export default function OurTeamPage() {
  const trainers = trainersData as any[];
  return <OurTeamContent dynamicTrainers={trainers} />;
}

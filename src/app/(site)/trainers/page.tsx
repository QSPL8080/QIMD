import type { Metadata } from "next";
import { siteConfig, trainersData } from "@/data";
import TrainersContent from "./TrainersContent";

export const metadata: Metadata = {
  title: `Our Trainers – ${siteConfig.name}`,
  description:
    "Meet QIMD's expert industry trainers — experienced professionals who teach with real-world knowledge, live client projects, and AI-powered tools.",
  alternates: { canonical: "https://www.quickuppinstitute.com/trainers" },
};

export default function TrainersPage() {
  const trainers = trainersData as any[];
  return <TrainersContent trainers={trainers} />;
}

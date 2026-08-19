import type { Metadata } from "next";
import { siteConfig } from "@/data";
import { getDynamicTrainers } from "@/lib/getDynamicData";
import TrainersContent from "./TrainersContent";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: `Our Trainers – ${siteConfig.name}`,
  description:
    "Meet QIMD's expert industry trainers — experienced professionals who teach with real-world knowledge, live client projects, and AI-powered tools.",
  alternates: { canonical: "https://www.qimd.in/trainers" },
};

export default async function TrainersPage() {
  const trainers = await getDynamicTrainers();
  return <TrainersContent trainers={trainers} />;
}

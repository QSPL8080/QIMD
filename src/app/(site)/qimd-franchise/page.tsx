import type { Metadata } from "next";
import { siteConfig } from "@/data";
import FranchiseContent from "./FranchiseContent";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: `QIMD Franchise – Partner With Us | ${siteConfig.name}`,
  description:
    "Partner with QIMD Institute and bring AI-powered practical education to your city. Complete academic, marketing, operational, and placement support provided.",
  alternates: { canonical: "https://www.qimd.in/qimd-franchise" },
};

export default function FranchisePage() {
  return <FranchiseContent />;
}

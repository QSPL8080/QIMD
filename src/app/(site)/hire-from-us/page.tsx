import type { Metadata } from "next";
import { siteConfig } from "@/data";
import HireFromUsContent from "./HireFromUsContent";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: `Hire From QIMD – ${siteConfig.name}`,
  description:
    "Hire Industry-Ready Digital Professionals in Digital Marketing, Graphic Design, or Video Editing trained with hands-on AI tools and live client project experience at QIMD.",
  alternates: { canonical: "https://www.qimd.in/hire-from-us" },
};

export default function HireFromUsPage() {
  return <HireFromUsContent />;
}

import type { Metadata } from "next";
import { siteConfig } from "@/data";
import ContactContent from "./ContactContent";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: `Contact Us – ${siteConfig.name}`,
  description:
    "Get in touch with QIMD Institute in Hinjewadi, Pune. Schedule a free career counselling session for Digital Marketing, Graphic Design, and Video Editing.",
  alternates: { canonical: "https://www.qimd.in/contact" },
};

export default function ContactPage() {
  return <ContactContent />;
}

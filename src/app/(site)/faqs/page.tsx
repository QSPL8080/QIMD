import type { Metadata } from "next";
// import Breadcrumb from "@/components/Common/Breadcrumb";
import FaqsSection from "@/components/Home/Faqs";
import { siteConfig } from "@/data";
import Link from "next/link";
import { Icon } from "@iconify/react/dist/iconify.js";

export const metadata: Metadata = {
  title: `FAQs – ${siteConfig.name}`,
  description: "Find answers to frequently asked questions about QIMD Institute's programs, admissions, fees, placements, and more.",
  alternates: { canonical: "https://www.qimd.in/faqs" },
};

import { db } from "@/lib/db";

export default async function FaqsPage() {
  let whatsappUrl: string = siteConfig.socialLinks.whatsapp;
  try {
    const ws = await db.websiteSettings.findFirst({ select: { whatsappNumber: true } });
    if (ws?.whatsappNumber) {
      whatsappUrl = ws.whatsappNumber.startsWith('http')
        ? ws.whatsappNumber
        : `https://wa.me/${ws.whatsappNumber.replace(/[^\d]/g, '')}`;
    }
  } catch (err) {}

  return (
    <>
      {/* <Breadcrumb
        title="Frequently Asked Questions"
        items={[
          { label: "Home", href: "/" },
          { label: "FAQs" },
        ]}
      /> */}

      <FaqsSection />

      {/* Still Have Questions */}
      <section className="section-py bg-gradient-to-br from-primary to-darkprimary">
        <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4 text-center">
          <div data-aos="fade-up">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
              Still Have Questions?
            </h2>
            <p className="text-white/80 text-base mb-8 max-w-xl mx-auto">
              Our counselling team is ready to answer your specific questions and help you make the best decision for your career.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary/90 text-midnight_text font-bold px-8 py-4 rounded-xl text-base transition-all duration-200"
              >
                <Icon icon="mdi:email" className="text-lg" />
                Contact Us
              </Link>
              <Link
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#22c55e] text-white font-semibold px-8 py-4 rounded-xl text-base transition-all duration-200"
              >
                <Icon icon="mdi:whatsapp" className="text-lg" />
                WhatsApp Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

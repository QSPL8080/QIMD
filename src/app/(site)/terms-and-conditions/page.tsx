import type { Metadata } from "next";
import { siteConfig } from "@/data";
import { getDynamicOrderedPageSections } from "@/lib/getDynamicData";

export const metadata: Metadata = {
  title: `Terms & Conditions – ${siteConfig.name}`,
  description: "Read QIMD Institute's Terms and Conditions for using our website and enrolling in our training programs.",
  alternates: { canonical: "https://www.qimd.in/terms-and-conditions" },
};

export default async function TermsPage() {
  const sections = await getDynamicOrderedPageSections("TERMS");
  const richSection = sections.find((s) => (s.sectionType === "RICH_TEXT" || s.content) && s.content && s.content.trim().length > 50);

  if (richSection && richSection.content) {
    return (
      <section className="section-py bg-grey dark:bg-dark">
        <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4">
          <div className="max-w-4xl mx-auto bg-white dark:bg-darklight rounded-2xl shadow-card border border-border dark:border-dark_border p-8 lg:p-12">
            <h1 className="text-3xl font-extrabold text-midnight_text dark:text-white mb-6">
              {richSection.sectionTitle || "Terms & Conditions"}
            </h1>
            <div
              className="prose prose-sm max-w-none text-muted dark:text-white/70 space-y-6"
              dangerouslySetInnerHTML={{ __html: richSection.content }}
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-py bg-grey dark:bg-dark">
      <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4">
        <div className="max-w-4xl mx-auto bg-white dark:bg-darklight rounded-2xl shadow-card border border-border dark:border-dark_border p-8 lg:p-12">
          <p className="text-sm text-muted dark:text-white/50 mb-8">Last updated: August 2025</p>

          <div className="space-y-6 text-muted dark:text-white/70">
            {[
              {
                title: "1. Acceptance of Terms",
                content: "By accessing QIMD Institute's website or enrolling in any of our programs, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.",
              },
              {
                title: "2. Course Enrollment",
                content: "Enrollment in QIMD programs is subject to availability and completion of the admission process. QIMD reserves the right to accept or reject any application at its discretion. Enrollment is confirmed only upon receipt of the applicable fees.",
              },
              {
                title: "3. Course Content & Schedule",
                content: "QIMD reserves the right to modify course content, curriculum, schedule, and trainers at any time without prior notice, to ensure the best quality and relevance of training.",
              },
              {
                title: "4. Student Conduct",
                content: "Students are expected to maintain professional conduct, attend classes regularly, and complete all assignments and projects. QIMD reserves the right to terminate enrollment for misconduct or repeated absence without notice.",
              },
              {
                title: "5. Intellectual Property",
                content: "All course materials, study guides, and content provided by QIMD Institute are the intellectual property of QIMD. Students may not reproduce, distribute, or share course materials without prior written permission.",
              },
              {
                title: "6. Placement Assistance",
                content: "QIMD provides job assistance and placement opportunities as part of the program. However, QIMD does not guarantee placement or employment. Placement outcomes depend on student performance, market conditions, and other factors.",
              },
              {
                title: "7. Limitation of Liability",
                content: "QIMD Institute shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services or enrollment in our programs.",
              },
              {
                title: "8. Changes to Terms",
                content: "QIMD reserves the right to modify these Terms at any time. Continued use of our services after changes constitutes acceptance of the updated Terms.",
              },
              {
                title: "9. Governing Law",
                content: "These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Pune, Maharashtra.",
              },
              {
                title: "10. Contact",
                content: `For questions about these Terms, contact us at ${siteConfig.email} or ${siteConfig.phone}.`,
              },
            ].map((section, i) => (
              <div key={i}>
                <h2 className="text-lg font-bold text-midnight_text dark:text-white mb-2">{section.title}</h2>
                <p className="text-sm leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

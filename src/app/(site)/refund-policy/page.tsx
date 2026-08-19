import type { Metadata } from "next";
import { siteConfig } from "@/data";
import { getDynamicOrderedPageSections } from "@/lib/getDynamicData";

export const metadata: Metadata = {
  title: `Refund Policy – ${siteConfig.name}`,
  description: "Read QIMD Institute's Refund Policy for course enrollments and fee payments.",
  alternates: { canonical: "https://www.qimd.in/refund-policy" },
};

export default async function RefundPolicyPage() {
  const sections = await getDynamicOrderedPageSections("REFUND_POLICY");
  const richSection = sections.find((s) => (s.sectionType === "RICH_TEXT" || s.content) && s.content && s.content.trim().length > 50);

  if (richSection && richSection.content) {
    return (
      <section className="section-py bg-grey dark:bg-dark">
        <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4">
          <div className="max-w-4xl mx-auto bg-white dark:bg-darklight rounded-2xl shadow-card border border-border dark:border-dark_border p-8 lg:p-12">
            <h1 className="text-3xl font-extrabold text-midnight_text dark:text-white mb-6">
              {richSection.sectionTitle || "Refund & Fee Policy"}
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
            <div>
              <h2 className="text-lg font-bold text-midnight_text dark:text-white mb-2">Overview</h2>
              <p className="text-sm leading-relaxed">
                QIMD Institute is committed to providing high-quality education and a positive learning experience. Please read our refund policy carefully before enrolling.
              </p>
            </div>

            {[
              {
                title: "Cancellation Before Batch Start",
                content: "If a student cancels their enrollment before the batch commences, a refund of the course fee (minus the registration fee) may be processed within 30 working days, subject to written cancellation request.",
              },
              {
                title: "No Refund After Batch Commencement",
                content: "Once the batch has started and classes have commenced, no refund will be provided. Students who cannot continue due to personal reasons may request a transfer to the next available batch, subject to availability and QIMD's approval.",
              },
              {
                title: "Registration Fee",
                content: "The registration fee is non-refundable under any circumstances. It covers the administrative costs of processing your application and reserving your seat.",
              },
              {
                title: "Course Transfers",
                content: "Students may request a course transfer (e.g., from Digital Marketing to Graphic Design) before the 2nd week of class commencement. Course transfer requests are subject to seat availability and may involve a fee adjustment.",
              },
              {
                title: "Batch Transfer",
                content: "Students may request a transfer to a future batch due to genuine emergencies (medical, family emergency) at QIMD's discretion. Such requests must be submitted in writing with supporting documentation.",
              },
              {
                title: "Refund Process",
                content: "All eligible refunds will be processed within 30 working days of approval. Refunds will be made to the original payment method. QIMD is not responsible for delays caused by banking processes.",
              },
              {
                title: "Contact for Refund Requests",
                content: `For refund or cancellation requests, please write to us at ${siteConfig.email} or call ${siteConfig.phone}. Include your name, course, batch details, and reason for cancellation.`,
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

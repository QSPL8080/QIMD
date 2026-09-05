import type { Metadata } from "next";
import { siteConfig } from "@/data";
import Link from "next/link";
import { Icon } from "@iconify/react/dist/iconify.js";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: `Admission Information – ${siteConfig.name}`,
  description: "Learn about QIMD Institute's admission process, eligibility criteria, program fees, and enrollment procedure.",
  alternates: { canonical: "https://www.qimd.in/admission" },
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-xl font-bold text-midnight_text dark:text-white mb-4 pb-2 border-b border-border dark:border-dark_border">{title}</h2>
    {children}
  </div>
);

export default async function AdmissionPage() {
  let whatsappUrl: string = siteConfig.socialLinks.whatsapp;
  let callingPhone: string = siteConfig.phone;
  try {
    const ws = await db.websiteSettings.findFirst({ select: { whatsappNumber: true, contactPhone: true } });
    if (ws?.whatsappNumber) {
      whatsappUrl = ws.whatsappNumber.startsWith('http')
        ? ws.whatsappNumber
        : `https://wa.me/${ws.whatsappNumber.replace(/[^\d]/g, '')}`;
    }
    if (ws?.contactPhone) {
      callingPhone = ws.contactPhone;
    }
  } catch (err) {}

  return (
    <>
      <section className="section-py bg-grey dark:bg-dark">
        <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4">
          <div className="max-w-4xl mx-auto bg-white dark:bg-darklight rounded-2xl shadow-card border border-border dark:border-dark_border p-8 lg:p-12">

            <div className="badge-primary mb-5">Admissions Open</div>
            <h1 className="text-3xl font-extrabold text-midnight_text dark:text-white mb-8">
              Admission Information
            </h1>

            <Section title="Who Can Apply?">
              <p className="text-muted dark:text-white/70 text-base mb-3">QIMD&apos;s programs are open to:</p>
              <ul className="space-y-2">
                {[
                  "Students (12th pass, graduates, and postgraduates)",
                  "Freshers looking for their first job in the digital industry",
                  "Working professionals who want to upskill or switch careers",
                  "Business owners and entrepreneurs who want to market their business",
                  "Freelancers looking to build specialized skills",
                  "Career switchers from any field or background",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted dark:text-white/70">
                    <span className="text-primary font-bold mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Admission Process">
              <div className="space-y-4">
                {[
                  { step: "01", title: "Submit Enquiry", desc: "Fill out the enquiry form or call our admissions team." },
                  { step: "02", title: "Counselling Session", desc: "Our team will schedule a free career counselling session to understand your goals." },
                  { step: "03", title: "Program Selection", desc: "Based on your goals, our counsellors will recommend the best program for you." },
                  { step: "04", title: "Enrollment", desc: "Complete the enrollment formalities and fee payment to confirm your seat." },
                  { step: "05", title: "Batch Confirmation", desc: "You'll be assigned to the next available batch and receive all onboarding details." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-bold text-midnight_text dark:text-white text-sm">{item.title}</h4>
                      <p className="text-sm text-muted dark:text-white/60 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Fee & Payment">
              <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-5 border border-primary/20">
                <p className="text-sm text-muted dark:text-white/70 mb-3">
                  Program fees vary by program and batch. Please contact our admissions team for the latest fee structure, current offers, and EMI options.
                </p>
                <p className="text-sm text-muted dark:text-white/70">
                  <strong className="text-primary">EMI Available:</strong> We offer flexible EMI payment options through our banking partners to make the program accessible to everyone.
                </p>
              </div>
            </Section>

            <Section title="What&apos;s Included in the Program Fee?">
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8">
                {[
                  "All program sessions & classes",
                  "Study material & resources",
                  "Access to software & tools",
                  "Live client project experience",
                  "Internship opportunity",
                  "Resume building support",
                  "Interview preparation",
                  "Program completion certificate",
                  "Internship certificate",
                  "2 years repeat batch access",
                  "Placement assistance",
                  "Lifetime alumni support",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted dark:text-white/70">
                    <span className="text-accent font-bold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </Section>

            <div className="bg-gradient-to-br from-primary to-darkprimary rounded-xl p-6 text-white text-center mt-8">
              <h3 className="font-bold text-lg mb-2">Ready to Enroll?</h3>
              <p className="text-white/80 text-sm mb-4">Contact our admissions team today to start your journey.</p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href={`tel:${callingPhone}`}
                  className="inline-flex items-center gap-2 bg-secondary text-midnight_text font-bold px-6 py-3 rounded-xl text-sm"
                >
                  <Icon icon="mdi:phone" />
                  <span>{callingPhone}</span>
                </Link>
                <Link
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] text-white font-semibold px-6 py-3 rounded-xl text-sm"
                >
                  <Icon icon="mdi:whatsapp" />
                  <span>WhatsApp Us</span>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}

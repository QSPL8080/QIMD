import type { Metadata } from "next";
import { siteConfig } from "@/data";
import { getDynamicOrderedPageSections } from "@/lib/getDynamicData";

export const metadata: Metadata = {
  title: `Privacy Policy – ${siteConfig.name}`,
  description: "Read QIMD Institute's Privacy Policy to understand how we collect, use, and protect your personal information.",
  alternates: { canonical: "https://www.qimd.in/privacy-policy" },
};

export default async function PrivacyPolicyPage() {
  const sections = await getDynamicOrderedPageSections("PRIVACY_POLICY");
  const richSection = sections.find((s) => (s.sectionType === "RICH_TEXT" || s.content) && s.content && s.content.trim().length > 50);

  if (richSection && richSection.content) {
    return (
      <section className="section-py bg-grey dark:bg-dark">
        <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4">
          <div className="max-w-4xl mx-auto bg-white dark:bg-darklight rounded-2xl shadow-card border border-border dark:border-dark_border p-8 lg:p-12">
            <h1 className="text-3xl font-extrabold text-midnight_text dark:text-white mb-6">
              {richSection.sectionTitle || "Privacy Policy"}
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

          <div className="prose prose-sm max-w-none text-muted dark:text-white/70 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-midnight_text dark:text-white mb-3">1. Introduction</h2>
              <p>QIMD Institute (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or enroll in our programs.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-midnight_text dark:text-white mb-3">2. Information We Collect</h2>
              <p>We may collect information that you voluntarily provide when you:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Fill out enquiry or contact forms on our website</li>
                <li>Register for a course or program</li>
                <li>Subscribe to our newsletter or updates</li>
                <li>Contact us via phone, email, or WhatsApp</li>
              </ul>
              <p className="mt-2">This information may include: name, email address, phone number, location, and course preferences.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-midnight_text dark:text-white mb-3">3. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Respond to your enquiries and provide course information</li>
                <li>Process your enrollment and admission</li>
                <li>Send you updates about new batches, events, and offers</li>
                <li>Improve our website and services</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-midnight_text dark:text-white mb-3">4. Information Sharing</h2>
              <p>We do not sell, trade, or rent your personal information to third parties. We may share your information with trusted service providers who assist us in operating our website and conducting our business, provided they agree to keep your information confidential.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-midnight_text dark:text-white mb-3">5. Data Security</h2>
              <p>We implement appropriate technical and organizational security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-midnight_text dark:text-white mb-3">6. Your Rights</h2>
              <p>You have the right to access, correct, or delete your personal information. To exercise these rights, please contact us at{" "}
                <a href={`mailto:${siteConfig.email}`} className="text-primary hover:underline">{siteConfig.email}</a>.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-midnight_text dark:text-white mb-3">7. Cookies</h2>
              <p>Our website may use cookies to enhance your browsing experience. You can choose to disable cookies through your browser settings, though this may affect certain features of our website.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-midnight_text dark:text-white mb-3">8. Contact Us</h2>
              <p>If you have questions about this Privacy Policy, please contact us:</p>
              <div className="mt-2 space-y-1">
                <p><strong>QIMD Institute</strong></p>
                <p>{siteConfig.address}</p>
                <p>Email: <a href={`mailto:${siteConfig.email}`} className="text-primary hover:underline">{siteConfig.email}</a></p>
                <p>Phone: <a href={`tel:${siteConfig.phone}`} className="text-primary hover:underline">{siteConfig.phone}</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

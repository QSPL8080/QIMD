import type { Metadata } from "next";
import { siteConfig } from "@/data";

export const metadata: Metadata = {
  title: `Privacy Policy – ${siteConfig.name}`,
  description: "Read Quickupp Institute of Marketing & Design (QIMD) Privacy Policy to understand how we collect, use, store, and protect your personal information.",
  alternates: { canonical: "https://www.qimd.in/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <section className="section-py bg-grey dark:bg-dark">
      <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4">
        <div className="max-w-4xl mx-auto bg-white dark:bg-darklight rounded-2xl shadow-card border border-border dark:border-dark_border p-8 sm:p-10 lg:p-12">
          {/* Header */}
          <div className="border-b border-border dark:border-dark_border pb-6 mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-midnight_text dark:text-white mb-3">
              PRIVACY POLICY
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-muted dark:text-white/60 font-medium">
              <span><strong>Effective Date:</strong> 31 August 2026</span>
              <span>•</span>
              <span><strong>Last Updated:</strong> 31 August 2026</span>
            </div>
          </div>

          <div className="prose prose-sm sm:prose-base max-w-none text-slate-700 dark:text-white/80 space-y-8 leading-relaxed">
            {/* Introductory Text */}
            <div className="space-y-3 bg-slate-50 dark:bg-white/5 p-4 sm:p-5 rounded-xl border border-slate-200/80 dark:border-white/10">
              <p>
                <strong>Quickupp Institute of Marketing &amp; Design (QIMD)</strong>, operated by <strong>Quickupp Softech Pvt. Ltd.</strong> (“Quickupp”, “QIMD”, “we”, “us”, or “our”), respects your privacy and is committed to protecting the personal information entrusted to us.
              </p>
              <p>
                This Privacy Policy explains how we collect, use, store, process and protect personal information when you visit <strong>quickuppinstitute.com</strong>, submit an enquiry, download a brochure, contact us, register for a course, make a payment, enrol in a programme or otherwise interact with our services.
              </p>
            </div>

            {/* 1. Information We Collect */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">1. Information We Collect</h2>
              <p className="mb-3">Depending on your interaction with us, we may collect:</p>
              
              <h3 className="text-base sm:text-lg font-bold text-midnight_text dark:text-white mt-4 mb-2">Information You Provide</h3>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>Full name;</li>
                <li>Mobile number;</li>
                <li>WhatsApp number;</li>
                <li>Email address;</li>
                <li>City/location;</li>
                <li>Educational information;</li>
                <li>Course preferences;</li>
                <li>Admission information;</li>
                <li>Payment and transaction information;</li>
                <li>Documents submitted during admission;</li>
                <li>Enquiry details;</li>
                <li>Communication details; and</li>
                <li>Other information voluntarily provided by you.</li>
              </ul>

              <h3 className="text-base sm:text-lg font-bold text-midnight_text dark:text-white mt-4 mb-2">Technical Information</h3>
              <p className="mb-2">When you use our Website, certain information may be collected automatically, including:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>IP address;</li>
                <li>Browser type;</li>
                <li>Device information;</li>
                <li>Operating system;</li>
                <li>Pages visited;</li>
                <li>Referring website;</li>
                <li>Date and time of access; and</li>
                <li>Website usage information.</li>
              </ul>
            </div>

            {/* 2. How We Use Your Information */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">2. How We Use Your Information</h2>
              <p className="mb-2">We may use personal information to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Respond to enquiries;</li>
                <li>Provide course information;</li>
                <li>Send brochures;</li>
                <li>Provide counselling;</li>
                <li>Process admissions;</li>
                <li>Manage courses and batches;</li>
                <li>Process payments;</li>
                <li>Provide LMS access;</li>
                <li>Manage attendance;</li>
                <li>Issue certificates;</li>
                <li>Administer internships;</li>
                <li>Provide placement assistance;</li>
                <li>Provide career support;</li>
                <li>Conduct workshops;</li>
                <li>Provide customer support;</li>
                <li>Improve our Website and services;</li>
                <li>Maintain Website security;</li>
                <li>Prevent fraud or misuse;</li>
                <li>Meet legal and regulatory requirements; and</li>
                <li>Send relevant communications and marketing messages where permitted by applicable law.</li>
              </ul>
            </div>

            {/* 3. Marketing Communications */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">3. Marketing Communications</h2>
              <p className="mb-2">Where permitted by applicable law, we may contact you regarding:</p>
              <ul className="list-disc pl-5 space-y-1 mb-3">
                <li>Courses;</li>
                <li>Admissions;</li>
                <li>New batches;</li>
                <li>Workshops;</li>
                <li>Training programmes;</li>
                <li>Institute updates;</li>
                <li>Offers and promotions; and</li>
                <li>Other relevant services.</li>
              </ul>
              <p className="text-sm text-muted dark:text-white/70">
                You may request to stop promotional communications by contacting us or using an available unsubscribe/opt-out mechanism.
              </p>
            </div>

            {/* 4. Cookies & Similar Technologies */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">4. Cookies &amp; Similar Technologies</h2>
              <p className="mb-2">Our Website may use cookies, pixels, analytics tools and similar technologies to:</p>
              <ul className="list-disc pl-5 space-y-1 mb-3">
                <li>Operate the Website;</li>
                <li>Improve functionality;</li>
                <li>Understand Website usage;</li>
                <li>Measure marketing performance;</li>
                <li>Improve user experience; and</li>
                <li>Maintain security.</li>
              </ul>
              <p className="text-sm text-muted dark:text-white/70">
                Third-party services may also place cookies or similar technologies on the Website. Where required by applicable law, appropriate consent or controls will be provided.
              </p>
            </div>

            {/* 5. Sharing of Personal Information */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">5. Sharing of Personal Information</h2>
              <p className="mb-2">We may share personal information with trusted service providers where reasonably necessary to operate our business, including:</p>
              <ul className="list-disc pl-5 space-y-1 mb-3">
                <li>Website hosting providers;</li>
                <li>CRM providers;</li>
                <li>LMS providers;</li>
                <li>Payment processors;</li>
                <li>Communication providers;</li>
                <li>IT service providers;</li>
                <li>Analytics providers;</li>
                <li>Recruitment or hiring partners;</li>
                <li>Professional advisers; and</li>
                <li>Government or regulatory authorities where legally required.</li>
              </ul>
              <p className="text-sm font-semibold text-midnight_text dark:text-white">
                We do not intend to sell personal information as a standalone commercial product.
              </p>
            </div>

            {/* 6. Payment Information */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">6. Payment Information</h2>
              <div className="space-y-2">
                <p>Payments may be processed through third-party payment gateways or financial service providers.</p>
                <p>Payment providers may collect and process payment, banking or card information in accordance with their own terms and privacy policies.</p>
                <p>Quickupp does not intend to store complete payment-card information unless necessary and legally permitted.</p>
              </div>
            </div>

            {/* 7. Data Retention */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">7. Data Retention</h2>
              <p className="mb-2">We retain personal information for as long as reasonably necessary for purposes such as:</p>
              <ul className="list-disc pl-5 space-y-1 mb-3">
                <li>Admission and course administration;</li>
                <li>Financial and accounting records;</li>
                <li>Certification;</li>
                <li>Internship and placement administration;</li>
                <li>Customer support;</li>
                <li>Legal compliance;</li>
                <li>Dispute resolution;</li>
                <li>Security; and</li>
                <li>Legitimate business purposes.</li>
              </ul>
              <p className="text-sm text-muted dark:text-white/70">
                Retention periods may vary depending on the type and purpose of the information.
              </p>
            </div>

            {/* 8. Data Security */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">8. Data Security</h2>
              <div className="space-y-2">
                <p>We take reasonable technical and organisational measures to protect personal information against unauthorised access, misuse, loss, alteration or disclosure.</p>
                <p>However, no electronic system, website, database or transmission method can be guaranteed to be completely secure.</p>
              </div>
            </div>

            {/* 9. Your Privacy Rights */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">9. Your Privacy Rights</h2>
              <p className="mb-2">Subject to applicable law, you may have rights relating to your personal information, including rights to:</p>
              <ul className="list-disc pl-5 space-y-1 mb-3">
                <li>Request information about processing;</li>
                <li>Request correction of inaccurate information;</li>
                <li>Request deletion where legally applicable;</li>
                <li>Withdraw consent where consent is the applicable basis;</li>
                <li>Raise a privacy-related grievance; and</li>
                <li>Exercise other rights available under applicable law.</li>
              </ul>
              <p className="text-sm text-muted dark:text-white/70">
                To exercise an applicable right, please contact us using the details provided below. We may need to verify your identity before processing certain requests.
              </p>
            </div>

            {/* 10. Children's Data */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">10. Children&apos;s Data</h2>
              <p>Where personal information relating to a child is collected, Quickupp will comply with applicable legal requirements relating to children&apos;s personal data and parental/guardian consent.</p>
            </div>

            {/* 11. Third-Party Websites */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">11. Third-Party Websites</h2>
              <div className="space-y-2">
                <p>Our Website may contain links to third-party websites, platforms or services.</p>
                <p>Quickupp is not responsible for the privacy practices, security or content of third-party websites.</p>
                <p>Users should review the relevant third-party privacy policies before providing personal information.</p>
              </div>
            </div>

            {/* 12. International Processing */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">12. International Processing</h2>
              <div className="space-y-2">
                <p>Certain service providers used by Quickupp may process or store information outside India.</p>
                <p>Where personal information is processed or transferred outside India, Quickupp will take such measures as may be required under applicable law.</p>
              </div>
            </div>

            {/* 13. Data Breaches */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">13. Data Breaches</h2>
              <p>In the event of a personal-data breach, Quickupp will take appropriate steps in accordance with applicable law, including any legally required notifications.</p>
            </div>

            {/* 14. Changes to This Privacy Policy */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">14. Changes to This Privacy Policy</h2>
              <div className="space-y-2">
                <p>We may update this Privacy Policy periodically to reflect changes in our services, technology, business practices or applicable law.</p>
                <p>The updated version will be published on the Website with a revised “Last Updated” date.</p>
              </div>
            </div>

            {/* 15. Contact Us */}
            <div className="border-t border-border dark:border-dark_border pt-6">
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">15. Contact Us</h2>
              <div className="space-y-1 bg-slate-50 dark:bg-white/5 p-4 sm:p-5 rounded-xl border border-slate-200/80 dark:border-white/10 text-sm">
                <p className="font-bold text-midnight_text dark:text-white">Quickupp Institute of Marketing &amp; Design</p>
                <p>Operated by Quickupp Softech Pvt. Ltd.</p>
                <p>Suratwala Mark Plazzo, Hinjawadi Rd, Phase 1, Hinjawadi, Pune, Maharashtra 411057, India</p>
                <p className="pt-2">
                  <strong>Email:</strong>{" "}
                  <a href="mailto:info@quickuppinstitute.com" className="text-primary hover:underline font-medium">info@quickuppinstitute.com</a>
                </p>
                <p>
                  <strong>Website:</strong>{" "}
                  <a href="https://www.quickuppinstitute.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">quickuppinstitute.com</a>
                </p>
                <p className="text-xs text-muted dark:text-white/60 pt-2">
                  Please clearly describe the nature of your request so that we can process it appropriately.
                </p>
              </div>
            </div>

            {/* 16. Acceptance */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">16. Acceptance</h2>
              <div className="space-y-2">
                <p>By using our Website or voluntarily providing personal information to us, you acknowledge that you have read this Privacy Policy.</p>
                <p>Where separate consent is required by applicable law, such consent will be obtained through an appropriate consent mechanism.</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}


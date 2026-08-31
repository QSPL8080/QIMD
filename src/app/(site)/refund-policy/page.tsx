import type { Metadata } from "next";
import { siteConfig } from "@/data";

export const metadata: Metadata = {
  title: `Refund & Cancellation Policy – ${siteConfig.name}`,
  description: "Read Quickupp Institute of Marketing & Design (QIMD) Refund and Cancellation Policy for course enrollments, fees, and batch schedules.",
  alternates: { canonical: "https://www.qimd.in/refund-policy" },
};

export default function RefundPolicyPage() {
  return (
    <section className="section-py bg-grey dark:bg-dark">
      <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4">
        <div className="max-w-4xl mx-auto bg-white dark:bg-darklight rounded-2xl shadow-card border border-border dark:border-dark_border p-8 sm:p-10 lg:p-12">
          {/* Header */}
          <div className="border-b border-border dark:border-dark_border pb-6 mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-midnight_text dark:text-white mb-3">
              REFUND &amp; CANCELLATION POLICY
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
                This Refund &amp; Cancellation Policy applies to courses, training programmes, workshops and other paid educational services offered by <strong>Quickupp Institute of Marketing &amp; Design (QIMD)</strong>, operated by <strong>Quickupp Softech Pvt. Ltd.</strong> (“Quickupp”, “QIMD”, “Institute”, “we”, “us”, or “our”).
              </p>
              <p>
                By making a payment or enrolling in a programme, you acknowledge and agree to the applicable refund and cancellation terms, subject to applicable law.
              </p>
            </div>

            {/* 1. Admission & Registration Fees */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">1. Admission &amp; Registration Fees</h2>
              <div className="space-y-2">
                <p>Admission and registration fees are non-refundable, subject to applicable law.</p>
                <p>Payment of the admission/registration fee confirms the student&apos;s admission process or seat reservation, subject to the applicable course and batch conditions.</p>
              </div>
            </div>

            {/* 2. Cancellation Before Course Commencement */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">2. Cancellation Before Course Commencement</h2>
              <div className="space-y-2">
                <p>A student may submit a cancellation request before the applicable course commencement date.</p>
                <p>However, cancellation or refund requests submitted within <strong>15 days prior to the scheduled course commencement date</strong> will generally not be eligible for a refund, subject to applicable law.</p>
              </div>
            </div>

            {/* 3. Cancellation After Course Commencement */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">3. Cancellation After Course Commencement</h2>
              <div className="space-y-2">
                <p>Once a course has commenced, course fees are generally non-refundable.</p>
                <p>This includes cancellation due to personal reasons, relocation, change of career plans, employment, academic commitments, inability to attend or a decision not to continue the programme.</p>
                <p>Any exception will be considered only where required by applicable law or specifically approved by the Institute.</p>
              </div>
            </div>

            {/* 4. Access to Course Services */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">4. Access to Course Services</h2>
              <p className="mb-2">Once a student has:</p>
              <ul className="list-disc pl-5 space-y-1 mb-2">
                <li>Attended a class;</li>
                <li>Attended a practical session;</li>
                <li>Participated in a workshop;</li>
                <li>Accessed the LMS;</li>
                <li>Received study materials; or</li>
                <li>Started receiving course-related services,</li>
              </ul>
              <p>the course fee will generally be non-refundable, subject to applicable law.</p>
            </div>

            {/* 5. Partial Refunds */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">5. Partial Refunds</h2>
              <p className="mb-2">Partial refunds will not ordinarily be provided for:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Unused classes;</li>
                <li>Missed sessions;</li>
                <li>Non-attendance;</li>
                <li>Unused LMS access;</li>
                <li>Unused study materials;</li>
                <li>Unused practical sessions;</li>
                <li>Unused repeat-batch access; or</li>
                <li>Failure to use available course benefits.</li>
              </ul>
            </div>

            {/* 6. Batch Transfer */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">6. Batch Transfer</h2>
              <p className="mb-2">Students may request a transfer to another batch. Approval is subject to:</p>
              <ul className="list-disc pl-5 space-y-1 mb-2">
                <li>Availability of seats;</li>
                <li>Course availability;</li>
                <li>Institute approval;</li>
                <li>Timing compatibility; and</li>
                <li>Applicable administrative conditions.</li>
              </ul>
              <p className="text-sm text-muted dark:text-white/70">
                Batch transfer is not automatic and may be declined where operationally impractical.
              </p>
            </div>

            {/* 7. Course Rescheduling */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">7. Course Rescheduling</h2>
              <div className="space-y-2">
                <p>If Quickupp reschedules a course, batch or session due to operational, faculty, technical, regulatory or other legitimate reasons, the Institute may provide an alternative schedule or reasonable alternative arrangement.</p>
                <p>Where the Institute continues to provide the relevant programme or a reasonable alternative, such rescheduling will not automatically create a right to a refund.</p>
              </div>
            </div>

            {/* 8. Cancellation by the Institute */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">8. Cancellation by the Institute</h2>
              <div className="space-y-2">
                <p>If the Institute cancels a programme before commencement and cannot provide a reasonable alternative batch or programme, the Institute will communicate the available options to affected students.</p>
                <p>Depending on the circumstances, options may include transfer to another batch or refund of eligible amounts, subject to applicable law.</p>
              </div>
            </div>

            {/* 9. Refund Request Procedure */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">9. Refund Request Procedure</h2>
              <p className="mb-2">Where a refund request is eligible, the student must submit a written request containing:</p>
              <ul className="list-disc pl-5 space-y-1 mb-3">
                <li>Student name;</li>
                <li>Registered mobile number;</li>
                <li>Registered email address;</li>
                <li>Course name;</li>
                <li>Admission/payment details;</li>
                <li>Reason for cancellation/refund; and</li>
                <li>Supporting documents, where applicable.</li>
              </ul>
              <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-lg border border-slate-200/60 dark:border-white/10 text-sm">
                <p>
                  <strong>Requests should be sent to:</strong>{" "}
                  <a href="mailto:info@quickuppinstitute.com" className="text-primary hover:underline font-medium">info@quickuppinstitute.com</a>
                </p>
              </div>
            </div>

            {/* 10. Refund Processing */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">10. Refund Processing</h2>
              <div className="space-y-2">
                <p>Where a refund is approved, it will generally be processed through the original payment method or another appropriate method.</p>
                <p>Processing time may depend on the payment method, bank, payment gateway or financial institution.</p>
                <p>Any legally permissible and applicable third-party transaction charges may be deducted where such charges were disclosed or otherwise applicable.</p>
              </div>
            </div>

            {/* 11. EMI / Financing */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">11. EMI / Financing</h2>
              <div className="space-y-2">
                <p>Where course fees are paid through an EMI, bank, NBFC or other third-party financing arrangement, the financing arrangement may be governed by separate terms.</p>
                <p>Students remain responsible for obligations owed directly to the relevant financing provider.</p>
                <p>Approval of a refund by Quickupp does not automatically cancel a separate financing agreement unless the relevant financing provider confirms such cancellation.</p>
              </div>
            </div>

            {/* 12. Placement & Internship */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">12. Placement &amp; Internship</h2>
              <p className="mb-2">Non-selection for:</p>
              <ul className="list-disc pl-5 space-y-1 mb-2">
                <li>Internship;</li>
                <li>Employment;</li>
                <li>Placement;</li>
                <li>Job interviews;</li>
                <li>A particular employer; or</li>
                <li>A particular salary</li>
              </ul>
              <p className="mb-2">does not by itself create a right to a course-fee refund.</p>
              <p className="text-sm text-muted dark:text-white/70">
                Placement assistance and internship opportunities are subject to eligibility, student performance, availability and employer/company requirements.
              </p>
            </div>

            {/* 13. Attendance */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">13. Attendance</h2>
              <div className="space-y-2">
                <p>Failure to maintain the required attendance does not create a right to a refund.</p>
                <p>Students are responsible for meeting the attendance requirements applicable to their programme.</p>
              </div>
            </div>

            {/* 14. Disciplinary Termination */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">14. Disciplinary Termination</h2>
              <p>Where a student&apos;s admission or access is suspended or terminated due to serious misconduct, unauthorised distribution of course content, confidentiality violations, illegal activity, fraud or other serious breach of Institute policies, the student may not be entitled to a refund, subject to applicable law and the circumstances of the case.</p>
            </div>

            {/* 15. Exceptional Circumstances */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">15. Exceptional Circumstances</h2>
              <div className="space-y-2">
                <p>Requests based on exceptional circumstances may be reviewed individually by the Institute.</p>
                <p>Where appropriate, the Institute may request supporting documentation.</p>
                <p>Approval of an exceptional refund, credit or adjustment is discretionary unless otherwise required by applicable law.</p>
              </div>
            </div>

            {/* 16. Statutory Rights */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">16. Statutory Rights</h2>
              <div className="space-y-2">
                <p>Nothing in this Policy is intended to exclude, restrict or waive any consumer right, statutory remedy or legal protection that cannot lawfully be excluded or waived.</p>
                <p>Where applicable law provides a mandatory right to cancellation, refund or another remedy, that legal right shall prevail.</p>
              </div>
            </div>

            {/* 17. Policy Changes */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">17. Policy Changes</h2>
              <div className="space-y-2">
                <p>Quickupp may update this Refund &amp; Cancellation Policy from time to time.</p>
                <p>The latest version will be published on the Website with the applicable “Last Updated” date.</p>
                <p>The terms applicable to an enrolled student may also depend on the terms communicated and accepted at the time of enrolment, subject to applicable law.</p>
              </div>
            </div>

            {/* 18. Contact Us */}
            <div className="border-t border-border dark:border-dark_border pt-6">
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">18. Contact Us</h2>
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
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}


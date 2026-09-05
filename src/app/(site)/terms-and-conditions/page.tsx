import type { Metadata } from "next";
import { siteConfig } from "@/data";

export const metadata: Metadata = {
  title: `Terms & Conditions – ${siteConfig.name}`,
  description: "Read Quickupp Institute of Marketing & Design (QIMD) Terms and Conditions for using our website, programs, and educational services.",
  alternates: { canonical: "https://www.qimd.in/terms-and-conditions" },
};

export default function TermsPage() {
  return (
    <section className="section-py bg-grey dark:bg-dark">
      <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4">
        <div className="max-w-4xl mx-auto bg-white dark:bg-darklight rounded-2xl shadow-card border border-border dark:border-dark_border p-8 sm:p-10 lg:p-12">
          {/* Header */}
          <div className="border-b border-border dark:border-dark_border pb-6 mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-midnight_text dark:text-white mb-3">
              TERMS &amp; CONDITIONS
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
                Welcome to <strong>Quickupp Institute of Marketing &amp; Design (QIMD)</strong>, operated by <strong>Quickupp Softech Pvt. Ltd.</strong> (“Quickupp”, “QIMD”, “Institute”, “we”, “us”, or “our”).
              </p>
              <p>
                These Terms &amp; Conditions (“Terms”) govern your access to and use of <strong>quickuppinstitute.com</strong> (“Website”) and your participation in the programs, training programmes, practical sessions, live projects, internships, placement assistance, workshops, LMS resources and other services provided by the Institute.
              </p>
              <p>
                By accessing our Website, submitting an enquiry, registering for a program, making a payment, or enrolling in any programme, you acknowledge that you have read, understood and agreed to these Terms.
              </p>
              <p className="font-semibold text-midnight_text dark:text-white">
                If you do not agree with these Terms, please do not use the Website or enrol in our programmes.
              </p>
            </div>

            {/* 1. About the Institute */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">1. About the Institute</h2>
              <p className="mb-3">Quickupp Institute of Marketing &amp; Design provides professional and industry-oriented training programmes, including:</p>
              <ul className="list-disc pl-5 space-y-1.5 mb-3">
                <li>AI Powered Digital Marketing</li>
                <li>AI Powered Graphic Design</li>
                <li>AI Powered Video Editing</li>
                <li>Practical training</li>
                <li>Live industry projects</li>
                <li>Internship opportunities</li>
                <li>Career guidance</li>
                <li>Interview preparation</li>
                <li>Placement assistance</li>
                <li>Workshops and industry-oriented learning</li>
              </ul>
              <p className="text-sm text-muted dark:text-white/70">
                The specific program structure, duration, curriculum, batch schedule, facilities and deliverables may vary depending on the programme selected.
              </p>
            </div>

            {/* 2. Admission */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">2. Admission</h2>
              <div className="space-y-2">
                <p><strong>2.1</strong> Students must provide accurate, complete and genuine information during registration and admission.</p>
                <p><strong>2.2</strong> Admission is subject to applicable eligibility requirements, documentation, seat availability and completion of the Institute&apos;s admission process.</p>
                <p><strong>2.3</strong> Admission shall be considered confirmed only after the required admission formalities and applicable payment have been completed.</p>
                <p><strong>2.4</strong> Submission of an enquiry or registration form does not guarantee admission.</p>
                <p><strong>2.5</strong> The Institute reserves the right to decline an admission application where there is a legitimate academic, administrative, documentation, capacity or conduct-related reason.</p>
              </div>
            </div>

            {/* 3. Program & Training */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">3. Program &amp; Training</h2>
              <div className="space-y-2">
                <p><strong>3.1</strong> Program duration, curriculum, modules, batch timings, faculty, practical sessions, projects, software and learning resources may vary by programme.</p>
                <p><strong>3.2</strong> The Institute may reasonably modify program content, faculty, schedules, training methodology, software, tools or modules due to industry developments, technology changes, operational requirements or faculty availability.</p>
                <p><strong>3.3</strong> Where a material change affects the essential nature of an enrolled programme, the Institute will communicate the change to affected students where reasonably appropriate.</p>
              </div>
            </div>

            {/* 4. Fees & Payment */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">4. Fees &amp; Payment</h2>
              <div className="space-y-2 mb-3">
                <p><strong>4.1</strong> The applicable program fee shall be communicated to the student before admission.</p>
                <p><strong>4.2</strong> Unless otherwise agreed in writing, fees shall be paid according to the payment schedule communicated by the Institute.</p>
                <p><strong>4.3</strong> The standard payment structure specified in the admission documentation is:</p>
                <ul className="list-disc pl-5 space-y-1 my-2 bg-slate-50 dark:bg-white/5 p-3 rounded-lg border border-slate-200/60 dark:border-white/10">
                  <li><strong>10%</strong> of the total program fee at the time of admission;</li>
                  <li><strong>60%</strong> at least 15 days before program commencement; and</li>
                  <li><strong>30%</strong> within 60 days from the program commencement date.</li>
                </ul>
                <p><strong>4.4</strong> The payment schedule applicable to a student shall be the schedule communicated and accepted at the time of admission.</p>
                <p><strong>4.5</strong> Students are responsible for making payments within the prescribed due dates.</p>
                <p><strong>4.6</strong> Delayed payment may result in restriction or suspension of access to applicable program services, including LMS access, practical sessions, live projects, internship-related activities or certificate processing, subject to applicable law.</p>
                <p><strong>4.7</strong> Certificates may be withheld until applicable academic requirements are completed and all outstanding fees are cleared.</p>
              </div>
            </div>

            {/* 5. Attendance */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">5. Attendance</h2>
              <div className="space-y-2">
                <p><strong>5.1</strong> Students are expected to attend all scheduled classes, practical sessions, workshops and mandatory activities.</p>
                <p><strong>5.2</strong> Unless otherwise specified for a particular programme, students must maintain a minimum of <strong>75% attendance</strong>.</p>
                <p><strong>5.3</strong> Failure to meet the attendance requirement may affect eligibility for:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Program Completion Certificate;</li>
                  <li>Internship Certificate;</li>
                  <li>Internship opportunities;</li>
                  <li>Live project participation;</li>
                  <li>Placement assistance; and</li>
                  <li>Other academic or career-support benefits.</li>
                </ul>
              </div>
            </div>

            {/* 6. Practical Training & Live Projects */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">6. Practical Training &amp; Live Projects</h2>
              <div className="space-y-2">
                <p><strong>6.1</strong> Certain programmes may include practical assignments, case studies and live industry/client projects.</p>
                <p><strong>6.2</strong> Allocation of live projects is subject to availability, program requirements, student performance, skill level and operational requirements.</p>
                <p><strong>6.3</strong> Participation in a live project does not guarantee internship, employment or placement.</p>
                <p><strong>6.4</strong> Students must maintain professional conduct while participating in Institute or client projects.</p>
                <p><strong>6.5</strong> Students must not disclose, copy, publish, distribute or misuse confidential client information, campaign data, business information, credentials, documents or project information.</p>
              </div>
            </div>

            {/* 7. LMS & Learning Resources */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">7. LMS &amp; Learning Resources</h2>
              <div className="space-y-2">
                <p><strong>7.1</strong> Where applicable, students may receive access to an LMS, program videos, study materials, documents, templates and other educational resources.</p>
                <p><strong>7.2</strong> LMS credentials are personal to the enrolled student and must not be shared.</p>
                <p><strong>7.3</strong> Students must not, without prior written permission:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Share LMS credentials;</li>
                  <li>Copy or distribute restricted program videos;</li>
                  <li>Reproduce or resell program materials;</li>
                  <li>Upload Institute content to public platforms;</li>
                  <li>Share paid resources with non-enrolled persons;</li>
                  <li>Record restricted training sessions; or</li>
                  <li>Commercially exploit Institute-owned educational content.</li>
                </ul>
                <p><strong>7.4</strong> Unauthorised sharing or distribution may result in suspension or termination of access, subject to applicable law.</p>
              </div>
            </div>

            {/* 8. Repeat Batch Access */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">8. Repeat Batch Access</h2>
              <div className="space-y-2">
                <p>Where repeat-batch access is included with a particular programme, such access shall be subject to the applicable program terms, batch availability and Institute policies.</p>
                <p>Repeat-batch access does not automatically include additional certificates, internships, live projects or other services unless specifically communicated by the Institute.</p>
              </div>
            </div>

            {/* 9. Certification */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">9. Certification</h2>
              <div className="space-y-2">
                <p><strong>9.1</strong> Eligible students may receive a Program Completion Certificate and/or Internship Completion Certificate, depending on the applicable programme.</p>
                <p><strong>9.2</strong> Certificate issuance may require:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Successful completion of the applicable program;</li>
                  <li>Completion of required practical assignments;</li>
                  <li>Completion of required live projects;</li>
                  <li>Minimum 75% attendance;</li>
                  <li>Compliance with Institute policies; and</li>
                  <li>Full payment of applicable program fees and outstanding dues.</li>
                </ul>
                <p><strong>9.3</strong> Certificates do not constitute a guarantee of employment, salary, promotion or professional success.</p>
              </div>
            </div>

            {/* 10. Internship */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">10. Internship</h2>
              <div className="space-y-2">
                <p><strong>10.1</strong> Internship opportunities may be provided to eligible students depending on the applicable programme.</p>
                <p><strong>10.2</strong> Internship opportunities are subject to student eligibility, attendance, performance, conduct, project availability and organisational requirements.</p>
                <p><strong>10.3</strong> Enrolment in a program does not create an unconditional right to a particular internship, employer, role, stipend or duration.</p>
              </div>
            </div>

            {/* 11. Placement Assistance */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">11. Placement Assistance</h2>
              <div className="space-y-2">
                <p><strong>11.1</strong> Quickupp may provide placement and career assistance, which may include:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Resume building;</li>
                  <li>Portfolio development;</li>
                  <li>Mock interviews;</li>
                  <li>Interview preparation;</li>
                  <li>Job referrals;</li>
                  <li>Hiring drives;</li>
                  <li>Interview opportunities;</li>
                  <li>Communication skills development; and</li>
                  <li>Career guidance.</li>
                </ul>
                <p><strong>11.2</strong> Placement assistance is a support service and does not constitute a guarantee of employment.</p>
                <p><strong>11.3</strong> Final employment decisions are made by the relevant employer.</p>
                <p><strong>11.4</strong> Selection may depend on skills, practical knowledge, portfolio, communication, interview performance, attendance, employer requirements, vacancy availability and other relevant factors.</p>
                <p><strong>11.5</strong> Quickupp does not guarantee any specific employer, job role, salary, number of interviews or employment date.</p>
              </div>
            </div>

            {/* 12. Employment Opportunities with Quickupp */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">12. Employment Opportunities with Quickupp</h2>
              <div className="space-y-2">
                <p>Students demonstrating exceptional performance may be considered for internship, freelance or employment opportunities with Quickupp Softech Pvt. Ltd.</p>
                <p>Any such opportunity shall be subject to the company&apos;s recruitment process, performance requirements, vacancy availability and applicable employment terms.</p>
                <p>Program completion does not create an entitlement to employment with Quickupp Softech Pvt. Ltd.</p>
              </div>
            </div>

            {/* 13. Student Responsibilities */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">13. Student Responsibilities</h2>
              <p className="mb-2">Students are expected to:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Attend classes regularly;</li>
                <li>Maintain required attendance;</li>
                <li>Complete assignments on time;</li>
                <li>Follow Institute rules and policies;</li>
                <li>Respect faculty, staff and fellow students;</li>
                <li>Maintain confidentiality;</li>
                <li>Use Institute resources responsibly;</li>
                <li>Avoid plagiarism and cheating;</li>
                <li>Avoid unethical or unlawful practices; and</li>
                <li>Maintain professional conduct during projects and internships.</li>
              </ul>
            </div>

            {/* 14. Intellectual Property */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">14. Intellectual Property</h2>
              <div className="space-y-2">
                <p>All Institute-created program materials, videos, presentations, documents, templates, graphics, training content, website content, branding and other educational resources are owned by or lawfully licensed to Quickupp, unless otherwise stated.</p>
                <p>Students receive a limited right to use program materials for their personal educational purposes.</p>
                <p>Students must not reproduce, distribute, publish, sell, license or commercially exploit Institute-owned content without prior written permission.</p>
              </div>
            </div>

            {/* 15. Confidentiality */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">15. Confidentiality</h2>
              <div className="space-y-2">
                <p>Students may receive access to confidential information belonging to Quickupp, its clients, employees, partners or other parties.</p>
                <p>Students must not disclose, publish, copy, transfer or misuse such confidential information.</p>
                <p>Confidentiality obligations relating to information that remains confidential shall continue after completion or termination of the programme, to the extent permitted by applicable law.</p>
              </div>
            </div>

            {/* 16. Website Use */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">16. Website Use</h2>
              <p className="mb-2">Users must use the Website only for lawful purposes. Users must not:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Attempt unauthorised access;</li>
                <li>Introduce malicious code;</li>
                <li>Interfere with Website functionality;</li>
                <li>Submit false information;</li>
                <li>Impersonate another person;</li>
                <li>Copy Website content for unauthorised commercial purposes; or</li>
                <li>Use the Website for fraudulent or unlawful activities.</li>
              </ul>
            </div>

            {/* 17. Third-Party Services */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">17. Third-Party Services</h2>
              <div className="space-y-2">
                <p>The Website may contain links to or integrations with third-party platforms, payment providers, software, social-media platforms, recruitment platforms or other external services.</p>
                <p>Quickupp does not control third-party services and is not responsible for their independent terms, privacy practices, availability or content.</p>
              </div>
            </div>

            {/* 18. Privacy & Personal Data */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">18. Privacy &amp; Personal Data</h2>
              <div className="space-y-2">
                <p>Quickupp may collect and process personal information for purposes including admission, program administration, communication, payment processing, certification, internship and placement assistance, customer support, security and legal compliance.</p>
                <p>Personal information will be handled in accordance with applicable law and the Quickupp Privacy Policy.</p>
              </div>
            </div>

            {/* 19. Photography, Video & Testimonials */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">19. Photography, Video &amp; Testimonials</h2>
              <div className="space-y-2">
                <p>Where appropriate and subject to applicable consent and privacy requirements, Quickupp may use photographs, videos, testimonials, student achievements, classroom activities and event content for legitimate educational, promotional and marketing purposes.</p>
                <p>Students may contact the Institute regarding the use of their personal information for promotional purposes.</p>
              </div>
            </div>

            {/* 20. Code of Conduct */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">20. Code of Conduct</h2>
              <p className="mb-2">The Institute may take appropriate disciplinary action for conduct including:</p>
              <ul className="list-disc pl-5 space-y-1.5 mb-3">
                <li>Harassment;</li>
                <li>Bullying;</li>
                <li>Serious misconduct;</li>
                <li>Threatening behaviour;</li>
                <li>Misbehaviour;</li>
                <li>Damage to Institute property;</li>
                <li>Misuse of equipment or software;</li>
                <li>Unauthorised system access;</li>
                <li>Plagiarism;</li>
                <li>Cheating;</li>
                <li>Disclosure of confidential information;</li>
                <li>Unauthorised distribution of program material; or</li>
                <li>Illegal activities.</li>
              </ul>
              <p className="text-sm text-muted dark:text-white/70">
                Depending on the circumstances, action may include warning, suspension, restriction of access or termination of admission, subject to applicable law.
              </p>
            </div>

            {/* 21. Career & Outcome Disclaimer */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">21. Career &amp; Outcome Disclaimer</h2>
              <p className="mb-2">Quickupp provides education, practical training and career-support services. The Institute does not guarantee:</p>
              <ul className="list-disc pl-5 space-y-1 mb-3">
                <li>A specific job;</li>
                <li>A specific salary;</li>
                <li>A specific employer;</li>
                <li>A specific career outcome;</li>
                <li>Freelance income;</li>
                <li>Business income;</li>
                <li>Promotion; or</li>
                <li>Professional success.</li>
              </ul>
              <p className="text-sm text-muted dark:text-white/70">
                Individual outcomes depend on several factors, including student performance, skills, effort, market conditions and employer requirements.
              </p>
            </div>

            {/* 22. Force Majeure */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">22. Force Majeure</h2>
              <div className="space-y-2">
                <p>Quickupp shall not be responsible for delays or interruptions caused by circumstances beyond its reasonable control, including natural disasters, pandemics, government restrictions, strikes, civil disturbances, major technical failures, internet outages, power failures or other unforeseen circumstances.</p>
                <p>Where reasonably possible, affected sessions or activities may be rescheduled.</p>
              </div>
            </div>

            {/* 23. Changes to Terms */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">23. Changes to Terms</h2>
              <div className="space-y-2">
                <p>Quickupp may update these Terms from time to time to reflect changes in its services, business practices, technology or applicable law.</p>
                <p>The latest version will be published on the Website with the applicable “Last Updated” date.</p>
              </div>
            </div>

            {/* 24. Governing Law & Jurisdiction */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">24. Governing Law &amp; Jurisdiction</h2>
              <div className="space-y-2">
                <p>These Terms shall be governed by the laws of India.</p>
                <p>Nothing in these Terms shall exclude or restrict any statutory right or remedy that cannot lawfully be excluded or restricted.</p>
                <p>Subject to applicable law, disputes relating to these Terms or services provided by Quickupp shall be subject to the jurisdiction of the competent courts at Pune, Maharashtra.</p>
              </div>
            </div>

            {/* 25. Severability */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">25. Severability</h2>
              <div className="space-y-2">
                <p>If any provision of these Terms is held to be invalid or unenforceable, that provision shall be modified or interpreted to the minimum extent necessary to make it enforceable, where legally permissible.</p>
                <p>The remaining provisions shall continue in effect.</p>
              </div>
            </div>

            {/* 26. Contact Us */}
            <div className="border-t border-border dark:border-dark_border pt-6">
              <h2 className="text-xl sm:text-2xl font-bold text-midnight_text dark:text-white mb-3">26. Contact Us</h2>
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
                  For questions regarding these Terms, programs, admissions, fees or services, please contact us at the email address above.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}


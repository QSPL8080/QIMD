'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react/dist/iconify.js";
import { placementPartnersData } from "@/data";
import PhoneInput from "@/components/Common/PhoneInput";
import {
  CareerTabs,
  CkHero,
  CkPanel,
  CkPanelRow,
  CkHead,
  CkSteps,
  CkChecks,
  CkSuccess,
  CkConsent,
  CkUpload,
  CkCta,
} from "@/components/Careers/CareerKit";

const defaultFormData = {
  companyName: "",
  contactPersonName: "",
  officialEmail: "",
  mobileNumber: "",
  website: "",
  numEmployees: "1–10 Employees",
  jobRole: "",
  department: "Digital Marketing",
  numVacancies: "1",
  jobLocation: "Pune",
  experienceRequired: "Fresher",
  employmentType: "Full-Time",
  remuneration: "",
  jobDescription: "",
  agreeContact: true,
};

export default function HireFromUsContent() {
  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState(defaultFormData);

  const [jdFile, setJdFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Auto-reset success message after 3 seconds
  useEffect(() => {
    if (submitSuccess) {
      const timer = setTimeout(() => {
        setSubmitSuccess(false);
        setFormData(defaultFormData);
        setFormStep(1);
        setJdFile(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [submitSuccess]);

  const equippedSkills = [
    "AI-Powered Industry Skills",
    "Live Client Project Experience",
    "Professional Portfolio",
    "Practical Classroom Training",
    "Industry Mentorship",
    "Communication & Soft Skills",
    "Interview Readiness",
    "Internship Experience",
  ];

  const whyChooseUs = [
    { title: "AI-Powered Practical Training", icon: "mdi:robot", desc: "Trained on latest AI tools and digital workflows for productivity & creativity." },
    { title: "Industry-Relevant Curriculum", icon: "mdi:book-open-page-variant", desc: "Syllabus updated regularly to match employer expectations and market trends." },
    { title: "Job-Ready Candidates", icon: "mdi:account-check", desc: "Candidates prepared to contribute effectively from day one of joining." },
    { title: "Strong Practical Knowledge", icon: "mdi:laptop", desc: "Hands-on experience through assignments, real-world tools, and live projects." },
    { title: "Portfolio-Based Evaluation", icon: "mdi:folder-star", desc: "Evaluate candidates based on verified live project work and portfolios." },
    { title: "Internship Experience", icon: "mdi:briefcase-check", desc: "Real business workplace exposure before entering full-time roles." },
    { title: "Faster Hiring Process", icon: "mdi:rocket-launch", desc: "Quick candidate shortlisting and streamlined interview coordination." },
    { title: "Dedicated Placement Support", icon: "mdi:handshake", desc: "Our placement team works closely with employers for hassle-free hiring." },
  ];

  const recruitmentSteps = [
    { step: "01", title: "Share Your Requirement", desc: "Fill out the hiring request form with role details", icon: "mdi:file-document-edit-outline" },
    { step: "02", title: "Candidate Shortlisting", desc: "We match top-fit candidates & share portfolios", icon: "mdi:account-search-outline" },
    { step: "03", title: "Interview Scheduling", desc: "Schedule interviews at your convenience", icon: "mdi:calendar-clock-outline" },
    { step: "04", title: "Selection", desc: "Select ideal candidates for your team", icon: "mdi:check-circle-outline" },
    { step: "05", title: "Hiring & Onboarding", desc: "Welcome your new industry-ready professional", icon: "mdi:party-popper" },
  ];

  const partnersList = placementPartnersData;
  const loopPartners = [...partnersList, ...partnersList, ...partnersList, ...partnersList];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { submitHireRequestAction } = await import('@/app/actions/crmActions');
      const res = await submitHireRequestAction({
        companyName: formData.companyName,
        contactPerson: formData.contactPersonName,
        email: formData.officialEmail,
        phone: formData.mobileNumber,
        jobRole: formData.jobRole,
        requiredSkills: formData.jobDescription || undefined,
        vacancies: parseInt(formData.numVacancies) || 1,
        jobLocation: formData.jobLocation || undefined,
        message: `Department: ${formData.department}, Experience: ${formData.experienceRequired}, Type: ${formData.employmentType}, Salary: ${formData.remuneration}`,
      });
      setIsSubmitting(false);
      if (res.success) {
        setSubmitSuccess(true);
      } else {
        alert(res.error || 'Failed to submit hiring request');
      }
    } catch (err) {
      setIsSubmitting(false);
      alert('An error occurred during submission.');
    }
  };

  const formSteps = [
    { num: 1, label: "Company" },
    { num: 2, label: "Hiring Role" },
    { num: 3, label: "Job Details" },
    { num: 4, label: "Submit" },
  ];

  return (
    <div className="qk">
      <CareerTabs />

      {/* HERO */}
      <CkHero
        eyebrow="Corporate Placement Portal"
        title="Hire From QIMD"
        subtitle="Hire Industry-Ready Digital Professionals"
        actions={
          <>
            <a href="#hiring-form" className="qk-btn qk-btn-dark">
              <Icon icon="mdi:account-search" />
              <span>Submit Hiring Requirement</span>
            </a>
            <a href="#why-qimd" className="qk-btn qk-btn-line">
              <span>Why Hire From QIMD?</span>
            </a>
          </>
        }
        aside={
          <CkPanel label="Talent Pipeline" title="Quick Talent Access" badge="Verified Candidates">
            <CkPanelRow icon="mdi:bullseye-arrow" title="Digital Marketers" text="SEO, Performance Ads & Analytics" />
            <CkPanelRow icon="mdi:palette-outline" title="Graphic Designers" text="Brand Identity, UI Creatives & AI Tools" />
            <CkPanelRow icon="mdi:video-film" title="Video Editors" text="Reels, Motion Graphics & Post-Production" />
          </CkPanel>
        }
      >
        <p className="qk-lead-strong">
          Looking for skilled professionals in Digital Marketing, Graphic Design, or Video Editing?
        </p>
        <p>
          QIMD connects employers with industry-ready candidates who have completed AI-powered, practical training and gained hands-on experience through live client projects, internships, and portfolio development.
        </p>
        <p className="qk-note">
          <Icon icon="mdi:office-building-outline" className="qk-note-ic" />
          <span>Whether you&apos;re hiring for your agency, startup, or business, we&apos;ll help you find candidates who are ready to contribute from day one.</span>
        </p>
      </CkHero>

      {/* WHY HIRE FROM QIMD */}
      <section className="qk-sec qk-white" id="why-qimd">
        <div className="qk-wrap">
          <CkHead
            index="01"
            eyebrow="Candidate Preparation"
            title="Why Hire From QIMD?"
            desc="Our students are trained using a practical, industry-driven approach that prepares them for real workplace challenges."
          />
          <h3 className="qk-sub-title">Every Candidate Is Equipped With:</h3>
          <CkChecks items={equippedSkills} cols={4} />
        </div>
      </section>

      {/* WHY COMPANIES CHOOSE QIMD */}
      <section className="qk-sec qk-ink">
        <div className="qk-wrap">
          <CkHead
            light
            index="02"
            eyebrow="Employer Advantage"
            title="Why Companies Choose QIMD"
            desc="We help employers connect with job-ready candidates faster and hassle-free."
          />
          <div className="qk-cells cols-4 is-light">
            {whyChooseUs.map((item, i) => (
              <div key={i} className="qk-cell">
                <div className="qk-cell-top">
                  <span className="qk-cell-ic">
                    <Icon icon={item.icon} />
                  </span>
                  <span className="qk-cell-num">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="qk-cell-title">{item.title}</h3>
                <p className="qk-cell-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RECRUITMENT PROCESS */}
      <section className="qk-sec">
        <div className="qk-wrap">
          <CkHead
            index="03"
            eyebrow="Hiring Workflow"
            title="Recruitment Process"
            desc="Our placement team works closely with employers to recommend suitable candidates based on your hiring requirements."
          />
          <CkSteps steps={recruitmentSteps} />
        </div>
      </section>

      {/* HIRING REQUEST FORM */}
      <section className="qk-sec qk-ink" id="hiring-form">
        <div className="qk-wrap">
          <div className="qk-form-grid">
            <div className="qk-form-intro">
              <CkHead
                light
                index="04"
                eyebrow="Employer Portal"
                title="Looking for Skilled Digital Professionals?"
                desc="Fill out the step-by-step form below, and our Placement Team will connect you with suitable candidates."
              />
            </div>

            <div className="qk-sheet">
              {!submitSuccess && (
                <div className="qk-stepper" aria-label="Form progress">
                  {formSteps.map((st, idx) => (
                    <React.Fragment key={st.num}>
                      <div
                        onClick={() => {
                          if (formStep > st.num) setFormStep(st.num);
                        }}
                        className={`qk-stepper-item ${formStep === st.num ? "is-current" : ""} ${formStep > st.num ? "is-done" : ""}`}
                      >
                        <span className="qk-stepper-num">
                          {formStep > st.num ? <Icon icon="mdi:check-bold" /> : st.num}
                        </span>
                        <span className="qk-stepper-label">{st.label}</span>
                      </div>
                      {idx < formSteps.length - 1 && (
                        <span className={`qk-stepper-line ${formStep > st.num ? "is-done" : ""}`} aria-hidden="true" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}

              {submitSuccess ? (
                <CkSuccess
                  title="Hiring Request Submitted!"
                  text="Thank you! The QIMD Placement Team will review your requirement and share suitable candidate profiles shortly."
                />
              ) : (
                <form onSubmit={handleSubmit} className="qk-form">
                  {/* STEP 1: COMPANY INFORMATION */}
                  {formStep === 1 && (
                    <div className="qk-form-step">
                      <h3 className="qk-step-title">
                        <Icon icon="mdi:office-building" /> Step 1: Company Information
                      </h3>
                      <div className="qk-row-2">
                        <div className="qk-field">
                          <label className="qk-label" htmlFor="qk-h-company">Company Name *</label>
                          <input id="qk-h-company" type="text" required placeholder="Enter company name" value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} className="qk-input" />
                        </div>
                        <div className="qk-field">
                          <label className="qk-label" htmlFor="qk-h-contact">Contact Person Name *</label>
                          <input id="qk-h-contact" type="text" required placeholder="Enter contact person name" value={formData.contactPersonName} onChange={(e) => setFormData({ ...formData, contactPersonName: e.target.value })} className="qk-input" />
                        </div>
                      </div>
                      <div className="qk-row-2">
                        <div className="qk-field">
                          <label className="qk-label" htmlFor="qk-h-email">Official Email Address *</label>
                          <input id="qk-h-email" type="email" required placeholder="hr@company.com" value={formData.officialEmail} onChange={(e) => setFormData({ ...formData, officialEmail: e.target.value })} className="qk-input" />
                        </div>
                        <div className="qk-field">
                          <label className="qk-label">Mobile Number *</label>
                          <div className="qk-phone">
                            <PhoneInput value={formData.mobileNumber} onChange={(val) => setFormData({ ...formData, mobileNumber: val })} required placeholder="Enter mobile number" />
                          </div>
                        </div>
                      </div>
                      <div className="qk-row-2">
                        <div className="qk-field">
                          <label className="qk-label" htmlFor="qk-h-web">Company Website (Optional)</label>
                          <input id="qk-h-web" type="url" placeholder="https://www.company.com" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} className="qk-input" />
                        </div>
                        <div className="qk-field">
                          <label className="qk-label" htmlFor="qk-h-emp">Number of Employees *</label>
                          <select id="qk-h-emp" value={formData.numEmployees} onChange={(e) => setFormData({ ...formData, numEmployees: e.target.value })} className="qk-input qk-select">
                            <option value="1–10 Employees">1–10 Employees</option>
                            <option value="11–50 Employees">11–50 Employees</option>
                            <option value="51–200 Employees">51–200 Employees</option>
                            <option value="200+ Employees">200+ Employees</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: HIRING REQUIREMENTS */}
                  {formStep === 2 && (
                    <div className="qk-form-step">
                      <h3 className="qk-step-title">
                        <Icon icon="mdi:briefcase-account" /> Step 2: Hiring Requirements
                      </h3>
                      <div className="qk-row-2">
                        <div className="qk-field">
                          <label className="qk-label" htmlFor="qk-h-role">Job Role / Position *</label>
                          <input id="qk-h-role" type="text" required placeholder="e.g. Digital Marketer / Video Editor" value={formData.jobRole} onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })} className="qk-input" />
                        </div>
                        <div className="qk-field">
                          <label className="qk-label" htmlFor="qk-h-dept">Department *</label>
                          <select id="qk-h-dept" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="qk-input qk-select">
                            <option value="Digital Marketing">Digital Marketing</option>
                            <option value="Graphic Design">Graphic Design</option>
                            <option value="Video Editing">Video Editing</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                      <div className="qk-row-2">
                        <div className="qk-field">
                          <label className="qk-label" htmlFor="qk-h-vac">Number of Vacancies *</label>
                          <input id="qk-h-vac" type="number" min="1" required value={formData.numVacancies} onChange={(e) => setFormData({ ...formData, numVacancies: e.target.value })} className="qk-input" />
                        </div>
                        <div className="qk-field">
                          <label className="qk-label" htmlFor="qk-h-loc">Job Location *</label>
                          <input id="qk-h-loc" type="text" required placeholder="e.g. Pune / Remote" value={formData.jobLocation} onChange={(e) => setFormData({ ...formData, jobLocation: e.target.value })} className="qk-input" />
                        </div>
                      </div>
                      <div className="qk-row-3">
                        <div className="qk-field">
                          <label className="qk-label" htmlFor="qk-h-exp">Experience Required *</label>
                          <select id="qk-h-exp" value={formData.experienceRequired} onChange={(e) => setFormData({ ...formData, experienceRequired: e.target.value })} className="qk-input qk-select">
                            <option value="Fresher">Fresher</option>
                            <option value="0–1 Year">0–1 Year</option>
                            <option value="1–3 Years">1–3 Years</option>
                            <option value="3+ Years">3+ Years</option>
                          </select>
                        </div>
                        <div className="qk-field">
                          <label className="qk-label" htmlFor="qk-h-type">Employment Type *</label>
                          <select id="qk-h-type" value={formData.employmentType} onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })} className="qk-input qk-select">
                            <option value="Full-Time">Full-Time</option>
                            <option value="Internship">Internship</option>
                            <option value="Contract">Contract</option>
                            <option value="Freelance">Freelance</option>
                          </select>
                        </div>
                        <div className="qk-field">
                          <label className="qk-label" htmlFor="qk-h-pay">Stipend / Remuneration *</label>
                          <input id="qk-h-pay" type="text" required placeholder="e.g. ₹20,000 - ₹35,000" value={formData.remuneration} onChange={(e) => setFormData({ ...formData, remuneration: e.target.value })} className="qk-input" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: JOB DETAILS */}
                  {formStep === 3 && (
                    <div className="qk-form-step">
                      <h3 className="qk-step-title">
                        <Icon icon="mdi:file-document-edit" /> Step 3: Job Details &amp; Specifications
                      </h3>
                      <div className="qk-field">
                        <label className="qk-label" htmlFor="qk-h-jd">Job Description / Requirements *</label>
                        <textarea id="qk-h-jd" rows={4} required placeholder="Briefly describe the role, required skills, responsibilities, and qualifications..." value={formData.jobDescription} onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })} className="qk-input qk-textarea" />
                      </div>
                      <div className="qk-field">
                        <label className="qk-label" htmlFor="jd-file-upload">Upload Job Description (JD) (PDF / DOC / DOCX)</label>
                        <CkUpload id="jd-file-upload" file={jdFile} onFile={setJdFile} placeholder="Click to browse & upload JD file" />
                      </div>
                    </div>
                  )}

                  {/* STEP 4: REVIEW & AGREEMENT */}
                  {formStep === 4 && (
                    <div className="qk-form-step">
                      <h3 className="qk-step-title">
                        <Icon icon="mdi:check-decagram" /> Step 4: Review &amp; Submit Request
                      </h3>
                      <dl className="qk-review">
                        <div><dt>Company:</dt><dd>{formData.companyName || "-"}</dd></div>
                        <div><dt>Contact:</dt><dd>{formData.contactPersonName || "-"}</dd></div>
                        <div><dt>Email:</dt><dd>{formData.officialEmail || "-"}</dd></div>
                        <div><dt>Mobile:</dt><dd>{formData.mobileNumber || "-"}</dd></div>
                        <div><dt>Position:</dt><dd className="is-accent">{formData.jobRole || "-"}</dd></div>
                        <div><dt>Department:</dt><dd>{formData.department}</dd></div>
                      </dl>
                      <CkConsent id="agreeContactPlacement" checked={formData.agreeContact} onChange={(v) => setFormData({ ...formData, agreeContact: v })}>
                        I agree to be contacted by the QIMD Placement Team regarding my hiring requirements.
                      </CkConsent>
                    </div>
                  )}

                  {/* NAVIGATION STEP BUTTONS */}
                  <div className="qk-form-nav">
                    {formStep > 1 ? (
                      <button type="button" onClick={() => setFormStep((prev) => Math.max(prev - 1, 1))} className="qk-btn qk-btn-line">
                        <Icon icon="mdi:arrow-left" /> Back
                      </button>
                    ) : (
                      <div />
                    )}

                    {formStep < 4 ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (formStep === 1 && (!formData.companyName || !formData.contactPersonName || !formData.officialEmail || !formData.mobileNumber)) {
                            alert("Please fill out the required Company Information fields.");
                            return;
                          }
                          if (formStep === 2 && (!formData.jobRole || !formData.jobLocation || !formData.remuneration)) {
                            alert("Please fill out the required Hiring Requirements fields.");
                            return;
                          }
                          setFormStep((prev) => Math.min(prev + 1, 4));
                        }}
                        className="qk-btn qk-btn-dark"
                      >
                        Next Step <Icon icon="mdi:arrow-right" />
                      </button>
                    ) : (
                      <button type="submit" disabled={isSubmitting} className="qk-btn qk-btn-accent">
                        {isSubmitting ? "Submitting Request..." : "Submit Hiring Request"}
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* NEED HIRING SUPPORT */}
      <CkCta
        eyebrow="Placement Support"
        icon="mdi:headset"
        title="Need Hiring Support?"
        desc="Our Placement Team will review your requirements and share suitable candidate profiles based on your hiring needs."
        actions={
          <>
            <Link href="tel:+918237024479" className="qk-btn qk-btn-light">
              <Icon icon="mdi:phone" />
              <span>Call: +91 8237024479</span>
            </Link>
            <Link href="mailto:placements@quickuppinstitute.com" className="qk-btn qk-btn-ghost">
              <Icon icon="mdi:email-outline" />
              <span>Email: placements@quickuppinstitute.com</span>
            </Link>
          </>
        }
      />
    </div>
  );
}

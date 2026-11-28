'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react/dist/iconify.js";
import { submitCareerApplicationAction } from "@/app/actions/crmActions";
import PhoneInput from "@/components/Common/PhoneInput";
import {
  CareerTabs,
  CkHero,
  CkPanel,
  CkHead,
  CkSteps,
  CkSuccess,
  CkConsent,
  CkUpload,
  CkCta,
} from "@/components/Careers/CareerKit";

export default function CareersContent({ jobOpenings }: { jobOpenings: any[] }) {
  const defaultPos = jobOpenings && jobOpenings.length > 0 ? (jobOpenings[0].title || jobOpenings[0].name) : "Digital Marketing Trainer";

  const [formData, setFormData] = useState({
    fullName: "",
    mobileNumber: "",
    email: "",
    position: defaultPos,
    experience: "1-3 Years",
    agreeContact: false,
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Auto-reset success message after 3 seconds
  useEffect(() => {
    if (submitSuccess) {
      const timer = setTimeout(() => {
        setSubmitSuccess(false);
        setFormData({
          fullName: "",
          mobileNumber: "",
          email: "",
          position: defaultPos,
          experience: "1-3 Years",
          agreeContact: false,
        });
        setResumeFile(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [submitSuccess, defaultPos]);

  const openPositions = [
    "Digital Marketing Trainer",
    "Graphic Design Trainer",
    "Video Editing Trainer",
    "Academic Counsellor",
    "Business Development Executive",
    "Digital Marketing Executive",
    "Graphic Designer",
    "Video Editor",
    "Student Support Executive",
  ];

  const whatWeOffer = [
    { title: "Professional Growth Opportunities", icon: "mdi:trending-up" },
    { title: "AI-Powered Work Environment", icon: "mdi:robot" },
    { title: "Collaborative Team Culture", icon: "mdi:account-group" },
    { title: "Continuous Learning & Upskilling", icon: "mdi:school" },
    { title: "Performance-Based Career Growth", icon: "mdi:trophy" },
    { title: "Modern & Professional Workplace", icon: "mdi:office-building" },
    { title: "Recognition & Rewards", icon: "mdi:star-circle" },
    { title: "Work-Life Balance & Wellness", icon: "mdi:heart-flash" },
  ];

  const recruitmentSteps = [
    { step: "01", title: "Apply", desc: "Submit your application form" },
    { step: "02", title: "Resume Screening", desc: "Shortlisting profile details" },
    { step: "03", title: "HR Interview", desc: "Culture fit & background discussion" },
    { step: "04", title: "Technical Round", desc: "Domain skill evaluation" },
    { step: "05", title: "Final Discussion", desc: "Role expectations & terms" },
    { step: "06", title: "Offer Letter", desc: "Welcome to the QIMD team!" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let resumeUrl = "";

      // Upload the resume file first
      if (resumeFile) {
        const uploadForm = new FormData();
        uploadForm.append("file", resumeFile);
        try {
          const uploadRes = await fetch("/api/upload/career-resume", {
            method: "POST",
            body: uploadForm,
          });
          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            resumeUrl = uploadData.url || resumeFile.name;
          } else {
            resumeUrl = resumeFile.name;
          }
        } catch {
          resumeUrl = resumeFile.name;
        }
      } else {
        setIsSubmitting(false);
        alert("Please upload your resume.");
        return;
      }

      const res = await submitCareerApplicationAction({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.mobileNumber,
        jobTitle: formData.position,
        resume: resumeUrl,
        coverLetter: `Experience: ${formData.experience}`,
      });
      setIsSubmitting(false);
      if (res.success) {
        setSubmitSuccess(true);
      } else {
        alert(res.error || "Failed to submit application");
      }
    } catch (err) {
      setIsSubmitting(false);
      alert("Submission error. Please try again.");
    }
  };


  const positionTitles: string[] =
    jobOpenings && jobOpenings.length > 0 ? jobOpenings.map((job: any) => job.title || job.name) : openPositions;

  const whoCanApply = [
    { title: "Passionate Educators & Innovators", desc: "Enthusiastic about modern practical learning and AI tools.", icon: "mdi:lightbulb-on-outline" },
    { title: "Industry-Experienced Professionals", desc: "Eager to mentor students with real client insights and projects.", icon: "mdi:briefcase-account-outline" },
    { title: "Strong Communicators & Team Players", desc: "Collaborative, approachable, and dedicated to student success.", icon: "mdi:account-group-outline" },
    { title: "Continuous Learners", desc: "Committed to ongoing personal growth, upskilling, and excellence.", icon: "mdi:school-outline" },
  ];

  const hiringSteps = [
    { step: "01", title: "Application Submission", desc: "Submit your form & details", icon: "mdi:send-outline" },
    { step: "02", title: "Profile Screening", desc: "Shortlisting candidate details", icon: "mdi:file-search-outline" },
    { step: "03", title: "HR Interview", desc: "Background & culture fit", icon: "mdi:account-voice" },
    { step: "04", title: "Technical Round", desc: "Domain skill evaluation", icon: "mdi:cog-outline" },
    { step: "05", title: "Final Discussion", desc: "Role expectations & terms", icon: "mdi:handshake-outline" },
    { step: "06", title: "Offer & Onboarding", desc: "Welcome to QIMD team!", icon: "mdi:party-popper" },
  ];

  return (
    <div className="qk">
      <CareerTabs />

      {/* 1. HERO */}
      <CkHero
        eyebrow="Careers at QIMD"
        title={
          <>
            Join Our Team. <span className="qk-mark">Shape the Future.</span>
          </>
        }
        actions={
          <>
            <a href="#open-positions" className="qk-btn qk-btn-dark">
              <Icon icon="mdi:account-search-outline" />
              <span>Explore Open Positions</span>
            </a>
            <a href="#apply-now" className="qk-btn qk-btn-line">
              <Icon icon="mdi:file-document-edit-outline" />
              <span>Apply Now</span>
            </a>
          </>
        }
        aside={
          <CkPanel label="Open Opportunities" title="Current Open Positions" badge={`${positionTitles.length} Roles`}>
            <ul className="qk-mini-list">
              {positionTitles.slice(0, 5).map((t, i) => (
                <li key={i}>
                  <span className="qk-mini-num">{String(i + 1).padStart(2, "0")}</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <a href="#open-positions" className="qk-panel-link">
              <span>Explore Open Positions</span>
              <Icon icon="mdi:arrow-right" />
            </a>
          </CkPanel>
        }
      >
        <p>
          At <strong>QIMD (Quickupp Institute of Marketing &amp; Design)</strong>, we&apos;re building a team of passionate educators, creative professionals, marketers, and innovators dedicated to transforming digital education through practical, AI-powered learning.
        </p>
        <p className="qk-note">
          <Icon icon="mdi:lightbulb-on-outline" className="qk-note-ic" />
          <span>If you&apos;re enthusiastic about teaching, mentoring, creating, or driving innovation, we&apos;d love to hear from you.</span>
        </p>
      </CkHero>

      {/* 2. WHY JOIN QIMD */}
      <section className="qk-sec qk-ink">
        <div className="qk-wrap">
          <CkHead
            light
            index="01"
            eyebrow="Key Employee Benefits"
            title="Why Join QIMD?"
            desc="Become part of a fast-growing institute where learning, creativity, and career growth go hand in hand."
          />
          <div className="qk-cells cols-4 is-light">
            {whatWeOffer.map((offer, i) => (
              <div key={i} className="qk-cell">
                <span className="qk-cell-ic">
                  <Icon icon={offer.icon} />
                </span>
                <h3 className="qk-cell-title">{offer.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CURRENT OPEN POSITIONS */}
      <section className="qk-sec" id="open-positions">
        <div className="qk-wrap">
          <CkHead
            index="02"
            eyebrow="Open Opportunities"
            title="Current Open Positions"
            desc="Explore our active job openings and find the role that aligns with your experience and career goals."
          />
          <div className="qk-jobs">
            {positionTitles.map((posTitle: string, i: number) => (
              <div key={i} className="qk-job">
                <span className="qk-job-num">{String(i + 1).padStart(2, "0")}</span>
                <span className="qk-job-ic">
                  <Icon icon="mdi:briefcase-check" />
                </span>
                <span className="qk-job-title">{posTitle}</span>
                <a href="#apply-now" className="qk-job-apply">
                  Apply <Icon icon="mdi:arrow-right" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. WHO CAN APPLY + RECRUITMENT PROCESS */}
      <section className="qk-sec qk-white">
        <div className="qk-wrap">
          <div className="qk-split">
            <div>
              <CkHead index="03" eyebrow="Eligibility Criteria" title="Who Can Apply?" />
              <div className="qk-list">
                {whoCanApply.map((c, i) => (
                  <div key={i} className="qk-list-item">
                    <span className="qk-list-ic">
                      <Icon icon={c.icon} />
                    </span>
                    <div>
                      <h3>{c.title}</h3>
                      <p>{c.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <CkHead index="04" eyebrow="Hiring Workflow" title="Recruitment Process" />
              <CkSteps steps={hiringSteps} />
            </div>
          </div>
        </div>
      </section>

      {/* 5. APPLY NOW */}
      <section className="qk-sec qk-ink" id="apply-now">
        <div className="qk-wrap">
          <div className="qk-form-grid">
            <div className="qk-form-intro">
              <CkHead
                light
                index="05"
                eyebrow="Apply Now"
                title="Ready to Join QIMD?"
                desc="Fill out the form below, and our HR team will review your application. If your profile matches our requirements, we'll get in touch with you."
              />
            </div>

            <div className="qk-sheet">
              {submitSuccess ? (
                <CkSuccess
                  title="Application Submitted Successfully!"
                  text="Thank you for applying to QIMD. Our HR recruitment team has received your details and will get in touch shortly."
                />
              ) : (
                <form onSubmit={handleSubmit} className="qk-form">
                  <div className="qk-field">
                    <label className="qk-label" htmlFor="qk-c-name">Full Name *</label>
                    <input
                      id="qk-c-name"
                      type="text"
                      required
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="qk-input"
                    />
                  </div>

                  <div className="qk-row-2">
                    <div className="qk-field">
                      <label className="qk-label">Mobile Number *</label>
                      <div className="qk-phone">
                        <PhoneInput
                          value={formData.mobileNumber}
                          onChange={(val) => setFormData({ ...formData, mobileNumber: val })}
                          required
                          placeholder="Enter mobile number"
                        />
                      </div>
                    </div>
                    <div className="qk-field">
                      <label className="qk-label" htmlFor="qk-c-email">Email Address *</label>
                      <input
                        id="qk-c-email"
                        type="email"
                        required
                        placeholder="Enter email address"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="qk-input"
                      />
                    </div>
                  </div>

                  <div className="qk-row-2">
                    <div className="qk-field">
                      <label className="qk-label" htmlFor="qk-c-pos">Position Applying For *</label>
                      <select
                        id="qk-c-pos"
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        className="qk-input qk-select"
                      >
                        {positionTitles.map((posTitle: string) => (
                          <option key={posTitle} value={posTitle}>
                            {posTitle}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="qk-field">
                      <label className="qk-label" htmlFor="qk-c-exp">Years of Experience *</label>
                      <select
                        id="qk-c-exp"
                        value={formData.experience}
                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                        className="qk-input qk-select"
                      >
                        <option value="Fresher">Fresher (0 Years)</option>
                        <option value="1-3 Years">1 - 3 Years</option>
                        <option value="3-5 Years">3 - 5 Years</option>
                        <option value="5+ Years">5+ Years</option>
                      </select>
                    </div>
                  </div>

                  <div className="qk-field">
                    <label className="qk-label" htmlFor="resume-upload">Upload Resume * (PDF / DOC / DOCX)</label>
                    <CkUpload
                      id="resume-upload"
                      file={resumeFile}
                      onFile={setResumeFile}
                      placeholder="Click to browse & upload resume file"
                    />
                  </div>

                  <CkConsent
                    id="agreeContact"
                    checked={formData.agreeContact}
                    onChange={(v) => setFormData({ ...formData, agreeContact: v })}
                  >
                    I agree to be contacted by the QIMD recruitment team regarding my application.
                  </CkConsent>

                  <button type="submit" disabled={isSubmitting} className="qk-btn qk-btn-submit">
                    {isSubmitting ? "Submitting Application..." : "Submit Application"}
                    {!isSubmitting && <Icon icon="mdi:arrow-right" />}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 6. BUILD A CAREER THAT MAKES AN IMPACT */}
      <CkCta
        eyebrow="Join Our Mission"
        icon="mdi:rocket-launch-outline"
        title="Build a Career That Makes an Impact"
        desc="Join a workplace where your expertise helps shape the next generation of Digital Marketers, Graphic Designers, and Video Editors. At QIMD, you'll have the opportunity to inspire learners, work alongside industry professionals, and grow your career in a collaborative and innovation-driven environment."
        actions={
          <Link href="tel:+917410106608" className="qk-btn qk-btn-light">
            <Icon icon="mdi:phone" />
            <span>Call HR: +91 7410-106608</span>
          </Link>
        }
        note="Take the next step in your career. Apply today and grow with QIMD."
      />
    </div>
  );
}

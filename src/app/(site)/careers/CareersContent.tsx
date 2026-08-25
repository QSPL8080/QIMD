'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react/dist/iconify.js";
import { submitCareerApplicationAction } from "@/app/actions/crmActions";
import PhoneInput from "@/components/Common/PhoneInput";

export default function CareersContent({ jobOpenings }: { jobOpenings: any[] }) {
  const defaultPos = jobOpenings && jobOpenings.length > 0 ? (jobOpenings[0].title || jobOpenings[0].name) : "Digital Marketing Trainer";

  const [formData, setFormData] = useState({
    fullName: "",
    mobileNumber: "",
    email: "",
    position: defaultPos,
    experience: "1-3 Years",
    agreeContact: true,
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
          agreeContact: true,
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


  return (
    <div className="bg-grey dark:bg-dark min-h-screen">
      {/* 1. HERO SECTION: UNIQUE CENTRIC EDITORIAL HERO WITH LIGHT GRADIENT */}
      <section
        className="py-14 sm:py-18 relative overflow-hidden text-midnight_text border-b border-slate-200/80 dark:border-dark_border"
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #ffffff 40%, #f0e8ff 70%, #dcecfe 100%)',
        }}
      >
        {/* Subtle Ambient Decorative Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#764DFF]/8 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="container mx-auto max-w-4xl px-4 lg:px-8 relative z-10 space-y-6 text-center" data-aos="fade-up">
          
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-1.5 bg-[#764DFF]/15 text-[#5c38d6] dark:text-[#a78bfa] border border-[#764DFF]/25 text-xs font-bold px-3.5 py-1 rounded-full shadow-2xs backdrop-blur-md">
            <Icon icon="mdi:briefcase-account" className="text-[#764DFF] animate-pulse text-sm" />
            <span>Careers at QIMD</span>
          </div>

          {/* Main Typography */}
          <div className="space-y-2 max-w-2xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] dark:text-white leading-tight tracking-tight">
              Join Our Team.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#764DFF] via-[#9055ff] to-[#BD69F2]">
                Shape the Future.
              </span>
            </h1>
          </div>

          {/* Elevated Centric Statement Bento Card */}
          <div className="max-w-3xl mx-auto rounded-2xl sm:rounded-3xl bg-white/90 dark:bg-darklight/90 border border-slate-200/80 dark:border-dark_border shadow-lg backdrop-blur-md p-5 sm:p-7 space-y-4 text-left relative overflow-hidden">
            {/* Ambient Watermark Icon */}
            <div className="absolute top-3 right-5 text-slate-300/25 dark:text-white/5 text-6xl pointer-events-none select-none">
              <Icon icon="mdi:briefcase-account-outline" />
            </div>

            <p className="text-slate-700 dark:text-white/90 text-xs sm:text-sm leading-relaxed font-medium relative z-10">
              At <strong>QIMD (Quickupp Institute of Marketing &amp; Design)</strong>, we&apos;re building a team of passionate educators, creative professionals, marketers, and innovators dedicated to transforming digital education through practical, AI-powered learning.
            </p>

            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#764DFF]/5 dark:bg-[#764DFF]/15 border border-[#764DFF]/20 relative z-10 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#764DFF] text-white flex items-center justify-center text-sm shrink-0 mt-0.5 shadow-xs">
                <Icon icon="mdi:lightbulb-on-outline" />
              </div>
              <p className="text-slate-800 dark:text-white text-xs leading-relaxed font-semibold">
                If you&apos;re enthusiastic about teaching, mentoring, creating, or driving innovation, we&apos;d love to hear from you.
              </p>
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div className="pt-1 flex flex-wrap justify-center gap-3.5">
            <a
              href="#open-positions"
              className="bg-[#764DFF] hover:bg-[#5c38d6] text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-md hover:shadow-xl hover:scale-[1.02] flex items-center gap-2"
            >
              <Icon icon="mdi:account-search-outline" className="text-sm" />
              <span>Explore Open Positions</span>
            </a>
            <a
              href="#apply"
              className="bg-white/90 dark:bg-darklight border border-[#764DFF]/40 text-[#764DFF] hover:bg-[#764DFF]/10 font-bold text-xs px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 hover:scale-[1.02] shadow-2xs"
            >
              <Icon icon="mdi:file-document-edit-outline" className="text-sm" />
              <span>Apply Now</span>
            </a>
          </div>

        </div>
      </section>

      {/* 2. WHY JOIN QIMD & WHAT WE OFFER */}
      <section className="py-16 lg:py-24 bg-white dark:bg-dark">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2" data-aos="fade-up">
            <span className="text-xs font-bold uppercase tracking-widest text-[#764DFF]">
              Key Employee Benefits
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-midnight_text dark:text-white tracking-tight">
              Why Join QIMD?
            </h2>
            <p className="text-slate-600 dark:text-white/70 text-xs sm:text-sm font-medium leading-relaxed">
              Become part of a fast-growing institute where learning, creativity, and career growth go hand in hand.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto items-stretch">
            {whatWeOffer.map((offer, i) => (
              <div
                key={i}
                data-aos="fade-up"
                data-aos-delay={i * 50}
                className="bg-slate-50/80 dark:bg-darklight border border-slate-200/80 dark:border-dark_border p-5 rounded-2xl shadow-2xs hover:shadow-md hover:border-[#764DFF]/50 transition-all duration-300 flex items-center gap-4 h-[90px]"
              >
                <div className="w-11 h-11 rounded-xl bg-[#764DFF]/10 text-[#764DFF] flex items-center justify-center text-xl font-bold shrink-0">
                  <Icon icon={offer.icon} />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-midnight_text dark:text-white leading-snug tracking-tight">
                  {offer.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CURRENT OPEN POSITIONS & WHO CAN APPLY */}
      <section className="section-py bg-grey dark:bg-darklight">
        <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4 space-y-12">
          
          {/* Positions list */}
          <div className="bg-white dark:bg-dark rounded-3xl p-8 lg:p-12 shadow-card border border-border dark:border-dark_border" data-aos="fade-up">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <span className="text-xs font-extrabold uppercase tracking-wider text-primary">Open Opportunities</span>
              <h2 className="text-3xl font-extrabold text-midnight_text dark:text-white mt-1 mb-2">
                Current Open Positions
              </h2>
              <p className="text-muted dark:text-white/70 text-sm">
                Explore our active job openings and find the role that aligns with your experience and career goals.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(jobOpenings && jobOpenings.length > 0
                ? jobOpenings.map((job: any) => job.title || job.name)
                : openPositions
              ).map((posTitle: string, i: number) => (
                <div key={i} className="p-4 rounded-2xl bg-grey dark:bg-darklight border border-border dark:border-dark_border/60 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-bold">
                      <Icon icon="mdi:briefcase-check" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-midnight_text dark:text-white">{posTitle}</span>
                  </div>
                  <a href="#apply-now" className="text-xs text-primary font-extrabold hover:underline">
                    Apply &rarr;
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Who Can Apply & Recruitment Process Side-by-Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch" data-aos="fade-up">
            {/* Left: Who Can Apply? */}
            <div className="bg-white dark:bg-dark rounded-3xl p-6 sm:p-8 shadow-card border border-border dark:border-dark_border flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-dark_border">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl font-bold shrink-0">
                    <Icon icon="mdi:account-check-outline" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary block">Eligibility Criteria</span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-midnight_text dark:text-white tracking-tight">
                      Who Can Apply?
                    </h2>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { title: "Passionate Educators & Innovators", desc: "Enthusiastic about modern practical learning and AI tools.", icon: "mdi:lightbulb-on-outline" },
                    { title: "Industry-Experienced Professionals", desc: "Eager to mentor students with real client insights and projects.", icon: "mdi:briefcase-account-outline" },
                    { title: "Strong Communicators & Team Players", desc: "Collaborative, approachable, and dedicated to student success.", icon: "mdi:account-group-outline" },
                    { title: "Continuous Learners", desc: "Committed to ongoing personal growth, upskilling, and excellence.", icon: "mdi:school-outline" },
                  ].map((criteria, i) => (
                    <div
                      key={i}
                      className="p-3.5 px-4 rounded-2xl bg-slate-50/80 dark:bg-darklight border border-slate-200/80 dark:border-dark_border flex items-center gap-3.5 shadow-2xs"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-base font-bold shrink-0">
                        <Icon icon={criteria.icon} />
                      </div>
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold text-midnight_text dark:text-white leading-snug">
                          {criteria.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-white/60 font-medium leading-tight">
                          {criteria.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Recruitment Process */}
            <div className="bg-white dark:bg-dark rounded-3xl p-6 sm:p-8 shadow-card border border-border dark:border-dark_border flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-dark_border">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl font-bold shrink-0">
                    <Icon icon="mdi:timeline-text-outline" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary block">Hiring Workflow</span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-midnight_text dark:text-white tracking-tight">
                      Recruitment Process
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { step: "01", title: "Application Submission", desc: "Submit your form & details", icon: "mdi:send-outline" },
                    { step: "02", title: "Profile Screening", desc: "Shortlisting candidate details", icon: "mdi:file-search-outline" },
                    { step: "03", title: "HR Interview", desc: "Background & culture fit", icon: "mdi:account-voice" },
                    { step: "04", title: "Technical Round", desc: "Domain skill evaluation", icon: "mdi:cog-outline" },
                    { step: "05", title: "Final Discussion", desc: "Role expectations & terms", icon: "mdi:handshake-outline" },
                    { step: "06", title: "Offer & Onboarding", desc: "Welcome to QIMD team!", icon: "mdi:party-popper" },
                  ].map((step, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-darklight border border-slate-200/80 dark:border-dark_border flex items-start gap-3 shadow-2xs min-h-[72px]"
                    >
                      <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                        {step.step}
                      </span>
                      <div>
                        <h4 className="font-bold text-midnight_text dark:text-white text-xs leading-snug">
                          {step.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-white/60 leading-tight font-medium mt-0.5">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. APPLY NOW - CAREER APPLICATION FORM */}
      <section className="section-py bg-grey dark:bg-darklight" id="apply-now">
        <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4">
          <div className="max-w-3xl mx-auto bg-white dark:bg-dark rounded-3xl p-8 sm:p-10 shadow-2xl border border-border dark:border-dark_border" data-aos="fade-up">
            <div className="text-center mb-8">
              <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-3">
                Apply Now
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-midnight_text dark:text-white mb-2">
                Ready to Join QIMD?
              </h2>
              <p className="text-xs sm:text-sm text-muted dark:text-white/70">
                Fill out the form below, and our HR team will review your application. If your profile matches our requirements, we&apos;ll get in touch with you.
              </p>
            </div>

            {submitSuccess ? (
              <div className="p-8 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl text-center space-y-3">
                <Icon icon="mdi:check-circle" className="text-emerald-600 text-5xl mx-auto" />
                <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-100">Application Submitted Successfully!</h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  Thank you for applying to QIMD. Our HR recruitment team has received your details and will get in touch shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 text-xs sm:text-sm">
                <div>
                  <label className="block font-bold text-midnight_text dark:text-white mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-grey dark:bg-darklight border border-border dark:border-dark_border rounded-xl p-3 text-midnight_text dark:text-white focus:outline-none focus:border-primary font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-midnight_text dark:text-white mb-1.5">
                      Mobile Number *
                    </label>
                    <PhoneInput
                      value={formData.mobileNumber}
                      onChange={(val) => setFormData({ ...formData, mobileNumber: val })}
                      required
                      placeholder="Enter mobile number"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-midnight_text dark:text-white mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="Enter email address"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-grey dark:bg-darklight border border-border dark:border-dark_border rounded-xl p-3 text-midnight_text dark:text-white focus:outline-none focus:border-primary font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-midnight_text dark:text-white mb-1.5">
                      Position Applying For *
                    </label>
                    <select
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="w-full bg-grey dark:bg-darklight border border-border dark:border-dark_border rounded-xl p-3 text-midnight_text dark:text-white focus:outline-none focus:border-primary font-medium"
                    >
                      {(jobOpenings && jobOpenings.length > 0
                        ? jobOpenings.map((job: any) => job.title || job.name)
                        : openPositions
                      ).map((posTitle: string) => (
                        <option key={posTitle} value={posTitle}>
                          {posTitle}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-midnight_text dark:text-white mb-1.5">
                      Years of Experience *
                    </label>
                    <select
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      className="w-full bg-grey dark:bg-darklight border border-border dark:border-dark_border rounded-xl p-3 text-midnight_text dark:text-white focus:outline-none focus:border-primary font-medium"
                    >
                      <option value="Fresher">Fresher (0 Years)</option>
                      <option value="1-3 Years">1 - 3 Years</option>
                      <option value="3-5 Years">3 - 5 Years</option>
                      <option value="5+ Years">5+ Years</option>
                    </select>
                  </div>
                </div>

                {/* Upload Resume */}
                <div>
                  <label className="block font-bold text-midnight_text dark:text-white mb-1.5">
                    Upload Resume * (PDF / DOC / DOCX)
                  </label>
                  <div className="border-2 border-dashed border-border dark:border-dark_border bg-grey dark:bg-darklight p-4 rounded-xl text-center">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      id="resume-upload"
                      className="hidden"
                      onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                    />
                    <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center gap-1">
                      <Icon icon="mdi:cloud-upload" className="text-primary text-3xl" />
                      <span className="font-bold text-xs text-primary">
                        {resumeFile ? resumeFile.name : "Click to browse & upload resume file"}
                      </span>
                      <span className="text-[11px] text-muted dark:text-white/60">Max file size 10MB</span>
                    </label>
                  </div>
                </div>

                {/* Checkbox agreement */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="agreeContact"
                    checked={formData.agreeContact}
                    onChange={(e) => setFormData({ ...formData, agreeContact: e.target.checked })}
                    className="w-4 h-4 text-primary rounded"
                  />
                  <label htmlFor="agreeContact" className="text-xs text-midnight_text dark:text-white font-medium cursor-pointer">
                    I agree to be contacted by the QIMD recruitment team regarding my application.
                  </label>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-darkprimary text-white font-extrabold py-4 rounded-xl text-sm transition-all shadow-md hover:-translate-y-0.5 cursor-pointer"
                >
                  {isSubmitting ? "Submitting Application..." : "Submit Application"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 6. BUILD A CAREER THAT MAKES AN IMPACT */}
      <section className="py-12 sm:py-16 bg-white dark:bg-dark border-t border-slate-100 dark:border-dark_border">
        <div className="container mx-auto max-w-4xl px-4 text-center space-y-4" data-aos="fade-up">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
            <Icon icon="mdi:rocket-launch" className="text-sm" />
            <span>Join Our Mission</span>
          </div>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-midnight_text dark:text-white tracking-tight">
            Build a Career That Makes an Impact
          </h2>

          <p className="text-slate-600 dark:text-white/70 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed font-medium">
            Join a workplace where your expertise helps shape the next generation of Digital Marketers, Graphic Designers, and Video Editors. At QIMD, you&apos;ll have the opportunity to inspire learners, work alongside industry professionals, and grow your career in a collaborative and innovation-driven environment.
          </p>

          <div className="pt-2 flex flex-wrap justify-center items-center gap-3">
            <Link
              href="tel:+918237024479"
              className="inline-flex items-center gap-2 bg-primary hover:bg-darkprimary text-white font-bold px-6 py-3 rounded-xl text-xs sm:text-sm transition-all shadow-sm hover:shadow-md"
            >
              <Icon icon="mdi:phone" className="text-base" />
              <span>Call HR: +91 8237024479</span>
            </Link>
          </div>

          <p className="text-xs font-bold text-primary pt-1">
            Take the next step in your career. Apply today and grow with QIMD.
          </p>
        </div>
      </section>
    </div>
  );
}

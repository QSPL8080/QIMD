'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react/dist/iconify.js";
import { placementPartnersData } from "@/data";
import PhoneInput from "@/components/Common/PhoneInput";

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

  return (
    <div className="bg-grey dark:bg-dark min-h-screen">
      {/* HERO SECTION - UNIQUE SPLIT CORPORATE LAYOUT */}
      <section
        className="py-16 lg:py-24 relative overflow-hidden text-midnight_text border-b border-slate-200/60 dark:border-dark_border"
        style={{
          background: 'linear-gradient(135deg, #f5f0ff 0%, #ffffff 50%, #f0f7ff 100%)',
        }}
      >
        <div className="container mx-auto max-w-7xl px-4 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6" data-aos="fade-right">
              <div className="inline-flex items-center gap-2 bg-[#764DFF]/10 text-[#764DFF] border border-[#764DFF]/20 text-xs font-bold px-3.5 py-1.5 rounded-full">
                <Icon icon="mdi:briefcase-check" className="text-base" />
                Corporate Placement Portal
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-midnight_text dark:text-white tracking-tight leading-tight">
                  Hire From QIMD
                </h1>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#764DFF] tracking-tight">
                  Hire Industry-Ready Digital Professionals
                </h2>
              </div>

              <div className="space-y-3 text-slate-600 dark:text-white/80 text-xs sm:text-sm leading-relaxed font-medium">
                <p className="text-slate-800 dark:text-white font-bold text-sm sm:text-base">
                  Looking for skilled professionals in Digital Marketing, Graphic Design, or Video Editing?
                </p>
                <p>
                  QIMD connects employers with industry-ready candidates who have completed AI-powered, practical training and gained hands-on experience through live client projects, internships, and portfolio development.
                </p>
                <p className="text-[#764DFF] font-bold">
                  Whether you&apos;re hiring for your agency, startup, or business, we&apos;ll help you find candidates who are ready to contribute from day one.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <a
                  href="#hiring-form"
                  className="bg-[#764DFF] hover:bg-[#5c38d6] text-white font-bold text-xs sm:text-sm px-7 py-3.5 rounded-xl transition-all shadow-md flex items-center gap-2"
                >
                  <Icon icon="mdi:account-search" className="text-base" />
                  <span>Submit Hiring Requirement</span>
                </a>
                <a
                  href="#why-qimd"
                  className="border border-slate-300 dark:border-dark_border text-midnight_text dark:text-white hover:bg-slate-100 dark:hover:bg-darklight font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl transition-all"
                >
                  Why Hire From QIMD?
                </a>
              </div>
            </div>

            {/* Right Feature Card Column (Makes Hero Section Unique) */}
            <div className="lg:col-span-5" data-aos="fade-left">
              <div className="bg-white dark:bg-dark p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-dark_border shadow-xl space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-dark_border">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#764DFF] block">Talent Pipeline</span>
                    <h3 className="text-base font-extrabold text-midnight_text dark:text-white">Quick Talent Access</h3>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                    Verified Candidates
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-darklight border border-slate-200/70 dark:border-dark_border flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#764DFF]/10 text-[#764DFF] flex items-center justify-center text-lg font-bold shrink-0">
                      <Icon icon="mdi:bullseye-arrow" />
                    </div>
                    <div>
                      <h4 className="font-bold text-midnight_text dark:text-white">Digital Marketers</h4>
                      <p className="text-slate-500 dark:text-white/60 text-[11px]">SEO, Performance Ads &amp; Analytics</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-darklight border border-slate-200/70 dark:border-dark_border flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#764DFF]/10 text-[#764DFF] flex items-center justify-center text-lg font-bold shrink-0">
                      <Icon icon="mdi:palette-outline" />
                    </div>
                    <div>
                      <h4 className="font-bold text-midnight_text dark:text-white">Graphic Designers</h4>
                      <p className="text-slate-500 dark:text-white/60 text-[11px]">Brand Identity, UI Creatives &amp; AI Tools</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-darklight border border-slate-200/70 dark:border-dark_border flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#764DFF]/10 text-[#764DFF] flex items-center justify-center text-lg font-bold shrink-0">
                      <Icon icon="mdi:video-film" />
                    </div>
                    <div>
                      <h4 className="font-bold text-midnight_text dark:text-white">Video Editors</h4>
                      <p className="text-slate-500 dark:text-white/60 text-[11px]">Reels, Motion Graphics &amp; Post-Production</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY HIRE FROM QIMD? & EQUIPPED WITH */}
      <section className="py-16 lg:py-20 bg-white dark:bg-dark" id="why-qimd">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-2" data-aos="fade-up">
            <span className="text-xs font-bold uppercase tracking-widest text-[#764DFF]">Candidate Preparation</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-midnight_text dark:text-white tracking-tight">
              Why Hire From QIMD?
            </h2>
            <p className="text-slate-600 dark:text-white/70 text-xs sm:text-sm font-medium leading-relaxed">
              Our students are trained using a practical, industry-driven approach that prepares them for real workplace challenges.
            </p>
          </div>

          <div className="bg-slate-50/80 dark:bg-darklight rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-dark_border shadow-2xs space-y-6" data-aos="fade-up">
            <h3 className="text-base sm:text-lg font-extrabold text-midnight_text dark:text-white text-center">
              Every Candidate Is Equipped With:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {equippedSkills.map((skill, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-white dark:bg-dark border border-slate-200/70 dark:border-dark_border/60 flex items-center gap-3 shadow-2xs">
                  <div className="w-6 h-6 rounded-lg bg-[#764DFF]/10 text-[#764DFF] flex items-center justify-center text-xs shrink-0">
                    <Icon icon="mdi:check-bold" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-white/90 leading-tight">{skill}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHY COMPANIES CHOOSE QIMD */}
      <section className="py-16 lg:py-24 bg-grey dark:bg-darklight border-t border-b border-slate-200/80 dark:border-dark_border">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2" data-aos="fade-up">
            <span className="text-xs font-bold uppercase tracking-widest text-[#764DFF]">Employer Advantage</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-midnight_text dark:text-white tracking-tight">
              Why Companies Choose QIMD
            </h2>
            <p className="text-muted dark:text-white/70 text-xs sm:text-sm font-medium">
              We help employers connect with job-ready candidates faster and hassle-free.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {whyChooseUs.map((item, i) => (
              <div
                key={i}
                className="bg-white dark:bg-dark border border-slate-200/80 dark:border-dark_border p-5 rounded-2xl shadow-2xs hover:shadow-md hover:border-[#764DFF]/50 transition-all duration-300 flex flex-col justify-between"
                data-aos="fade-up"
                data-aos-delay={i * 50}
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#764DFF]/10 text-[#764DFF] flex items-center justify-center text-xl font-bold">
                    <Icon icon={item.icon} />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-midnight_text dark:text-white leading-snug tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-white/60 leading-relaxed font-medium">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RECRUITMENT PROCESS */}
      <section className="py-16 lg:py-24 bg-white dark:bg-dark border-b border-slate-200/80 dark:border-dark_border">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2" data-aos="fade-up">
            <span className="text-xs font-bold uppercase tracking-widest text-[#764DFF]">Hiring Workflow</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-midnight_text dark:text-white tracking-tight">
              Recruitment Process
            </h2>
            <p className="text-slate-600 dark:text-white/70 text-xs sm:text-sm font-medium leading-relaxed max-w-xl mx-auto">
              Our placement team works closely with employers to recommend suitable candidates based on your hiring requirements.
            </p>
          </div>

          {/* Connected Process Flow */}
          <div className="relative w-full" data-aos="fade-up">
            <div className="hidden lg:block absolute top-1/2 left-8 right-8 h-0.5 bg-slate-200 dark:bg-dark_border -translate-y-6 z-0" />

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-5 sm:gap-6 relative z-10">
              {recruitmentSteps.map((step, i) => (
                <div
                  key={i}
                  className="bg-slate-50/90 dark:bg-darklight border border-slate-200/80 dark:border-dark_border rounded-2xl p-5 text-center flex flex-col justify-between items-center space-y-3 shadow-2xs hover:shadow-md hover:border-[#764DFF]/50 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-dark border border-slate-200 dark:border-dark_border text-[#764DFF] group-hover:bg-[#764DFF] group-hover:text-white flex items-center justify-center text-xl font-bold transition-colors shadow-2xs relative">
                    <Icon icon={step.icon} />
                    <span className="absolute -top-2 -right-2 bg-[#764DFF] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-dark">
                      {i + 1}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-midnight_text dark:text-white text-xs leading-snug mb-1">
                      {step.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-white/60 leading-tight font-medium">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* HIRING REQUEST FORM */}
      <section className="py-16 lg:py-24 bg-white dark:bg-dark" id="hiring-form">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="max-w-4xl mx-auto bg-slate-50/80 dark:bg-darklight rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-dark_border shadow-card" data-aos="fade-up">
            
            <div className="text-center max-w-2xl mx-auto mb-6 space-y-1.5">
              <span className="bg-[#764DFF] text-white text-[10px] font-bold px-3 py-0.5 rounded-full inline-block">
                Employer Portal
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-midnight_text dark:text-white tracking-tight">
                Looking for Skilled Digital Professionals?
              </h2>
              <p className="text-xs text-slate-500 dark:text-white/70 font-medium">
                Fill out the step-by-step form below, and our Placement Team will connect you with suitable candidates.
              </p>
            </div>

            {/* STEP PROGRESS INDICATOR BAR */}
            {!submitSuccess && (
              <div className="mb-6 pb-4 border-b border-slate-200/80 dark:border-dark_border">
                <div className="flex items-center justify-between max-w-md mx-auto relative">
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 dark:bg-dark_border -translate-y-1/2 z-0" />
                  {[
                    { num: 1, label: "Company" },
                    { num: 2, label: "Hiring Role" },
                    { num: 3, label: "Job Details" },
                    { num: 4, label: "Submit" },
                  ].map((s) => (
                    <div key={s.num} className="relative z-10 flex flex-col items-center gap-1">
                      <div
                        className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center transition-all ${
                          formStep === s.num
                            ? "bg-[#764DFF] text-white ring-4 ring-[#764DFF]/20 scale-105 shadow-xs"
                            : formStep > s.num
                            ? "bg-emerald-600 text-white"
                            : "bg-white dark:bg-dark text-slate-400 border border-slate-200 dark:border-dark_border"
                        }`}
                      >
                        {formStep > s.num ? <Icon icon="mdi:check" className="text-sm" /> : s.num}
                      </div>
                      <span className={`text-[10px] font-bold ${formStep === s.num ? "text-[#764DFF]" : "text-slate-400"}`}>
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {submitSuccess ? (
              <div className="p-6 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl text-center space-y-2">
                <Icon icon="mdi:check-circle" className="text-emerald-600 text-4xl mx-auto" />
                <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-100">Hiring Request Submitted!</h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                  Thank you! The QIMD Placement Team will review your requirement and share suitable candidate profiles shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 text-xs">
                
                {/* STEP 1: COMPANY INFORMATION */}
                {formStep === 1 && (
                  <div className="space-y-4" data-aos="fade-in">
                    <h3 className="text-xs font-extrabold text-[#764DFF] uppercase tracking-wider flex items-center gap-1.5 pb-1">
                      <Icon icon="mdi:office-building" className="text-sm" />
                      Step 1: Company Information
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block font-bold text-midnight_text dark:text-white mb-1">Company Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="Enter company name"
                          value={formData.companyName}
                          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                          className="w-full bg-white dark:bg-dark border border-slate-200 dark:border-dark_border rounded-xl p-2.5 text-midnight_text dark:text-white focus:outline-none focus:border-[#764DFF] font-medium text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-midnight_text dark:text-white mb-1">Contact Person Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="Enter contact person name"
                          value={formData.contactPersonName}
                          onChange={(e) => setFormData({ ...formData, contactPersonName: e.target.value })}
                          className="w-full bg-white dark:bg-dark border border-slate-200 dark:border-dark_border rounded-xl p-2.5 text-midnight_text dark:text-white focus:outline-none focus:border-[#764DFF] font-medium text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block font-bold text-midnight_text dark:text-white mb-1">Official Email Address *</label>
                        <input
                          type="email"
                          required
                          placeholder="hr@company.com"
                          value={formData.officialEmail}
                          onChange={(e) => setFormData({ ...formData, officialEmail: e.target.value })}
                          className="w-full bg-white dark:bg-dark border border-slate-200 dark:border-dark_border rounded-xl p-2.5 text-midnight_text dark:text-white focus:outline-none focus:border-[#764DFF] font-medium text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-midnight_text dark:text-white mb-1">Mobile Number *</label>
                        <PhoneInput
                          value={formData.mobileNumber}
                          onChange={(val) => setFormData({ ...formData, mobileNumber: val })}
                          required
                          placeholder="Enter mobile number"
                          inputClassName="text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block font-bold text-midnight_text dark:text-white mb-1">Company Website (Optional)</label>
                        <input
                          type="url"
                          placeholder="https://www.company.com"
                          value={formData.website}
                          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                          className="w-full bg-white dark:bg-dark border border-slate-200 dark:border-dark_border rounded-xl p-2.5 text-midnight_text dark:text-white focus:outline-none focus:border-[#764DFF] font-medium text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-midnight_text dark:text-white mb-1">Number of Employees *</label>
                        <select
                          value={formData.numEmployees}
                          onChange={(e) => setFormData({ ...formData, numEmployees: e.target.value })}
                          className="w-full bg-white dark:bg-dark border border-slate-200 dark:border-dark_border rounded-xl p-2.5 text-midnight_text dark:text-white focus:outline-none focus:border-[#764DFF] font-medium text-xs"
                        >
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
                  <div className="space-y-4" data-aos="fade-in">
                    <h3 className="text-xs font-extrabold text-[#764DFF] uppercase tracking-wider flex items-center gap-1.5 pb-1">
                      <Icon icon="mdi:briefcase-account" className="text-sm" />
                      Step 2: Hiring Requirements
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block font-bold text-midnight_text dark:text-white mb-1">Job Role / Position *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Digital Marketer / Video Editor"
                          value={formData.jobRole}
                          onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
                          className="w-full bg-white dark:bg-dark border border-slate-200 dark:border-dark_border rounded-xl p-2.5 text-midnight_text dark:text-white focus:outline-none focus:border-[#764DFF] font-medium text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-midnight_text dark:text-white mb-1">Department *</label>
                        <select
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                          className="w-full bg-white dark:bg-dark border border-slate-200 dark:border-dark_border rounded-xl p-2.5 text-midnight_text dark:text-white focus:outline-none focus:border-[#764DFF] font-medium text-xs"
                        >
                          <option value="Digital Marketing">Digital Marketing</option>
                          <option value="Graphic Design">Graphic Design</option>
                          <option value="Video Editing">Video Editing</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block font-bold text-midnight_text dark:text-white mb-1">Number of Vacancies *</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={formData.numVacancies}
                          onChange={(e) => setFormData({ ...formData, numVacancies: e.target.value })}
                          className="w-full bg-white dark:bg-dark border border-slate-200 dark:border-dark_border rounded-xl p-2.5 text-midnight_text dark:text-white focus:outline-none focus:border-[#764DFF] font-medium text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-midnight_text dark:text-white mb-1">Job Location *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Pune / Remote"
                          value={formData.jobLocation}
                          onChange={(e) => setFormData({ ...formData, jobLocation: e.target.value })}
                          className="w-full bg-white dark:bg-dark border border-slate-200 dark:border-dark_border rounded-xl p-2.5 text-midnight_text dark:text-white focus:outline-none focus:border-[#764DFF] font-medium text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <div>
                        <label className="block font-bold text-midnight_text dark:text-white mb-1">Experience Required *</label>
                        <select
                          value={formData.experienceRequired}
                          onChange={(e) => setFormData({ ...formData, experienceRequired: e.target.value })}
                          className="w-full bg-white dark:bg-dark border border-slate-200 dark:border-dark_border rounded-xl p-2.5 text-midnight_text dark:text-white focus:outline-none focus:border-[#764DFF] font-medium text-xs"
                        >
                          <option value="Fresher">Fresher</option>
                          <option value="0–1 Year">0–1 Year</option>
                          <option value="1–3 Years">1–3 Years</option>
                          <option value="3+ Years">3+ Years</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-midnight_text dark:text-white mb-1">Employment Type *</label>
                        <select
                          value={formData.employmentType}
                          onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                          className="w-full bg-white dark:bg-dark border border-slate-200 dark:border-dark_border rounded-xl p-2.5 text-midnight_text dark:text-white focus:outline-none focus:border-[#764DFF] font-medium text-xs"
                        >
                          <option value="Full-Time">Full-Time</option>
                          <option value="Internship">Internship</option>
                          <option value="Contract">Contract</option>
                          <option value="Freelance">Freelance</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-midnight_text dark:text-white mb-1">Stipend / Remuneration *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. ₹20,000 - ₹35,000"
                          value={formData.remuneration}
                          onChange={(e) => setFormData({ ...formData, remuneration: e.target.value })}
                          className="w-full bg-white dark:bg-dark border border-slate-200 dark:border-dark_border rounded-xl p-2.5 text-midnight_text dark:text-white focus:outline-none focus:border-[#764DFF] font-medium text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: JOB DETAILS */}
                {formStep === 3 && (
                  <div className="space-y-4" data-aos="fade-in">
                    <h3 className="text-xs font-extrabold text-[#764DFF] uppercase tracking-wider flex items-center gap-1.5 pb-1">
                      <Icon icon="mdi:file-document-edit" className="text-sm" />
                      Step 3: Job Details & Specifications
                    </h3>

                    <div>
                      <label className="block font-bold text-midnight_text dark:text-white mb-1">
                        Job Description / Requirements *
                      </label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Briefly describe the role, required skills, responsibilities, and qualifications..."
                        value={formData.jobDescription}
                        onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                        className="w-full bg-white dark:bg-dark border border-slate-200 dark:border-dark_border rounded-xl p-2.5 text-midnight_text dark:text-white focus:outline-none focus:border-[#764DFF] font-medium text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-midnight_text dark:text-white mb-1">
                        Upload Job Description (JD) (PDF / DOC / DOCX)
                      </label>
                      <div className="border-2 border-dashed border-slate-200 dark:border-dark_border bg-white dark:bg-dark p-3.5 rounded-xl text-center">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          id="jd-file-upload"
                          className="hidden"
                          onChange={(e) => setJdFile(e.target.files?.[0] || null)}
                        />
                        <label htmlFor="jd-file-upload" className="cursor-pointer flex flex-col items-center gap-0.5">
                          <Icon icon="mdi:cloud-upload" className="text-[#764DFF] text-2xl" />
                          <span className="font-bold text-xs text-[#764DFF]">
                            {jdFile ? jdFile.name : "Click to browse & upload JD file"}
                          </span>
                          <span className="text-[10px] text-slate-400">Max file size 10MB</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: REVIEW & AGREEMENT */}
                {formStep === 4 && (
                  <div className="space-y-4" data-aos="fade-in">
                    <h3 className="text-xs font-extrabold text-[#764DFF] uppercase tracking-wider flex items-center gap-1.5 pb-1">
                      <Icon icon="mdi:check-decagram" className="text-sm" />
                      Step 4: Review &amp; Submit Request
                    </h3>

                    <div className="bg-white dark:bg-dark p-4 rounded-xl border border-slate-200 dark:border-dark_border space-y-2 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div><span className="text-slate-400">Company:</span> <strong className="text-midnight_text dark:text-white">{formData.companyName || "-"}</strong></div>
                        <div><span className="text-slate-400">Contact:</span> <strong className="text-midnight_text dark:text-white">{formData.contactPersonName || "-"}</strong></div>
                        <div><span className="text-slate-400">Email:</span> <strong className="text-midnight_text dark:text-white">{formData.officialEmail || "-"}</strong></div>
                        <div><span className="text-slate-400">Mobile:</span> <strong className="text-midnight_text dark:text-white">{formData.mobileNumber || "-"}</strong></div>
                        <div><span className="text-slate-400">Position:</span> <strong className="text-[#764DFF]">{formData.jobRole || "-"}</strong></div>
                        <div><span className="text-slate-400">Department:</span> <strong className="text-midnight_text dark:text-white">{formData.department}</strong></div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="agreeContactPlacement"
                        checked={formData.agreeContact}
                        onChange={(e) => setFormData({ ...formData, agreeContact: e.target.checked })}
                        className="w-4 h-4 text-[#764DFF] rounded cursor-pointer"
                      />
                      <label htmlFor="agreeContactPlacement" className="text-xs text-midnight_text dark:text-white font-medium cursor-pointer">
                        I agree to be contacted by the QIMD Placement Team regarding my hiring requirements.
                      </label>
                    </div>
                  </div>
                )}

                {/* NAVIGATION STEP BUTTONS */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 dark:border-dark_border">
                  {formStep > 1 ? (
                    <button
                      type="button"
                      onClick={() => setFormStep((prev) => Math.max(prev - 1, 1))}
                      className="px-4 py-2 bg-white dark:bg-dark text-midnight_text dark:text-white font-bold rounded-xl text-xs border border-slate-200 dark:border-dark_border hover:bg-slate-100 transition-all cursor-pointer"
                    >
                      &larr; Back
                    </button>
                  ) : <div />}

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
                      className="px-6 py-2 bg-[#764DFF] hover:bg-[#5c38d6] text-white font-bold rounded-xl text-xs transition-all shadow-xs cursor-pointer"
                    >
                      Next Step &rarr;
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-7 py-2.5 bg-[#764DFF] hover:bg-[#5c38d6] text-white font-extrabold rounded-xl text-xs transition-all shadow-md cursor-pointer"
                    >
                      {isSubmitting ? "Submitting Request..." : "Submit Hiring Request"}
                    </button>
                  )}
                </div>

              </form>
            )}
          </div>
        </div>
      </section>

      {/* NEED HIRING SUPPORT */}
      <section className="py-12 sm:py-16 bg-white dark:bg-dark border-t border-slate-200/80 dark:border-dark_border">
        <div className="container mx-auto max-w-4xl px-4 text-center space-y-4" data-aos="fade-up">
          <div className="inline-flex items-center gap-1.5 bg-[#764DFF]/10 text-[#764DFF] text-xs font-bold px-3 py-1 rounded-full">
            <Icon icon="mdi:headset" className="text-sm" />
            <span>Placement Support</span>
          </div>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-midnight_text dark:text-white tracking-tight">
            Need Hiring Support?
          </h2>

          <p className="text-slate-600 dark:text-white/70 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed font-medium">
            Our Placement Team will review your requirements and share suitable candidate profiles based on your hiring needs.
          </p>

          <div className="pt-2 flex flex-wrap justify-center items-center gap-4 text-xs sm:text-sm font-bold">
            <Link
              href="tel:+918237024479"
              className="inline-flex items-center gap-2 bg-[#764DFF] hover:bg-[#5c38d6] text-white px-6 py-3 rounded-xl transition-all shadow-sm"
            >
              <Icon icon="mdi:phone" className="text-base" />
              <span>Call: +91 8237024479</span>
            </Link>
            <Link
              href="mailto:placements@quickuppinstitute.com"
              className="inline-flex items-center gap-2 bg-slate-50 dark:bg-darklight text-midnight_text dark:text-white border border-slate-200 dark:border-dark_border px-6 py-3 rounded-xl transition-all"
            >
              <Icon icon="mdi:email" className="text-base text-[#764DFF]" />
              <span>Email: placements@quickuppinstitute.com</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}


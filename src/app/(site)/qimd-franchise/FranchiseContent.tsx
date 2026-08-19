'use client';

import React, { useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react/dist/iconify.js";

export default function FranchiseContent() {
  const [formData, setFormData] = useState({
    fullName: "",
    mobileNumber: "",
    email: "",
    cityState: "",
    currentProfession: "",
    hasCommercialSpace: "Yes",
    preferredCity: "",
    interestDetails: "",
    agreeContact: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const whyPartnerReasons = [
    {
      title: "Growing Industry",
      icon: "mdi:trending-up",
      desc: "The demand for skilled professionals in Digital Marketing, Graphic Design, Video Editing, and AI is increasing rapidly. Businesses are actively looking for candidates with practical experience and industry-ready skills.",
    },
    {
      title: "Proven Training Model",
      icon: "mdi:certificate-outline",
      desc: "Our curriculum combines AI-powered learning, live client projects, practical implementation, internships, and career-focused mentoring to deliver real outcomes.",
    },
    {
      title: "Established Brand",
      icon: "mdi:store-check",
      desc: "Leverage the QIMD brand, training methodology, marketing systems, and operational processes to launch your institute with confidence.",
    },
    {
      title: "Low Operational Complexity",
      icon: "mdi:cogs",
      desc: "Our standardized systems, LMS, academic support, and marketing guidance make managing your center efficient and scalable.",
    },
  ];

  const supportPillars = [
    {
      category: "Academic Support",
      icon: "mdi:school",
      items: [
        "Complete Course Curriculum",
        "AI-Powered Learning Modules",
        "Learning Management System (LMS)",
        "Study Material",
        "Assessments & Certifications",
      ],
    },
    {
      category: "Marketing Support",
      icon: "mdi:bullhorn",
      items: [
        "Digital Marketing Campaigns",
        "Social Media Creatives",
        "Lead Generation Strategy",
        "Branding Guidelines",
        "Promotional Materials",
      ],
    },
    {
      category: "Operational Support",
      icon: "mdi:office-building-cog",
      items: [
        "Franchise Setup Guidance",
        "Staff Recruitment Support",
        "Faculty Training",
        "Admission Process",
        "Student Management Systems",
      ],
    },
    {
      category: "Business Support",
      icon: "mdi:finance",
      items: [
        "Sales Training",
        "Business Development Guidance",
        "Performance Reviews",
        "Regular Strategy Sessions",
        "Ongoing Franchise Assistance",
      ],
    },
  ];

  const programsOffered = [
    "AI-Powered Digital Marketing Program",
    "AI-Powered Graphic Design Program",
    "AI-Powered Video Editing Program",
    "Corporate Training Programs",
    "Workshops & Certification Programs",
  ];

  const targetPartners = [
    "Entrepreneurs",
    "Coaching Institute Owners",
    "Training Centers",
    "Education Consultants",
    "Business Owners",
    "Working Professionals",
    "Startup Founders",
    "Investors",
  ];

  const whyChoosePills = [
    "AI-Powered Industry Curriculum",
    "Practical Learning Methodology",
    "Live Project-Based Training",
    "Dedicated Franchise Support",
    "Marketing & Branding Assistance",
    "Academic & Faculty Support",
    "Learning Management System (LMS)",
    "Placement Assistance Framework",
    "Scalable Business Model",
  ];

  const franchiseSteps = [
    { step: "01", title: "Step 1", desc: "Submit your franchise enquiry." },
    { step: "02", title: "Step 2", desc: "Business discussion with our franchise team." },
    { step: "03", title: "Step 3", desc: "Location & feasibility assessment." },
    { step: "04", title: "Step 4", desc: "Franchise approval and agreement." },
    { step: "05", title: "Step 5", desc: "Training, branding, and center setup." },
    { step: "06", title: "Step 6", desc: "Launch your QIMD Franchise with ongoing support." },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { submitFranchiseEnquiryAction } = await import('@/app/actions/crmActions');
      const res = await submitFranchiseEnquiryAction({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.mobileNumber,
        city: formData.preferredCity || formData.cityState,
        state: formData.cityState,
        investmentCapacity: formData.currentProfession,
        message: `Commercial Space Available: ${formData.hasCommercialSpace}. Notes: ${formData.interestDetails || 'None'}`,
      });
      setIsSubmitting(false);
      if (res.success) {
        setSubmitSuccess(true);
      } else {
        alert(res.error || 'Failed to submit proposal');
      }
    } catch (err) {
      setIsSubmitting(false);
      alert('An error occurred during submission.');
    }
  };

  return (
    <div className="bg-grey dark:bg-dark min-h-screen">
      {/* 1. HERO SECTION - PASTEL CORPORATE LAYOUT */}
      <section
        className="py-16 lg:py-24 relative overflow-hidden text-midnight_text border-b border-slate-200/60 dark:border-dark_border"
        style={{
          background: 'linear-gradient(135deg, #f0e8ff 0%, #f7ebff 30%, #ffffff 55%, #e8f4fd 80%, #e2eeff 100%)',
        }}
      >
        <div className="container mx-auto max-w-7xl px-4 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Main Content */}
            <div className="lg:col-span-7 space-y-6" data-aos="fade-right">
              <div className="inline-flex items-center gap-2 bg-[#764DFF]/15 text-[#5c38d6] border border-[#764DFF]/25 text-xs sm:text-sm font-bold px-4 py-2 rounded-full shadow-xs backdrop-blur-md">
                <Icon icon="mdi:handshake" className="text-primary animate-pulse text-base" />
                QIMD Franchise Partnership
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#111827] leading-tight tracking-tight">
                Partner With One of India&apos;s <br />
                <span className="text-[#5c38d6]">
                  Fast-Growing Practical Learning Institutes
                </span>
              </h1>

              <div className="space-y-3 text-[#374151] text-xs sm:text-sm leading-relaxed font-medium">
                <p>
                  Bring AI-Powered, Practical Education to your city by partnering with <strong>QIMD (Quickupp Institute of Marketing &amp; Design)</strong>.
                </p>
                <p>
                  If you&apos;re passionate about education and entrepreneurship, our franchise model gives you the opportunity to establish a successful training institute with complete academic, operational, marketing, and placement support.
                </p>
                <p className="font-bold text-[#111827]">
                  Whether you&apos;re an entrepreneur, training institute owner, education consultant, or business professional, QIMD provides a proven system to help you build a sustainable education business.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <a
                  href="#enquiry-form"
                  className="bg-[#764DFF] hover:bg-[#5c38d6] text-white font-bold text-xs sm:text-sm px-8 py-3.5 rounded-xl transition-all shadow-md flex items-center gap-2"
                >
                  <Icon icon="mdi:rocket-launch" className="text-base" />
                  <span>Apply for Franchise</span>
                </a>
              </div>
            </div>

            {/* Right Card Column - Key Franchise Highlights */}
            <div className="lg:col-span-5" data-aos="fade-left">
              <div className="bg-white/95 dark:bg-dark p-6 sm:p-8 rounded-3xl border border-[#764DFF]/20 shadow-2xl space-y-5 backdrop-blur-md">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-dark_border">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#5c38d6] block">High Return Opportunity</span>
                    <h3 className="text-base font-extrabold text-midnight_text dark:text-white">Why QIMD Franchise?</h3>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                    High Demand
                  </span>
                </div>

                <div className="space-y-3.5 text-xs text-midnight_text dark:text-white">
                  <div className="p-3.5 rounded-2xl bg-grey dark:bg-darklight border border-border dark:border-dark_border flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#764DFF]/15 text-[#5c38d6] flex items-center justify-center text-xl font-bold shrink-0">
                      <Icon icon="mdi:school" />
                    </div>
                    <div>
                      <h4 className="font-bold text-midnight_text dark:text-white">Full Academic &amp; LMS Support</h4>
                      <p className="text-muted dark:text-white/60 text-[11px]">Turnkey AI-powered curriculum &amp; LMS portal</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-grey dark:bg-darklight border border-border dark:border-dark_border flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#764DFF]/15 text-[#5c38d6] flex items-center justify-center text-xl font-bold shrink-0">
                      <Icon icon="mdi:bullhorn" />
                    </div>
                    <div>
                      <h4 className="font-bold text-midnight_text dark:text-white">National Marketing &amp; Leads</h4>
                      <p className="text-muted dark:text-white/60 text-[11px]">Centralized marketing and inquiry support</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-grey dark:bg-darklight border border-border dark:border-dark_border flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#764DFF]/15 text-[#5c38d6] flex items-center justify-center text-xl font-bold shrink-0">
                      <Icon icon="mdi:shield-check" />
                    </div>
                    <div>
                      <h4 className="font-bold text-midnight_text dark:text-white">100% Operational Guidance</h4>
                      <p className="text-muted dark:text-white/60 text-[11px]">Faculty hiring &amp; center launch assistance</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BECOME A QIMD FRANCHISE PARTNER & ENQUIRY FORM */}
      <section className="section-py bg-white dark:bg-dark" id="enquiry-form">
        <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4">
          <div className="max-w-4xl mx-auto bg-slate-50/80 dark:bg-darklight rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-dark_border shadow-card" data-aos="fade-up">
            <div className="text-center mb-8">
              <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-3">
                Franchise Partner
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-midnight_text dark:text-white mb-2">
                Start Your Own AI-Powered Training Institute
              </h2>
              <p className="text-xs sm:text-sm text-muted dark:text-white/70">
                Fill out the form below, and our Franchise Team will connect with you to discuss the business model, investment, operational support, and partnership process.
              </p>
            </div>

            {submitSuccess ? (
              <div className="p-8 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl text-center space-y-3">
                <Icon icon="mdi:check-circle" className="text-emerald-600 text-5xl mx-auto" />
                <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-100">Franchise Application Submitted!</h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  Thank you for your interest in QIMD Franchise. Our franchise development manager will contact you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
                {/* Row 1: Name, Mobile, Email */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block font-bold text-midnight_text dark:text-white mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter full name"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full bg-white dark:bg-dark border border-slate-200 dark:border-dark_border rounded-xl p-2.5 text-midnight_text dark:text-white focus:outline-none focus:border-primary font-medium text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-midnight_text dark:text-white mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Enter mobile number"
                      value={formData.mobileNumber}
                      onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                      className="w-full bg-white dark:bg-dark border border-slate-200 dark:border-dark_border rounded-xl p-2.5 text-midnight_text dark:text-white focus:outline-none focus:border-primary font-medium text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-midnight_text dark:text-white mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="Enter email address"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white dark:bg-dark border border-slate-200 dark:border-dark_border rounded-xl p-2.5 text-midnight_text dark:text-white focus:outline-none focus:border-primary font-medium text-xs"
                    />
                  </div>
                </div>

                {/* Row 2: City/State, Current Business, Commercial Space */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block font-bold text-midnight_text dark:text-white mb-1">
                      City / State *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Pune, Maharashtra"
                      value={formData.cityState}
                      onChange={(e) => setFormData({ ...formData, cityState: e.target.value })}
                      className="w-full bg-white dark:bg-dark border border-slate-200 dark:border-dark_border rounded-xl p-2.5 text-midnight_text dark:text-white focus:outline-none focus:border-primary font-medium text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-midnight_text dark:text-white mb-1">
                      Current Profession *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Business Owner / Institute Owner"
                      value={formData.currentProfession}
                      onChange={(e) => setFormData({ ...formData, currentProfession: e.target.value })}
                      className="w-full bg-white dark:bg-dark border border-slate-200 dark:border-dark_border rounded-xl p-2.5 text-midnight_text dark:text-white focus:outline-none focus:border-primary font-medium text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-midnight_text dark:text-white mb-1">
                      Commercial Space? *
                    </label>
                    <select
                      value={formData.hasCommercialSpace}
                      onChange={(e) => setFormData({ ...formData, hasCommercialSpace: e.target.value })}
                      className="w-full bg-white dark:bg-dark border border-slate-200 dark:border-dark_border rounded-xl p-2.5 text-midnight_text dark:text-white focus:outline-none focus:border-primary font-medium text-xs"
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>

                {/* Row 3: Preferred City & Interest Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block font-bold text-midnight_text dark:text-white mb-1">
                      Preferred City *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Pune / Mumbai / Nashik"
                      value={formData.preferredCity}
                      onChange={(e) => setFormData({ ...formData, preferredCity: e.target.value })}
                      className="w-full bg-white dark:bg-dark border border-slate-200 dark:border-dark_border rounded-xl p-2.5 text-midnight_text dark:text-white focus:outline-none focus:border-primary font-medium text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-midnight_text dark:text-white mb-1">
                      Tell Us About Your Interest (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Investment budget, space availability, timeline..."
                      value={formData.interestDetails}
                      onChange={(e) => setFormData({ ...formData, interestDetails: e.target.value })}
                      className="w-full bg-white dark:bg-dark border border-slate-200 dark:border-dark_border rounded-xl p-2.5 text-midnight_text dark:text-white focus:outline-none focus:border-primary font-medium text-xs"
                    />
                  </div>
                </div>

                {/* Checkbox agreement & Submit */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="agreeContactFranchise"
                      checked={formData.agreeContact}
                      onChange={(e) => setFormData({ ...formData, agreeContact: e.target.checked })}
                      className="w-4 h-4 text-primary rounded cursor-pointer"
                    />
                    <label htmlFor="agreeContactFranchise" className="text-xs text-midnight_text dark:text-white font-medium cursor-pointer">
                      I agree to be contacted by the QIMD Franchise Team.
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto bg-[#764DFF] hover:bg-[#5c38d6] text-white font-extrabold px-8 py-3 rounded-xl text-xs transition-all shadow-md cursor-pointer"
                  >
                    {isSubmitting ? "Submitting Application..." : "Apply for Franchise"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 3. WHY PARTNER WITH QIMD? (MODERN 4-CARD HORIZONTAL GRID) */}
      <section className="py-16 lg:py-20 bg-slate-50/70 dark:bg-darklight border-y border-slate-200/70 dark:border-dark_border" id="why-partner">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10" data-aos="fade-up">
            <span className="bg-[#764DFF]/10 text-[#764DFF] text-xs font-extrabold px-3.5 py-1 rounded-full inline-block mb-2.5">
              Strategic Advantages
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-midnight_text dark:text-white tracking-tight">
              Why Partner With QIMD?
            </h2>
            <p className="text-slate-500 dark:text-white/70 text-xs sm:text-sm font-medium mt-1">
              Build a scalable, high-margin education business backed by a proven brand and AI-powered curriculum.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {whyPartnerReasons.map((reason, i) => (
              <div
                key={i}
                className="bg-white dark:bg-dark p-6 rounded-2xl border border-slate-200/80 dark:border-dark_border shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
                data-aos="fade-up"
                data-aos-delay={i * 70}
              >
                <div className="space-y-3.5">
                  <div className="w-11 h-11 rounded-xl bg-[#764DFF]/10 text-[#764DFF] group-hover:bg-[#764DFF] group-hover:text-white transition-colors duration-300 flex items-center justify-center text-xl font-bold">
                    <Icon icon={reason.icon} />
                  </div>
                  <h3 className="text-base font-extrabold text-midnight_text dark:text-white group-hover:text-[#764DFF] transition-colors">
                    {reason.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-white/70 leading-relaxed">
                    {reason.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. COMPLETE FRANCHISE SUPPORT (MODERN 2x2 DETAILED PILLARS) */}
      <section className="py-16 lg:py-20 bg-white dark:bg-dark">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12" data-aos="fade-up">
            <span className="bg-[#764DFF]/10 text-[#764DFF] text-xs font-extrabold px-3.5 py-1 rounded-full inline-block mb-2.5">
              360° Operational Ecosystem
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-midnight_text dark:text-white tracking-tight">
              Complete Franchise Support
            </h2>
            <p className="text-slate-500 dark:text-white/70 text-xs sm:text-sm font-medium mt-1">
              As a QIMD Franchise Partner, you&apos;ll receive full end-to-end assistance across every operational pillar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {supportPillars.map((pillar, i) => (
              <div
                key={i}
                className="bg-slate-50/70 dark:bg-darklight p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-dark_border shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                data-aos={i % 2 === 0 ? "fade-right" : "fade-left"}
                data-aos-duration="800"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-dark_border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#764DFF] text-white flex items-center justify-center text-xl font-bold shadow-sm">
                        <Icon icon={pillar.icon} />
                      </div>
                      <h3 className="text-base sm:text-lg font-extrabold text-midnight_text dark:text-white">
                        {pillar.category}
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold bg-[#764DFF]/10 text-[#764DFF] px-2.5 py-0.5 rounded-full border border-[#764DFF]/20">
                      Pillar 0{i + 1}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {pillar.items.map((item, idx) => (
                      <div
                        key={idx}
                        data-aos="fade-up"
                        data-aos-delay={idx * 100 + 150}
                        className="flex items-center gap-2.5 bg-white dark:bg-dark px-3 py-2.5 rounded-xl border border-slate-200/70 dark:border-dark_border text-xs font-semibold text-midnight_text dark:text-white shadow-2xs hover:shadow-md hover:border-[#764DFF]/50 hover:-translate-y-0.5 hover:bg-[#764DFF]/5 transition-all duration-300 group/pill cursor-default"
                      >
                        <Icon icon="mdi:check-circle" className="text-[#764DFF] text-sm shrink-0 group-hover/pill:scale-125 transition-transform duration-300" />
                        <span className="leading-tight group-hover/pill:text-[#764DFF] transition-colors">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. PROGRAMS YOU CAN OFFER & WHO CAN BECOME A PARTNER (SIDE BY SIDE WITH MIDDLE DIVIDER) */}
      <section className="py-16 lg:py-20 bg-slate-50/70 dark:bg-darklight border-y border-slate-200/70 dark:border-dark_border">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            
            {/* Left Side: Programs You Can Offer */}
            <div className="lg:col-span-6 space-y-6 lg:pr-8 lg:border-r border-slate-200 dark:border-dark_border" data-aos="fade-right">
              <div>
                <span className="bg-[#764DFF]/10 text-[#764DFF] text-xs font-extrabold px-3.5 py-1 rounded-full inline-block mb-2.5">
                  Academic Offerings
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-midnight_text dark:text-white tracking-tight">
                  Programs You Can Offer
                </h2>
                <p className="text-slate-500 dark:text-white/70 text-xs sm:text-sm font-medium mt-1">
                  Deliver high-demand, AI-powered practical courses to students and professionals in your region.
                </p>
              </div>

              <div className="space-y-2.5">
                {programsOffered.map((program, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-white dark:bg-dark border border-slate-200/80 dark:border-dark_border flex items-center gap-3.5 shadow-2xs hover:shadow-md hover:border-[#764DFF]/50 transition-all"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#764DFF]/10 text-[#764DFF] flex items-center justify-center text-lg font-bold shrink-0">
                      <Icon icon="mdi:school-outline" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-midnight_text dark:text-white">
                      {program}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side: Who Can Become a Franchise Partner */}
            <div className="lg:col-span-6 space-y-6 lg:pl-4" data-aos="fade-left">
              <div>
                <span className="bg-[#764DFF]/10 text-[#764DFF] text-xs font-extrabold px-3.5 py-1 rounded-full inline-block mb-2.5">
                  Eligibility &amp; Profiles
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-midnight_text dark:text-white tracking-tight">
                  Who Can Become a Partner?
                </h2>
                <p className="text-slate-500 dark:text-white/70 text-xs sm:text-sm font-medium mt-1">
                  We welcome passionate business leaders. No prior experience in education required — our team guides you at every step.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
                {targetPartners.map((partner, i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-dark border border-slate-200/80 dark:border-dark_border text-midnight_text dark:text-white text-xs font-bold p-3.5 rounded-2xl shadow-2xs hover:shadow-md hover:border-[#764DFF] hover:text-[#764DFF] transition-all flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#764DFF]/10 text-[#764DFF] flex items-center justify-center shrink-0">
                      <Icon icon="mdi:check-circle" className="text-base" />
                    </div>
                    <span>{partner}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5.5. WHY CHOOSE QIMD? */}
      <section className="py-16 lg:py-20 bg-white dark:bg-dark border-b border-slate-200/70 dark:border-dark_border">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10" data-aos="fade-up">
            <span className="bg-[#764DFF]/10 text-[#764DFF] text-xs font-extrabold px-3.5 py-1 rounded-full inline-block mb-2.5">
              Core Benefits
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-midnight_text dark:text-white tracking-tight">
              Why Choose QIMD?
            </h2>
            <p className="text-slate-500 dark:text-white/70 text-xs sm:text-sm font-medium mt-1">
              Key pillars that make our franchise partnership model reliable, scalable, and practical.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5" data-aos="fade-up">
            {whyChoosePills.map((pill, i) => (
              <div
                key={i}
                className="bg-slate-50/80 dark:bg-darklight border border-slate-200/80 dark:border-dark_border p-4 rounded-2xl flex items-center gap-3 shadow-2xs hover:shadow-md hover:border-[#764DFF]/50 transition-all group"
              >
                <div className="w-8 h-8 rounded-xl bg-[#764DFF]/10 text-[#764DFF] group-hover:bg-[#764DFF] group-hover:text-white transition-colors flex items-center justify-center text-sm font-bold shrink-0">
                  <Icon icon="mdi:star-four-points" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-midnight_text dark:text-white group-hover:text-[#764DFF] transition-colors">
                  {pill}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. OUR FRANCHISE PROCESS (SLEEK OPEN STEPPER PIPELINE) */}
      <section className="py-16 lg:py-20 bg-white dark:bg-dark border-b border-slate-200/70 dark:border-dark_border">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14" data-aos="fade-up">
            <span className="bg-[#764DFF]/10 text-[#764DFF] text-xs font-extrabold px-3.5 py-1 rounded-full inline-block mb-2.5">
              Onboarding Roadmap
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-midnight_text dark:text-white tracking-tight">
              Our Franchise Process
            </h2>
            <p className="text-slate-500 dark:text-white/70 text-xs sm:text-sm font-medium mt-1">
              A simple, structured 6-step process to launch your own QIMD practical training center.
            </p>
          </div>

          {/* Connected Steps Horizontal Stepper */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 relative">
            {franchiseSteps.map((s, i) => (
              <div
                key={i}
                className="relative flex flex-col items-center text-center space-y-3 group"
                data-aos="fade-up"
                data-aos-delay={i * 70}
              >
                {/* Horizontal Connector Arrow for Desktop */}
                {i < franchiseSteps.length - 1 && (
                  <div className="hidden lg:flex items-center justify-center absolute top-5 -right-3 w-6 h-6 text-slate-300 dark:text-white/20 z-10">
                    <Icon icon="mdi:chevron-right" className="text-xl" />
                  </div>
                )}

                {/* Step Circle Icon Badge */}
                <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-darklight border border-slate-200 dark:border-dark_border text-[#764DFF] group-hover:bg-[#764DFF] group-hover:text-white group-hover:border-[#764DFF] transition-all duration-300 flex items-center justify-center text-xs font-black shadow-2xs group-hover:shadow-md shrink-0">
                  {s.step}
                </div>

                <div className="space-y-1">
                  <h4 className="font-extrabold text-midnight_text dark:text-white text-xs group-hover:text-[#764DFF] transition-colors">
                    {s.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-white/60 leading-relaxed font-medium">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. LET'S BUILD THE FUTURE TOGETHER */}
      <section className="py-14 lg:py-18 bg-slate-50/80 dark:bg-darklight border-t border-slate-200/80 dark:border-dark_border">
        <div className="container mx-auto max-w-4xl px-4 text-center space-y-4" data-aos="fade-up">
          <span className="bg-[#764DFF]/10 text-[#764DFF] text-xs font-extrabold px-3.5 py-1 rounded-full inline-block">
            Start Your Journey
          </span>
          
          <h2 className="text-2xl sm:text-3xl font-extrabold text-midnight_text dark:text-white tracking-tight">
            Let&apos;s Build the Future of Practical Education Together
          </h2>
          
          <p className="text-slate-500 dark:text-white/70 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed font-medium">
            Become a QIMD Franchise Partner and establish a successful education business backed by a practical learning model, AI-powered curriculum, and continuous business support.
          </p>
          
          <div className="pt-2 flex flex-wrap justify-center items-center gap-4">
            <Link
              href="tel:+918087897288"
              className="inline-flex items-center gap-2 bg-[#764DFF] hover:bg-[#5c38d6] text-white font-extrabold px-7 py-3 rounded-xl text-xs sm:text-sm transition-all shadow-md"
            >
              <Icon icon="mdi:phone" className="text-base" />
              <span>Call: +91 80878 97288</span>
            </Link>
            <Link
              href="mailto:info@quickuppinstitute.com"
              className="inline-flex items-center gap-2 bg-white dark:bg-dark text-midnight_text dark:text-white border border-slate-300 dark:border-dark_border font-extrabold px-7 py-3 rounded-xl text-xs sm:text-sm transition-all shadow-2xs hover:border-[#764DFF] hover:text-[#764DFF]"
            >
              <Icon icon="mdi:email" className="text-base" />
              <span>Email: info@quickuppinstitute.com</span>
            </Link>
          </div>

          <p className="text-xs font-extrabold text-[#764DFF] pt-1">
            Start Your QIMD Franchise Journey Today.
          </p>
        </div>
      </section>
    </div>
  );
}

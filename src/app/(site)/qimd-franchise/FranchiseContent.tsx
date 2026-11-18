'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react/dist/iconify.js";
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
  CkCta,
} from "@/components/Careers/CareerKit";

export default function FranchiseContent() {
  const initialFormData = {
    fullName: "",
    mobileNumber: "",
    email: "",
    cityState: "",
    currentProfession: "",
    hasCommercialSpace: "Yes",
    preferredCity: "",
    interestDetails: "",
    agreeContact: false,
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (submitSuccess) {
      const timer = setTimeout(() => {
        setSubmitSuccess(false);
        setFormData(initialFormData);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [submitSuccess]);

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
        "Complete Program Curriculum",
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
    <div className="qk">
      <CareerTabs />

      {/* 1. HERO */}
      <CkHero
        eyebrow="QIMD Franchise Partnership"
        title={
          <>
            Partner With One of India&apos;s <span className="qk-mark">Fast-Growing Practical Learning Institutes</span>
          </>
        }
        actions={
          <a href="#enquiry-form" className="qk-btn qk-btn-dark">
            <Icon icon="mdi:rocket-launch-outline" />
            <span>Apply for Franchise</span>
          </a>
        }
        aside={
          <CkPanel label="High Return Opportunity" title="Why QIMD Franchise?" badge="High Demand">
            <CkPanelRow icon="mdi:school" title="Full Academic & LMS Support" text="Turnkey AI-powered curriculum & LMS portal" />
            <CkPanelRow icon="mdi:bullhorn" title="National Marketing & Leads" text="Centralized marketing and inquiry support" />
            <CkPanelRow icon="mdi:shield-check" title="100% Operational Guidance" text="Faculty hiring & center launch assistance" />
          </CkPanel>
        }
      >
        <p>
          Bring AI-Powered, Practical Education to your city by partnering with <strong>QIMD (Quickupp Institute of Marketing &amp; Design)</strong>.
        </p>
        <p>
          If you&apos;re passionate about education and entrepreneurship, our franchise model gives you the opportunity to establish a successful training institute with complete academic, operational, marketing, and placement support.
        </p>
        <p className="qk-note">
          <Icon icon="mdi:account-tie-outline" className="qk-note-ic" />
          <span>Whether you&apos;re an entrepreneur, training institute owner, education consultant, or business professional, QIMD provides a proven system to help you build a sustainable education business.</span>
        </p>
      </CkHero>

      {/* 2. ENQUIRY FORM */}
      <section className="qk-sec qk-ink" id="enquiry-form">
        <div className="qk-wrap">
          <div className="qk-form-grid">
            <div className="qk-form-intro">
              <CkHead
                light
                index="01"
                eyebrow="Franchise Partner"
                title="Start Your Own AI-Powered Training Institute"
                desc="Fill out the form below, and our Franchise Team will connect with you to discuss the business model, investment, operational support, and partnership process."
              />
            </div>

            <div className="qk-sheet">
              {submitSuccess ? (
                <CkSuccess
                  title="Franchise Application Submitted!"
                  text="Thank you for your interest in QIMD Franchise. Our franchise development manager will contact you within 24 hours."
                />
              ) : (
                <form onSubmit={handleSubmit} className="qk-form">
                  <div className="qk-field">
                    <label className="qk-label" htmlFor="qk-f-name">Full Name *</label>
                    <input id="qk-f-name" type="text" required placeholder="Enter your full name" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="qk-input" />
                  </div>

                  <div className="qk-row-2">
                    <div className="qk-field">
                      <label className="qk-label">Mobile Number *</label>
                      <div className="qk-phone">
                        <PhoneInput value={formData.mobileNumber} onChange={(val) => setFormData({ ...formData, mobileNumber: val })} required placeholder="Enter mobile number" />
                      </div>
                    </div>
                    <div className="qk-field">
                      <label className="qk-label" htmlFor="qk-f-email">Email Address *</label>
                      <input id="qk-f-email" type="email" required placeholder="Enter email address" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="qk-input" />
                    </div>
                  </div>

                  <div className="qk-row-3">
                    <div className="qk-field">
                      <label className="qk-label" htmlFor="qk-f-city">City / State *</label>
                      <input id="qk-f-city" type="text" required placeholder="e.g. Pune, Maharashtra" value={formData.cityState} onChange={(e) => setFormData({ ...formData, cityState: e.target.value })} className="qk-input" />
                    </div>
                    <div className="qk-field">
                      <label className="qk-label" htmlFor="qk-f-prof">Current Profession *</label>
                      <input id="qk-f-prof" type="text" required placeholder="e.g. Business Owner / Institute Owner" value={formData.currentProfession} onChange={(e) => setFormData({ ...formData, currentProfession: e.target.value })} className="qk-input" />
                    </div>
                    <div className="qk-field">
                      <label className="qk-label" htmlFor="qk-f-space">Commercial Space? *</label>
                      <select id="qk-f-space" value={formData.hasCommercialSpace} onChange={(e) => setFormData({ ...formData, hasCommercialSpace: e.target.value })} className="qk-input qk-select">
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                  </div>

                  <div className="qk-row-3">
                    <div className="qk-field">
                      <label className="qk-label" htmlFor="qk-f-pref">Preferred City *</label>
                      <input id="qk-f-pref" type="text" required placeholder="e.g. Pune / Mumbai / Nashik" value={formData.preferredCity} onChange={(e) => setFormData({ ...formData, preferredCity: e.target.value })} className="qk-input" />
                    </div>
                    <div className="qk-field qk-span-2">
                      <label className="qk-label" htmlFor="qk-f-int">Tell Us About Your Interest (Optional)</label>
                      <input id="qk-f-int" type="text" placeholder="Investment budget, space availability, timeline..." value={formData.interestDetails} onChange={(e) => setFormData({ ...formData, interestDetails: e.target.value })} className="qk-input" />
                    </div>
                  </div>

                  <CkConsent id="agreeContactFranchise" checked={formData.agreeContact} onChange={(v) => setFormData({ ...formData, agreeContact: v })}>
                    I agree to be contacted by the QIMD Franchise Team.
                  </CkConsent>

                  <button type="submit" disabled={isSubmitting} className="qk-btn qk-btn-submit">
                    {isSubmitting ? "Submitting Application..." : "Apply for Franchise"}
                    {!isSubmitting && <Icon icon="mdi:arrow-right" />}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. WHY PARTNER WITH QIMD? */}
      <section className="qk-sec qk-white" id="why-partner">
        <div className="qk-wrap">
          <CkHead
            index="02"
            eyebrow="Strategic Advantages"
            title="Why Partner With QIMD?"
            desc="Build a scalable, high-margin education business backed by a proven brand and AI-powered curriculum."
          />
          <div className="qk-cells cols-4">
            {whyPartnerReasons.map((reason, i) => (
              <div key={i} className="qk-cell">
                <div className="qk-cell-top">
                  <span className="qk-cell-ic">
                    <Icon icon={reason.icon} />
                  </span>
                  <span className="qk-cell-num">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="qk-cell-title">{reason.title}</h3>
                <p className="qk-cell-desc">{reason.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. COMPLETE FRANCHISE SUPPORT */}
      <section className="qk-sec qk-ink">
        <div className="qk-wrap">
          <CkHead
            light
            index="03"
            eyebrow="360° Operational Ecosystem"
            title="Complete Franchise Support"
            desc="As a QIMD Franchise Partner, you'll receive full end-to-end assistance across every operational pillar."
          />
          <div className="qk-pillars">
            {supportPillars.map((pillar, i) => (
              <div key={i} className="qk-pillar">
                <div className="qk-pillar-head">
                  <span className="qk-cell-ic">
                    <Icon icon={pillar.icon} />
                  </span>
                  <h3>{pillar.category}</h3>
                  <span className="qk-pillar-tag">Pillar 0{i + 1}</span>
                </div>
                <ul className="qk-pillar-list">
                  {pillar.items.map((item, idx) => (
                    <li key={idx}>
                      <Icon icon="mdi:check" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. PROGRAMS + WHO CAN BECOME A PARTNER */}
      <section className="qk-sec">
        <div className="qk-wrap">
          <div className="qk-split">
            <div>
              <CkHead
                index="04"
                eyebrow="Academic Offerings"
                title="Programs You Can Offer"
                desc="Deliver high-demand, AI-powered practical programs to students and professionals in your region."
              />
              <div className="qk-jobs is-compact">
                {programsOffered.map((program, i) => (
                  <div key={i} className="qk-job">
                    <span className="qk-job-num">{String(i + 1).padStart(2, "0")}</span>
                    <span className="qk-job-ic">
                      <Icon icon="mdi:school-outline" />
                    </span>
                    <span className="qk-job-title">{program}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <CkHead
                index="05"
                eyebrow="Eligibility & Profiles"
                title="Who Can Become a Partner?"
                desc="We welcome passionate business leaders. No prior experience in education required - our team guides you at every step."
              />
              <CkChecks items={targetPartners} cols={2} />
            </div>
          </div>
        </div>
      </section>

      {/* 6. WHY CHOOSE QIMD? */}
      <section className="qk-sec qk-white">
        <div className="qk-wrap">
          <CkHead
            index="06"
            eyebrow="Core Benefits"
            title="Why Choose QIMD?"
            desc="Key pillars that make our franchise partnership model reliable, scalable, and practical."
          />
          <CkChecks items={whyChoosePills} cols={3} />
        </div>
      </section>

      {/* 7. OUR FRANCHISE PROCESS */}
      <section className="qk-sec">
        <div className="qk-wrap">
          <CkHead
            index="07"
            eyebrow="Onboarding Roadmap"
            title="Our Franchise Process"
            desc="A simple, structured 6-step process to launch your own QIMD practical training center."
          />
          <CkSteps steps={franchiseSteps} />
        </div>
      </section>

      {/* 8. LET'S BUILD THE FUTURE TOGETHER */}
      <CkCta
        eyebrow="Start Your Journey"
        icon="mdi:flag-outline"
        title="Let's Build the Future of Practical Education Together"
        desc="Become a QIMD Franchise Partner and establish a successful education business backed by a practical learning model, AI-powered curriculum, and continuous business support."
        actions={
          <>
            <Link href="tel:+918087897288" className="qk-btn qk-btn-light">
              <Icon icon="mdi:phone" />
              <span>Call: +91 80878 97288</span>
            </Link>
            <Link href="mailto:info@quickuppinstitute.com" className="qk-btn qk-btn-ghost">
              <Icon icon="mdi:email-outline" />
              <span>Email: info@quickuppinstitute.com</span>
            </Link>
          </>
        }
        note="Start Your QIMD Franchise Journey Today."
      />
    </div>
  );
}

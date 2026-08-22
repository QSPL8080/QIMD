'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react/dist/iconify.js";
import PhoneInput from "@/components/Common/PhoneInput";

export default function ContactContent() {
  const [formData, setFormData] = useState({
    fullName: "",
    mobileNumber: "",
    email: "",
    course: "AI-Powered Digital Marketing",
    message: "",
    agreeContact: true,
  });
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
          course: "AI-Powered Digital Marketing",
          message: "",
          agreeContact: true,
        });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [submitSuccess]);

  const coursesList = [
    "AI-Powered Digital Marketing",
    "AI-Powered Graphic Design",
    "AI-Powered Video Editing",
    "General Enquiry",
  ];

  const weOfferList = [
    "AI-Powered Digital Marketing Program",
    "AI-Powered Graphic Design Program",
    "AI-Powered Video Editing Program",
    "100% Live Project-Based Learning",
    "Internship Opportunities",
    "Placement Assistance",
    "Industry Expert Mentorship",
    "Portfolio Development",
    "Resume Building & Interview Preparation",
  ];

  const guidanceTopics = [
    "Course Selection",
    "Admission Process",
    "Fee Structure & EMI Options",
    "Batch Schedules",
    "Internship Opportunities",
    "Placement Assistance",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { submitContactEnquiryAction } = await import('@/app/actions/crmActions');
      const res = await submitContactEnquiryAction({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.mobileNumber,
        subject: formData.course ? `Contact Enquiry (${formData.course})` : 'General Contact Enquiry',
        message: formData.message || `Interested in course: ${formData.course}`,
      });
      setIsSubmitting(false);
      if (res.success) {
        setSubmitSuccess(true);
      } else {
        alert(res.error || 'Submission failed');
      }
    } catch (err) {
      setIsSubmitting(false);
      alert('An error occurred during submission.');
    }
  };

  return (
    <div className="bg-grey dark:bg-dark min-h-screen">
      {/* 1. TOP HEADER BANNER (SUBTLE PASTEL BACKGROUND) */}
      <section
        className="py-14 lg:py-18 relative overflow-hidden text-midnight_text border-b border-slate-200/60 dark:border-dark_border"
        style={{
          background: 'linear-gradient(135deg, #f0e8ff 0%, #ffffff 50%, #e8f4fd 100%)',
        }}
      >
        <div className="container mx-auto max-w-7xl px-4 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4" data-aos="fade-up">
            <div className="inline-flex items-center gap-2 bg-[#764DFF]/15 text-[#5c38d6] border border-[#764DFF]/25 text-xs font-bold px-3.5 py-1.5 rounded-full backdrop-blur-md">
              <Icon icon="mdi:phone-in-talk" className="text-base" />
              Contact Us
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#111827] dark:text-white leading-tight tracking-tight">
              Let&apos;s Build Your <span className="text-[#764DFF]">Career Together</span>
            </h1>

            <p className="text-slate-600 dark:text-white/80 text-xs sm:text-sm font-medium leading-relaxed max-w-2xl mx-auto">
              Whether you&apos;re looking to enroll in a program, explore career opportunities, hire skilled professionals, or simply learn more about QIMD, our team is here to assist you.
            </p>
            <p className="text-xs sm:text-sm font-extrabold text-[#111827] dark:text-white">
              Complete the enquiry form below, and one of our counsellors will get in touch with you shortly.
            </p>
          </div>
        </div>
      </section>

      {/* 2. GET IN TOUCH: SIDE CONTACT INFO & FORM (SWAPPED SIDES WITH SPACIOUS GAP) */}
      <section className="py-16 lg:py-20 bg-white dark:bg-dark" id="enquiry-form">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Left Column: Clean Side Info (5 cols - WITHOUT CARDS) */}
            <div className="lg:col-span-5 space-y-8 lg:pr-4" data-aos="fade-right">
              
              {/* Visit Our Campus Info */}
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 bg-[#764DFF]/10 text-[#764DFF] text-xs font-extrabold px-3.5 py-1 rounded-full">
                  <Icon icon="mdi:map-marker-radius" className="text-base" />
                  <span>Visit Our Campus</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-midnight_text dark:text-white tracking-tight">
                  Experience QIMD Firsthand
                </h3>
                <p className="text-slate-500 dark:text-white/70 text-xs sm:text-sm leading-relaxed font-medium">
                  Meet our trainers, explore our facilities, and discover how practical learning can transform your career.
                </p>

                <div className="space-y-4 pt-2">
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-[#764DFF]/10 text-[#764DFF] flex items-center justify-center text-lg shrink-0 mt-0.5 font-bold">
                      <Icon icon="mdi:map-marker" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-midnight_text dark:text-white text-xs">Address</h4>
                      <p className="text-xs sm:text-sm font-bold text-midnight_text dark:text-white mt-0.5">
                        Quickupp Institute of Marketing &amp; Design (QIMD)
                      </p>
                      <p className="text-xs text-slate-500 dark:text-white/60">Hinjewadi, Pune, Maharashtra</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-[#764DFF]/10 text-[#764DFF] flex items-center justify-center text-lg shrink-0 mt-0.5 font-bold">
                      <Icon icon="mdi:clock-outline" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-midnight_text dark:text-white text-xs">Working Hours</h4>
                      <p className="text-xs sm:text-sm font-bold text-midnight_text dark:text-white mt-0.5">
                        Monday – Saturday | 9:00 AM – 6:00 PM
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Helpline & Support Divider */}
              <div className="border-t border-slate-200 dark:border-dark_border pt-6 space-y-4">
                <div className="inline-flex items-center gap-2 bg-[#764DFF]/10 text-[#764DFF] text-xs font-extrabold px-3.5 py-1 rounded-full">
                  <Icon icon="mdi:phone-classic" className="text-base" />
                  <span>Helpline &amp; Support</span>
                </div>

                <div className="space-y-3.5">
                  <Link
                    href="tel:+918087897288"
                    className="flex items-center gap-3.5 text-midnight_text dark:text-white hover:text-[#764DFF] transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#764DFF]/10 text-[#764DFF] flex items-center justify-center text-lg font-bold group-hover:bg-[#764DFF] group-hover:text-white transition-colors shrink-0">
                      <Icon icon="mdi:phone" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-white/50 uppercase tracking-wider">Phone Helpline</p>
                      <p className="text-sm font-extrabold">+91 8087897288</p>
                    </div>
                  </Link>

                  <Link
                    href="mailto:info@quickuppinstitute.com"
                    className="flex items-center gap-3.5 text-midnight_text dark:text-white hover:text-[#764DFF] transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#764DFF]/10 text-[#764DFF] flex items-center justify-center text-lg font-bold group-hover:bg-[#764DFF] group-hover:text-white transition-colors shrink-0">
                      <Icon icon="mdi:email" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-white/50 uppercase tracking-wider">Email Address</p>
                      <p className="text-sm font-extrabold">info@quickuppinstitute.com</p>
                    </div>
                  </Link>
                </div>
              </div>

            </div>

            {/* Right Column: Form (7 cols) */}
            <div className="lg:col-span-7 bg-slate-50/80 dark:bg-darklight rounded-3xl p-6 sm:p-9 border border-slate-200/80 dark:border-dark_border shadow-card" data-aos="fade-left">
              <div className="mb-6 space-y-1">
                <span className="bg-[#764DFF] text-white text-[10px] font-bold px-3 py-0.5 rounded-full inline-block mb-1">
                  Get In Touch
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-midnight_text dark:text-white tracking-tight">
                  Schedule a Free Career Counselling Session
                </h2>
                <p className="text-xs text-slate-500 dark:text-white/70 font-medium">
                  Fill out the form below to receive personalized guidance from our admissions experts.
                </p>
              </div>

              {submitSuccess ? (
                <div className="p-8 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl text-center space-y-3">
                  <Icon icon="mdi:check-circle" className="text-emerald-600 text-5xl mx-auto" />
                  <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-100">Enquiry Submitted Successfully!</h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">
                    Thank you for reaching out to QIMD. One of our senior admissions counsellors will contact you shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                    <div>
                      <label className="block font-bold text-midnight_text dark:text-white mb-1">
                        Course Interested In *
                      </label>
                      <select
                        value={formData.course}
                        onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                        className="w-full bg-white dark:bg-dark border border-slate-200 dark:border-dark_border rounded-xl p-2.5 text-midnight_text dark:text-white focus:outline-none focus:border-primary font-medium text-xs"
                      >
                        {coursesList.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-midnight_text dark:text-white mb-1">
                      Your Message (Optional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Tell us about your background, career goals, or any specific questions..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full bg-white dark:bg-dark border border-slate-200 dark:border-dark_border rounded-xl p-2.5 text-midnight_text dark:text-white focus:outline-none focus:border-primary font-medium text-xs"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="agreeContactEnquiry"
                        checked={formData.agreeContact}
                        onChange={(e) => setFormData({ ...formData, agreeContact: e.target.checked })}
                        className="w-4 h-4 text-primary rounded cursor-pointer"
                      />
                      <label htmlFor="agreeContactEnquiry" className="text-xs text-midnight_text dark:text-white font-medium cursor-pointer">
                        I agree to be contacted by QIMD regarding my enquiry.
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto bg-[#764DFF] hover:bg-[#5c38d6] text-white font-extrabold px-8 py-3 rounded-xl text-xs transition-all shadow-md cursor-pointer shrink-0"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Enquiry"}
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* 5. NEED CAREER GUIDANCE? */}
      <section className="py-14 lg:py-18 bg-slate-50/80 dark:bg-darklight border-t border-slate-200/80 dark:border-dark_border">
        <div className="container mx-auto max-w-4xl px-4 text-center space-y-4" data-aos="fade-up">
          <span className="bg-[#764DFF]/10 text-[#764DFF] text-xs font-extrabold px-3.5 py-1 rounded-full inline-block">
            Admissions Assistance
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-midnight_text dark:text-white tracking-tight">
            Need Career Guidance?
          </h2>

          <p className="text-slate-500 dark:text-white/70 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed font-medium">
            Our admissions team is available to help you choose the right course based on your career goals, interests, and experience.
          </p>

          <div className="pt-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#764DFF] mb-3">Get Personalized Guidance On:</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {guidanceTopics.map((topic, i) => (
                <div key={i} className="p-3 rounded-2xl bg-white dark:bg-dark border border-slate-200/80 dark:border-dark_border text-xs font-bold text-midnight_text dark:text-white shadow-2xs">
                  ✓ {topic}
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs font-extrabold text-[#764DFF] pt-2">
            Start your journey with QIMD today. We&apos;re here to help you take the next step toward a successful career.
          </p>
        </div>
      </section>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react/dist/iconify.js";
import PhoneInput from "@/components/Common/PhoneInput";

export default function ContactContent() {
  const [formData, setFormData] = useState({
    fullName: "",
    mobileNumber: "",
    email: "",
    course: "",
    message: "",
    agreeContact: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);
  const courseDropdownRef = useRef<HTMLDivElement>(null);

  // Close course dropdown on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (courseDropdownRef.current && !courseDropdownRef.current.contains(e.target as Node)) {
        setCourseDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Auto-reset success message after 3 seconds
  useEffect(() => {
    if (submitSuccess) {
      const timer = setTimeout(() => {
        setSubmitSuccess(false);
        setFormData({
          fullName: "",
          mobileNumber: "",
          email: "",
          course: "",
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
    "Program Selection",
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
        message: formData.message || `Interested in program: ${formData.course}`,
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
    <div className="qc-page bg-white dark:bg-dark min-h-screen">
      {/* ═══ 1. HERO — classic photo banner ═══ */}
      <section className="qc-hero">
        <div className="qc-hero-bg" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/contact/contact-hero.webp" alt="" loading="eager" />
        </div>
        <div className="container mx-auto max-w-7xl px-4 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-5" data-aos="fade-up">
            <nav className="qc-crumbs" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span className="qc-crumbs-sep">/</span>
              <span>Contact Us</span>
            </nav>

            <p className="qc-hero-kicker">Contact Us</p>

            <h1 className="qc-hero-title">
              Let&apos;s Build Your <span className="qc-hero-accent">Career Together</span>
            </h1>

            <p className="qc-hero-lead">
              Whether you&apos;re looking to enroll in a program, explore career opportunities, hire skilled professionals, or simply learn more about QIMD, our team is here to assist you.
            </p>

            <p className="qc-hero-note">
              Complete the enquiry form below, and one of our counsellors will get in touch with you shortly.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ 2. CONTACT INFO + FORM ═══ */}
      <section className="qc-main" id="enquiry-form">

        <div className="container mx-auto max-w-7xl px-4 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* Left: campus & helpline info */}
            <div className="lg:col-span-5 space-y-8" data-aos="fade-right">
              <div className="space-y-4">
                <div className="qc-eyebrow">
                  <Icon icon="solar:map-point-wave-bold" />
                  Visit Our Campus
                </div>
                <h3 className="qc-main-title">Experience QIMD Firsthand</h3>
                <p className="qc-main-lead">
                  Meet our trainers, explore our facilities, and discover how practical learning can transform your career.
                </p>
              </div>

              <div className="qc-info-list">
                <div className="qc-info">
                  <span className="qc-info-ic">
                    <Icon icon="solar:map-point-bold" />
                  </span>
                  <div>
                    <p className="qc-info-label">Address</p>
                    <p className="qc-info-value">Quickupp Institute of Marketing &amp; Design (QIMD)</p>
                    <p className="qc-info-sub">Hinjewadi, Pune, Maharashtra</p>
                  </div>
                </div>

                <div className="qc-info">
                  <span className="qc-info-ic">
                    <Icon icon="solar:clock-circle-bold" />
                  </span>
                  <div>
                    <p className="qc-info-label">Working Hours</p>
                    <p className="qc-info-value">Monday – Saturday | 9:00 AM – 6:00 PM</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="qc-eyebrow">
                  <Icon icon="solar:headphones-round-sound-bold" />
                  Helpline &amp; Support
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                  <Link href="tel:+918087897288" className="qc-quick">
                    <span className="qc-quick-ic">
                      <Icon icon="solar:phone-calling-bold" />
                    </span>
                    <span className="min-w-0">
                      <span className="qc-info-label">Phone Helpline</span>
                      <span className="qc-quick-value">+91 8087897288</span>
                    </span>
                    <Icon icon="solar:arrow-right-up-linear" className="qc-quick-arrow" />
                  </Link>

                  <Link href="mailto:info@quickuppinstitute.com" className="qc-quick">
                    <span className="qc-quick-ic">
                      <Icon icon="solar:letter-bold" />
                    </span>
                    <span className="min-w-0">
                      <span className="qc-info-label">Email Address</span>
                      <span className="qc-quick-value break-all">info@quickuppinstitute.com</span>
                    </span>
                    <Icon icon="solar:arrow-right-up-linear" className="qc-quick-arrow" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right: enquiry form */}
            <div className="lg:col-span-7" data-aos="fade-left">
              <div className="qc-form-card">
                <div className="qc-form-head">
                  <span className="qc-form-head-ic">
                    <Icon icon="solar:chat-round-call-bold" />
                  </span>
                  <div>
                    <span className="qc-chip">Get In Touch</span>
                    <h2 className="qc-form-title">Schedule a Free Career Counselling Session</h2>
                    <p className="qc-form-lead">
                      Fill out the form below to receive personalized guidance from our admissions experts.
                    </p>
                  </div>
                </div>

                {submitSuccess ? (
                  <div className="qc-success">
                    <span className="qc-success-ic">
                      <Icon icon="solar:check-circle-bold" />
                    </span>
                    <h3>Enquiry Submitted Successfully!</h3>
                    <p>
                      Thank you for reaching out to QIMD. One of our senior admissions counsellors will contact you shortly.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="qc-form">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="qc-field">
                        <label htmlFor="qc-name">Full Name *</label>
                        <div className="qc-input-wrap">
                          <Icon icon="solar:user-linear" className="qc-input-ic" />
                          <input
                            id="qc-name"
                            type="text"
                            required
                            placeholder="Enter your full name"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className="qc-input has-ic"
                          />
                        </div>
                      </div>
                      <div className="qc-field">
                        <label htmlFor="qc-email">Email Address *</label>
                        <div className="qc-input-wrap">
                          <Icon icon="solar:letter-linear" className="qc-input-ic" />
                          <input
                            id="qc-email"
                            type="email"
                            required
                            placeholder="Enter email address"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="qc-input has-ic"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="qc-field">
                        <label>Mobile Number *</label>
                        <div className="qc-phone">
                          <PhoneInput
                            value={formData.mobileNumber}
                            onChange={(val) => setFormData({ ...formData, mobileNumber: val })}
                            required
                            placeholder="Enter mobile number"
                          />
                        </div>
                      </div>
                      <div className="qc-field">
                        <label>Program Interested In *</label>
                        <div className="relative" ref={courseDropdownRef}>
                          <div
                            role="button"
                            tabIndex={0}
                            aria-haspopup="listbox"
                            aria-expanded={courseDropdownOpen}
                            onClick={() => setCourseDropdownOpen(!courseDropdownOpen)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setCourseDropdownOpen(!courseDropdownOpen);
                              }
                            }}
                            className={`qc-select ${courseDropdownOpen ? 'is-open' : ''}`}
                          >
                            <Icon icon="solar:book-bookmark-linear" className="qc-input-ic" />
                            <span className={`truncate ${!formData.course ? 'qc-placeholder' : 'qc-selected'}`}>
                              {formData.course || "Select program of interest"}
                            </span>
                            <Icon icon="solar:alt-arrow-down-linear" className="qc-select-caret" />
                          </div>

                          {courseDropdownOpen && (
                            <div className="qc-options" role="listbox">
                              {coursesList.map((c) => {
                                const isSelected = formData.course === c;
                                return (
                                  <div
                                    key={c}
                                    role="option"
                                    aria-selected={isSelected}
                                    onClick={() => {
                                      setFormData({ ...formData, course: c });
                                      setCourseDropdownOpen(false);
                                    }}
                                    className={`qc-option ${isSelected ? 'is-selected' : ''}`}
                                  >
                                    <span className="truncate">{c}</span>
                                    {isSelected && <Icon icon="solar:check-circle-bold" className="shrink-0" />}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="qc-field">
                      <label htmlFor="qc-message">Your Message (Optional)</label>
                      <textarea
                        id="qc-message"
                        rows={4}
                        placeholder="Tell us about your background, career goals, or any specific questions..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="qc-input qc-textarea"
                      />
                    </div>

                    <label htmlFor="agreeContactEnquiry" className="qc-check">
                      <input
                        type="checkbox"
                        id="agreeContactEnquiry"
                        checked={formData.agreeContact}
                        onChange={(e) => setFormData({ ...formData, agreeContact: e.target.checked })}
                      />
                      <span className="qc-check-box" aria-hidden="true">
                        <Icon icon="solar:check-read-linear" />
                      </span>
                      <span>I agree to be contacted by QIMD regarding my enquiry.</span>
                    </label>

                    <button type="submit" disabled={isSubmitting} className="qc-submit">
                      {isSubmitting ? (
                        <>
                          <Icon icon="svg-spinners:180-ring" className="text-lg" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Enquiry</span>
                          <span className="qc-submit-arrow">
                            <Icon icon="solar:arrow-right-linear" />
                          </span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 3. NEED CAREER GUIDANCE? ═══ */}
      <section className="qc-guide">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="qc-guide-media" data-aos="fade-right">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/contact/contact-guidance.webp" alt="Students working on live projects at QIMD" loading="lazy" />
              <span className="qc-guide-ring" aria-hidden="true" />
            </div>

            <div className="space-y-5" data-aos="fade-left">
              <div className="qc-eyebrow">
                <Icon icon="solar:user-speak-rounded-bold" />
                Admissions Assistance
              </div>
              <h2 className="qc-guide-title">Need Career Guidance?</h2>
              <p className="qc-guide-lead">
                Our admissions team is available to help you choose the right program based on your career goals, interests, and experience.
              </p>

              <div>
                <h4 className="qc-guide-sub">Get Personalized Guidance On:</h4>
                <div className="qc-topics">
                  {guidanceTopics.map((topic, i) => (
                    <div key={i} className="qc-topic">
                      <span className="qc-topic-ic">
                        <Icon icon="solar:check-circle-bold" />
                      </span>
                      <span>{topic}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="qc-guide-cta">
                <Icon icon="solar:rocket-2-bold" className="shrink-0 text-xl" />
                <span>Start your journey with QIMD today. We&apos;re here to help you take the next step toward a successful career.</span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

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
    agreeContact: false,
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
          agreeContact: false,
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

  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Office 411, Suratwala Mark Plazzo, Hinjawadi Rd, Phase 1, Hinjawadi, Maharashtra 411057")}`;

  return (
    <div className="qc-page qn">
      {/* ═══ 1. CONTACT DESK — intro + enquiry form side by side ═══ */}
      <section className="qn-desk-sec" id="enquiry-form" data-qx="off">
        <div className="qn-wrap">
          <div className="qn-desk">
            {/* Left: intro & direct lines */}
            <div className="qn-desk-intro">
              <nav className="qn-crumbs" aria-label="Breadcrumb">
                <Link href="/">Home</Link>
                <Icon icon="solar:alt-arrow-right-linear" />
                <span>Contact Us</span>
              </nav>

              <p className="qn-kicker">
                <span className="qn-kicker-dot" aria-hidden="true" />
                Contact Us
              </p>

              <h1 className="qn-h1">
                Let&apos;s Build Your <span className="qn-accent">Career Together</span>
              </h1>

              <p className="qn-lead">
                Whether you&apos;re looking to enroll in a program, explore career opportunities, hire skilled professionals, or simply learn more about QIMD, our team is here to assist you.
              </p>

              <p className="qn-note">
                <Icon icon="solar:chat-round-dots-bold" />
                <span>Complete the enquiry form below, and one of our counsellors will get in touch with you shortly.</span>
              </p>

              <div className="qn-lines">
                <p className="qn-lines-title">
                  <Icon icon="solar:headphones-round-sound-bold" />
                  Helpline &amp; Support
                </p>
                <Link href="tel:+918087897288" className="qn-line">
                  <span className="qn-line-ic"><Icon icon="solar:phone-calling-bold" /></span>
                  <span className="qn-line-text">
                    <span className="qn-line-label">Phone Helpline</span>
                    <span className="qn-line-value">+91 8087897288</span>
                  </span>
                  <Icon icon="solar:arrow-right-up-linear" className="qn-line-arrow" />
                </Link>
                <Link href="mailto:info@quickuppinstitute.com" className="qn-line">
                  <span className="qn-line-ic"><Icon icon="solar:letter-bold" /></span>
                  <span className="qn-line-text">
                    <span className="qn-line-label">Email Address</span>
                    <span className="qn-line-value">info@quickuppinstitute.com</span>
                  </span>
                  <Icon icon="solar:arrow-right-up-linear" className="qn-line-arrow" />
                </Link>
              </div>
            </div>

            {/* Right: enquiry form */}
            <div className="qn-desk-form qc-form-card">
              <div className="qn-form-head">
                <span className="qn-form-chip">
                  <Icon icon="solar:chat-round-call-bold" />
                  Get In Touch
                </span>
                <h2 className="qn-form-title">Schedule a Free Career Counselling Session</h2>
                <p className="qn-form-lead">
                  Fill out the form below to receive personalized guidance from our admissions experts.
                </p>
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
                        required
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
      </section>

      {/* ═══ 2. VISIT OUR CAMPUS ═══ */}
      <section className="qn-campus">
        <div className="qn-wrap">
          <div className="qn-campus-grid">
            <div className="qn-campus-intro">
              <p className="qn-eyebrow">
                <Icon icon="solar:map-point-wave-bold" />
                Visit Our Campus
              </p>
              <h3 className="qn-h3">Experience QIMD Firsthand</h3>
              <p>
                Meet our trainers, explore our facilities, and discover how practical learning can transform your career.
              </p>
            </div>

            <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="qn-place">
              <span className="qn-place-ic"><Icon icon="solar:map-point-bold" /></span>
              <span className="qn-place-label">Address</span>
              <span className="qn-place-value">Quickupp Institute of Marketing &amp; Design (QIMD)</span>
              <span className="qn-place-sub">Office 411, Suratwala Mark Plazzo, Hinjawadi Rd, Phase 1, Hinjawadi, Maharashtra 411057</span>
              <Icon icon="solar:arrow-right-up-linear" className="qn-place-arrow" />
            </a>

            <div className="qn-place is-static">
              <span className="qn-place-ic"><Icon icon="solar:clock-circle-bold" /></span>
              <span className="qn-place-label">Working Hours</span>
              <span className="qn-place-value">Monday – Saturday | 9:00 AM – 6:00 PM</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 3. NEED CAREER GUIDANCE? ═══ */}
      <section className="qn-guide-sec">
        <div className="qn-wrap">
          <div className="qn-guide">
            <div className="qn-guide-photo" aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/contact/contact-guidance.webp" alt="Students working on live projects at QIMD" loading="lazy" />
            </div>
            <div className="qn-guide-body">
              <p className="qn-eyebrow is-light">
                <Icon icon="solar:user-speak-rounded-bold" />
                Admissions Assistance
              </p>
              <h2 className="qn-h2">Need Career Guidance?</h2>
              <p className="qn-guide-lead">
                Our admissions team is available to help you choose the right program based on your career goals, interests, and experience.
              </p>

              <h4 className="qn-guide-sub">Get Personalized Guidance On:</h4>
              <ol className="qn-topics">
                {guidanceTopics.map((topic, i) => (
                  <li key={i}>
                    <span className="qn-topic-num">{String(i + 1).padStart(2, "0")}</span>
                    <span>{topic}</span>
                  </li>
                ))}
              </ol>

              <p className="qn-guide-cta">
                <Icon icon="solar:rocket-2-bold" />
                <span>Start your journey with QIMD today. We&apos;re here to help you take the next step toward a successful career.</span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

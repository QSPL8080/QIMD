'use client'
import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import type { EnquiryFormData } from "@/types";
import { coursesData, siteConfig } from "@/data";
import PhoneInput from "@/components/Common/PhoneInput";

interface EnquiryFormProps {
  title?: string;
  subtitle?: string;
  showTitle?: boolean;
  compact?: boolean;
  className?: string;
  formType?: 'admission' | 'contact';
  selectedCourse?: string;
  onSubmit?: (data: EnquiryFormData) => void;
}

const EnquiryForm: React.FC<EnquiryFormProps> = ({
  title,
  subtitle,
  showTitle = true,
  compact = false,
  className = "",
  formType = 'admission',
  selectedCourse = "",
  onSubmit,
}) => {
  const INITIAL_FORM: EnquiryFormData = {
    name: "",
    phone: "",
    email: "",
    location: "",
    courseInterest: selectedCourse,
    message: "",
    subject: "",
  };

  const [form, setForm] = useState<EnquiryFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<EnquiryFormData>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloadInfo, setDownloadInfo] = useState<{ url: string; title?: string } | null>(null);
  const [courseOpen, setCourseOpen] = useState(false);
  const courseDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedCourse) {
      setForm(prev => ({ ...prev, courseInterest: selectedCourse }));
    }
  }, [selectedCourse]);

  // Auto-reset form to original state after 3 seconds upon successful submission
  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => {
        setSubmitted(false);
        setDownloadInfo(null);
        setForm({
          name: "",
          phone: "",
          email: "",
          location: "",
          courseInterest: selectedCourse,
          message: "",
          subject: "",
        });
        setErrors({});
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [submitted, selectedCourse]);

  // Close course dropdown on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (courseDropdownRef.current && !courseDropdownRef.current.contains(e.target as Node)) {
        setCourseOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const validate = (): boolean => {
    const newErrors: Partial<EnquiryFormData> = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.phone.trim() || form.phone.replace(/[^\d]/g, '').length < 5)
      newErrors.phone = "Valid phone number required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Valid email address required";
    
    if (formType === 'admission') {
      if (!form.courseInterest && !selectedCourse) newErrors.courseInterest = "Please select a course";
    } else {
      if (!form.message?.trim()) newErrors.message = "Message is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof EnquiryFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const downloadingRef = useRef(false);

  const triggerBrochureDownload = (brochureUrl: string, courseParam: string, courseName?: string) => {
    if (downloadingRef.current) return;
    downloadingRef.current = true;
    setTimeout(() => {
      downloadingRef.current = false;
    }, 3000);

    const downloadApiUrl = `/api/public/brochures/download?file=${encodeURIComponent(brochureUrl)}&courseId=${encodeURIComponent(courseParam || '')}`;

    // Single reliable download trigger using hidden <a> element
    try {
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = downloadApiUrl;
      a.setAttribute('download', '');
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        try {
          document.body.removeChild(a);
        } catch {}
      }, 3000);
    } catch (err) {
      console.error('Error triggering brochure download:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (formType === 'contact') {
        const { submitContactEnquiryAction } = await import('@/app/actions/crmActions');
        const courseName = coursesData.find(c => c.slug === form.courseInterest)?.title;
        const res = await submitContactEnquiryAction({
          fullName: form.name,
          email: form.email,
          phone: form.phone,
          subject: form.subject || (courseName ? `Inquiry about ${courseName}` : 'General Contact Inquiry'),
          message: form.message || '',
        });
        setLoading(false);
        if (res.success) {
          setSubmitted(true);
          onSubmit?.(form);
        } else {
          alert(res.error || 'Failed to submit enquiry');
        }
      } else {
        const { submitAdmissionEnquiryAction } = await import('@/app/actions/crmActions');
        const effectiveCourse = form.courseInterest || selectedCourse;
        const res = await submitAdmissionEnquiryAction({
          studentName: form.name,
          email: form.email,
          phone: form.phone,
          courseId: effectiveCourse,
          city: form.location,
          message: form.message ? `Remarks: ${form.message}` : undefined,
        });
        setLoading(false);
        if (res.success) {
          setSubmitted(true);
          if (res.brochureUrl) {
            const downloadApiUrl = `/api/public/brochures/download?file=${encodeURIComponent(res.brochureUrl)}&courseId=${encodeURIComponent(effectiveCourse || '')}`;
            setDownloadInfo({
              url: downloadApiUrl,
              title: res.brochureTitle || res.courseName || 'Brochure',
            });
            triggerBrochureDownload(res.brochureUrl, effectiveCourse, (res.courseName || res.brochureTitle) ?? undefined);
          }
          onSubmit?.(form);
        } else {
          alert(res.error || 'Failed to submit form');
        }
      }
    } catch (err) {
      setLoading(false);
      alert('An error occurred. Please try again.');
    }
  };

  if (submitted) {
    return (
      <div className={`flex flex-col items-center justify-center py-8 px-4 text-center ${className}`}>
        <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-4 shadow-inner">
          <Icon icon="mdi:check-circle" className="text-accent text-4xl" />
        </div>
        <h3 className="text-xl font-extrabold text-midnight_text dark:text-white mb-2">Thank You!</h3>
        <p className="text-muted dark:text-white/70 text-xs sm:text-sm max-w-xs leading-relaxed">
          {formType === 'contact' 
            ? "Your message has been sent successfully. Our team will get back to you shortly."
            : downloadInfo?.url
              ? "Your course brochure download has started automatically! Our admissions counsellor will get in touch with you shortly."
              : "We've received your admission enquiry. Our admissions counsellor will get in touch with you shortly."}
        </p>
        {downloadInfo?.url && (
          <a
            href={downloadInfo.url}
            download
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-white bg-primary hover:bg-darkprimary px-4 py-2 rounded-xl transition-all shadow-md hover:-translate-y-0.5"
          >
            <Icon icon="mdi:download" className="text-base" />
            Click here to download brochure
          </a>
        )}
        <button
          onClick={() => { setSubmitted(false); setDownloadInfo(null); setForm(INITIAL_FORM); }}
          className="mt-4 text-primary text-xs font-bold hover:underline flex items-center gap-1"
        >
          <Icon icon="mdi:arrow-left" className="text-sm" />
          Submit another response
        </button>
      </div>
    );
  }

  // Dynamic titles and button labels
  const formTitle = title || (formType === 'contact' ? "Send Us a Message" : "Fill The Form & Download The Brochure");
  const formSubtitle = subtitle || (formType === 'contact' ? "Fill out the form below and we will get back to you shortly." : "");

  return (
    <div className={className}>
      {showTitle && (
        <div className="mb-3 pb-2 border-b border-gray-100 dark:border-dark_border">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <h3 className="text-lg sm:text-xl font-black text-midnight_text dark:text-white leading-tight">{formTitle}</h3>
            {formType !== 'contact' && (
              <div className="flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0">
                <Icon icon="mdi:phone" className="text-xs" />
                <span>{siteConfig.phone}</span>
              </div>
            )}
          </div>
          {formSubtitle && <p className="text-muted dark:text-white/60 text-xs mt-1">{formSubtitle}</p>}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-2 sm:space-y-2.5">
        {/* Full Name */}
        <div>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <Icon icon="mdi:account-outline" className="text-lg" />
            </div>
            <input
              id="enquiry-name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your Full Name *"
              className={`w-full pl-10 pr-4 py-2 sm:py-2.5 rounded-xl border text-xs sm:text-sm text-midnight_text dark:text-white bg-gray-50/80 dark:bg-darklight focus:outline-none transition-all font-medium ${
                errors.name ? 'border-red-500 bg-red-50/50' : 'border-gray-200 dark:border-dark_border focus:border-primary focus:bg-white'
              }`}
            />
          </div>
          {errors.name && (
            <p className="text-red-500 text-[11px] mt-0.5 flex items-center gap-1 font-medium"><Icon icon="mdi:alert-circle-outline" className="text-xs" />{errors.name}</p>
          )}
        </div>

        {/* Phone Number - Full Width */}
        <div>
          <PhoneInput
            id="enquiry-phone"
            value={form.phone}
            onChange={(val) => {
              setForm((prev) => ({ ...prev, phone: val }));
              if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
            }}
            placeholder="Phone Number *"
            inputClassName={`text-xs sm:text-sm ${
              errors.phone ? 'border-red-500 bg-red-50/50' : ''
            }`}
          />
          {errors.phone && (
            <p className="text-red-500 text-[11px] mt-0.5 flex items-center gap-1 font-medium"><Icon icon="mdi:alert-circle-outline" className="text-xs" />{errors.phone}</p>
          )}
        </div>

        {/* Email Address - Full Width to prevent cut off */}
        <div>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <Icon icon="mdi:email-outline" className="text-lg" />
            </div>
            <input
              id="enquiry-email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email Address *"
              className={`w-full pl-10 pr-4 py-2 sm:py-2.5 rounded-xl border text-xs sm:text-sm text-midnight_text dark:text-white bg-gray-50/80 dark:bg-darklight focus:outline-none transition-all font-medium ${
                errors.email ? 'border-red-500 bg-red-50/50' : 'border-gray-200 dark:border-dark_border focus:border-primary focus:bg-white'
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-[11px] mt-0.5 flex items-center gap-1 font-medium"><Icon icon="mdi:alert-circle-outline" className="text-xs" />{errors.email}</p>
          )}
        </div>

        {/* Location & Course Interest side-by-side in one row */}
        {formType === 'admission' && !compact ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
            {/* Location */}
            <div>
              <div className="relative">
                <div className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <Icon icon="mdi:map-marker-outline" className="text-base" />
                </div>
                <input
                  id="enquiry-location"
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Your City / Location"
                  className="w-full pl-8 sm:pl-9 pr-3 py-2 sm:py-2.5 rounded-xl border border-gray-200 dark:border-dark_border text-xs sm:text-sm text-midnight_text dark:text-white bg-gray-50/80 dark:bg-darklight focus:outline-none focus:border-primary focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            {/* Course Interest (Custom Sleek Dropdown) */}
            <div className="relative" ref={courseDropdownRef}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => setCourseOpen(!courseOpen)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setCourseOpen(!courseOpen);
                  }
                }}
                className={`w-full flex items-center justify-between pl-8 sm:pl-9 pr-3 py-2 sm:py-2.5 rounded-xl border text-xs sm:text-sm text-left transition-all font-medium cursor-pointer relative select-none ${
                  errors.courseInterest
                    ? 'border-red-500 bg-red-50/50'
                    : courseOpen
                      ? 'border-primary bg-white'
                      : 'border-gray-200 dark:border-dark_border bg-gray-50/80 dark:bg-darklight hover:border-gray-300 dark:hover:border-dark_border/80'
                }`}
                aria-haspopup="listbox"
                aria-expanded={courseOpen}
              >
                <div className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <Icon icon="mdi:book-open-outline" className="text-base" />
                </div>
                <span className={`truncate mr-2 ${form.courseInterest ? 'text-midnight_text dark:text-white font-medium' : 'text-gray-400 font-normal'}`}>
                  {coursesData.find(c => c.slug === form.courseInterest)?.title || "Select a Course *"}
                </span>
                <Icon
                  icon="mdi:chevron-down"
                  className={`text-gray-400 text-base shrink-0 transition-transform duration-200 ${courseOpen ? 'rotate-180 text-primary' : ''}`}
                />
              </div>

              {/* Dropdown Menu - Aligned right & stays within form boundaries */}
              {courseOpen && (
                <div className="absolute top-full right-0 z-50 mt-1.5 w-full min-w-[210px] sm:min-w-[240px] max-w-[calc(100vw-2rem)] bg-white dark:bg-dark border border-slate-200 dark:border-dark_border rounded-xl shadow-xl overflow-hidden py-1">
                  <div
                    onClick={() => {
                      setForm(prev => ({ ...prev, courseInterest: "" }));
                      if (errors.courseInterest) setErrors(prev => ({ ...prev, courseInterest: undefined }));
                      setCourseOpen(false);
                    }}
                    className={`px-3 py-2 text-xs sm:text-sm text-gray-400 hover:bg-slate-50 dark:hover:bg-darklight cursor-pointer transition-colors ${
                      !form.courseInterest ? 'bg-primary/5 font-bold text-primary' : ''
                    }`}
                  >
                    Select a Course *
                  </div>
                  {coursesData.map((course) => {
                    const isSelected = form.courseInterest === course.slug;
                    return (
                      <div
                        key={course.id}
                        onClick={() => {
                          setForm(prev => ({ ...prev, courseInterest: course.slug }));
                          if (errors.courseInterest) setErrors(prev => ({ ...prev, courseInterest: undefined }));
                          setCourseOpen(false);
                        }}
                        className={`flex items-center justify-between gap-2 px-3 py-2 text-xs sm:text-sm cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-primary/10 text-primary font-bold'
                            : 'text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-darklight font-medium'
                        }`}
                      >
                        <span className="truncate">{course.title}</span>
                        {isSelected && (
                          <Icon icon="mdi:check" className="text-primary text-sm shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {errors.courseInterest && (
                <p className="text-red-500 text-[11px] mt-0.5 flex items-center gap-1 font-medium"><Icon icon="mdi:alert-circle-outline" className="text-xs" />{errors.courseInterest}</p>
              )}
            </div>
          </div>
        ) : (
          /* Course Interest when compact or contact */
          <div className="relative" ref={courseDropdownRef}>
            <div
              role="button"
              tabIndex={0}
              onClick={() => setCourseOpen(!courseOpen)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setCourseOpen(!courseOpen);
                }
              }}
              className={`w-full flex items-center justify-between pl-9 pr-3 py-2 sm:py-2.5 rounded-xl border text-xs sm:text-sm text-left transition-all font-medium cursor-pointer relative select-none ${
                errors.courseInterest
                  ? 'border-red-500 bg-red-50/50'
                  : courseOpen
                    ? 'border-primary bg-white'
                    : 'border-gray-200 dark:border-dark_border bg-gray-50/80 dark:bg-darklight hover:border-gray-300 dark:hover:border-dark_border/80'
              }`}
              aria-haspopup="listbox"
              aria-expanded={courseOpen}
            >
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <Icon icon="mdi:book-open-outline" className="text-base" />
              </div>
              <span className={`truncate mr-2 ${form.courseInterest ? 'text-midnight_text dark:text-white font-medium' : 'text-gray-400 font-normal'}`}>
                {coursesData.find(c => c.slug === form.courseInterest)?.title || (formType === 'contact' ? "Select Course (Optional)" : "Select a Course *")}
              </span>
              <Icon
                icon="mdi:chevron-down"
                className={`text-gray-400 text-base shrink-0 transition-transform duration-200 ${courseOpen ? 'rotate-180 text-primary' : ''}`}
              />
            </div>

            {/* Dropdown Menu */}
            {courseOpen && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1.5 w-full bg-white dark:bg-dark border border-slate-200 dark:border-dark_border rounded-xl shadow-xl overflow-hidden py-1">
                <div
                  onClick={() => {
                    setForm(prev => ({ ...prev, courseInterest: "" }));
                    if (errors.courseInterest) setErrors(prev => ({ ...prev, courseInterest: undefined }));
                    setCourseOpen(false);
                  }}
                  className={`px-3 py-2 text-xs sm:text-sm text-gray-400 hover:bg-slate-50 dark:hover:bg-darklight cursor-pointer transition-colors ${
                    !form.courseInterest ? 'bg-primary/5 font-bold text-primary' : ''
                  }`}
                >
                  {formType === 'contact' ? "None (General Inquiry)" : "Select a Course *"}
                </div>
                {coursesData.map((course) => {
                  const isSelected = form.courseInterest === course.slug;
                  return (
                    <div
                      key={course.id}
                      onClick={() => {
                        setForm(prev => ({ ...prev, courseInterest: course.slug }));
                        if (errors.courseInterest) setErrors(prev => ({ ...prev, courseInterest: undefined }));
                        setCourseOpen(false);
                      }}
                      className={`flex items-center justify-between gap-2 px-3 py-2 text-xs sm:text-sm cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-darklight font-medium'
                      }`}
                    >
                      <span className="truncate">{course.title}</span>
                      {isSelected && (
                        <Icon icon="mdi:check" className="text-primary text-sm shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {errors.courseInterest && (
              <p className="text-red-500 text-[11px] mt-0.5 flex items-center gap-1 font-medium"><Icon icon="mdi:alert-circle-outline" className="text-xs" />{errors.courseInterest}</p>
            )}
          </div>
        )}

        {/* Message (Textarea) */}
        <div>
          <div className="relative">
            <div className="absolute left-3.5 top-3 text-gray-400 pointer-events-none">
              <Icon icon="mdi:message-text-outline" className="text-lg" />
            </div>
            <textarea
              id="enquiry-message"
              name="message"
              rows={2}
              value={form.message}
              onChange={handleChange}
              placeholder={formType === 'contact' ? "Your Message *" : "Any additional notes or comments"}
              className={`w-full pl-10 pr-4 py-2 rounded-xl border text-xs sm:text-sm text-midnight_text dark:text-white bg-gray-50/80 dark:bg-darklight focus:outline-none transition-all font-medium resize-none ${
                errors.message ? 'border-red-500 bg-red-50/50' : 'border-gray-200 dark:border-dark_border focus:border-primary focus:bg-white'
              }`}
            />
          </div>
          {errors.message && (
            <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1 font-medium"><Icon icon="mdi:alert-circle-outline" className="text-xs" />{errors.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-darkprimary text-white font-extrabold py-3 rounded-xl text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:-translate-y-0.5 mt-1"
        >
          {loading ? (
            <>
              <Icon icon="mdi:loading" className="animate-spin text-base" />
              Submitting...
            </>
          ) : (
            <>
              <Icon icon={formType === 'contact' ? "mdi:send" : "mdi:download"} className="text-base" />
              {formType === 'contact' ? "Send Message" : "Submit & Download Brochure"}
            </>
          )}
        </button>

        <p className="text-[11px] text-gray-400 dark:text-white/40 text-center pt-1">
          By submitting, you agree to our{" "}
          <a href="/privacy-policy" className="text-primary hover:underline font-semibold">Privacy Policy</a>.
        </p>
      </form>
    </div>
  );
};

export default EnquiryForm;

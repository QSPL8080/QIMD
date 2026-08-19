'use client'
import { useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import type { EnquiryFormData } from "@/types";
import { coursesData, siteConfig } from "@/data";

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

  const validate = (): boolean => {
    const newErrors: Partial<EnquiryFormData> = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.phone.trim() || !/^[0-9]{10,13}$/.test(form.phone.replace(/\s+/g, '')))
      newErrors.phone = "Valid 10-digit phone number required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Valid email address required";
    
    if (formType === 'admission') {
      if (!form.courseInterest) newErrors.courseInterest = "Please select a course";
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
        const res = await submitAdmissionEnquiryAction({
          studentName: form.name,
          email: form.email,
          phone: form.phone,
          city: form.location,
          message: `Course Interest: ${form.courseInterest}. Remarks: ${form.message || 'None'}`,
        });
        setLoading(false);
        if (res.success) {
          setSubmitted(true);
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
            : "We've received your enquiry. Our admissions counsellor will get in touch with you shortly."}
        </p>
        <button
          onClick={() => { setSubmitted(false); setForm(INITIAL_FORM); }}
          className="mt-5 text-primary text-xs font-bold hover:underline flex items-center gap-1"
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

      <form onSubmit={handleSubmit} noValidate className="space-y-2.5">
        {/* Name & Phone in 2 columns on sm+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Name */}
          <div>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <Icon icon="mdi:account-outline" className="text-lg" />
              </div>
              <input
                id="enquiry-name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your Full Name *"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs sm:text-sm text-midnight_text dark:text-white bg-gray-50/80 dark:bg-darklight focus:outline-none transition-all font-medium ${
                  errors.name ? 'border-red-500 bg-red-50/50' : 'border-gray-200 dark:border-dark_border focus:border-primary focus:bg-white'
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1 font-medium"><Icon icon="mdi:alert-circle-outline" className="text-xs" />{errors.name}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <Icon icon="mdi:phone-outline" className="text-lg" />
              </div>
              <input
                id="enquiry-phone"
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone Number *"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs sm:text-sm text-midnight_text dark:text-white bg-gray-50/80 dark:bg-darklight focus:outline-none transition-all font-medium ${
                  errors.phone ? 'border-red-500 bg-red-50/50' : 'border-gray-200 dark:border-dark_border focus:border-primary focus:bg-white'
                }`}
              />
            </div>
            {errors.phone && (
              <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1 font-medium"><Icon icon="mdi:alert-circle-outline" className="text-xs" />{errors.phone}</p>
            )}
          </div>
        </div>

        {/* Email & Location in 2 columns on sm+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Email */}
          <div>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <Icon icon="mdi:email-outline" className="text-lg" />
              </div>
              <input
                id="enquiry-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email Address *"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs sm:text-sm text-midnight_text dark:text-white bg-gray-50/80 dark:bg-darklight focus:outline-none transition-all font-medium ${
                  errors.email ? 'border-red-500 bg-red-50/50' : 'border-gray-200 dark:border-dark_border focus:border-primary focus:bg-white'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1 font-medium"><Icon icon="mdi:alert-circle-outline" className="text-xs" />{errors.email}</p>
            )}
          </div>

          {/* Location (Only for Admission) */}
          {formType === 'admission' && !compact && (
            <div>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <Icon icon="mdi:map-marker-outline" className="text-lg" />
                </div>
                <input
                  id="enquiry-location"
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Your City / Location"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark_border text-xs sm:text-sm text-midnight_text dark:text-white bg-gray-50/80 dark:bg-darklight focus:outline-none focus:border-primary focus:bg-white transition-all font-medium"
                />
              </div>
            </div>
          )}
        </div>

        {/* Course Interest (Select a Course) */}
        <div>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <Icon icon="mdi:book-open-outline" className="text-lg" />
            </div>
            <select
              id="enquiry-course"
              name="courseInterest"
              value={form.courseInterest}
              onChange={handleChange}
              className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-xs sm:text-sm text-midnight_text dark:text-white bg-gray-50/80 dark:bg-darklight focus:outline-none transition-all font-medium appearance-none cursor-pointer ${
                errors.courseInterest ? 'border-red-500 bg-red-50/50' : 'border-gray-200 dark:border-dark_border focus:border-primary focus:bg-white'
              } ${!form.courseInterest ? 'text-gray-400' : ''}`}
            >
              <option value="">{formType === 'contact' ? "Select Course of Interest (Optional)" : "Select a Course *"}</option>
              {coursesData.map((course) => (
                <option key={course.id} value={course.slug} className="text-midnight_text">
                  {course.title}
                </option>
              ))}
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <Icon icon="mdi:chevron-down" className="text-lg" />
            </div>
          </div>
          {errors.courseInterest && (
            <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1 font-medium"><Icon icon="mdi:alert-circle-outline" className="text-xs" />{errors.courseInterest}</p>
          )}
        </div>

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

'use client';

import Link from "next/link";
import { Icon } from "@iconify/react/dist/iconify.js";

export default function WhyQimdContent() {
  const whyChoosePoints = [
    {
      title: "AI-Powered Learning",
      icon: "mdi:robot-outline",
      desc: "Learn the latest AI tools and workflows used by modern marketers, designers, and video editors to improve productivity and creativity.",
    },
    {
      title: "100% Live Project-Based Learning",
      icon: "mdi:laptop",
      desc: "Work on real client projects, assignments, and case studies to gain practical experience throughout your training.",
    },
    {
      title: "Industry-Driven Curriculum",
      icon: "mdi:book-open-page-variant-outline",
      desc: "Our syllabus is regularly updated to match current industry trends, employer expectations, and emerging technologies.",
    },
    {
      title: "Offline Practical Classroom Training",
      icon: "mdi:school-outline",
      desc: "We conduct offline batches because we believe classroom interaction, mentorship, and hands-on practice create better professionals.",
    },
    {
      title: "Learn from Industry Experts",
      icon: "mdi:account-star-outline",
      desc: "Get trained by professionals who actively work with brands, businesses, and agencies, bringing real industry insights into every session.",
    },
    {
      title: "Internship Opportunities",
      icon: "mdi:briefcase-check-outline",
      desc: "Gain valuable practical exposure through internship opportunities that help you understand real business workflows.",
    },
    {
      title: "Placement Assistance & Hiring Opportunities",
      icon: "mdi:handshake-outline",
      desc: "Receive resume building, interview preparation, career guidance, and placement assistance with access to hiring opportunities through our industry network.",
    },
    {
      title: "Portfolio Development",
      icon: "mdi:folder-star-outline",
      desc: "Graduate with a professional portfolio showcasing live projects and practical work that strengthens your profile during interviews.",
    },
    {
      title: "Small Batch Sizes",
      icon: "mdi:account-group-outline",
      desc: "We maintain focused classroom batches to provide individual attention, personalized mentoring, and better learning outcomes.",
    },
    {
      title: "Modern Learning Management System",
      icon: "mdi:cloud-download-outline",
      desc: "Access study materials, assignments, recorded resources, and learning support throughout your course.",
    },
    {
      title: "Practical Assignments & Workshops",
      icon: "mdi:lightning-bolt-outline",
      desc: "Every module includes hands-on exercises, workshops, and assessments to reinforce your learning.",
    },
    {
      title: "Career Mentorship",
      icon: "mdi:account-voice",
      desc: "Our mentors guide you beyond the classroom with career planning, freelancing guidance, interview preparation, and professional development.",
    },
  ];

  const methodologySteps = [
    { step: "01", title: "Learn", icon: "mdi:book-open-variant", desc: "Interactive Classroom" },
    { step: "02", title: "Practice", icon: "mdi:laptop", desc: "Live AI Workflows" },
    { step: "03", title: "Implement", icon: "mdi:cog-sync", desc: "Real Client Work" },
    { step: "04", title: "Build Portfolio", icon: "mdi:folder-star", desc: "Verified Assets" },
    { step: "05", title: "Internship", icon: "mdi:briefcase-outline", desc: "Workplace Exposure" },
    { step: "06", title: "Placement Assistance", icon: "mdi:check-circle", desc: "Hiring Drives" },
  ];

  const targetAudience = [
    "Students",
    "Fresh Graduates",
    "Job Seekers",
    "Working Professionals",
    "Freelancers",
    "Entrepreneurs",
    "Career Switchers",
  ];

  return (
    <div className="bg-grey dark:bg-dark min-h-screen">
      
      {/* 1. HERO SECTION */}
      <section
        className="py-16 lg:py-20 relative overflow-hidden text-midnight_text border-b border-slate-200/80 dark:border-dark_border"
        style={{
          background: 'linear-gradient(135deg, #c4b0ff 0%, #ddb8f8 28%, #ffffff 50%, #b8d9f0 72%, #a8c4e8 100%)',
        }}
      >
        <div className="container mx-auto max-w-7xl px-4 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-5" data-aos="fade-up">
            <div className="inline-flex items-center gap-2 bg-[#764DFF]/15 text-[#5c38d6] border border-[#764DFF]/25 text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full shadow-2xs backdrop-blur-md">
              <Icon icon="mdi:star-four-points" className="text-[#764DFF] animate-pulse" />
              Why Choose QIMD?
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#111827] leading-tight tracking-tight">
              Build Your Career Through <br />
              <span className="text-[#5c38d6]">AI-Powered Practical Learning</span>
            </h1>

            <div className="space-y-3 text-[#374151] text-xs sm:text-sm leading-relaxed font-medium max-w-3xl mx-auto">
              <p>
                At <strong>QIMD (Quickupp Institute of Marketing &amp; Design)</strong>, we believe that successful careers are built through practical experience, not just theory. Our AI-powered, industry-driven programs are designed to help students develop real-world skills by working on live projects under the guidance of experienced professionals.
              </p>
              <p className="text-[#5c38d6] font-bold">
                Whether you&apos;re a student, graduate, job seeker, freelancer, entrepreneur, or working professional, our training prepares you to become confident, skilled, and industry-ready.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <Link
                href="/courses"
                className="bg-[#764DFF] hover:bg-[#5c38d6] text-white font-bold text-xs sm:text-sm px-7 py-3 rounded-xl transition-all shadow-md"
              >
                Explore Our Programs
              </Link>
              <Link
                href="/contact"
                className="border border-[#764DFF] text-[#764DFF] hover:bg-[#764DFF]/5 font-bold text-xs sm:text-sm px-7 py-3 rounded-xl transition-all"
              >
                Book Free Career Session
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WHY THOUSANDS OF STUDENTS CHOOSE QIMD (SMOOTH SLOW INFINITE CONTINUOUS MARQUEE) */}
      <section className="py-16 lg:py-24 bg-grey dark:bg-darklight overflow-hidden">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-2" data-aos="fade-up">
            <span className="text-xs font-bold uppercase tracking-widest text-[#764DFF]">Key Advantages</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-midnight_text dark:text-white tracking-tight">
              Why Thousands of Students Choose QIMD
            </h2>
            <p className="text-muted dark:text-white/70 text-xs sm:text-sm font-medium">
              Every detail of our institute is engineered to bridge the gap between classroom education and high-growth industry careers.
            </p>
          </div>
        </div>

        {/* FULL SCREEN EDGE-TO-EDGE INFINITE SLOW MARQUEE */}
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden select-none py-3 mt-8">
          {/* Edge Fade Shadows */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-28 bg-gradient-to-r from-grey dark:from-darklight to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-28 bg-gradient-to-l from-grey dark:from-darklight to-transparent z-10" />

          <div
            className="flex animate-marquee-slow items-stretch gap-4 sm:gap-5 pr-4 sm:pr-5"
            style={{ animationDuration: '65s' }}
          >
            {[...whyChoosePoints, ...whyChoosePoints].map((point, i) => (
              <div
                key={`${point.title}-${i}`}
                className="w-[280px] sm:w-[320px] lg:w-[340px] bg-white dark:bg-dark rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border-[1.5px] border-[#764DFF]/20 dark:border-dark_border flex flex-col justify-between shrink-0 h-[175px] sm:h-[185px] group hover:border-[#764DFF] hover:shadow-[0_15px_35px_rgba(118,77,255,0.14)] transition-all duration-300"
              >
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-[#764DFF]/10 text-[#764DFF] flex items-center justify-center text-sm font-bold group-hover:bg-[#764DFF] group-hover:text-white transition-colors duration-300 shrink-0">
                      <Icon icon={point.icon} />
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-midnight_text dark:text-white leading-tight tracking-tight group-hover:text-[#764DFF] transition-colors line-clamp-1">
                      {point.title}
                    </h3>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-600 dark:text-white/70 leading-relaxed font-medium line-clamp-4">
                    {point.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 & 4. COMBINED METHODOLOGY & WHO CAN JOIN QIMD (SIDE-BY-SIDE 2-COLUMN WITH STAGGERED FADE-RIGHT / FADE-LEFT ANIMATIONS) */}
      <section className="py-16 lg:py-24 bg-white dark:bg-dark border-y border-slate-200/80 dark:border-dark_border">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2" data-aos="fade-up">
            <span className="text-xs font-bold uppercase tracking-widest text-[#764DFF]">Structured Framework</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-midnight_text dark:text-white tracking-tight">
              Learning Journey &amp; Eligibility
            </h2>
            <p className="text-muted dark:text-white/70 text-xs sm:text-sm font-medium">
              We ensure every student gains practical knowledge through continuous implementation.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch pt-2">
            
            {/* Left Column: Our Learning Methodology (Fade-Right Staggered) */}
            <div className="space-y-4 bg-slate-50/60 dark:bg-darklight p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-dark_border shadow-2xs flex flex-col justify-between h-full">
              <div className="flex items-center gap-3 pb-2 border-b border-slate-200/60 dark:border-dark_border">
                <div className="w-9 h-9 rounded-xl bg-[#764DFF]/10 text-[#764DFF] flex items-center justify-center text-lg font-bold shrink-0">
                  <Icon icon="mdi:school-outline" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-midnight_text dark:text-white leading-tight">
                    Our Learning Methodology
                  </h3>
                  <span className="text-[10px] font-bold text-[#764DFF] uppercase tracking-wider">6-Step Execution Flow</span>
                </div>
              </div>

              <div className="space-y-2.5 pt-1 flex-1 flex flex-col justify-between">
                {[
                  { step: "01", title: "Learn", desc: "Interactive Classroom Sessions", icon: "mdi:book-open-variant" },
                  { step: "02", title: "Practice", desc: "Hands-on AI Tool Workflows", icon: "mdi:laptop" },
                  { step: "03", title: "Implement", desc: "Real Client Campaign Work", icon: "mdi:cog-sync" },
                  { step: "04", title: "Build Portfolio", desc: "Verified Professional Assets", icon: "mdi:folder-star-outline" },
                  { step: "05", title: "Internship", desc: "Real Business Workplace Exposure", icon: "mdi:briefcase-outline" },
                  { step: "06", title: "Placement Assistance", desc: "Hiring Drives & Interview Coaching", icon: "mdi:check-circle-outline" },
                ].map((m, i) => (
                  <div
                    key={i}
                    data-aos="fade-right"
                    data-aos-delay={i * 80}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-dark border border-slate-200/70 dark:border-dark_border/60 hover:border-[#764DFF]/40 transition-all group min-h-[50px]"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#764DFF]/10 text-[#764DFF] flex items-center justify-center text-xs font-bold shrink-0 group-hover:bg-[#764DFF] group-hover:text-white transition-colors">
                      {m.step}
                    </div>
                    <div className="flex-1 flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold text-midnight_text dark:text-white">
                        {m.title}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500 dark:text-white/60">
                        {m.desc}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Who Can Join QIMD? (Fade-Left Staggered) */}
            <div className="space-y-4 bg-slate-50/60 dark:bg-darklight p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-dark_border shadow-2xs flex flex-col justify-between h-full">
              <div className="flex items-center gap-3 pb-2 border-b border-slate-200/60 dark:border-dark_border">
                <div className="w-9 h-9 rounded-xl bg-[#BD69F2]/10 text-[#BD69F2] flex items-center justify-center text-lg font-bold shrink-0">
                  <Icon icon="mdi:account-group-outline" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-midnight_text dark:text-white leading-tight">
                    Who Can Join QIMD?
                  </h3>
                  <span className="text-[10px] font-bold text-[#BD69F2] uppercase tracking-wider">No Prior Experience Required</span>
                </div>
              </div>

              <div className="space-y-2.5 pt-1 flex-1 flex flex-col justify-between">
                {[
                  { label: "Students", desc: "Looking to build practical career skills early", icon: "mdi:account-school-outline" },
                  { label: "Fresh Graduates", desc: "Seeking job-ready practical training & placements", icon: "mdi:certificate-outline" },
                  { label: "Job Seekers", desc: "Aiming for high-growth tech & creative roles", icon: "mdi:briefcase-search-outline" },
                  { label: "Working Professionals", desc: "Upskilling with modern AI tools & strategies", icon: "mdi:account-tie-outline" },
                  { label: "Freelancers", desc: "Scaling client services & project quality", icon: "mdi:laptop-account" },
                  { label: "Entrepreneurs", desc: "Growing their own business & brand presence", icon: "mdi:rocket-launch-outline" },
                  { label: "Career Switchers", desc: "Transitioning into digital marketing, design or video", icon: "mdi:swap-horizontal-bold" },
                ].map((item, i) => (
                  <div
                    key={i}
                    data-aos="fade-left"
                    data-aos-delay={i * 80}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-dark border border-slate-200/70 dark:border-dark_border/60 hover:border-[#BD69F2]/40 transition-all group min-h-[50px]"
                  >
                    <div className="w-6 h-6 rounded-lg bg-[#BD69F2]/10 text-[#BD69F2] flex items-center justify-center text-xs shrink-0 group-hover:bg-[#BD69F2] group-hover:text-white transition-colors">
                      <Icon icon={item.icon} />
                    </div>
                    <div className="flex-1 flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold text-midnight_text dark:text-white">
                        {item.label}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500 dark:text-white/60">
                        {item.desc}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. OUR PROMISE — PREMIUM HIGH-END GLASSMORPHIC DESIGN */}
      <section className="py-16 bg-grey dark:bg-darklight overflow-hidden relative">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div
            className="relative bg-white dark:bg-dark rounded-3xl p-8 sm:p-12 border border-slate-200/80 dark:border-dark_border shadow-xl max-w-5xl mx-auto overflow-hidden group"
            data-aos="fade-up"
          >
            {/* Soft Ambient Background Glows */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#764DFF]/15 dark:bg-[#764DFF]/25 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#BD69F2]/15 dark:bg-[#BD69F2]/25 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>

            <div className="relative z-10 space-y-6 text-center">
              
              {/* Header Badge */}
              <div className="inline-flex items-center gap-2 bg-[#764DFF]/10 text-[#764DFF] border border-[#764DFF]/20 text-xs font-extrabold px-4 py-1.5 rounded-full shadow-2xs">
                <Icon icon="mdi:shield-check" className="text-base" />
                <span>The QIMD Commitment</span>
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-4xl font-extrabold text-midnight_text dark:text-white tracking-tight">
                Our Promise to Every Student
              </h2>

              {/* Main Text Content Body */}
              <div className="max-w-3xl mx-auto space-y-3 pt-1 text-[#374151] dark:text-white/80 text-xs sm:text-sm leading-relaxed font-medium">
                <p>
                  At QIMD, we don&apos;t just teach software or concepts. We help you develop practical skills, build confidence, create a professional portfolio, and prepare for real career opportunities.
                </p>
                <p className="text-slate-800 dark:text-white font-bold text-sm sm:text-base pt-1">
                  Our mission is to transform aspiring learners into industry-ready professionals through AI-powered education, practical implementation, and expert mentorship.
                </p>
              </div>

              {/* Key Pillars Highlights */}
              <div className="pt-2 flex flex-wrap justify-center gap-2.5 sm:gap-3">
                {[
                  { label: "Practical Implementation", icon: "mdi:laptop" },
                  { label: "AI-Powered Tools", icon: "mdi:robot-outline" },
                  { label: "Verified Portfolio", icon: "mdi:folder-star-outline" },
                  { label: "Career Mentorship", icon: "mdi:handshake-outline" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-dark border border-slate-200/80 dark:border-dark_border text-[11px] font-bold text-slate-700 dark:text-white/90 shadow-2xs"
                  >
                    <Icon icon={item.icon} className="text-[#764DFF]" />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 5. WHY WAIT? CLOSING CTA BANNER */}
      <section className="py-16 bg-white dark:bg-dark border-t border-slate-200/80 dark:border-dark_border">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8 text-center space-y-4" data-aos="fade-up">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#764DFF]">
            Start Today
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-midnight_text dark:text-white tracking-tight">
            Why Wait?
          </h2>
          <div className="text-muted dark:text-white/80 text-xs sm:text-sm max-w-2xl mx-auto space-y-1.5 leading-relaxed font-medium">
            <p className="font-bold text-midnight_text dark:text-white text-sm">
              Your career deserves more than theoretical knowledge.
            </p>
            <p>
              Join QIMD and learn through AI-powered practical training, live client projects, internships, and expert guidance to become industry-ready from day one.
            </p>
          </div>
          <div className="pt-3 flex flex-wrap justify-center gap-4">
            <Link
              href="/courses"
              className="bg-[#764DFF] hover:bg-[#5c38d6] text-white font-bold text-xs sm:text-sm px-8 py-3.5 rounded-xl transition-all shadow-md"
            >
              View All Courses
            </Link>
            <Link
              href="/contact"
              className="border border-[#764DFF] text-[#764DFF] hover:bg-[#764DFF]/5 font-bold text-xs sm:text-sm px-8 py-3.5 rounded-xl transition-all"
            >
              Contact Admissions
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

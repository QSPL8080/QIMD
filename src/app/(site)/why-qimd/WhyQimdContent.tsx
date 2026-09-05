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
      desc: "Access study materials, assignments, recorded resources, and learning support throughout your program.",
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
        className="py-16 lg:py-24 relative overflow-hidden text-midnight_text border-b border-slate-200/80 dark:border-dark_border"
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #ffffff 40%, #f0e8ff 70%, #dcecfe 100%)',
        }}
      >
        {/* Subtle Ambient Decorative Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#764DFF]/10 rounded-full blur-3xl pointer-events-none -z-0" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#BD69F2]/10 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="container mx-auto max-w-7xl px-4 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column (Heading, Highlight Box & Action Buttons) */}
            <div className="lg:col-span-6 space-y-5 text-left" data-aos="fade-up">
              <div className="inline-flex items-center gap-2 bg-[#764DFF]/15 text-[#5c38d6] dark:text-[#a78bfa] border border-[#764DFF]/25 text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full shadow-2xs backdrop-blur-md">
                <Icon icon="mdi:star-four-points" className="text-[#764DFF] animate-pulse" />
                <span>Why Choose QIMD?</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-[#111827] dark:text-white leading-tight tracking-tight">
                Build Your Career Through <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#764DFF] via-[#9055ff] to-[#BD69F2]">
                  AI-Powered Practical Learning
                </span>
              </h1>

              <div className="py-3.5 px-4 sm:px-5 rounded-2xl bg-white/90 dark:bg-darklight/90 border border-slate-200/80 dark:border-dark_border shadow-sm">
                <p className="text-slate-700 dark:text-white/90 font-medium text-xs sm:text-sm leading-relaxed">
                  Whether you&apos;re a student, graduate, job seeker, freelancer, entrepreneur, or working professional, our training prepares you to become confident, skilled, and industry-ready.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap gap-3.5">
                <Link
                  href="/courses"
                  className="bg-[#764DFF] hover:bg-[#5c38d6] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-xl hover:scale-[1.02] flex items-center gap-2"
                >
                  <Icon icon="mdi:compass-outline" className="text-base" />
                  <span>Explore Our Programs</span>
                </Link>
                <Link
                  href="/contact"
                  className="bg-white/80 dark:bg-darklight border border-[#764DFF]/50 text-[#764DFF] hover:bg-[#764DFF]/10 font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all flex items-center gap-2 hover:scale-[1.02] shadow-2xs"
                >
                  <Icon icon="mdi:calendar-check-outline" className="text-base" />
                  <span>Book Free Career Session</span>
                </Link>
              </div>
            </div>

            {/* Right Column (Elevated Philosophy / Statement Card) */}
            <div className="lg:col-span-6" data-aos="fade-up" data-aos-delay="100">
              <div className="relative p-6 sm:p-8 rounded-3xl bg-white/90 dark:bg-darklight/90 border border-slate-200/80 dark:border-dark_border shadow-xl backdrop-blur-md space-y-4">
                {/* Decorative Icon Watermark */}
                <div className="absolute top-4 right-6 text-slate-300/40 dark:text-white/5 text-6xl pointer-events-none select-none">
                  <Icon icon="mdi:school-outline" />
                </div>

                <div className="space-y-4 text-slate-700 dark:text-white/90 text-sm sm:text-[15px] lg:text-base leading-relaxed font-medium relative z-10">
                  <p>
                    At <strong>QIMD (Quickupp Institute of Marketing &amp; Design)</strong>, we believe that successful careers are built through practical experience, not just theory. Our AI-powered, industry-driven programs are designed to help students develop real-world skills by working on live projects under the guidance of experienced professionals.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. WHY THOUSANDS OF STUDENTS CHOOSE QIMD (DARK GRADIENT SLOW INFINITE MARQUEE) */}
      <section
        className="py-16 lg:py-24 text-white relative overflow-hidden border-b border-white/10"
        style={{
          background: 'linear-gradient(135deg, #180e29 0%, #2b1654 35%, #3e1f7d 70%, #0284c7 100%)',
        }}
      >
        <div className="container mx-auto max-w-7xl px-4 lg:px-8 space-y-10 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-2" data-aos="fade-up">
            <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-300">Key Advantages</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Why Thousands of Students Choose QIMD
            </h2>
            <p className="text-slate-200 text-xs sm:text-sm font-medium">
              Every detail of our institute is engineered to bridge the gap between classroom education and high-growth industry careers.
            </p>
          </div>
        </div>

        {/* FULL SCREEN EDGE-TO-EDGE INFINITE SLOW MARQUEE */}
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden select-none py-3 mt-8">
          {/* Edge Fade Shadows */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-28 bg-gradient-to-r from-[#180e29] to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-28 bg-gradient-to-l from-[#0284c7] to-transparent z-10" />

          <div
            className="flex animate-marquee-slow items-stretch gap-4 sm:gap-5 pr-4 sm:pr-5"
            style={{ animationDuration: '65s' }}
          >
            {[...whyChoosePoints, ...whyChoosePoints].map((point, i) => (
              <div
                key={`${point.title}-${i}`}
                className="w-[290px] sm:w-[330px] lg:w-[350px] bg-[#22123d]/90 dark:bg-[#1a0e30]/90 backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-xl border border-white/25 flex flex-col justify-between shrink-0 min-h-[190px] group hover:border-cyan-300 hover:bg-[#2c184d] transition-all duration-300"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-white/15 text-cyan-300 flex items-center justify-center text-base font-bold border border-white/25 group-hover:bg-white group-hover:text-[#180e29] transition-colors duration-300 shrink-0">
                      <Icon icon={point.icon} />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white leading-snug tracking-tight group-hover:text-cyan-300 transition-colors">
                      {point.title}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-[13px] text-slate-100/95 leading-relaxed font-normal">
                    {point.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 & 4. COMBINED METHODOLOGY & WHO CAN JOIN QIMD - LIGHT GRADIENT */}
      <section
        className="py-16 lg:py-24 border-y border-slate-200/80 dark:border-dark_border relative overflow-hidden text-midnight_text"
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #ffffff 40%, #e8dcff 75%, #c8e0fe 100%)',
        }}
      >
        <div className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#764DFF]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-[#38bdf8]/10 blur-3xl" />

        <div className="container mx-auto max-w-7xl px-4 lg:px-8 space-y-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto space-y-2" data-aos="fade-up">
            <span className="text-xs font-bold uppercase tracking-widest text-[#764DFF]">Structured Framework</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111827] dark:text-white tracking-tight">
              Learning Journey &amp; Eligibility
            </h2>
            <p className="text-slate-600 dark:text-white/70 text-xs sm:text-sm font-medium">
              We ensure every student gains practical knowledge through continuous implementation.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch pt-2">
            
            {/* Left Column: Our Learning Methodology */}
            <div className="space-y-4 bg-white dark:bg-darklight p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-dark_border shadow-sm flex flex-col justify-between h-full">
              <div className="flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-dark_border">
                <div className="w-9 h-9 rounded-xl bg-[#764DFF]/10 text-[#764DFF] flex items-center justify-center text-lg font-bold shrink-0">
                  <Icon icon="mdi:school-outline" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#111827] dark:text-white leading-tight">
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
                    className="flex items-center gap-3 p-3 rounded-2xl bg-grey/50 dark:bg-dark border border-slate-200/60 dark:border-dark_border/60 hover:border-[#764DFF]/40 hover:bg-white dark:hover:bg-darklight transition-all group min-h-[50px]"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#764DFF]/10 text-[#764DFF] flex items-center justify-center text-xs font-bold shrink-0 group-hover:bg-[#764DFF] group-hover:text-white transition-colors">
                      {m.step}
                    </div>
                    <div className="flex-1 flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white">
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

            {/* Right Column: Who Can Join QIMD? */}
            <div className="space-y-4 bg-white dark:bg-darklight p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-dark_border shadow-sm flex flex-col justify-between h-full">
              <div className="flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-dark_border">
                <div className="w-9 h-9 rounded-xl bg-[#BD69F2]/10 text-[#BD69F2] flex items-center justify-center text-lg font-bold shrink-0">
                  <Icon icon="mdi:account-group-outline" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#111827] dark:text-white leading-tight">
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
                    className="flex items-center gap-3 p-3 rounded-2xl bg-grey/50 dark:bg-dark border border-slate-200/60 dark:border-dark_border/60 hover:border-[#BD69F2]/40 hover:bg-white dark:hover:bg-darklight transition-all group min-h-[50px]"
                  >
                    <div className="w-6 h-6 rounded-lg bg-[#BD69F2]/10 text-[#BD69F2] flex items-center justify-center text-xs shrink-0 group-hover:bg-[#BD69F2] group-hover:text-white transition-colors">
                      <Icon icon={item.icon} />
                    </div>
                    <div className="flex-1 flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white">
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

      {/* 4. OUR PROMISE — DARK GRADIENT */}
      <section
        className="py-16 sm:py-24 text-white overflow-hidden relative border-y border-white/10"
        style={{
          background: 'linear-gradient(135deg, #180e29 0%, #2b1654 35%, #3e1f7d 70%, #0284c7 100%)',
        }}
      >
        {/* Soft Ambient Background Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#764DFF]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#0284c7]/20 blur-3xl pointer-events-none" />

        <div className="container mx-auto max-w-7xl px-4 lg:px-8 relative z-10">
          <div
            className="relative bg-white/10 dark:bg-white/10 backdrop-blur-md rounded-3xl p-8 sm:p-12 border border-white/20 shadow-2xl max-w-5xl mx-auto overflow-hidden group text-white"
            data-aos="fade-up"
          >
            <div className="relative z-10 space-y-6 text-center">
              
              {/* Header Badge */}
              <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 text-white text-xs font-extrabold px-4 py-1.5 rounded-full shadow-xs backdrop-blur-md">
                <Icon icon="mdi:shield-check" className="text-base text-cyan-300" />
                <span>The QIMD Commitment</span>
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Our Promise to Every Student
              </h2>

              {/* Main Text Content Body */}
              <div className="max-w-3xl mx-auto space-y-3 pt-1 text-slate-200 text-xs sm:text-sm leading-relaxed font-normal">
                <p>
                  At QIMD, we don&apos;t just teach software or concepts. We help you develop practical skills, build confidence, create a professional portfolio, and prepare for real career opportunities.
                </p>
                <p className="text-white font-bold text-sm sm:text-base pt-1">
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
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/15 border border-white/25 text-[11px] font-bold text-white shadow-xs backdrop-blur-md"
                  >
                    <Icon icon={item.icon} className="text-cyan-300" />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 5. WHY WAIT? CLOSING CTA BANNER - TOP-SIDE LIGHT GRADIENT */}
      <section
        className="py-16 sm:py-24 border-t border-slate-200/80 dark:border-dark_border relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #c8e0fe 0%, #e8dcff 25%, #f8f9ff 60%, #ffffff 100%)',
        }}
      >
        <div className="container mx-auto max-w-7xl px-4 lg:px-8 text-center space-y-4 relative z-10" data-aos="fade-up">
          <span className="inline-flex items-center gap-1.5 bg-[#764DFF]/15 border border-[#764DFF]/25 text-[#5c38d6] text-[11px] font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
            <Icon icon="mdi:rocket-launch-outline" className="text-sm text-[#764DFF]" />
            <span>Start Today</span>
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111827] dark:text-white tracking-tight">
            Why Wait?
          </h2>
          <div className="text-slate-700 dark:text-white/80 text-xs sm:text-sm max-w-2xl mx-auto space-y-2 leading-relaxed font-medium">
            <p className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
              Your career deserves more than theoretical knowledge.
            </p>
            <p>
              Join QIMD and learn through AI-powered practical training, live client projects, internships, and expert guidance to become industry-ready from day one.
            </p>
          </div>
          <div className="pt-3 flex flex-wrap justify-center gap-4">
            <Link
              href="/courses"
              className="bg-primary hover:bg-darkprimary text-white font-extrabold text-xs sm:text-sm px-8 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              View All Programs
            </Link>
            <Link
              href="/contact"
              className="bg-white dark:bg-darklight hover:bg-slate-50 text-midnight_text dark:text-white font-extrabold text-xs sm:text-sm px-8 py-3.5 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5"
            >
              Contact Admissions
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

'use client';

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useWebsiteSettings } from "@/app/context/WebsiteSettingsContext";

function StaggeredPopCard({ item, index }: { item: { title: string; icon: string }; index: number }) {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, index * 70);
        } else {
          setIsVisible(false);
        }
      },
      { threshold: 0.05 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [index]);

  return (
    <div
      ref={cardRef}
      suppressHydrationWarning
      style={{
        transitionDuration: '500ms',
        transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
      className={`flex items-center gap-2.5 bg-white/10 hover:bg-white/20 p-3 sm:p-3.5 rounded-2xl border border-white/20 hover:border-cyan-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl transition-all group backdrop-blur-sm cursor-pointer ${
        mounted && isVisible
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-8 scale-75'
      }`}
    >
      <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-cyan-300 shrink-0 shadow-xs border border-white/25 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-cyan-300 group-hover:text-[#180e29] transition-all duration-300">
        <Icon icon={item.icon} className="text-base" />
      </div>

      <span className="text-xs sm:text-sm font-bold text-white leading-snug group-hover:text-cyan-300 transition-colors">
        {item.title}
      </span>
    </div>
  );
}

export default function AboutContent({ dynamicTrainers }: { dynamicTrainers?: any[] } = {}) {
  const { phone } = useWebsiteSettings();
  const contactPhone = phone || "+91 80878 97288";
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  // 1. Learning model 5 steps - directly from doc
  const learningModel = [
    { num: "1", title: "Learn the concept", icon: "mdi:lightbulb-on-outline" },
    { num: "2", title: "Practice it", icon: "mdi:laptop" },
    { num: "3", title: "Apply it on real projects", icon: "mdi:briefcase-outline" },
    { num: "4", title: "Build your portfolio", icon: "mdi:folder-star-outline" },
    { num: "5", title: "Prepare for your career", icon: "mdi:rocket-launch-outline" },
  ];

  // 2. Three Programs - directly from doc
  const programs = [
    {
      title: "AI-Powered Digital Marketing Program",
      level: "Basic to Advanced",
      description: "Learn digital marketing along with modern AI tools and practical industry applications.",
      icon: "mdi:bullhorn-outline",
      watermarkIcon: "mdi:bullhorn-outline",
      color: "from-primary/10 to-primary/5",
      borderColor: "border-primary/30 hover:border-primary",
      iconColor: "text-primary",
    },
    {
      title: "AI-Powered Graphic Design Program",
      level: "Basic to Advanced",
      description: "Learn graphic design, AI-generated creatives and modern AI-powered design tools.",
      icon: "mdi:palette-outline",
      watermarkIcon: "mdi:palette-outline",
      color: "from-[#BD69F2]/10 to-[#BD69F2]/5",
      borderColor: "border-[#BD69F2]/35 hover:border-[#BD69F2]",
      iconColor: "text-[#BD69F2]",
    },
    {
      title: "AI-Powered Video Editing Program",
      level: "Basic to Advanced",
      description: "Learn video editing, AI generation and AI-powered tools used in today's content industry.",
      icon: "mdi:video-film",
      watermarkIcon: "mdi:video-film",
      color: "from-[#4999D4]/10 to-[#4999D4]/5",
      borderColor: "border-[#4999D4]/35 hover:border-[#4999D4]",
      iconColor: "text-[#4999D4]",
    },
  ];

  // 3. Interdisciplinary teams - directly from doc
  const interdisciplinaryTeams = [
    {
      role: "1 Digital Marketing Student",
      icon: "mdi:bullhorn-outline",
      color: "from-[#764DFF]/20 to-[#764DFF]/5",
      borderColor: "border-[#764DFF]/40",
      iconColor: "text-[#a78bfa]",
    },
    {
      role: "1 Graphic Design Student",
      icon: "mdi:palette-outline",
      color: "from-[#BD69F2]/20 to-[#BD69F2]/5",
      borderColor: "border-[#BD69F2]/40",
      iconColor: "text-[#e879f9]",
    },
    {
      role: "1 Video Editing Student",
      icon: "mdi:video-vintage",
      color: "from-[#0284c7]/20 to-[#0284c7]/5",
      borderColor: "border-[#0284c7]/40",
      iconColor: "text-[#38bdf8]",
    },
  ];

  // 4. Real client projects 8 points - directly from doc
  const clientProjectPoints = [
    { title: "How client requirements work", icon: "mdi:file-document-check-outline" },
    { title: "How projects are planned and executed", icon: "mdi:chart-timeline-variant" },
    { title: "How marketing campaigns are managed", icon: "mdi:bullhorn-outline" },
    { title: "How creatives are developed", icon: "mdi:palette-outline" },
    { title: "How videos are created for real businesses", icon: "mdi:video-vintage" },
    { title: "How teams collaborate", icon: "mdi:account-group-outline" },
    { title: "How deadlines and deliverables are handled", icon: "mdi:clock-check-outline" },
    { title: "How professional communication works", icon: "mdi:chat-processing-outline" },
  ];

  // 5. Your Career Journey Starts With QIMD 6 items - directly from doc
  const careerItems = [
    {
      title: "Program Completion Certificate",
      desc: "Recognition of successful completion of the selected program.",
      icon: "mdi:certificate-outline",
      color: "text-[#764DFF]",
      bg: "bg-[#764DFF]/10",
      border: "border-[#764DFF]/20 hover:border-[#764DFF]",
    },
    {
      title: "Internship Certificate",
      desc: "Certification of practical internship experience.",
      icon: "mdi:briefcase-check-outline",
      color: "text-[#BD69F2]",
      bg: "bg-[#BD69F2]/10",
      border: "border-[#BD69F2]/20 hover:border-[#BD69F2]",
    },
    {
      title: "Portfolio Building",
      desc: "Guidance to create a professional portfolio showcasing practical work.",
      icon: "mdi:folder-star-outline",
      color: "text-[#0284c7]",
      bg: "bg-[#0284c7]/10",
      border: "border-[#0284c7]/20 hover:border-[#0284c7]",
    },
    {
      title: "Interview Preparation",
      desc: "Preparation for interviews, communication and professional presentation.",
      icon: "mdi:account-voice",
      color: "text-[#10b981]",
      bg: "bg-[#10b981]/10",
      border: "border-[#10b981]/20 hover:border-[#10b981]",
    },
    {
      title: "Placement Opportunities",
      desc: "Access to placement opportunities with our hiring partners.",
      icon: "mdi:handshake-outline",
      color: "text-[#f59e0b]",
      bg: "bg-[#f59e0b]/10",
      border: "border-[#f59e0b]/20 hover:border-[#f59e0b]",
    },
    {
      title: "Dedicated Student Success Team",
      desc: "Support throughout the learning and career journey.",
      icon: "mdi:account-group-outline",
      color: "text-[#ec4899]",
      bg: "bg-[#ec4899]/10",
      border: "border-[#ec4899]/20 hover:border-[#ec4899]",
    },
  ];

  return (
    <div className="bg-grey dark:bg-dark min-h-screen text-midnight_text dark:text-white">
      
      {/* 1. HERO SECTION: ABOUT QIMD */}
      <section
        className="relative overflow-hidden py-16 sm:py-20 lg:py-24 text-white border-b border-white/10"
        style={{
          background: 'linear-gradient(135deg, #180e29 0%, #2b1654 35%, #3e1f7d 70%, #0284c7 100%)',
        }}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#764DFF]/25 blur-3xl animate-pulse" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#0284c7]/25 blur-3xl" />
        </div>

        <div className="container mx-auto max-w-3xl px-4 relative z-10 text-center space-y-4 text-white" data-aos="fade-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 bg-[#764DFF] text-white text-[11px] font-extrabold px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-md">
            <Icon icon="mdi:shield-check-outline" className="text-sm" />
            <span>India&apos;s Trusted Practical Learning Institute</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-white tracking-tight drop-shadow-md">
            Learn. Practice. Work. <span className="text-cyan-300">Build Your Career.</span>
          </h1>

          {/* Paragraphs */}
          <div className="max-w-2xl mx-auto space-y-3 text-white/95 text-xs sm:text-sm leading-relaxed font-medium">
            <p className="bg-slate-900/75 backdrop-blur-md p-4 sm:p-5 rounded-xl border border-white/15 shadow-xl text-xs sm:text-sm leading-relaxed font-semibold text-white">
              QIMD is built with one clear mission - to bridge the gap between learning and real-world industry experience.
            </p>
            
            <p className="leading-relaxed">
              In today&apos;s rapidly changing digital industry, knowing the theory is not enough. Businesses are looking for professionals who can actually execute campaigns, create designs, edit videos, use AI tools, solve real problems and deliver results.
            </p>
            
            <div className="bg-[#764DFF]/35 backdrop-blur-md p-3.5 sm:p-4 rounded-lg border border-[#764DFF]/45 text-white font-semibold text-xs leading-relaxed shadow-lg">
              <p>
                That&apos;s why at QIMD, we have created a practical, AI-powered learning model where students don&apos;t just learn concepts - they apply them on real projects from Day One.
              </p>
            </div>

            <p className="leading-relaxed">
              Our programs combine structured learning, AI-powered tools, practical assignments, live client projects, industry mentorship and internship experience to help students become industry-ready professionals.
            </p>
          </div>

          {/* Buttons */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/courses"
              className="bg-primary hover:bg-darkprimary text-white font-extrabold text-xs sm:text-sm px-6 sm:px-7 py-3 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2"
            >
              <span>Explore Programs</span>
              <Icon icon="mdi:arrow-right" className="text-sm" />
            </Link>
            <Link
              href={`tel:${contactPhone.replace(/\s+/g, '')}`}
              className="inline-flex items-center gap-2 bg-white dark:bg-darklight hover:bg-slate-50 text-midnight_text dark:text-white font-extrabold text-xs sm:text-sm px-6 py-3 rounded-xl border border-slate-200/80 shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <Icon icon="mdi:phone-in-talk-outline" className="text-base text-[#764DFF]" />
              <span>Talk to Counselor</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. WHY QIMD? & AI-POWERED & PRACTICAL LEARNING */}
      <section
        className="py-14 sm:py-18 border-b border-slate-200/80 dark:border-dark_border relative overflow-hidden text-midnight_text"
        id="why-qimd"
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #ffffff 40%, #e8dcff 75%, #c8e0fe 100%)',
        }}
      >
        <div className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#764DFF]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-[#38bdf8]/10 blur-3xl" />

        <div className="container mx-auto max-w-6xl px-4 lg:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
            
            {/* Card 1: Why QIMD? */}
            <div
              className="relative overflow-hidden rounded-3xl bg-white dark:bg-darklight border border-slate-200/80 dark:border-dark_border p-6 sm:p-7 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              data-aos="fade-right"
            >
              <div className="relative z-10 space-y-3.5 text-left">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 bg-[#764DFF]/15 border border-[#764DFF]/25 text-[#5c38d6] text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                    <Icon icon="mdi:school-outline" className="text-xs text-[#764DFF]" />
                    <span>Why QIMD?</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#111827] dark:text-white tracking-tight mb-1">
                    Why QIMD?
                  </h3>
                  <p className="text-xs sm:text-sm font-bold text-[#764DFF] mb-2.5">
                    Learn. Practice. Work.
                  </p>
                  <div className="space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-white/80 leading-relaxed font-medium">
                    <p>
                      Unlike traditional institutes that primarily focus on classroom-based theoretical learning, QIMD follows a <strong className="text-slate-900 dark:text-white font-bold">theory + practical + real-project approach</strong>.
                    </p>
                    <p>
                      With one session focused on understanding the concepts and the next focused on practical implementation, students get a deeper understanding of how things actually work in the industry.
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-5 pt-3.5 border-t border-slate-100 dark:border-dark_border">
                <div className="border-l-3 border-[#764DFF] pl-3 py-0.5 bg-[#764DFF]/5 rounded-r-xl">
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                    Our learning model is simple: <span className="text-[#764DFF] font-bold">Learn the concept &rarr; Practice it &rarr; Apply it on real projects &rarr; Build your portfolio &rarr; Prepare for your career.</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: AI-Powered & Practical Learning */}
            <div
              className="relative overflow-hidden rounded-3xl bg-white dark:bg-darklight border border-slate-200/80 dark:border-dark_border p-6 sm:p-7 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              data-aos="fade-left"
            >
              <div className="relative z-10 space-y-3.5 text-left">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 bg-[#BD69F2]/15 border border-[#BD69F2]/25 text-[#7a23b0] text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                    <Icon icon="mdi:robot-outline" className="text-xs text-[#BD69F2]" />
                    <span>AI-Powered</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#111827] dark:text-white tracking-tight mb-1">
                    AI-Powered &amp; Practical Learning
                  </h3>
                  <p className="text-xs sm:text-sm font-bold text-[#BD69F2] mb-2.5">
                    Modern AI Tools &amp; Workflows
                  </p>
                  <div className="space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-white/80 leading-relaxed font-medium">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      AI is transforming the way digital professionals work.
                    </p>
                    <p>
                      That&apos;s why our programs are designed around the latest AI tools, technologies and industry workflows, helping students understand not only traditional skills but also how AI can be used to improve productivity, creativity and execution.
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-5 pt-3.5 border-t border-slate-100 dark:border-dark_border">
                <div className="border-l-3 border-[#BD69F2] pl-3 py-0.5 bg-[#BD69F2]/5 rounded-r-xl">
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                    Our programs cover <span className="text-[#BD69F2] font-bold">Basic to Advanced levels</span>, making them suitable for beginners as well as learners looking to develop professional skills.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. OUR PROGRAMS */}
      <section className="py-14 sm:py-18 bg-white dark:bg-darklight relative overflow-hidden border-b border-border dark:border-dark_border">
        <div className="pointer-events-none absolute -top-24 left-1/4 w-80 h-80 rounded-full bg-[#764DFF]/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-1/4 w-80 h-80 rounded-full bg-[#4999D4]/5 blur-3xl" />

        <div className="container mx-auto max-w-6xl px-4 space-y-7 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-2" data-aos="fade-up">
            <div className="inline-flex items-center gap-1.5 bg-[#764DFF]/15 border border-[#764DFF]/25 text-[#5c38d6] text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
              <Icon icon="mdi:laptop" className="text-xs text-[#764DFF]" />
              <span>Training Offerings</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#111827] dark:text-white tracking-tight">
              Our Programs
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-white/70 font-medium">
              Industry-driven practical training programs designed to build professional competence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {programs.map((prog, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-dark rounded-3xl border-[1.5px] border-[#764DFF]/25 dark:border-dark_border hover:border-[#764DFF] shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_15px_35px_rgba(118,77,255,0.18)] hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col justify-between p-6 sm:p-7"
                data-aos="fade-up"
                data-aos-delay={idx * 80}
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl bg-[#764DFF]/10 flex items-center justify-center text-lg font-bold ${prog.iconColor} shadow-xs`}>
                      <Icon icon={prog.icon} />
                    </div>
                    <span className="inline-block bg-[#764DFF]/10 dark:bg-[#764DFF]/20 text-[#764DFF] dark:text-[#a78bfa] text-[11px] font-bold px-3 py-1 rounded-full border border-[#764DFF]/20">
                      {prog.level}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-extrabold text-midnight_text dark:text-white leading-tight">
                    {prog.title}
                  </h3>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-darklight border border-slate-200/80 dark:border-dark_border">
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-white/80 leading-relaxed font-medium">
                      <strong className="text-slate-900 dark:text-white">{prog.level}</strong> - {prog.description.replace(/^Basic to Advanced -\s*/i, '')}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-dark_border">
                  <Link
                    href="/courses"
                    className="inline-flex items-center justify-center gap-2 text-center w-full bg-primary hover:bg-darkprimary text-white font-extrabold text-xs sm:text-sm py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg"
                  >
                    <span>View Program Details</span>
                    <Icon icon="mdi:arrow-right" className="text-sm" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. 6 MONTHS LEARNING + 3 MONTHS INTERNSHIP */}
      <section
        className="py-14 sm:py-18 text-white relative overflow-hidden border-y border-white/10"
        style={{
          background: 'linear-gradient(135deg, #180e29 0%, #2b1654 35%, #3e1f7d 70%, #0284c7 100%)',
        }}
      >
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#764DFF]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#0284c7]/20 blur-3xl pointer-events-none" />

        <div className="container mx-auto max-w-3xl px-4 relative z-10 text-center space-y-3.5 text-white" data-aos="fade-up">
          <div className="inline-flex items-center gap-1.5 bg-white/15 text-white text-[11px] font-extrabold px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-md">
            <Icon icon="mdi:calendar-clock-outline" className="text-cyan-300 text-sm" />
            <span>Program Duration &amp; Structure</span>
          </div>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
            6 Months Learning + 3 Months Internship
          </h2>

          <div className="max-w-2xl mx-auto space-y-3 text-white/95 text-xs sm:text-sm leading-relaxed font-medium">
            <p className="text-xs sm:text-sm leading-relaxed font-medium text-slate-200">
              At QIMD, learning doesn&apos;t stop when the classroom sessions end.
            </p>

            <div className="bg-[#764DFF]/35 backdrop-blur-md p-3.5 sm:p-4 rounded-lg border border-[#764DFF]/45 text-white font-semibold text-xs sm:text-sm leading-relaxed shadow-lg">
              <p className="font-bold text-cyan-300">
                Our program includes: 6 Months of Practical Training + 3 Months of Internship.
              </p>
            </div>

            <div className="bg-slate-900/75 backdrop-blur-md p-4 sm:p-5 rounded-xl border border-white/15 shadow-xl text-xs sm:text-sm leading-relaxed space-y-2">
              <p className="font-bold text-white">
                Most importantly, students start working on practical projects from Day One.
              </p>
              <p className="text-slate-200">
                The objective is to ensure that by the time students complete the program, they have more than just a certificate - they have actual experience, project exposure and a professional portfolio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. LEARN THROUGH REAL CLIENT PROJECTS */}
      <section
        className="py-14 sm:py-18 text-white relative overflow-hidden border-b border-white/10"
        id="real-client-projects"
        style={{
          background: 'linear-gradient(135deg, #180e29 0%, #2b1654 35%, #3e1f7d 70%, #0284c7 100%)',
        }}
      >
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#764DFF]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#0284c7]/20 blur-3xl pointer-events-none" />

        <div className="container mx-auto max-w-6xl px-4 space-y-7 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-2" data-aos="fade-up">
            <div className="inline-flex items-center gap-1.5 bg-white/15 text-white text-[11px] font-extrabold px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-md">
              <Icon icon="mdi:earth" className="text-cyan-300 text-sm" />
              <span>Domestic &amp; Global Projects</span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
              Learn Through Real Client Projects
            </h2>

            <p className="text-xs sm:text-sm font-bold text-cyan-300">
              This is what makes the QIMD learning model different.
            </p>

            <p className="text-xs sm:text-sm text-slate-200 max-w-2xl mx-auto leading-relaxed font-normal">
              During the internship phase, students get exposure to both domestic and global projects.
            </p>
          </div>

          {/* Interdisciplinary Teams directly from doc */}
          <div className="bg-white/10 backdrop-blur-md p-5 sm:p-6 rounded-2xl border border-white/15 shadow-xl space-y-4" data-aos="fade-up">
            <div className="text-center max-w-2xl mx-auto">
              <h3 className="text-sm sm:text-base font-extrabold text-white leading-tight">
                With the launch of our three programs, we are creating interdisciplinary teams consisting of:
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-stretch">
              {interdisciplinaryTeams.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl bg-gradient-to-b ${item.color} border ${item.borderColor} flex items-center gap-3 hover:-translate-y-1 transition-all duration-300 shadow-sm`}
                >
                  <div className={`w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-base ${item.iconColor} shrink-0`}>
                    <Icon icon={item.icon} />
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">
                    {item.role}
                  </h4>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-center space-y-1">
              <p className="text-xs sm:text-sm font-bold text-cyan-200">
                Teams can work together on 2-3 client projects.
              </p>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                These teams get an opportunity to experience how different creative and marketing functions work together in a real business environment.
              </p>
            </div>
          </div>

          {/* 8 Opportunity points directly from doc */}
          <div className="space-y-3.5" data-aos="fade-up">
            <div className="text-center space-y-1 max-w-2xl mx-auto">
              <h3 className="text-sm sm:text-base font-extrabold text-white leading-tight">
                Students don&apos;t simply complete classroom assignments.
              </h3>
              <p className="text-xs text-slate-200">
                They get the opportunity to understand:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {clientProjectPoints.map((item, idx) => (
                <StaggeredPopCard key={idx} item={item} index={idx} />
              ))}
            </div>

            {/* Goal note directly from doc */}
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-center max-w-2xl mx-auto shadow-md">
              <p className="text-xs sm:text-sm font-extrabold text-cyan-300 tracking-wide">
                Our goal is simple: give students real-world experience before they start their careers.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 6. BUILD A PORTFOLIO, NOT JUST A CERTIFICATE */}
      <section
        className="py-14 sm:py-18 border-b border-slate-200/80 dark:border-dark_border relative overflow-hidden text-midnight_text"
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #ffffff 40%, #e8dcff 75%, #c8e0fe 100%)',
        }}
      >
        <div className="container mx-auto max-w-3xl px-4 space-y-3.5 text-center relative z-10" data-aos="fade-up">
          <div className="inline-flex items-center gap-1.5 bg-[#764DFF]/15 border border-[#764DFF]/25 text-[#5c38d6] text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
            <Icon icon="mdi:folder-star-outline" className="text-xs text-[#764DFF]" />
            <span>Practical Proof of Work</span>
          </div>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#111827] dark:text-white tracking-tight">
            Build a Portfolio, Not Just a Certificate
          </h2>

          <p className="text-xs sm:text-sm font-bold text-[#764DFF]">
            A certificate can show that you completed a program. A portfolio can show what you can actually do.
          </p>

          <div className="space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-white/80 leading-relaxed font-medium pt-1">
            <p>
              At QIMD, we help students build a professional portfolio based on the projects and work they complete during their learning and internship journey.
            </p>
            <p>
              This portfolio can become an important asset when applying for jobs, internships, freelance projects, agency opportunities and client work.
            </p>
            <div className="border-l-3 border-[#764DFF] pl-3 py-0.5 bg-white/70 dark:bg-darklight rounded-r-xl inline-block text-left">
              <p className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                Students finish their journey with work they can actually showcase.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. YOUR CAREER JOURNEY STARTS WITH QIMD */}
      <section className="py-14 sm:py-18 bg-grey dark:bg-dark relative overflow-hidden border-b border-border dark:border-dark_border">
        <div className="container mx-auto max-w-6xl px-4 space-y-7 relative z-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-2" data-aos="fade-up">
            <div className="inline-flex items-center gap-1.5 bg-[#764DFF]/15 border border-[#764DFF]/25 text-[#5c38d6] text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
              <Icon icon="mdi:school-outline" className="text-xs text-[#764DFF]" />
              <span>Career Roadmap</span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-midnight_text dark:text-white tracking-tight">
              Your Career Journey Starts With QIMD
            </h2>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-white/80 font-medium">
              We don&apos;t want students to simply complete a program. We want them to be ready to enter the industry.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 items-stretch" data-aos="fade-up">
            {careerItems.map((item, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-darklight rounded-2xl border border-slate-200/80 dark:border-dark_border hover:border-[#764DFF] p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className={`w-9 h-9 rounded-xl ${item.bg} ${item.color} flex items-center justify-center text-lg shadow-xs`}>
                    <Icon icon={item.icon} />
                  </div>

                  <h3 className="text-sm sm:text-base font-extrabold text-midnight_text dark:text-white leading-tight">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 8. OUR VISION & OUR MISSION */}
      <section
        className="py-14 sm:py-18 border-b border-slate-200/80 dark:border-dark_border relative overflow-hidden text-midnight_text"
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #ffffff 40%, #e8dcff 75%, #c8e0fe 100%)',
        }}
      >
        <div className="container mx-auto max-w-6xl px-4 space-y-7">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
            
            {/* Our Vision Card */}
            <div
              className="relative overflow-hidden rounded-3xl bg-white dark:bg-darklight border border-slate-200/80 dark:border-dark_border p-6 sm:p-7 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              data-aos="fade-right"
            >
              <div className="relative z-10 space-y-3 text-left">
                <div className="inline-flex items-center gap-1.5 bg-[#764DFF]/15 border border-[#764DFF]/25 text-[#5c38d6] text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                  <Icon icon="mdi:eye-outline" className="text-xs text-[#764DFF]" />
                  <span>Our Vision</span>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#111827] dark:text-white tracking-tight leading-snug mb-1.5">
                    From Learning to Real-World Experience
                  </h3>
                  <div className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-white/80 leading-relaxed font-medium">
                    <p>
                      We identified a major gap in the traditional education and training system: students learn concepts, but often don&apos;t get enough opportunities to apply them in real-world situations.
                    </p>
                    <p>
                      At the same time, the digital industry is rapidly evolving with AI, automation and new-age tools.
                    </p>
                    <p>
                      We believe students deserve an education model that prepares them for this reality.
                    </p>
                    <p>
                      That&apos;s why QIMD is built around AI-powered, practical and industry-oriented learning.
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-5 pt-3.5 border-t border-slate-100 dark:border-dark_border">
                <div className="border-l-3 border-[#764DFF] pl-3 py-0.5 bg-[#764DFF]/5 rounded-r-xl">
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                    Our vision is to create professionals who don&apos;t just say: &ldquo;I have completed a program.&rdquo; But can confidently say: &ldquo;I know how to do the work.&rdquo;
                  </p>
                </div>
              </div>
            </div>

            {/* Our Mission Card - Spread Wisely with balanced vertical height */}
            <div
              className="relative overflow-hidden rounded-3xl bg-white dark:bg-darklight border border-slate-200/80 dark:border-dark_border p-6 sm:p-7 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              data-aos="fade-left"
            >
              <div className="relative z-10 space-y-3 text-left">
                <div className="inline-flex items-center gap-1.5 bg-[#BD69F2]/15 border border-[#BD69F2]/25 text-[#7a23b0] text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                  <Icon icon="mdi:target" className="text-xs text-[#BD69F2]" />
                  <span>Our Mission</span>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#111827] dark:text-white tracking-tight leading-snug mb-1.5">
                    Our Mission
                  </h3>
                  <div className="space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-white/80 leading-relaxed font-medium">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      To make students industry-ready before they begin their professional careers.
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-[#7a23b0] dark:text-[#d4a0f7]">
                      We aim to achieve this by combining:
                    </p>
                    
                    {/* Mission Formula - 2 column balanced cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {[
                        { title: "Practical Learning", icon: "mdi:laptop" },
                        { title: "AI Tools", icon: "mdi:robot-outline" },
                        { title: "Live Projects", icon: "mdi:briefcase-outline" },
                        { title: "Internship Experience", icon: "mdi:account-tie" },
                        { title: "Portfolio Building", icon: "mdi:folder-star-outline" },
                        { title: "Career Preparation", icon: "mdi:rocket-launch-outline" },
                      ].map((pillar, pIdx) => (
                        <div
                          key={pIdx}
                          className="flex items-center gap-2 bg-slate-50 dark:bg-dark p-2 rounded-xl border border-[#BD69F2]/20 hover:border-[#BD69F2]/50 text-left transition-all shadow-2xs group/pill"
                        >
                          <div className="w-6 h-6 rounded-lg bg-[#BD69F2]/10 text-[#BD69F2] flex items-center justify-center text-xs shrink-0 font-bold group-hover/pill:bg-[#BD69F2] group-hover/pill:text-white transition-colors">
                            <Icon icon={pillar.icon} />
                          </div>
                          <span className="font-bold text-xs text-slate-800 dark:text-white">
                            {pillar.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-5 pt-3.5 border-t border-slate-100 dark:border-dark_border">
                <div className="border-l-3 border-[#BD69F2] pl-3 py-0.5 bg-[#BD69F2]/5 rounded-r-xl">
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                    Because we believe the best way to learn a skill is not just to study it - but to actually use it.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 9. CLOSING SECTION: INLINE EMBEDDED VIDEO CARD & LAUNCH YOUR CAREER CTA */}
      <section
        className="relative overflow-hidden py-14 sm:py-20 text-midnight_text border-t border-slate-200/80 dark:border-dark_border"
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #ffffff 40%, #e8dcff 75%, #c8e0fe 100%)',
        }}
      >
        <div className="pointer-events-none absolute -top-20 -left-20 w-72 h-72 rounded-full bg-[#764DFF]/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-[#38bdf8]/10 blur-2xl" />

        <div className="container mx-auto max-w-4xl px-4 space-y-10 relative z-10" data-aos="fade-up">
          
          {/* SEAMLESS INLINE VIDEO CARD (PLAYS DIRECTLY IN CARD, NO POPUP) */}
          <div className="max-w-3xl mx-auto">
            <div className="group relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-dark_border bg-slate-950 aspect-video w-full transition-all duration-300 hover:shadow-[0_20px_50px_rgba(118,77,255,0.25)]">
              {isPlayingVideo ? (
                <iframe
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0"
                  title="QIMD Institute - Practical Learning Experience"
                  className="w-full h-full border-0 rounded-3xl"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div
                  onClick={() => setIsPlayingVideo(true)}
                  className="relative w-full h-full cursor-pointer"
                >
                  {/* Background Video Poster */}
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80"
                    alt="QIMD Practical Learning & Campus Experience"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                  {/* Glowing Animated Play Button */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <div className="relative">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#764DFF] text-white flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-[#5c38d6] transition-all duration-300">
                        <Icon icon="mdi:play" className="text-3xl sm:text-4xl translate-x-0.5" />
                      </div>
                      <div className="absolute inset-0 rounded-full bg-[#764DFF]/40 animate-ping pointer-events-none" />
                    </div>

                    <span className="text-xs sm:text-sm font-extrabold text-white bg-slate-900/80 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/20 shadow-md">
                      Click to Play Video
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* LAUNCH YOUR CAREER CONTENT WITHIN SAME SECTION */}
          <div className="max-w-3xl mx-auto text-center space-y-3.5">
            <span className="inline-flex items-center gap-1.5 bg-[#764DFF]/15 border border-[#764DFF]/25 text-[#5c38d6] text-[11px] font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
              <Icon icon="mdi:rocket-launch-outline" className="text-sm text-[#764DFF]" />
              <span>Launch Your Career</span>
            </span>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#111827] dark:text-white tracking-tight leading-snug">
              QIMD - Learn. Practice. Work. Launch Your Career.
            </h2>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-white/80 max-w-2xl mx-auto leading-relaxed font-medium">
              Don&apos;t just learn skills. Build experience. Build your portfolio. Build your confidence. Get ready for the real industry with QIMD.
            </p>

            <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white tracking-wide pt-0.5">
              Build Skills. Gain Experience. Launch Your Career with QIMD.
            </p>

            <div className="pt-2.5 flex flex-wrap items-center justify-center gap-3.5">
              <Link
                href="/courses"
                className="bg-primary hover:bg-darkprimary text-white font-extrabold text-xs sm:text-sm px-6 sm:px-7 py-3 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                Explore Programs
              </Link>
              <Link
                href={`tel:${contactPhone.replace(/\s+/g, '')}`}
                className="inline-flex items-center gap-2 bg-white dark:bg-darklight hover:bg-slate-50 text-midnight_text dark:text-white font-extrabold text-xs sm:text-sm px-5 py-3 rounded-xl border border-slate-200/80 shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                <Icon icon="mdi:phone" className="text-base text-[#764DFF]" />
                <span className="text-midnight_text dark:text-white font-extrabold tracking-wide">{contactPhone}</span>
              </Link>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}

'use client';

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useWebsiteSettings } from "@/app/context/WebsiteSettingsContext";
import EnquiryForm from "@/components/Common/EnquiryForm";

function CounterItem({ stat }: { stat: { value: string; label: string } }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const isPercentage = stat.value.includes('%');
  const isPlus = stat.value.includes('+');
  const numericValue = parseInt(stat.value.replace(/[^0-9]/g, '')) || 0;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            const duration = 3000; // 3 seconds for clear, smooth counting
            const startTime = performance.now();

            const animate = (currentTime: number) => {
              const elapsedTime = currentTime - startTime;
              const progress = Math.min(elapsedTime / duration, 1);
              // Smooth easeOutExpo curve
              const easeOutProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
              const currentCount = Math.floor(easeOutProgress * numericValue);

              setCount(currentCount);

              if (progress < 1) {
                requestAnimationFrame(animate);
              } else {
                setCount(numericValue);
              }
            };

            requestAnimationFrame(animate);
          }
        });
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasAnimated, numericValue]);

  return (
    <div ref={ref} className="text-center p-3.5 sm:p-4 rounded-xl bg-white/70 dark:bg-darklight/80 border border-white/80 dark:border-dark_border shadow-sm transition-transform duration-300 hover:-translate-y-0.5">
      <div className="text-2xl sm:text-3xl font-extrabold text-[#764DFF] mb-1 tracking-tight" suppressHydrationWarning>
        {hasAnimated ? `${count.toLocaleString()}${isPlus ? '+' : ''}${isPercentage ? '%' : ''}` : '0'}
      </div>
      <div className="text-xs sm:text-sm text-[#374151] dark:text-white/80 font-bold leading-tight">{stat.label}</div>
    </div>
  );
}

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
          }, index * 90);
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
      className={`flex items-center gap-3 bg-white/10 hover:bg-white/20 p-3.5 rounded-2xl border border-white/20 hover:border-cyan-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl transition-all group backdrop-blur-sm ${
        mounted && isVisible
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-8 scale-75'
      }`}
    >
      <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-cyan-300 shrink-0 shadow-2xs border border-white/25 group-hover:scale-110 transition-transform">
        <Icon icon={item.icon} className="text-base text-cyan-300" />
      </div>

      <span className="text-xs font-bold text-white leading-snug group-hover:text-cyan-300 transition-colors">
        {item.title}
      </span>
    </div>
  );
}

export default function AboutContent({ dynamicTrainers }: { dynamicTrainers?: any[] }) {
  const { phone } = useWebsiteSettings();
  const contactPhone = phone || "+91 80878 97288";

  const staticTeamMembers = [
    {
      name: "Industry Lead Mentor",
      role: "Digital Marketing & Performance Growth Lead",
      photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
      bio: "10+ years driving multi-channel ROI campaigns, SEO growth architectures, and performance ad strategies for agency clients.",
      linkedin: "#",
    },
    {
      name: "Creative Art Director",
      role: "Brand Identity & Graphic Design Lead",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
      bio: "12+ years shaping visual communications, D2C packaging designs, and AI-driven creative workflows.",
      linkedin: "#",
    },
    {
      name: "Head of Video Production",
      role: "Video Editing & VFX Specialist",
      photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
      bio: "8+ years in commercial video editing, DaVinci Resolve color grading, and viral short-form reel productions.",
      linkedin: "#",
    },
    {
      name: "Student Placement Lead",
      role: "Career Development & Hiring Specialist",
      photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80",
      bio: "Dedicated placement director connecting QIMD candidates directly with 50+ hiring partner agencies across Pune & India.",
      linkedin: "#",
    },
  ];

  const dbTeamMembers = (dynamicTrainers || []).filter((t) => {
    return (
      t.category === 'GENERAL' ||
      (t.designation &&
        (t.designation.toLowerCase().includes('lead') ||
          t.designation.toLowerCase().includes('director') ||
          t.designation.toLowerCase().includes('head') ||
          t.designation.toLowerCase().includes('founder') ||
          t.designation.toLowerCase().includes('counsellor')))
    );
  });

  const teamMembers = dbTeamMembers.length > 0
    ? dbTeamMembers.slice(0, 4).map((t) => ({
        name: t.name,
        role: t.designation || 'Faculty & Mentor',
        photo: t.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
        bio: t.biography || `${t.qualification || 'Experienced professional'} with ${t.experience || 'extensive'} practical experience.`,
        linkedin: t.linkedin || '#',
      }))
    : staticTeamMembers;

  const offerings = [
    "AI-Powered Industry Curriculum",
    "Offline Classroom Training",
    "Live Client Projects",
    "Internship Opportunities",
    "Industry Expert Mentorship",
    "Portfolio Development",
    "Resume Building & Interview Preparation",
    "Placement Assistance",
    "Hiring Partner Opportunities",
    "Certifications",
    "Career Guidance",
  ];

  const differPoints = [
    {
      title: "AI-Powered & Performance-Driven Curriculum",
      icon: "mdi:robot",
    },
    {
      title: "100% Live Project-Based Learning",
      icon: "mdi:laptop",
    },
    {
      title: "Offline Practical Classroom Training",
      icon: "mdi:school",
    },
    {
      title: "Industry Expert Mentors",
      icon: "mdi:account-tie",
    },
    {
      title: "Real Client Project Experience",
      icon: "mdi:briefcase-check",
    },
    {
      title: "Internship Opportunities",
      icon: "mdi:certificate",
    },
    {
      title: "Portfolio Development",
      icon: "mdi:palette",
    },
    {
      title: "Career Counselling",
      icon: "mdi:headset",
    },
    {
      title: "Resume & Interview Preparation",
      icon: "mdi:file-document-outline",
    },
    {
      title: "Placement Assistance",
      icon: "mdi:handshake",
    },
    {
      title: "Hiring Partner Opportunities",
      icon: "mdi:domain",
    },
    {
      title: "Small Batch Sizes for Better Mentorship",
      icon: "mdi:account-group",
    },
    {
      title: "Modern Learning Infrastructure",
      icon: "mdi:monitor",
    },
    {
      title: "Industry-Relevant Curriculum Updated Regularly",
      icon: "mdi:sync",
    },
  ];

  const programs = [
    {
      title: "AI-Powered Digital Marketing Program",
      icon: "mdi:bullhorn-outline",
      watermarkIcon: "mdi:crosshairs-gps",
      color: "from-primary/10 to-primary/5",
      borderColor: "border-primary/30 hover:border-primary",
      shadowClass: "shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_15px_35px_rgba(118,77,255,0.18)]",
      iconColor: "text-primary",
      sub: "Master the complete digital marketing ecosystem with practical implementation.",
      skills: [
        "AI-Powered Marketing",
        "SEO & GEO Optimization",
        "Google Ads",
        "Meta Ads",
        "Social Media Marketing",
        "Content Marketing",
        "Email Marketing",
        "Analytics & Reporting",
        "Performance Marketing",
        "Lead Generation",
        "Marketing Automation",
        "Freelancing & Agency Skills",
      ],
    },
    {
      title: "AI-Powered Graphic Design Program",
      icon: "mdi:palette-outline",
      watermarkIcon: "mdi:vector-bezier",
      color: "from-[#BD69F2]/10 to-[#BD69F2]/5",
      borderColor: "border-[#BD69F2]/35 hover:border-[#BD69F2]",
      shadowClass: "shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_15px_35px_rgba(189,105,242,0.18)]",
      iconColor: "text-[#BD69F2]",
      sub: "Learn to create impactful visual designs using industry-leading software and AI-powered creative tools.",
      skills: [
        "Design Fundamentals",
        "Branding & Identity Design",
        "Social Media Creatives",
        "Print Design",
        "UI Design Basics",
        "Adobe Photoshop",
        "Adobe Illustrator",
        "Adobe InDesign",
        "AI Design Tools",
        "Portfolio Development",
      ],
    },
    {
      title: "AI-Powered Video Editing Program",
      icon: "mdi:video-film",
      watermarkIcon: "mdi:filmstrip",
      color: "from-[#4999D4]/10 to-[#4999D4]/5",
      borderColor: "border-[#4999D4]/35 hover:border-[#4999D4]",
      shadowClass: "shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_15px_35px_rgba(73,153,212,0.18)]",
      iconColor: "text-[#4999D4]",
      sub: "Build professional video editing skills for social media, YouTube, brands, and businesses.",
      skills: [
        "Adobe Premiere Pro",
        "After Effects",
        "Motion Graphics",
        "Reels & Shorts Editing",
        "YouTube Video Editing",
        "Corporate Video Editing",
        "Color Grading",
        "Sound Design",
        "AI Video Editing Tools",
        "Client Project Workflow",
      ],
    },
  ];

  const stats = [
    { value: "10000+", label: "Candidates Trained" },
    { value: "100%", label: "Placement Assistance" },
    { value: "100%", label: "Live Project-Based Practical Learning" },
  ];

  return (
    <div className="bg-grey dark:bg-dark min-h-screen text-midnight_text dark:text-white">
      
      {/* 1. HERO HEADER SECTION - DARK GRADIENT */}
      <section
        className="relative overflow-hidden py-12 sm:py-16 text-white border-b border-white/10"
        style={{
          background: 'linear-gradient(135deg, #180e29 0%, #2b1654 35%, #3e1f7d 70%, #0284c7 100%)',
        }}
      >
        {/* Subtle glow / depth overlays */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-[#764DFF]/20 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-[#0284c7]/20 blur-3xl" />
        </div>

        <div className="container mx-auto max-w-4xl px-4 relative z-10">
          <div className="text-center space-y-4" data-aos="fade-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 bg-white/15 text-white border border-white/25 text-xs font-bold px-3.5 py-1.5 rounded-full shadow-xs mx-auto backdrop-blur-md">
              <Icon icon="mdi:school-outline" className="text-sm text-cyan-300" />
              <span>About QIMD - Quickupp Institute of Marketing &amp; Design</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Learn Today. <span className="text-cyan-300">Lead Tomorrow.</span>
            </h1>

            {/* Body Text */}
            <div className="space-y-3 text-slate-200 text-xs sm:text-sm leading-relaxed font-normal">
              <p className="font-semibold text-sm sm:text-base text-white leading-snug max-w-3xl mx-auto">
                At QIMD (Quickupp Institute of Marketing &amp; Design), we are committed to building the next generation of digital professionals through AI-powered, practical, and industry-driven education. Our programs in Digital Marketing, Graphic Design, and Video Editing are designed to bridge the gap between classroom learning and real-world industry requirements.
              </p>
              <p className="max-w-3xl mx-auto">
                Unlike traditional institutes, we focus on 100% live project-based learning, where students gain practical experience by working on real client projects under the guidance of industry experts. Every program is built to help students develop in-demand skills, build a strong portfolio, and become job-ready from day one.
              </p>
              <div className="bg-white/10 backdrop-blur-md p-3 sm:p-3.5 rounded-xl border border-white/20 max-w-3xl mx-auto">
                <p className="text-xs text-slate-200 font-semibold italic">
                  With internship opportunities, expert mentorship, placement assistance, and hiring partner opportunities, QIMD empowers students to confidently launch and grow their careers in the digital industry.
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/courses"
                className="bg-gradient-to-r from-[#764DFF] via-[#8b5cf6] to-[#0284c7] hover:opacity-95 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-xl hover:-translate-y-0.5"
              >
                Explore Programs
              </Link>
              <Link
                href={`tel:${contactPhone.replace(/\s+/g, '')}`}
                className="bg-white hover:bg-slate-100 text-[#180e29] font-extrabold px-6 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-xl hover:-translate-y-0.5"
              >
                Talk to Counselor
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. OUR IMPACT - STATS COUNTING CARDS (MATCHING HOME PAGE) */}
      <section className="py-8 sm:py-10 bg-white dark:bg-darklight border-b border-border dark:border-dark_border">
        <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {stats.map((stat, i) => (
              <CounterItem key={i} stat={stat} />
            ))}
          </div>
        </div>
      </section>

      {/* 3. OUR MOTIVE & OUR DREAM - DISTINCT & PREMIUM DESIGN */}
      <section
        className="section-py relative overflow-hidden border-b border-slate-200/80 dark:border-dark_border"
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #ffffff 40%, #f0e8ff 70%, #dcecfe 100%)',
        }}
      >
        <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
            
            {/* Our Motive Card */}
            <div
              className="relative overflow-hidden rounded-3xl bg-white dark:bg-darklight border border-[#764DFF]/30 p-7 sm:p-8 flex flex-col justify-between shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group"
              data-aos="fade-up"
            >
              {/* Background Glow Accent & Decorative Watermark */}
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#764DFF]/10 blur-3xl pointer-events-none group-hover:bg-[#764DFF]/15 transition-all" />
              <Icon icon="mdi:target" className="absolute -right-6 -bottom-6 text-9xl text-[#764DFF]/5 dark:text-white/5 pointer-events-none transition-transform duration-500 group-hover:scale-110" />

              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#764DFF] to-[#5c38d6] text-white flex items-center justify-center text-2xl font-bold shadow-md">
                    <Icon icon="mdi:target" />
                  </div>
                  <span className="text-[11px] font-extrabold uppercase tracking-widest bg-[#764DFF]/10 text-[#764DFF] px-3 py-1 rounded-full border border-[#764DFF]/20">
                    Our Motive
                  </span>
                </div>

                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-midnight_text dark:text-white tracking-tight mb-2">
                    Bridging the Practical Experience Gap
                  </h2>
                  <p className="text-xs sm:text-sm text-muted dark:text-white/70 leading-relaxed font-medium mb-3">
                    The digital industry is evolving faster than ever, yet many graduates struggle to secure jobs because they lack practical experience.
                  </p>
                  <p className="text-xs sm:text-sm text-muted dark:text-white/70 leading-relaxed font-medium">
                    QIMD was founded to solve this challenge by creating a learning environment where students don&apos;t just study—they build, create, market, design, and execute real projects.
                  </p>
                </div>
              </div>

              <div className="relative z-10 mt-6 pt-4 border-t border-[#764DFF]/15">
                <div className="bg-[#764DFF]/10 dark:bg-dark border-l-4 border-[#764DFF] p-4 rounded-r-2xl">
                  <div className="flex items-start gap-2.5">
                    <Icon icon="mdi:bullseye-arrow" className="text-[#764DFF] text-lg shrink-0 mt-0.5" />
                    <p className="text-xs font-bold text-[#3d1c99] dark:text-[#9b7bff] leading-snug">
                      Our Mission: To make quality, practical, AI-powered education accessible to every aspiring professional and help them become confident, skilled, and industry-ready.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Our Dream Card */}
            <div
              className="relative overflow-hidden rounded-3xl bg-white dark:bg-darklight border border-[#BD69F2]/30 p-7 sm:p-8 flex flex-col justify-between shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group"
              data-aos="fade-up"
              data-aos-delay="150"
            >
              {/* Background Glow Accent & Decorative Watermark */}
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#BD69F2]/10 blur-3xl pointer-events-none group-hover:bg-[#BD69F2]/15 transition-all" />
              <Icon icon="mdi:lightbulb-on-outline" className="absolute -right-6 -bottom-6 text-9xl text-[#BD69F2]/5 dark:text-white/5 pointer-events-none transition-transform duration-500 group-hover:scale-110" />

              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#BD69F2] to-[#9b49d6] text-white flex items-center justify-center text-2xl font-bold shadow-md">
                    <Icon icon="mdi:lightbulb-on-outline" />
                  </div>
                  <span className="text-[11px] font-extrabold uppercase tracking-widest bg-[#BD69F2]/10 text-[#BD69F2] px-3 py-1 rounded-full border border-[#BD69F2]/20">
                    Our Dream
                  </span>
                </div>

                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-midnight_text dark:text-white tracking-tight mb-2">
                    India&apos;s Most Trusted Practical Institute
                  </h2>
                  <p className="text-xs sm:text-sm text-muted dark:text-white/70 leading-relaxed font-medium mb-3">
                    Our dream is to create India&apos;s most trusted practical learning institute by training the next generation of marketers, designers, and creative professionals.
                  </p>
                  <p className="text-xs sm:text-sm text-muted dark:text-white/70 leading-relaxed font-medium">
                    We aim to empower 10,000+ students with industry-relevant skills, practical experience, and career opportunities while building a strong ecosystem of learners, mentors, agencies, and hiring partners.
                  </p>
                </div>
              </div>

              <div className="relative z-10 mt-6 pt-4 border-t border-[#BD69F2]/15">
                <div className="bg-[#BD69F2]/10 dark:bg-dark border-l-4 border-[#BD69F2] p-4 rounded-r-2xl">
                  <div className="flex items-start gap-2.5">
                    <Icon icon="mdi:star-four-points" className="text-[#BD69F2] text-lg shrink-0 mt-0.5" />
                    <p className="text-xs font-bold text-[#7a23b0] dark:text-[#d4a0f7] leading-snug">
                      Our Vision: Empowering 10,000+ learners with real agency experience, direct placements, and lifelong skill mentorship.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4 & 5. WHO ARE WE & WHAT WE OFFER - DARK GRADIENT */}
      <section
        className="py-16 lg:py-20 text-white relative overflow-hidden border-y border-white/10"
        id="who-are-we"
        style={{
          background: 'linear-gradient(135deg, #180e29 0%, #2b1654 35%, #3e1f7d 70%, #0284c7 100%)',
        }}
      >
        {/* Subtle Ambient Glow Background Overlays */}
        <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#764DFF]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#0284c7]/20 blur-3xl" />

        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 items-start">
            
            {/* Left Column: Who Are We? */}
            <div className="lg:col-span-6 space-y-4 lg:pr-8 xl:pr-10" data-aos="fade-right">
              <div className="inline-flex items-center gap-1.5 bg-white/15 border border-white/25 text-white text-[11px] font-extrabold px-3.5 py-1 rounded-full backdrop-blur-md mb-1 shadow-xs">
                <Icon icon="mdi:information-outline" className="text-cyan-300 text-sm" />
                <span>Who Are We?</span>
              </div>
              
              <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                Career-Focused Training by <span className="text-cyan-300">Agency Experts</span>
              </h2>
              
              <p className="text-xs sm:text-sm font-semibold text-white leading-relaxed">
                QIMD is a career-focused training institute established by industry professionals with real agency experience.
              </p>

              {/* Vertical Accent Bar Block */}
              <div className="border-l-2 border-cyan-400/50 pl-3.5 space-y-2.5">
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                  Our mentors work on live projects every day, ensuring students learn the latest AI tools, digital strategies, creative workflows, and industry best practices.
                </p>
                
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                  We believe that practical implementation is the foundation of successful careers, which is why every student learns through real assignments, live client projects, workshops, and hands-on sessions.
                </p>
              </div>
            </div>

            {/* Right Column: What We Offer */}
            <div className="lg:col-span-6 space-y-4 lg:border-l lg:border-white/15 lg:pl-8 xl:pl-10 pt-6 lg:pt-0 border-t lg:border-t-0 border-white/15" data-aos="fade-left">
              <div className="inline-flex items-center gap-1.5 bg-white/15 border border-white/25 text-white text-[11px] font-extrabold px-3.5 py-1 rounded-full backdrop-blur-md mb-1 shadow-xs">
                <Icon icon="mdi:star-outline" className="text-cyan-300 text-sm" />
                <span>What We Offer</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                What We Offer
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 pt-1">
                {offerings.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2.5 py-1.5 border-b border-white/10 group transition-all duration-200"
                  >
                    <div className="w-5 h-5 rounded-full bg-white/15 text-cyan-300 flex items-center justify-center text-xs shrink-0 font-bold group-hover:bg-white group-hover:text-[#180e29] transition-colors">
                      <Icon icon="mdi:check" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors leading-snug">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. AI-POWERED PROGRAMS CURRICULUM BREAKDOWN */}
      <section className="py-16 lg:py-24 bg-white dark:bg-darklight relative overflow-hidden">
        {/* Soft Ambient Floating Background Accents */}
        <div className="pointer-events-none absolute -top-24 left-1/4 w-80 h-80 rounded-full bg-[#764DFF]/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-1/4 w-80 h-80 rounded-full bg-[#4999D4]/5 blur-3xl" />

        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-2" data-aos="fade-up">
            <div className="badge-secondary mx-auto mb-1">
              <Icon icon="mdi:laptop" />
              Our Core Programs
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-midnight_text dark:text-white tracking-tight">
              AI-Powered Practical Learning
            </h2>
            <p className="text-xs sm:text-sm text-muted dark:text-white/60 font-medium">
              Explore our three specialized 6-month offline training programs equipped with live agency project modules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {programs.map((prog, idx) => (
              <div
                key={idx}
                className={`group relative overflow-hidden bg-gradient-to-b ${prog.color} dark:bg-dark border-[1.5px] ${prog.borderColor} rounded-3xl p-6 sm:p-7 flex flex-col justify-between ${prog.shadowClass || 'shadow-md'} transition-all duration-200 hover:-translate-y-2 hover:scale-[1.01] w-full`}
              >
                {/* Large Background Watermark Icon in Middle-Right Open Space */}
                <div className={`pointer-events-none absolute top-[52%] -translate-y-1/2 -right-3 ${prog.iconColor} opacity-10 dark:opacity-10 text-[140px] leading-none select-none transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:opacity-20`}>
                  <Icon icon={prog.watermarkIcon || prog.icon} />
                </div>

                <div className="space-y-4 relative z-10">
                  {/* Floating Icon with Gentle Wobble on Hover */}
                  <div className={`w-12 h-12 rounded-2xl bg-white dark:bg-darklight flex items-center justify-center text-2xl font-bold ${prog.iconColor} shadow-xs border border-white/80 dark:border-dark_border group-hover:rotate-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon icon={prog.icon} />
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-midnight_text dark:text-white leading-tight group-hover:text-primary transition-colors">
                    {prog.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted dark:text-white/70 leading-relaxed font-medium">
                    {prog.sub}
                  </p>

                  <div className="pt-3.5 border-t border-border/40 dark:border-dark_border/40">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-midnight_text dark:text-white mb-2.5">
                      You&apos;ll Learn:
                    </p>
                    <ul className="space-y-2">
                      {prog.skills.map((skill, sIdx) => (
                        <li key={sIdx} className="flex items-center gap-2 text-xs font-semibold text-midnight_text dark:text-white/90">
                          <Icon icon="mdi:check" className={`${prog.iconColor} shrink-0 text-sm`} />
                          <span>{skill}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6 mt-6 relative z-10">
                  <Link
                    href="/courses"
                    className="group/btn inline-flex items-center justify-center gap-2 text-center w-full bg-white dark:bg-darklight hover:bg-primary hover:text-white text-midnight_text dark:text-white border border-border/70 dark:border-dark_border font-bold text-xs sm:text-sm py-3 rounded-2xl transition-all duration-200 shadow-2xs hover:shadow-md hover:border-primary"
                  >
                    <span>View Program Details</span>
                    <Icon icon="mdi:arrow-right" className="text-base group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. WHERE DO WE DIFFER FROM OTHERS? / WHY STUDENTS CHOOSE QIMD - DARK GRADIENT */}
      <section
        className="py-16 lg:py-24 relative overflow-hidden text-white border-y border-white/10"
        style={{
          background: 'linear-gradient(135deg, #180e29 0%, #2b1654 35%, #3e1f7d 70%, #0284c7 100%)',
        }}
      >
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#764DFF]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#0284c7]/20 blur-3xl pointer-events-none" />

        <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4 space-y-10 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-2" data-aos="fade-up">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Where Do We Differ From Others?
            </h2>
            <p className="text-sm sm:text-base font-bold text-cyan-300">
              Most institutes focus on completing a syllabus. We focus on building careers.
            </p>
          </div>

          <div className="bg-white/10 dark:bg-white/10 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl space-y-6">
            <h3 className="text-lg sm:text-xl font-extrabold text-white text-center">
              Why Students Choose QIMD
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {differPoints.map((item, idx) => (
                <StaggeredPopCard key={idx} item={item} index={idx} />
              ))}
            </div>

            <div className="bg-white/10 backdrop-blur-md p-5 sm:p-6 rounded-2xl border border-white/20 text-center">
              <p className="text-xs sm:text-sm font-extrabold text-white leading-relaxed">
                At QIMD, you don&apos;t just earn a certificate—you graduate with practical experience, confidence, a professional portfolio, and the skills employers are looking for.
              </p>
            </div>
          </div>

        </div>
      </section>



      {/* 9. START YOUR CAREER JOURNEY TODAY - LIGHT GRADIENT */}
      <section
        className="relative overflow-hidden py-12 sm:py-16 text-midnight_text border-t border-slate-200/80 dark:border-dark_border"
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #ffffff 40%, #e8dcff 75%, #c8e0fe 100%)',
        }}
      >
        {/* Decorative background glow rings */}
        <div className="pointer-events-none absolute -top-20 -left-20 w-72 h-72 rounded-full bg-[#764DFF]/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-[#38bdf8]/10 blur-2xl" />

        <div className="container mx-auto max-w-3xl px-4 text-center space-y-3.5 relative z-10" data-aos="fade-up">
          <span className="inline-flex items-center gap-1.5 bg-[#764DFF]/15 border border-[#764DFF]/25 text-[#5c38d6] text-[11px] font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
            <Icon icon="mdi:school-outline" className="text-sm text-[#764DFF]" />
            <span>Ready to Upgrade Your Career?</span>
          </span>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#111827] dark:text-white tracking-tight leading-snug">
            Start Your Career Journey Today
          </h2>

          <p className="text-xs sm:text-sm text-slate-700 dark:text-white/80 max-w-2xl mx-auto leading-relaxed font-medium">
            Whether you&apos;re a student, graduate, working professional, freelancer, or entrepreneur, QIMD provides the practical skills and industry exposure you need to succeed.
          </p>

          <div className="inline-flex items-center gap-2 bg-white dark:bg-darklight border border-slate-200/80 dark:border-dark_border shadow-xs px-4 py-2 rounded-full text-xs sm:text-sm font-extrabold text-midnight_text dark:text-white my-1">
            <Icon icon="mdi:phone-in-talk-outline" className="text-base text-[#764DFF] shrink-0" />
            <span>Call Us: <a href={`tel:${contactPhone.replace(/\s+/g, '')}`} className="text-[#764DFF] hover:underline">{contactPhone}</a></span>
          </div>

          <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white max-w-2xl mx-auto leading-relaxed">
            Join QIMD and become an industry-ready professional through AI-powered practical learning, live projects, and career-focused training.
          </p>
        </div>
      </section>

    </div>
  );
}

'use client';

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useWebsiteSettings } from "@/app/context/WebsiteSettingsContext";

export default function OurTeamContent({ dynamicTrainers }: { dynamicTrainers?: any[] }) {
  const { phone, teamGroupPhoto } = useWebsiteSettings();
  const contactPhone = phone || "+91 80878 97288";

  // Auto-rotating active card index (0 -> 1 -> 2) every 5 seconds
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCardIndex((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Static fallback team members with designations
  const defaultTeamMembers = [
    {
      name: "Leadership & Management",
      designation: "Founding Director & Strategic Lead",
      photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
      bio: "12+ years of expertise in education strategy, digital growth, and empowering youth through industry-first skill development.",
      linkedin: "#",
    },
    {
      name: "Digital Marketing Mentor",
      designation: "Performance Marketing & SEO Specialist",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
      bio: "10+ years driving ROI campaigns, performance ads, and AI-powered SEO architectures for top client brands.",
      linkedin: "#",
    },
    {
      name: "Graphic & Brand Design Mentor",
      designation: "Creative Art Director & UI Lead",
      photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
      bio: "8+ years in brand identity design, D2C creative packaging, and AI visual production workflows.",
      linkedin: "#",
    },
    {
      name: "Video & Post-Production Mentor",
      designation: "Head of Motion Graphics & Video Editing",
      photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
      bio: "9+ years in commercial video editing, DaVinci Resolve color grading, and viral short-form social reels.",
      linkedin: "#",
    },
    {
      name: "Student Placement Lead",
      designation: "Head of Career Placement & Industry Relations",
      photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80",
      bio: "Connecting QIMD candidates directly with 50+ hiring partner agencies across Pune & India.",
      linkedin: "#",
    },
    {
      name: "Student Academic Counsellor",
      designation: "Career Counsellor & Student Success Mentor",
      photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80",
      bio: "Guiding students to pick the right career path, build confidence, and navigate their learning roadmap.",
      linkedin: "#",
    },
  ];

  const teamList = (dynamicTrainers && dynamicTrainers.length > 0)
    ? dynamicTrainers.map((t) => ({
        name: t.name || t.fullName,
        designation: t.designation || t.role || "Faculty & Mentor",
        photo: t.photo || t.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
        bio: t.biography || t.bio || `${t.qualification || 'Experienced professional'} with ${t.experience || 'extensive'} industry experience.`,
        linkedin: t.linkedin || "#",
      }))
    : defaultTeamMembers;

  const differPoints = [
    "Industry-Experienced Trainers",
    "AI-Powered Learning Approach",
    "Live Project Mentorship",
    "Practical & Interactive Teaching",
    "Career-Focused Guidance",
    "Portfolio Development Support",
    "Resume & Interview Preparation",
    "Personalized Student Mentorship",
  ];

  return (
    <div className="bg-grey dark:bg-dark min-h-screen">
      {/* 1. HERO SECTION - TALL BANNER WITH COMPACT TEXT OVERLAY */}
      <section className="relative w-full min-h-[65vh] sm:min-h-[70vh] lg:min-h-[75vh] py-20 sm:py-28 flex items-center justify-center bg-slate-950 overflow-hidden border-b border-border dark:border-dark_border">
        {/* Full-bleed background group photo */}
        <div className="absolute inset-0 z-0">
          <img
            src={teamGroupPhoto || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&q=80"}
            alt="QIMD Team Group Photo"
            className="w-full h-full object-cover object-center scale-105"
          />
          {/* Dark gradient overlay for optimal text contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/40" />
        </div>

        {/* Overlay Content Container */}
        <div className="container mx-auto max-w-3xl px-4 relative z-10 text-center space-y-4 text-white" data-aos="fade-up">
          <div className="inline-flex items-center gap-1.5 bg-[#764DFF] text-white text-[11px] font-extrabold px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-md">
            <Icon icon="mdi:account-group-outline" className="text-sm" />
            <span>Our Team</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
            Meet the Experts Behind QIMD
          </h1>

          <div className="max-w-2xl mx-auto space-y-3 text-white/95 text-xs sm:text-sm leading-relaxed font-medium">
            <p className="bg-slate-900/75 backdrop-blur-md p-4 sm:p-5 rounded-xl border border-white/15 shadow-xl text-xs sm:text-sm leading-relaxed">
              At <strong>QIMD (Quickupp Institute of Marketing &amp; Design)</strong>, our greatest strength is our team. We are a group of experienced marketers, designers, video editors, trainers, and industry professionals dedicated to helping students build successful careers.
            </p>

            <p className="bg-[#764DFF]/35 backdrop-blur-md p-3.5 sm:p-4 rounded-lg border border-[#764DFF]/45 text-white font-semibold text-xs leading-relaxed shadow-lg">
              Our mentors don&apos;t just teach — they actively work on real client projects, ensuring every student learns the latest industry trends, AI-powered tools, and practical skills that employers value.
            </p>
          </div>
        </div>
      </section>

      {/* 2 & 3. COMBINED SIDE-BY-SIDE SECTION: LEARN FROM INDUSTRY PROFESSIONALS & WHAT MAKES OUR TEAM DIFFERENT */}
      <section
        className="py-12 sm:py-16 border-b border-border dark:border-dark_border overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #ffffff 60%, #f4efff 82%, #e9f3fd 100%)',
        }}
      >
        <div className="container mx-auto max-w-6xl px-4 lg:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Learn from Industry Professionals (Left-Aligned) */}
            <div className="lg:col-span-6 space-y-4 text-left" data-aos="fade-right">
              <div className="inline-flex items-center gap-1.5 bg-[#764DFF]/10 text-[#764DFF] text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                <Icon icon="mdi:school-outline" className="text-xs" />
                <span>Expert Mentorship</span>
              </div>

              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-midnight_text dark:text-white tracking-tight leading-snug">
                Learn from <span className="bg-gradient-to-r from-[#764DFF] via-[#BD69F2] to-[#4999D4] bg-clip-text text-transparent">Industry Professionals</span>
              </h2>

              <p className="text-xs sm:text-sm text-muted dark:text-white/80 leading-relaxed font-medium">
                Our faculty brings together expertise from digital marketing agencies, creative studios, branding, performance marketing, content creation, and video production.
              </p>

              <div className="border-l-3 border-[#764DFF] pl-3.5 py-0.5">
                <p className="text-xs sm:text-sm font-semibold text-midnight_text dark:text-white/90 leading-relaxed">
                  Every training session is designed to combine theory with practical implementation, giving students the confidence to work on real-world projects from day one.
                </p>
              </div>
            </div>

            {/* Right Column: What Makes Our Team Different? (Balanced Right Alignment) */}
            <div className="lg:col-span-6 space-y-4 text-left lg:border-l lg:border-border/60 lg:dark:border-dark_border/60 lg:pl-8 pt-6 lg:pt-0 border-t lg:border-t-0 border-border/60 dark:border-dark_border/60" data-aos="fade-left">
              <div className="inline-flex items-center gap-1.5 bg-[#BD69F2]/10 text-[#BD69F2] text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                <Icon icon="mdi:star-check-outline" className="text-xs" />
                <span>Why QIMD Mentors</span>
              </div>

              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-midnight_text dark:text-white tracking-tight leading-snug">
                What Makes Our <span className="text-[#BD69F2]">Team Different?</span>
              </h2>

              <p className="text-xs sm:text-sm text-muted dark:text-white/70 font-medium">
                We go beyond traditional teaching to give you hands-on mentorship, real agency exposure, and dedicated career guidance.
              </p>

              {/* Clean 2-Column Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2.5 pt-1">
                {differPoints.map((point, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2.5 py-0.5 text-midnight_text dark:text-white group transition-transform duration-200 hover:translate-x-1"
                  >
                    <div className="w-4 h-4 rounded-full bg-[#764DFF]/10 text-[#764DFF] flex items-center justify-center text-[10px] shrink-0 font-bold group-hover:bg-[#764DFF] group-hover:text-white transition-colors">
                      <Icon icon="mdi:check-bold" />
                    </div>
                    <span className="text-xs font-bold leading-tight group-hover:text-[#764DFF] transition-colors">
                      {point}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. OUR LEADERSHIP, OUR MENTORS & CORE MISSION - CLEAN SEQUENTIAL POP-UP ANIMATION */}
      <section className="py-14 sm:py-18 bg-grey dark:bg-dark border-b border-border/80 dark:border-dark_border overflow-hidden">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8 space-y-6">
          
          {/* Subtle indicator dots for active card step */}
          <div className="flex items-center justify-center gap-2">
            {[0, 1, 2].map((idx) => (
              <button
                key={idx}
                onClick={() => setActiveCardIndex(idx)}
                aria-label={`Highlight card ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-500 ${
                  activeCardIndex === idx
                    ? "w-8 bg-[#764DFF]"
                    : "w-2 bg-slate-300 dark:bg-slate-700 hover:bg-[#764DFF]/50"
                }`}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch pt-4">
            
            {/* Card 1: Our Leadership */}
            <div
              onClick={() => setActiveCardIndex(0)}
              className={`group relative rounded-2xl bg-white dark:bg-darklight p-6 border transition-all duration-500 cursor-pointer flex flex-col justify-between overflow-hidden ${
                activeCardIndex === 0
                  ? "scale-[1.02] -translate-y-2 shadow-lg border-border dark:border-dark_border z-20"
                  : "scale-100 translate-y-0 shadow-sm border-border/60 dark:border-dark_border/60 opacity-90 hover:opacity-100 z-10"
              }`}
            >
              {/* Top Accent Line */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 transition-all duration-500 ${
                activeCardIndex === 0 ? "bg-[#764DFF]" : "bg-[#764DFF]/20"
              }`} />

              <div className="space-y-3.5">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold shrink-0 transition-colors duration-500 ${
                    activeCardIndex === 0 ? "bg-[#764DFF] text-white" : "bg-[#764DFF]/10 text-[#764DFF]"
                  }`}>
                    <Icon icon="mdi:account-tie" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-midnight_text dark:text-white leading-tight">
                      Our Leadership
                    </h3>
                    <span className="text-[10px] font-bold text-[#764DFF] uppercase tracking-wider">Vision &amp; Direction</span>
                  </div>
                </div>

                <p className="text-xs text-muted dark:text-white/80 leading-relaxed font-medium">
                  Our leadership team is committed to creating an institute where education goes beyond textbooks.
                </p>

                <div className="p-3.5 rounded-xl bg-grey/80 dark:bg-dark/80 border border-border/50 dark:border-dark_border/60">
                  <p className="text-[11px] sm:text-xs text-midnight_text dark:text-white font-semibold leading-relaxed">
                    By combining innovation, practical learning, and industry collaboration, we ensure every student receives the guidance, mentorship, and opportunities needed to become a successful digital professional.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Our Mentors */}
            <div
              onClick={() => setActiveCardIndex(1)}
              className={`group relative rounded-2xl bg-white dark:bg-darklight p-6 border transition-all duration-500 cursor-pointer flex flex-col justify-between overflow-hidden ${
                activeCardIndex === 1
                  ? "scale-[1.02] -translate-y-2 shadow-lg border-border dark:border-dark_border z-20"
                  : "scale-100 translate-y-0 shadow-sm border-border/60 dark:border-dark_border/60 opacity-90 hover:opacity-100 z-10"
              }`}
            >
              {/* Top Accent Line */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 transition-all duration-500 ${
                activeCardIndex === 1 ? "bg-[#764DFF]" : "bg-[#764DFF]/20"
              }`} />

              <div className="space-y-3.5">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold shrink-0 transition-colors duration-500 ${
                    activeCardIndex === 1 ? "bg-[#764DFF] text-white" : "bg-[#764DFF]/10 text-[#764DFF]"
                  }`}>
                    <Icon icon="mdi:school-outline" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-midnight_text dark:text-white leading-tight">
                      Our Mentors
                    </h3>
                    <span className="text-[10px] font-bold text-[#764DFF] uppercase tracking-wider">Practicing Experts</span>
                  </div>
                </div>

                <p className="text-xs text-muted dark:text-white/80 leading-relaxed font-medium">
                  Our mentors are passionate educators and working professionals who bring real business experience into the classroom.
                </p>

                <div className="pt-2 border-t border-border/60 dark:border-dark_border space-y-2">
                  <p className="text-[10px] font-extrabold text-midnight_text dark:text-white uppercase tracking-wider">
                    They help students:
                  </p>
                  <ul className="space-y-1.5">
                    {[
                      "Master practical skills",
                      "Work on live client projects",
                      "Build an industry-ready portfolio",
                      "Stay updated with latest AI tools",
                      "Prepare for interviews & placements",
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-[11px] font-bold text-midnight_text dark:text-white/90">
                        <Icon icon="mdi:check-circle" className="text-[#764DFF] shrink-0 text-xs" />
                        <span className="leading-tight">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Card 3: Student Success is Our Mission */}
            <div
              onClick={() => setActiveCardIndex(2)}
              className={`group relative rounded-2xl bg-white dark:bg-darklight p-6 border transition-all duration-500 cursor-pointer flex flex-col justify-between overflow-hidden ${
                activeCardIndex === 2
                  ? "scale-[1.02] -translate-y-2 shadow-lg border-border dark:border-dark_border z-20"
                  : "scale-100 translate-y-0 shadow-sm border-border/60 dark:border-dark_border/60 opacity-90 hover:opacity-100 z-10"
              }`}
            >
              {/* Top Accent Line */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 transition-all duration-500 ${
                activeCardIndex === 2 ? "bg-[#764DFF]" : "bg-[#764DFF]/20"
              }`} />

              <div className="space-y-3.5">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold shrink-0 transition-colors duration-500 ${
                    activeCardIndex === 2 ? "bg-[#764DFF] text-[#764DFF]" : "bg-[#764DFF]/10 text-[#764DFF]"
                  }`}>
                    <Icon icon="mdi:target" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-midnight_text dark:text-white leading-tight">
                      Student Success is Our Mission
                    </h3>
                    <span className="text-[10px] font-bold text-[#764DFF] uppercase tracking-wider">Our Core Goal</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-grey/80 dark:bg-dark/80 border border-border/50 dark:border-dark_border/60 mt-2">
                  <p className="text-[11px] sm:text-xs font-semibold text-midnight_text dark:text-white leading-relaxed">
                    Every member of our team shares one common goal: To transform aspiring learners into confident, skilled, and industry-ready professionals through practical learning, expert mentorship, and real-world experience.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 5. TEAM MEMBERS WITH DESIGNATIONS */}
      <section className="section-py bg-white dark:bg-darklight border-t border-border dark:border-dark_border" id="meet-the-team">
        <div className="container mx-auto max-w-7xl px-4 space-y-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-3" data-aos="fade-up">
            <div className="badge-secondary mx-auto">
              <Icon icon="mdi:account-group" />
              <span>Team Members</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-midnight_text dark:text-white tracking-tight">
              Meet the Team
            </h2>
            <p className="text-sm sm:text-base font-bold text-[#764DFF]">
              Experienced Trainers. Creative Thinkers. Industry Mentors. Career Builders.
            </p>
            <p className="text-xs sm:text-sm text-muted dark:text-white/70 font-medium">
              Behind every successful QIMD student is a dedicated team committed to guiding, supporting, and inspiring them throughout their learning journey.
            </p>
          </div>

          {/* Grid of Team Cards with Designations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {teamList.map((member, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-darklight rounded-3xl border-[1.5px] border-[#764DFF]/25 dark:border-dark_border hover:border-[#764DFF] shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_15px_35px_rgba(118,77,255,0.18)] hover:-translate-y-2 transition-all duration-300 overflow-hidden flex flex-col h-full"
                data-aos="fade-up"
                data-aos-delay={idx * 80}
              >
                {/* Profile Photo Container with Soft Ambient Top Header */}
                <div className="bg-gradient-to-b from-[#764DFF]/10 via-[#BD69F2]/5 to-transparent p-6 sm:p-8 flex flex-col items-center justify-center relative">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white dark:border-dark shadow-md bg-white shrink-0">
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="px-6 pb-6 text-center flex flex-col flex-1">
                  <h3 className="text-lg sm:text-xl font-extrabold text-midnight_text dark:text-white mb-2">
                    {member.name}
                  </h3>

                  {/* Rounded Pill Badge Designation */}
                  <div>
                    <span className="inline-block bg-[#764DFF]/10 dark:bg-[#764DFF]/20 text-[#764DFF] dark:text-[#a78bfa] text-xs font-bold px-4 py-1.5 rounded-full border border-[#764DFF]/20">
                      {member.designation}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. JOIN OUR COMMUNITY CTA */}
      <section className="relative overflow-hidden py-12 sm:py-16 bg-gradient-to-r from-[#764DFF] via-[#5c38d6] to-[#BD69F2] text-white">
        <div className="pointer-events-none absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-2xl" />

        <div className="container mx-auto max-w-3xl px-4 text-center space-y-4 relative z-10" data-aos="fade-up">
          <span className="inline-flex items-center gap-1.5 bg-white/15 border border-white/25 text-white text-[11px] font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
            <Icon icon="mdi:account-group" className="text-sm" />
            <span>Join Our Community</span>
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
            Join Our Community
          </h2>

          <p className="text-xs sm:text-sm text-white/90 max-w-2xl mx-auto leading-relaxed font-medium">
            Learn from professionals who practice what they teach. Experience AI-powered, project-based learning with mentors who are invested in your success.
          </p>

          <p className="text-sm sm:text-base font-extrabold text-white tracking-wide pt-1">
            Build Skills. Gain Experience. Launch Your Career with QIMD.
          </p>

          <div className="pt-3 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="bg-white hover:bg-slate-100 text-[#764DFF] font-extrabold text-xs sm:text-sm px-7 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              Get Enrolled Today
            </Link>
            <Link
              href={`tel:${contactPhone.replace(/\s+/g, '')}`}
              className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/35 text-white font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-xl border border-white/40 hover:border-white transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <Icon icon="mdi:phone" className="text-base text-white" />
              <span className="text-white font-extrabold tracking-wide">{contactPhone}</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

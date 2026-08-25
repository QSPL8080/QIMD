'use client'

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useWebsiteSettings } from "@/app/context/WebsiteSettingsContext";

const TrainerCard: React.FC<{ trainer: any; index: number }> = ({
  trainer,
  index,
}) => {
  const name = trainer.name || trainer.fullName || "Industry Specialist";
  const role = trainer.role || trainer.designation || "Senior Instructor";
  const photo = trainer.photo || trainer.image;
  const experience =
    trainer.yearsOfExperience || trainer.experience || "8+ Years";
  const specialization =
    trainer.specialization || trainer.qualification || "AI Tools Specialist";
  const bio =
    trainer.bio ||
    trainer.biography ||
    "Experienced industry professional specializing in practical AI workflows and client projects.";
  const linkedin =
    trainer.socialLinks?.linkedin || trainer.linkedin || "#";

  return (
    <div
      className="bg-white/10 dark:bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 hover:border-cyan-300 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden flex flex-col h-full text-white"
    >
      {/* Profile Image Header */}
      <div className="bg-white/5 p-5 flex flex-col items-center justify-center relative min-h-[115px]">
        <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-white/40 shadow-md bg-white flex items-center justify-center shrink-0 z-10">
          {photo ? (
            <img
              src={photo}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Icon icon="mdi:account" className="text-[#764DFF] text-4xl m-auto" />
          )}
        </div>
      </div>

      <div className="p-4 text-center flex flex-col flex-1">
        <h3 className="text-base font-bold text-white mb-0.5 tracking-tight">
          {name}
        </h3>
        <p className="text-cyan-300 text-xs font-semibold mb-1 leading-snug">{role}</p>
        <p className="text-[11px] text-slate-200 mb-2.5 font-medium leading-tight line-clamp-1">
          {specialization}
        </p>

        {experience && (
          <div>
            <span className="inline-block bg-white/15 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-white/25">
              {experience.includes('+') ? experience : `${experience}+ Years`} Experience
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default function TrainersContent({ trainers }: { trainers: any[] }) {
  const { teamGroupPhoto } = useWebsiteSettings();

  const marketingTrainer = trainers.find((t) => t.category === "MARKETING") || trainers[0];
  const designTrainer = trainers.find((t) => t.category === "DESIGN") || trainers[1];
  const videoTrainer = trainers.find((t) => t.category === "VIDEO") || trainers[2];

  const activeDomainTrainers = [
    { title: "Digital Marketing Lead", sub: "Performance Ads & SEO Specialist", trainer: marketingTrainer, color: "#764DFF" },
    { title: "Graphic Design Lead", sub: "Branding & AI Creative Workflows", trainer: designTrainer, color: "#BD69F2" },
    { title: "Video Editing Lead", sub: "Commercial Reels & VFX Specialist", trainer: videoTrainer, color: "#4999D4" },
  ].filter(item => item.trainer);

  return (
    <div className="bg-grey dark:bg-dark min-h-screen text-midnight_text dark:text-white">
      
      {/* 1. HERO HEADER & BANNER - TOP & BOTTOM LIGHT GRADIENT */}
      <section
        className="pt-20 sm:pt-28 pb-14 sm:pb-20 border-b border-slate-200/80 dark:border-dark_border relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #c8e0fe 0%, #e8dcff 15%, #ffffff 40%, #ffffff 65%, #e8dcff 85%, #c8e0fe 100%)',
        }}
      >
        {/* Soft Ambient Floating Background Accents */}
        <div className="pointer-events-none absolute -top-20 -left-20 w-80 h-80 rounded-full bg-[#764DFF]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-[#38bdf8]/10 blur-3xl" />

        <div className="container mx-auto max-w-7xl px-4 lg:px-8 relative z-10">
          <div className="text-center space-y-4" data-aos="fade-up">
            <div className="inline-flex items-center gap-1.5 bg-[#764DFF]/15 border border-[#764DFF]/25 text-[#5c38d6] text-xs font-extrabold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-xs">
              <Icon icon="mdi:account-group-outline" className="text-base text-[#764DFF]" />
              <span>Learn From Industry Experts</span>
            </div>

            <div className="max-w-3xl mx-auto space-y-3 text-slate-700 dark:text-white/80 text-sm sm:text-base leading-relaxed font-medium">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#111827] dark:text-white tracking-tight leading-tight">
                Learn from Industry Experts Who Practice What They Teach
              </h1>
              <p className="text-slate-800 dark:text-white/90 text-sm sm:text-base leading-relaxed font-semibold">
                At <strong>QIMD (Quickupp Institute of Marketing &amp; Design)</strong>, our trainers are more than educators—they are experienced professionals actively working in the fields of Digital Marketing, Graphic Design, and Video Editing.
              </p>
              <p className="text-slate-600 dark:text-white/70 text-xs sm:text-sm leading-relaxed">
                With hands-on industry experience, they bring real business challenges, live client projects, and the latest AI-powered tools into every classroom session, ensuring students learn skills that are relevant, practical, and job-ready.
              </p>
            </div>

            {/* Group Photo Card */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-dark_border max-w-5xl mx-auto bg-white dark:bg-darklight mt-8">
              <div className="relative h-64 sm:h-80 md:h-[420px] w-full bg-slate-900">
                <img
                  src={teamGroupPhoto || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80"}
                  alt="QIMD Trainers Group Photo"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MEET OUR EXPERT TRAINERS - DARK GRADIENT */}
      <section
        className="py-16 lg:py-24 text-white relative overflow-hidden border-b border-white/10"
        style={{
          background: 'linear-gradient(135deg, #180e29 0%, #2b1654 35%, #3e1f7d 70%, #0284c7 100%)',
        }}
      >
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#764DFF]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#0284c7]/20 blur-3xl pointer-events-none" />

        <div className="container mx-auto max-w-7xl px-4 lg:px-8 space-y-10 relative z-10">
          <div className="text-center" data-aos="fade-up">
            <span className="inline-flex items-center gap-1.5 bg-white/15 border border-white/25 text-cyan-300 text-[11px] font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider mb-2 backdrop-blur-md">
              <Icon icon="mdi:account-star-outline" className="text-sm" />
              Faculty Roster
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1 tracking-tight">
              Meet Our Expert Trainers
            </h2>
            <p className="text-slate-200 text-xs sm:text-sm mt-1.5 max-w-lg mx-auto">
              Our 3 domain leads guiding students across Digital Marketing, Graphic Design, and Video Editing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
            {trainers.map((t: any, index: number) => (
              <div key={t.id || index} className="flex flex-col h-full space-y-3" data-aos="fade-up" data-aos-delay={index * 100}>
                <div className="border-l-4 border-cyan-400 pl-3 py-0.5">
                  <h3 className="text-base font-bold text-white">
                    {t.category === 'MARKETING' ? 'Digital Marketing Lead' : t.category === 'DESIGN' ? 'Graphic Design Lead' : t.category === 'VIDEO' ? 'Video Editing Lead' : 'Faculty Lead'}
                  </h3>
                  <p className="text-xs text-cyan-300 font-medium">
                    {t.designation || 'Specialist Trainer'}
                  </p>
                </div>
                <div className="flex-1">
                  <TrainerCard trainer={t} index={index} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. OUR TRAINING APPROACH — LIGHT GRADIENT INFINITE MARQUEE */}
      <section
        className="py-14 sm:py-18 border-b border-slate-200/80 dark:border-dark_border relative overflow-hidden text-midnight_text"
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #ffffff 40%, #e8dcff 75%, #c8e0fe 100%)',
        }}
      >
        <div className="container mx-auto max-w-7xl px-4 space-y-6 relative z-10" data-aos="fade-up">
          <div className="text-center max-w-xl mx-auto mb-2 px-4">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#764DFF]">Hands-on Learning</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] dark:text-white mt-1 mb-1 tracking-tight">
              Our Training Approach
            </h2>
            <p className="text-slate-600 dark:text-white/70 text-xs sm:text-sm font-medium">
              We believe students learn best by doing.
            </p>
          </div>

          <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden py-4 flex">
            <div className="flex shrink-0 animate-marquee gap-4 pr-4">
              {[
                { label: "Interactive Sessions", icon: "mdi:google-classroom" },
                { label: "Practical Training", icon: "mdi:laptop" },
                { label: "Live Client Projects", icon: "mdi:briefcase-check" },
                { label: "Real Case Studies", icon: "mdi:file-document-multiple" },
                { label: "Portfolio Building", icon: "mdi:folder-account" },
                { label: "1-on-1 Mentorship", icon: "mdi:account-voice" },
                { label: "Continuous Feedback", icon: "mdi:comment-check" },
              ].map((approach, i) => (
                <div
                  key={`t1-${i}`}
                  className="p-3.5 px-5 rounded-2xl bg-white dark:bg-darklight border border-slate-200/80 dark:border-dark_border flex items-center gap-3 shadow-sm hover:shadow-md shrink-0"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#764DFF]/10 text-[#764DFF] flex items-center justify-center text-lg shrink-0">
                    <Icon icon={approach.icon} />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white whitespace-nowrap">
                    {approach.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex shrink-0 animate-marquee gap-4 pr-4" aria-hidden="true">
              {[
                { label: "Interactive Sessions", icon: "mdi:google-classroom" },
                { label: "Practical Training", icon: "mdi:laptop" },
                { label: "Live Client Projects", icon: "mdi:briefcase-check" },
                { label: "Real Case Studies", icon: "mdi:file-document-multiple" },
                { label: "Portfolio Building", icon: "mdi:folder-account" },
                { label: "1-on-1 Mentorship", icon: "mdi:account-voice" },
                { label: "Continuous Feedback", icon: "mdi:comment-check" },
              ].map((approach, i) => (
                <div
                  key={`t2-${i}`}
                  className="p-3.5 px-5 rounded-2xl bg-white dark:bg-darklight border border-slate-200/80 dark:border-dark_border flex items-center gap-3 shadow-sm hover:shadow-md shrink-0"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#764DFF]/10 text-[#764DFF] flex items-center justify-center text-lg shrink-0">
                    <Icon icon={approach.icon} />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white whitespace-nowrap">
                    {approach.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHY OUR TRAINERS STAND OUT - DARK GRADIENT */}
      <section
        className="py-16 lg:py-24 text-white relative overflow-hidden border-b border-white/10"
        style={{
          background: 'linear-gradient(135deg, #180e29 0%, #2b1654 35%, #3e1f7d 70%, #0284c7 100%)',
        }}
      >
        {/* Ambient background glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#764DFF]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#0284c7]/20 blur-3xl pointer-events-none" />

        <div className="container mx-auto max-w-7xl px-4 lg:px-8 space-y-10 relative z-10">
          <div className="text-center max-w-2xl mx-auto space-y-2" data-aos="fade-up">
            <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-300">
              The QIMD Advantage
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Why Our Trainers Stand Out
            </h2>
            <p className="text-slate-200 text-xs sm:text-sm font-medium leading-relaxed">
              Combining industry expertise with practical teaching methodologies to help students gain real-world confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch max-w-6xl mx-auto">
            
            {/* Left Column: What Makes Our Trainers Different? */}
            <div className="space-y-4 bg-white/10 dark:bg-white/10 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl flex flex-col justify-between h-full" data-aos="fade-right">
              <div className="flex items-center gap-3 pb-2 border-b border-white/15 min-h-[54px]">
                <div className="w-9 h-9 rounded-xl bg-white/15 text-cyan-300 flex items-center justify-center text-lg font-bold shrink-0 border border-white/25">
                  <Icon icon="mdi:star-outline" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-white leading-tight">
                    What Makes Our Trainers Different?
                  </h3>
                  <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider">Key Differentiators</span>
                </div>
              </div>

              <div className="space-y-2.5 pt-2 flex-1 flex flex-col justify-between">
                {[
                  "Industry Professionals with Practical Experience",
                  "AI-Powered Teaching Methodology",
                  "Live Project-Based Learning",
                  "Personalized Mentorship",
                  "Career-Focused Guidance",
                  "Updated Curriculum Based on Industry Trends",
                  "Practical Assignments & Workshops",
                  "Student-Centric Learning Approach",
                ].map((title, i) => (
                  <div
                    key={i}
                    data-aos="fade-right"
                    data-aos-delay={i * 60}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 border border-white/15 hover:border-cyan-300 hover:bg-white/20 transition-all group min-h-[50px]"
                  >
                    <div className="w-6 h-6 rounded-lg bg-white/15 text-cyan-300 flex items-center justify-center text-xs shrink-0 group-hover:bg-white group-hover:text-[#180e29] transition-colors">
                      <Icon icon="mdi:check-bold" />
                    </div>
                    <span className="text-xs font-bold text-white leading-tight group-hover:text-cyan-300 transition-colors">
                      {title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Why Learn from QIMD Trainers? */}
            <div className="space-y-4 bg-white/10 dark:bg-white/10 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl flex flex-col justify-between h-full" data-aos="fade-left">
              <div className="flex items-center gap-3 pb-2 border-b border-white/15 min-h-[54px]">
                <div className="w-9 h-9 rounded-xl bg-white/15 text-cyan-300 flex items-center justify-center text-lg font-bold shrink-0 border border-white/25">
                  <Icon icon="mdi:target" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-white leading-tight">
                    Why Learn from QIMD Trainers?
                  </h3>
                  <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider">How They Help You</span>
                </div>
              </div>

              <div className="space-y-2.5 pt-2 flex-1 flex flex-col justify-between">
                {[
                  { title: "Master industry-relevant skills", icon: "mdi:school-outline" },
                  { title: "Work on live client projects", icon: "mdi:briefcase-check-outline" },
                  { title: "Learn the latest AI-powered tools", icon: "mdi:robot-outline" },
                  { title: "Build a professional portfolio", icon: "mdi:folder-star-outline" },
                  { title: "Solve real business challenges", icon: "mdi:lightning-bolt-outline" },
                  { title: "Prepare for interviews & placements", icon: "mdi:account-tie-outline" },
                  { title: "Develop confidence through practical implementation", icon: "mdi:target" },
                  { title: "Personalized 1-on-1 mentorship & career support", icon: "mdi:handshake-outline" },
                ].map((item, i) => (
                  <div
                    key={i}
                    data-aos="fade-left"
                    data-aos-delay={i * 60}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 border border-white/15 hover:border-cyan-300 hover:bg-white/20 transition-all group min-h-[50px]"
                  >
                    <div className="w-6 h-6 rounded-lg bg-white/15 text-cyan-300 flex items-center justify-center text-xs shrink-0 group-hover:bg-white group-hover:text-[#180e29] transition-colors">
                      <Icon icon={item.icon} />
                    </div>
                    <span className="text-xs font-bold text-white leading-tight group-hover:text-cyan-300 transition-colors">
                      {item.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. CLOSING CALL TO ACTION BANNER - TOP-SIDE LIGHT GRADIENT */}
      <section
        className="py-16 sm:py-24 border-t border-slate-200/80 dark:border-dark_border relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #c8e0fe 0%, #e8dcff 25%, #f8f9ff 60%, #ffffff 100%)',
        }}
      >
        <div className="container mx-auto max-w-7xl px-4 lg:px-8 relative z-10">
          <div className="text-center bg-white dark:bg-darklight rounded-3xl p-8 sm:p-12 border border-slate-200/80 dark:border-dark_border shadow-xl max-w-5xl mx-auto space-y-4" data-aos="fade-up">
            <span className="inline-flex items-center gap-1.5 bg-[#764DFF]/15 border border-[#764DFF]/25 text-[#5c38d6] text-[11px] font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
              <Icon icon="mdi:school-outline" className="text-sm text-[#764DFF]" />
              <span>Transform Your Future</span>
            </span>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#111827] dark:text-white tracking-tight leading-snug">
              Learn from Professionals. Grow with Confidence.
            </h2>
            <div className="text-slate-700 dark:text-white/80 text-xs sm:text-sm max-w-2xl mx-auto space-y-2 leading-relaxed font-medium">
              <p>
                At QIMD, every trainer is committed to helping students build practical skills, industry knowledge, and the confidence to succeed in today&apos;s competitive digital world.
              </p>
              <p>
                Our goal is simple—to ensure every student graduates with the experience, portfolio, and expertise needed to build a successful career.
              </p>
              <p className="text-[#764DFF] font-extrabold text-xs sm:text-sm pt-1">
                Learn from experts. Practice on live projects. Become industry-ready with QIMD.
              </p>
            </div>
            <div className="pt-3 flex flex-wrap justify-center gap-4">
              <Link
                href="/courses"
                className="bg-primary hover:bg-darkprimary text-white font-extrabold text-xs sm:text-sm px-8 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                Explore Courses
              </Link>
              <Link
                href="/contact"
                className="bg-white dark:bg-darklight hover:bg-slate-50 text-midnight_text dark:text-white font-extrabold text-xs sm:text-sm px-8 py-3.5 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5"
              >
                Connect with Mentors
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

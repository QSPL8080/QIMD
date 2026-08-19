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
      className="bg-white dark:bg-darklight rounded-2xl shadow-sm border border-slate-200/80 dark:border-dark_border hover:shadow-md transition-all overflow-hidden flex flex-col h-full"
      data-aos="fade-up"
      data-aos-delay={index * 80}
    >
      {/* Profile Image Header */}
      <div className="bg-gradient-to-br from-[#764DFF]/10 via-[#BD69F2]/5 to-[#4999D4]/10 p-5 flex flex-col items-center justify-center relative min-h-[115px]">
        <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-white dark:border-dark shadow-md bg-white flex items-center justify-center shrink-0 z-10">
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
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-0.5 tracking-tight">
          {name}
        </h3>
        <p className="text-[#764DFF] text-xs font-semibold mb-1 leading-snug">{role}</p>
        <p className="text-[11px] text-slate-500 dark:text-white/60 mb-2.5 font-medium leading-tight line-clamp-1">
          {specialization}
        </p>

        {experience && (
          <div>
            <span className="inline-block bg-[#764DFF]/10 text-[#764DFF] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[#764DFF]/20">
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
    <section className="section-py bg-grey dark:bg-dark min-h-screen">
      <div className="container mx-auto max-w-7xl px-4 lg:px-8 space-y-20 sm:space-y-24">
        
        {/* HERO HEADER & BANNER */}
        <div className="text-center space-y-4" data-aos="fade-up">
          <div className="inline-flex items-center gap-1.5 bg-[#764DFF]/10 text-[#764DFF] text-xs font-extrabold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
            <Icon icon="mdi:account-group-outline" className="text-base" />
            Learn From Industry Experts
          </div>

          <div className="max-w-3xl mx-auto space-y-3 text-muted dark:text-white/70 text-sm sm:text-base leading-relaxed font-medium">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-midnight_text dark:text-white tracking-tight">
              Learn from Industry Experts Who Practice What They Teach
            </h1>
            <p className="text-slate-700 dark:text-white/80 text-sm sm:text-base leading-relaxed">
              At <strong>QIMD (Quickupp Institute of Marketing &amp; Design)</strong>, our trainers are more than educators—they are experienced professionals actively working in the fields of Digital Marketing, Graphic Design, and Video Editing.
            </p>
            <p className="text-slate-600 dark:text-white/70 text-xs sm:text-sm leading-relaxed">
              With hands-on industry experience, they bring real business challenges, live client projects, and the latest AI-powered tools into every classroom session, ensuring students learn skills that are relevant, practical, and job-ready.
            </p>
          </div>

          {/* Group Photo Card (Clean without text overlay) */}
          <div className="relative rounded-3xl overflow-hidden shadow-xl border border-border dark:border-dark_border max-w-6xl mx-auto bg-white dark:bg-darklight mt-8">
            <div className="relative h-56 sm:h-80 md:h-[420px] w-full bg-slate-900">
              <img
                src={teamGroupPhoto || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80"}
                alt="QIMD Trainers Group Photo"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* MEET OUR EXPERT TRAINERS - 3 DOMAIN LEADS IN 1 SPACIOUS ROW */}
        <div className="space-y-8">
          <div className="text-center">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#764DFF]">Faculty Roster</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-midnight_text dark:text-white mt-1">
              Meet Our Expert Trainers
            </h2>
            <p className="text-muted dark:text-white/70 text-sm mt-1.5 max-w-lg mx-auto">
              Our 3 domain leads guiding students across Digital Marketing, Graphic Design, and Video Editing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
            {trainers.map((t: any, index: number) => (
              <div key={t.id || index} className="flex flex-col h-full space-y-3">
                <div className="border-l-4 border-[#764DFF] pl-3 py-0.5">
                  <h3 className="text-base font-bold text-midnight_text dark:text-white">
                    {t.category === 'MARKETING' ? 'Digital Marketing Lead' : t.category === 'DESIGN' ? 'Graphic Design Lead' : t.category === 'VIDEO' ? 'Video Editing Lead' : 'Faculty Lead'}
                  </h3>
                  <p className="text-xs text-muted dark:text-white/60 font-medium">
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

        {/* OUR TRAINING APPROACH — FULL SCREEN EDGE-TO-EDGE INFINITE MARQUEE */}
        <div className="space-y-6 py-4" data-aos="fade-up">
          <div className="text-center max-w-xl mx-auto mb-2 px-4">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#764DFF]">Hands-on Learning</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-midnight_text dark:text-white mt-1 mb-1">
              Our Training Approach
            </h2>
            <p className="text-muted dark:text-white/70 text-sm font-medium">
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
                  className="p-3.5 px-5 rounded-2xl bg-white dark:bg-darklight border border-slate-200/80 dark:border-dark_border flex items-center gap-3 shadow-2xs shrink-0"
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
                  className="p-3.5 px-5 rounded-2xl bg-white dark:bg-darklight border border-slate-200/80 dark:border-dark_border flex items-center gap-3 shadow-2xs shrink-0"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#764DFF]/10 text-[#764DFF] flex items-center justify-center text-lg shrink-0">
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

        {/* UNIFIED TRAINER VALUE PROPOSITION — 2-COLUMN SIDE-BY-SIDE WITH STAGGERED FADE-RIGHT / FADE-LEFT ANIMATIONS */}
        <div className="max-w-6xl mx-auto pt-4 space-y-8" data-aos="fade-up">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#764DFF]">
              The QIMD Advantage
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-midnight_text dark:text-white tracking-tight">
              Why Our Trainers Stand Out
            </h2>
            <p className="text-muted dark:text-white/70 text-xs sm:text-sm font-medium leading-relaxed">
              Combining industry expertise with practical teaching methodologies to help students gain real-world confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch pt-2">
            
            {/* Left Column: What Makes Our Trainers Different? (Fade-Right Staggered) */}
            <div className="space-y-4 bg-white dark:bg-darklight p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-dark_border shadow-sm flex flex-col justify-between h-full">
              <div className="flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-dark_border min-h-[54px]">
                <div className="w-9 h-9 rounded-xl bg-[#764DFF]/10 text-[#764DFF] flex items-center justify-center text-lg font-bold shrink-0">
                  <Icon icon="mdi:star-outline" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-midnight_text dark:text-white leading-tight">
                    What Makes Our Trainers Different?
                  </h3>
                  <span className="text-[10px] font-bold text-[#764DFF] uppercase tracking-wider">Key Differentiators</span>
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
                    data-aos-delay={i * 80}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-grey/60 dark:bg-dark/60 border border-slate-200/60 dark:border-dark_border/60 hover:border-[#764DFF]/40 hover:bg-white dark:hover:bg-darklight transition-all group min-h-[50px]"
                  >
                    <div className="w-6 h-6 rounded-lg bg-[#764DFF]/10 text-[#764DFF] flex items-center justify-center text-xs shrink-0 group-hover:bg-[#764DFF] group-hover:text-white transition-colors">
                      <Icon icon="mdi:check-bold" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-white/90 leading-tight">
                      {title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Why Learn from QIMD Trainers? (Fade-Left Staggered) */}
            <div className="space-y-4 bg-white dark:bg-darklight p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-dark_border shadow-sm flex flex-col justify-between h-full">
              <div className="flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-dark_border min-h-[54px]">
                <div className="w-9 h-9 rounded-xl bg-[#BD69F2]/10 text-[#BD69F2] flex items-center justify-center text-lg font-bold shrink-0">
                  <Icon icon="mdi:target" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-midnight_text dark:text-white leading-tight">
                    Why Learn from QIMD Trainers?
                  </h3>
                  <span className="text-[10px] font-bold text-[#BD69F2] uppercase tracking-wider">How They Help You</span>
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
                    data-aos-delay={i * 80}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-grey/60 dark:bg-dark/60 border border-slate-200/60 dark:border-dark_border/60 hover:border-[#BD69F2]/40 hover:bg-white dark:hover:bg-darklight transition-all group min-h-[50px]"
                  >
                    <div className="w-6 h-6 rounded-lg bg-[#BD69F2]/10 text-[#BD69F2] flex items-center justify-center text-xs shrink-0 group-hover:bg-[#BD69F2] group-hover:text-white transition-colors">
                      <Icon icon={item.icon} />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-white/90 leading-tight">
                      {item.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* CLOSING CALL TO ACTION BANNER */}
        <div className="text-center bg-white dark:bg-darklight rounded-3xl p-8 sm:p-12 border border-slate-200/80 dark:border-dark_border shadow-card max-w-6xl mx-auto space-y-4" data-aos="fade-up">
          <h2 className="text-2xl sm:text-3xl font-bold text-midnight_text dark:text-white">
            Learn from Professionals. Grow with Confidence.
          </h2>
          <div className="text-muted dark:text-white/80 text-xs sm:text-sm max-w-2xl mx-auto space-y-1.5 leading-relaxed font-medium">
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
              className="bg-[#764DFF] hover:bg-[#5c38d6] text-white font-bold text-sm px-8 py-3.5 rounded-xl transition-all shadow-md"
            >
              Explore Courses
            </Link>
            <Link
              href="/contact"
              className="border border-[#764DFF] text-[#764DFF] hover:bg-[#764DFF]/5 font-bold text-sm px-8 py-3.5 rounded-xl transition-all"
            >
              Book Career Session
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}

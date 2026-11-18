'use client'

import React from "react";
import Link from "next/link";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useWebsiteSettings } from "@/app/context/WebsiteSettingsContext";
import { AboutTabs, QaKicker, QaHead, QaCheck } from "@/components/About/AboutKit";

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
    <div className="qa-person qa-trainer" data-index={index}>
      <div className="qa-person-photo">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={name} />
        ) : (
          <span className="qa-person-fallback">
            <Icon icon="mdi:account" />
          </span>
        )}
      </div>
      <div className="qa-person-body">
        <h3 className="qa-person-name">{name}</h3>
        <span className="qa-person-role">{role}</span>
        <p className="qa-person-spec">{specialization}</p>
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

  const approaches = [
    { label: "Interactive Sessions", icon: "mdi:google-classroom" },
    { label: "Practical Training", icon: "mdi:laptop" },
    { label: "Live Client Projects", icon: "mdi:briefcase-check" },
    { label: "Real Case Studies", icon: "mdi:file-document-multiple" },
    { label: "Portfolio Building", icon: "mdi:folder-account" },
    { label: "1-on-1 Mentorship", icon: "mdi:account-voice" },
    { label: "Continuous Feedback", icon: "mdi:comment-check" },
  ];
  const differentiators = [
    "Industry Professionals with Practical Experience",
    "AI-Powered Teaching Methodology",
    "Live Project-Based Learning",
    "Personalized Mentorship",
    "Career-Focused Guidance",
    "Updated Curriculum Based on Industry Trends",
    "Practical Assignments & Workshops",
    "Student-Centric Learning Approach",
  ];
  const benefits = [
    { title: "Master industry-relevant skills", icon: "mdi:school-outline" },
    { title: "Work on live client projects", icon: "mdi:briefcase-check-outline" },
    { title: "Learn the latest AI-powered tools", icon: "mdi:robot-outline" },
    { title: "Build a professional portfolio", icon: "mdi:folder-star-outline" },
    { title: "Solve real business challenges", icon: "mdi:lightning-bolt-outline" },
    { title: "Prepare for interviews & placements", icon: "mdi:account-tie-outline" },
    { title: "Develop confidence through practical implementation", icon: "mdi:target" },
    { title: "Personalized 1-on-1 mentorship & career support", icon: "mdi:handshake-outline" },
  ];

  return (
    <div className="qa">
      <AboutTabs />

      {/* 1. HERO — BENTO WITH GROUP PHOTO */}
      <section className="qa-sec qa-hero">
        <div className="qa-wrap">
          <div className="qa-bento qa-hero-bento qa-hero-photo">
            <div className="qa-tile qa-tile-white qa-hero-main">
              <QaKicker icon="mdi:account-group-outline">Learn From Industry Experts</QaKicker>
              <h1 className="qa-h1">Learn from Industry Experts Who Practice What They Teach</h1>
              <div className="qa-copy">
                <p>
                  At <strong>QIMD (Quickupp Institute of Marketing &amp; Design)</strong>, our trainers are more than educators - they are experienced professionals actively working in the fields of Digital Marketing, Graphic Design, and Video Editing.
                </p>
              </div>
            </div>

            <div className="qa-tile qa-photo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={teamGroupPhoto || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80"}
                alt="QIMD Trainers Group Photo"
              />
            </div>

            <div className="qa-tile qa-tile-accent qa-hero-strip">
              <Icon icon="mdi:lightning-bolt-outline" className="qa-tile-big-ic" />
              <p className="qa-accent-text">
                With hands-on industry experience, they bring real business challenges, live client projects, and the latest AI-powered tools into every classroom session, ensuring students learn skills that are relevant, practical, and job-ready.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MEET OUR EXPERT TRAINERS */}
      <section className="qa-sec">
        <div className="qa-wrap">
          <QaHead
            kicker="Faculty Roster"
            icon="mdi:account-star-outline"
            title="Meet Our Expert Trainers"
            desc="Our 3 domain leads guiding students across Digital Marketing, Graphic Design, and Video Editing."
          />
          <div className="qa-people qa-roster">
            {trainers.map((t: any, index: number) => (
              <div key={t.id || index} className="qa-roster-item">
                <div className="qa-roster-head">
                  <span className="qa-roster-num">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="qa-h4">
                      {t.category === 'MARKETING' ? 'Digital Marketing Lead' : t.category === 'DESIGN' ? 'Graphic Design Lead' : t.category === 'VIDEO' ? 'Video Editing Lead' : 'Faculty Lead'}
                    </h3>
                    <p className="qa-roster-sub">{t.designation || 'Specialist Trainer'}</p>
                  </div>
                </div>
                <TrainerCard trainer={t} index={index} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. OUR TRAINING APPROACH */}
      <section className="qa-sec">
        <div className="qa-wrap">
          <QaHead
            kicker="Hands-on Learning"
            icon="mdi:hand-back-right-outline"
            title="Our Training Approach"
            desc="We believe students learn best by doing."
          />
          <div className="qa-approach">
            {approaches.map((approach, i) => (
              <div key={i} className={`qa-tile ${i === 0 ? "qa-tile-accent" : i === 3 ? "qa-tile-night" : "qa-tile-white"} qa-approach-tile`}>
                <span className="qa-feature-num">{String(i + 1).padStart(2, "0")}</span>
                <span className="qa-ic">
                  <Icon icon={approach.icon} />
                </span>
                <span className="qa-approach-label">{approach.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. WHY OUR TRAINERS STAND OUT */}
      <section className="qa-sec">
        <div className="qa-wrap">
          <QaHead
            kicker="The QIMD Advantage"
            icon="mdi:trophy-outline"
            title="Why Our Trainers Stand Out"
            desc="Combining industry expertise with practical teaching methodologies to help students gain real-world confidence."
          />
          <div className="qa-bento qa-two">
            <div className="qa-tile qa-tile-white qa-flex">
              <div className="qa-rot-head">
                <span className="qa-ic">
                  <Icon icon="mdi:star-outline" />
                </span>
                <div>
                  <h3 className="qa-h4">What Makes Our Trainers Different?</h3>
                  <span className="qa-rot-tag">Key Differentiators</span>
                </div>
              </div>
              <div className="qa-checks is-single">
                {differentiators.map((title, i) => (
                  <QaCheck key={i}>{title}</QaCheck>
                ))}
              </div>
            </div>

            <div className="qa-tile qa-tile-night qa-flex">
              <div className="qa-rot-head">
                <span className="qa-ic">
                  <Icon icon="mdi:target" />
                </span>
                <div>
                  <h3 className="qa-h4 is-light">Why Learn from QIMD Trainers?</h3>
                  <span className="qa-rot-tag">How They Help You</span>
                </div>
              </div>
              <div className="qa-icon-list">
                {benefits.map((item, i) => (
                  <div key={i} className="qa-icon-row">
                    <Icon icon={item.icon} />
                    <span>{item.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CLOSING CALL TO ACTION */}
      <section className="qa-sec qa-sec-last">
        <div className="qa-wrap">
          <div className="qa-tile qa-tile-night qa-cta">
            <div>
              <QaKicker icon="mdi:school-outline" light>Transform Your Future</QaKicker>
              <h2 className="qa-h2 is-light">Learn from Professionals. Grow with Confidence.</h2>
              <div className="qa-copy is-light">
                <p>
                  At QIMD, every trainer is committed to helping students build practical skills, industry knowledge, and the confidence to succeed in today&apos;s competitive digital world.
                </p>
                <p>
                  Our goal is simple - to ensure every student graduates with the experience, portfolio, and expertise needed to build a successful career.
                </p>
                <p className="qa-lime-text">Learn from experts. Practice on live projects. Become industry-ready with QIMD.</p>
              </div>
            </div>
            <div className="qa-actions qa-cta-actions">
              <Link href="/courses" className="qa-btn qa-btn-lime">
                Explore Programs
              </Link>
              <Link href="/contact" className="qa-btn qa-btn-glass">
                Connect with Mentors
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

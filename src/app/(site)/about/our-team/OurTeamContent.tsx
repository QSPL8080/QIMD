'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react/dist/iconify.js";
import { siteSettings } from "@/data/siteSettings";
import { AboutTabs, QaKicker, QaHead, QaCheck } from "@/components/About/AboutKit";

export default function OurTeamContent({ dynamicTrainers }: { dynamicTrainers?: any[] }) {
  const { phone, teamGroupPhoto } = siteSettings;
  const contactPhone = phone || "+91 7410-106608";

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

  const mentorPoints = [
    "Master practical skills",
    "Work on live client projects",
    "Build an industry-ready portfolio",
    "Stay updated with latest AI tools",
    "Prepare for interviews & placements",
  ];
  const telHref = `tel:${contactPhone.replace(/[^\d+]/g, '')}`;

  return (
    <div className="qa">
      <AboutTabs />

      {/* 1. HERO — BENTO WITH GROUP PHOTO */}
      <section className="qa-sec qa-hero">
        <div className="qa-wrap">
          <div className="qa-bento qa-hero-bento qa-hero-photo">
            <div className="qa-tile qa-tile-white qa-hero-main">
              <QaKicker icon="mdi:account-group-outline">Our Team</QaKicker>
              <h1 className="qa-h1">Meet the Experts Behind QIMD</h1>
              <div className="qa-copy">
                <p>
                  At <strong>QIMD (Quickupp Institute of Marketing &amp; Design)</strong>, our greatest strength is our team. We are a group of experienced marketers, designers, video editors, trainers, and industry professionals dedicated to helping students build successful careers.
                </p>
              </div>
            </div>

            <div className="qa-tile qa-photo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={teamGroupPhoto || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&q=80"}
                alt="QIMD Team Group Photo"
              />
            </div>

            <div className="qa-tile qa-tile-accent qa-hero-strip">
              <Icon icon="mdi:lightning-bolt-outline" className="qa-tile-big-ic" />
              <p className="qa-accent-text">
                Our mentors don&apos;t just teach — they actively work on real client projects, ensuring every student learns the latest industry trends, AI-powered tools, and practical skills that employers value.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LEARN FROM INDUSTRY PROFESSIONALS & WHAT MAKES OUR TEAM DIFFERENT */}
      <section className="qa-sec">
        <div className="qa-wrap">
          <div className="qa-bento qa-two">
            <div className="qa-tile qa-tile-white qa-flex">
              <QaKicker icon="mdi:school-outline">Expert Mentorship</QaKicker>
              <h2 className="qa-h2">
                Learn from <span className="qa-accent">Industry Professionals</span>
              </h2>
              <div className="qa-copy">
                <p>
                  Our faculty brings together expertise from digital marketing agencies, creative studios, branding, performance marketing, content creation, and video production.
                </p>
              </div>
              <p className="qa-note">
                <strong>Every training session is designed to combine theory with practical implementation, giving students the confidence to work on real-world projects from day one.</strong>
              </p>
            </div>

            <div className="qa-tile qa-tile-soft qa-flex">
              <QaKicker icon="mdi:star-check-outline">Why QIMD Mentors</QaKicker>
              <h2 className="qa-h2">
                What Makes Our <span className="qa-accent">Team Different?</span>
              </h2>
              <div className="qa-copy">
                <p>
                  We go beyond traditional teaching to give you hands-on mentorship, real agency exposure, and dedicated career guidance.
                </p>
              </div>
              <div className="qa-checks">
                {differPoints.map((point, index) => (
                  <QaCheck key={index}>{point}</QaCheck>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. OUR LEADERSHIP, OUR MENTORS & CORE MISSION */}
      <section className="qa-sec">
        <div className="qa-wrap">
          <div className="qa-dots">
            {[0, 1, 2].map((idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveCardIndex(idx)}
                aria-label={`Highlight card ${idx + 1}`}
                className={`qa-dot${activeCardIndex === idx ? " is-active" : ""}`}
              />
            ))}
          </div>

          <div className="qa-bento qa-three qa-rotate">
            <div
              onClick={() => setActiveCardIndex(0)}
              className={`qa-tile qa-flex qa-rot ${activeCardIndex === 0 ? "qa-tile-night is-active" : "qa-tile-white"}`}
            >
              <div className="qa-rot-head">
                <span className="qa-ic">
                  <Icon icon="mdi:account-tie" />
                </span>
                <div>
                  <h3 className="qa-h4">Our Leadership</h3>
                  <span className="qa-rot-tag">Vision &amp; Direction</span>
                </div>
              </div>
              <p>Our leadership team is committed to creating an institute where education goes beyond textbooks.</p>
              <p className="qa-rot-box">
                By combining innovation, practical learning, and industry collaboration, we ensure every student receives the guidance, mentorship, and opportunities needed to become a successful digital professional.
              </p>
            </div>

            <div
              onClick={() => setActiveCardIndex(1)}
              className={`qa-tile qa-flex qa-rot ${activeCardIndex === 1 ? "qa-tile-night is-active" : "qa-tile-white"}`}
            >
              <div className="qa-rot-head">
                <span className="qa-ic">
                  <Icon icon="mdi:school-outline" />
                </span>
                <div>
                  <h3 className="qa-h4">Our Mentors</h3>
                  <span className="qa-rot-tag">Practicing Experts</span>
                </div>
              </div>
              <p>Our mentors are passionate educators and working professionals who bring real business experience into the classroom.</p>
              <p className="qa-rot-label">They help students:</p>
              <div className="qa-checks is-single">
                {mentorPoints.map((item, idx) => (
                  <QaCheck key={idx} light={activeCardIndex === 1}>{item}</QaCheck>
                ))}
              </div>
            </div>

            <div
              onClick={() => setActiveCardIndex(2)}
              className={`qa-tile qa-flex qa-rot ${activeCardIndex === 2 ? "qa-tile-night is-active" : "qa-tile-white"}`}
            >
              <div className="qa-rot-head">
                <span className="qa-ic">
                  <Icon icon="mdi:target" />
                </span>
                <div>
                  <h3 className="qa-h4">Student Success is Our Mission</h3>
                  <span className="qa-rot-tag">Our Core Goal</span>
                </div>
              </div>
              <p className="qa-rot-box">
                Every member of our team shares one common goal: To transform aspiring learners into confident, skilled, and industry-ready professionals through practical learning, expert mentorship, and real-world experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MEET THE TEAM */}
      <section className="qa-sec" id="meet-the-team">
        <div className="qa-wrap">
          <QaHead
            kicker="Team Members"
            icon="mdi:account-group"
            title="Meet the Team"
            desc={
              <>
                <p className="qa-sub">Experienced Trainers. Creative Thinkers. Industry Mentors. Career Builders.</p>
                <p>Behind every successful QIMD student is a dedicated team committed to guiding, supporting, and inspiring them throughout their learning journey.</p>
              </>
            }
          />
          <div className="qa-people">
            {teamList.map((member, idx) => (
              <div key={idx} className="qa-person">
                <div className="qa-person-photo">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={member.photo} alt={member.name} />
                  <span className="qa-person-num">{String(idx + 1).padStart(2, "0")}</span>
                </div>
                <div className="qa-person-body">
                  <h3 className="qa-person-name">{member.name}</h3>
                  <span className="qa-person-role">{member.designation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. JOIN OUR COMMUNITY CTA */}
      <section className="qa-sec qa-sec-last">
        <div className="qa-wrap">
          <div className="qa-tile qa-tile-night qa-cta">
            <div>
              <QaKicker icon="mdi:account-group" light>Join Our Community</QaKicker>
              <h2 className="qa-h2 is-light">Join Our Community</h2>
              <div className="qa-copy is-light">
                <p>
                  Learn from professionals who practice what they teach. Experience AI-powered, project-based learning with mentors who are invested in your success.
                </p>
                <p className="qa-lime-text">Build Skills. Gain Experience. Launch Your Career with QIMD.</p>
              </div>
            </div>
            <div className="qa-actions qa-cta-actions">
              <Link href="/contact" className="qa-btn qa-btn-lime">
                Get Enrolled Today
              </Link>
              <Link href={telHref} className="qa-btn qa-btn-glass">
                <Icon icon="mdi:phone" />
                <span>{contactPhone}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

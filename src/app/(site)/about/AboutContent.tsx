'use client';

import React, { useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react/dist/iconify.js";
import { siteSettings } from "@/data/siteSettings";
import { AboutTabs, QaKicker, QaHead } from "@/components/About/AboutKit";

export default function AboutContent({ dynamicTrainers }: { dynamicTrainers?: any[] } = {}) {
  const { phone } = siteSettings;
  const contactPhone = phone || "+91 7410-106608";
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

  const missionPillars = [
    { title: "Practical Learning", icon: "mdi:laptop" },
    { title: "AI Tools", icon: "mdi:robot-outline" },
    { title: "Live Projects", icon: "mdi:briefcase-outline" },
    { title: "Internship Experience", icon: "mdi:account-tie" },
    { title: "Portfolio Building", icon: "mdi:folder-star-outline" },
    { title: "Career Preparation", icon: "mdi:rocket-launch-outline" },
  ];
  const telHref = `tel:${contactPhone.replace(/[^\d+]/g, '')}`;

  return (
    <div className="qa">
      <AboutTabs />

      {/* 1. HERO — BENTO */}
      <section className="qa-sec qa-hero">
        <div className="qa-wrap">
          <div className="qa-bento qa-hero-bento">
            <div className="qa-tile qa-tile-white qa-hero-main">
              <QaKicker icon="mdi:shield-check-outline">India&apos;s Trusted Practical Learning Institute</QaKicker>
              <h1 className="qa-h1">
                Learn. Practice. Work. <span className="qa-accent">Build Your Career.</span>
              </h1>
              <div className="qa-copy">
                <p>
                  In today&apos;s rapidly changing digital industry, knowing the theory is not enough. Businesses are looking for professionals who can actually execute campaigns, create designs, edit videos, use AI tools, solve real problems and deliver results.
                </p>
                <p>
                  Our programs combine structured learning, AI-powered tools, practical assignments, live client projects, industry mentorship and internship experience to help students become industry-ready professionals.
                </p>
              </div>
              <div className="qa-actions">
                <Link href="/courses" className="qa-btn qa-btn-accent">
                  <span>Explore Programs</span>
                  <Icon icon="mdi:arrow-right" />
                </Link>
                <Link href={telHref} className="qa-btn qa-btn-soft">
                  <Icon icon="mdi:phone-in-talk-outline" />
                  <span>Talk to Counselor</span>
                </Link>
              </div>
            </div>

            <div className="qa-tile qa-tile-night qa-quote-tile">
              <Icon icon="mdi:format-quote-open" className="qa-quote-mark" />
              <p className="qa-quote-text">
                QIMD is built with one clear mission - to bridge the gap between learning and real-world industry experience.
              </p>
            </div>

            <div className="qa-tile qa-tile-accent">
              <Icon icon="mdi:lightning-bolt-outline" className="qa-tile-big-ic" />
              <p className="qa-accent-text">
                That&apos;s why at QIMD, we have created a practical, AI-powered learning model where students don&apos;t just learn concepts - they apply them on real projects from Day One.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WHY QIMD? & AI-POWERED & PRACTICAL LEARNING */}
      <section className="qa-sec" id="why-qimd">
        <div className="qa-wrap">
          <div className="qa-bento qa-two">
            <div className="qa-tile qa-tile-white qa-flex">
              <QaKicker icon="mdi:school-outline">Why QIMD?</QaKicker>
              <h3 className="qa-h3">Why QIMD?</h3>
              <p className="qa-sub">Learn. Practice. Work.</p>
              <div className="qa-copy">
                <p>
                  Unlike traditional institutes that primarily focus on classroom-based theoretical learning, QIMD follows a <strong>theory + practical + real-project approach</strong>.
                </p>
                <p>
                  With one session focused on understanding the concepts and the next focused on practical implementation, students get a deeper understanding of how things actually work in the industry.
                </p>
              </div>
              <p className="qa-note">
                Our learning model is simple: <strong>Learn the concept &rarr; Practice it &rarr; Apply it on real projects &rarr; Build your portfolio &rarr; Prepare for your career.</strong>
              </p>
            </div>

            <div className="qa-tile qa-tile-soft qa-flex">
              <QaKicker icon="mdi:robot-outline">AI-Powered</QaKicker>
              <h3 className="qa-h3">AI-Powered &amp; Practical Learning</h3>
              <p className="qa-sub">Modern AI Tools &amp; Workflows</p>
              <div className="qa-copy">
                <p className="qa-strong">AI is transforming the way digital professionals work.</p>
                <p>
                  That&apos;s why our programs are designed around the latest AI tools, technologies and industry workflows, helping students understand not only traditional skills but also how AI can be used to improve productivity, creativity and execution.
                </p>
              </div>
              <p className="qa-note">
                Our programs cover <strong>Basic to Advanced levels</strong>, making them suitable for beginners as well as learners looking to develop professional skills.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. OUR PROGRAMS */}
      <section className="qa-sec">
        <div className="qa-wrap">
          <QaHead
            kicker="Training Offerings"
            icon="mdi:laptop"
            title="Our Programs"
            desc="Industry-driven practical training programs designed to build professional competence."
          />
          <div className="qa-bento qa-three">
            {programs.map((prog, idx) => (
              <div key={idx} className={`qa-tile ${idx === 1 ? "qa-tile-night" : "qa-tile-white"} qa-flex qa-program`}>
                <div className="qa-program-top">
                  <span className="qa-ic">
                    <Icon icon={prog.icon} />
                  </span>
                  <span className="qa-chip">{prog.level}</span>
                </div>
                <h3 className="qa-h3">{prog.title}</h3>
                <p className="qa-program-desc">
                  <strong>{prog.level}</strong> - {prog.description.replace(/^Basic to Advanced -\s*/i, '')}
                </p>
                <Link href="/courses" className={`qa-btn ${idx === 1 ? "qa-btn-lime" : "qa-btn-dark"} qa-btn-block`}>
                  <span>View Program Details</span>
                  <Icon icon="mdi:arrow-right" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. 6 MONTHS LEARNING + 3 MONTHS INTERNSHIP */}
      <section className="qa-sec">
        <div className="qa-wrap">
          <div className="qa-tile qa-tile-night qa-duration">
            <div>
              <QaKicker icon="mdi:calendar-clock-outline" light>Program Duration &amp; Structure</QaKicker>
              <h2 className="qa-h2 is-light">6 Months Learning + 3 Months Internship</h2>
              <p className="qa-muted-light">At QIMD, learning doesn&apos;t stop when the classroom sessions end.</p>
            </div>
            <div className="qa-duration-side">
              <p className="qa-duration-lead">Our program includes:</p>
              <div className="qa-stat-row">
                <div className="qa-stat">
                  <span className="qa-stat-num">6</span>
                  <span className="qa-stat-label">Months of Practical Training</span>
                </div>
                <span className="qa-stat-plus">+</span>
                <div className="qa-stat">
                  <span className="qa-stat-num">3</span>
                  <span className="qa-stat-label">Months of Internship.</span>
                </div>
              </div>
              <div className="qa-duration-note">
                <p className="qa-strong-light">Most importantly, students start working on practical projects from Day One.</p>
                <p>
                  The objective is to ensure that by the time students complete the program, they have more than just a certificate - they have actual experience, project exposure and a professional portfolio.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. LEARN THROUGH REAL CLIENT PROJECTS */}
      <section className="qa-sec" id="real-client-projects">
        <div className="qa-wrap">
          <QaHead
            kicker="Domestic & Global Projects"
            icon="mdi:earth"
            title="Learn Through Real Client Projects"
            desc={
              <>
                <p className="qa-sub">This is what makes the QIMD learning model different.</p>
                <p>During the internship phase, students get exposure to both domestic and global projects.</p>
              </>
            }
          />

          <div className="qa-bento qa-team-bento">
            <div className="qa-tile qa-tile-accent qa-team-intro">
              <h3 className="qa-h3 is-light">With the launch of our three programs, we are creating interdisciplinary teams consisting of:</h3>
            </div>
            {interdisciplinaryTeams.map((item, idx) => (
              <div key={idx} className="qa-tile qa-tile-white qa-role">
                <span className="qa-ic">
                  <Icon icon={item.icon} />
                </span>
                <h4>{item.role}</h4>
              </div>
            ))}
            <div className="qa-tile qa-tile-soft qa-team-note">
              <p className="qa-strong">Teams can work together on 2-3 client projects.</p>
              <p>These teams get an opportunity to experience how different creative and marketing functions work together in a real business environment.</p>
            </div>
          </div>

          <div className="qa-points-head">
            <h3 className="qa-h3">Students don&apos;t simply complete classroom assignments.</h3>
            <p>They get the opportunity to understand:</p>
          </div>
          <div className="qa-points">
            {clientProjectPoints.map((item, idx) => (
              <div key={idx} className="qa-point">
                <span className="qa-point-num">{String(idx + 1).padStart(2, "0")}</span>
                <Icon icon={item.icon} className="qa-point-ic" />
                <span className="qa-point-text">{item.title}</span>
              </div>
            ))}
          </div>
          <p className="qa-banner">
            <Icon icon="mdi:target" />
            <span>Our goal is simple: give students real-world experience before they start their careers.</span>
          </p>
        </div>
      </section>

      {/* 6. BUILD A PORTFOLIO, NOT JUST A CERTIFICATE */}
      <section className="qa-sec">
        <div className="qa-wrap">
          <div className="qa-bento qa-split">
            <div className="qa-tile qa-tile-accent qa-flex">
              <QaKicker icon="mdi:folder-star-outline" light>Practical Proof of Work</QaKicker>
              <h2 className="qa-h2 is-light">Build a Portfolio, Not Just a Certificate</h2>
              <p className="qa-accent-text">
                A certificate can show that you completed a program. A portfolio can show what you can actually do.
              </p>
            </div>
            <div className="qa-tile qa-tile-white qa-flex">
              <div className="qa-copy">
                <p>
                  At QIMD, we help students build a professional portfolio based on the projects and work they complete during their learning and internship journey.
                </p>
                <p>
                  This portfolio can become an important asset when applying for jobs, internships, freelance projects, agency opportunities and client work.
                </p>
              </div>
              <p className="qa-note">
                <strong>Students finish their journey with work they can actually showcase.</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. YOUR CAREER JOURNEY STARTS WITH QIMD */}
      <section className="qa-sec">
        <div className="qa-wrap">
          <QaHead
            kicker="Career Roadmap"
            icon="mdi:school-outline"
            title="Your Career Journey Starts With QIMD"
            desc="We don't want students to simply complete a program. We want them to be ready to enter the industry."
          />
          <div className="qa-bento qa-three">
            {careerItems.map((item, idx) => (
              <div key={idx} className="qa-tile qa-tile-white qa-feature">
                <div className="qa-feature-top">
                  <span className="qa-ic">
                    <Icon icon={item.icon} />
                  </span>
                  <span className="qa-feature-num">{String(idx + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="qa-h4">{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. OUR VISION & OUR MISSION */}
      <section className="qa-sec">
        <div className="qa-wrap">
          <div className="qa-bento qa-two">
            <div className="qa-tile qa-tile-white qa-flex">
              <QaKicker icon="mdi:eye-outline">Our Vision</QaKicker>
              <h3 className="qa-h3">From Learning to Real-World Experience</h3>
              <div className="qa-copy">
                <p>
                  We identified a major gap in the traditional education and training system: students learn concepts, but often don&apos;t get enough opportunities to apply them in real-world situations.
                </p>
                <p>At the same time, the digital industry is rapidly evolving with AI, automation and new-age tools.</p>
                <p>We believe students deserve an education model that prepares them for this reality.</p>
                <p>That&apos;s why QIMD is built around AI-powered, practical and industry-oriented learning.</p>
              </div>
              <p className="qa-note">
                Our vision is to create professionals who don&apos;t just say: &ldquo;I have completed a program.&rdquo; But can confidently say: <strong>&ldquo;I know how to do the work.&rdquo;</strong>
              </p>
            </div>

            <div className="qa-tile qa-tile-night qa-flex">
              <QaKicker icon="mdi:target" light>Our Mission</QaKicker>
              <h3 className="qa-h3 is-light">Our Mission</h3>
              <div className="qa-copy is-light">
                <p className="qa-strong-light">To make students industry-ready before they begin their professional careers.</p>
                <p className="qa-lime-text">We aim to achieve this by combining:</p>
              </div>
              <div className="qa-pillars">
                {missionPillars.map((pillar, pIdx) => (
                  <div key={pIdx} className="qa-pillar">
                    <Icon icon={pillar.icon} />
                    <span>{pillar.title}</span>
                  </div>
                ))}
              </div>
              <p className="qa-note is-light">
                Because we believe the best way to learn a skill is not just to study it - but to actually use it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. VIDEO + LAUNCH YOUR CAREER */}
      <section className="qa-sec qa-sec-last">
        <div className="qa-wrap">
          <div className="qa-bento qa-launch">
            <div className="qa-tile qa-video">
              {isPlayingVideo ? (
                <iframe
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0"
                  title="QIMD Institute - Practical Learning Experience"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <button type="button" onClick={() => setIsPlayingVideo(true)} className="qa-video-poster" aria-label="Click to Play Video">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80"
                    alt="QIMD Practical Learning & Campus Experience"
                  />
                  <span className="qa-play">
                    <Icon icon="mdi:play" />
                  </span>
                  <span className="qa-play-label">Click to Play Video</span>
                </button>
              )}
            </div>

            <div className="qa-tile qa-tile-night qa-flex qa-launch-cta">
              <QaKicker icon="mdi:rocket-launch-outline" light>Launch Your Career</QaKicker>
              <h2 className="qa-h2 is-light">QIMD - Learn. Practice. Work. Launch Your Career.</h2>
              <div className="qa-copy is-light">
                <p>
                  Don&apos;t just learn skills. Build experience. Build your portfolio. Build your confidence. Get ready for the real industry with QIMD.
                </p>
                <p className="qa-lime-text">Build Skills. Gain Experience. Launch Your Career with QIMD.</p>
              </div>
              <div className="qa-actions">
                <Link href="/courses" className="qa-btn qa-btn-lime">
                  Explore Programs
                </Link>
                <Link href={telHref} className="qa-btn qa-btn-glass">
                  <Icon icon="mdi:phone" />
                  <span>{contactPhone}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

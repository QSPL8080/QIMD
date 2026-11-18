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



  const methodology = [
    { step: "01", title: "Learn", desc: "Interactive Classroom Sessions", icon: "mdi:book-open-variant" },
    { step: "02", title: "Practice", desc: "Hands-on AI Tool Workflows", icon: "mdi:laptop" },
    { step: "03", title: "Implement", desc: "Real Client Campaign Work", icon: "mdi:cog-sync" },
    { step: "04", title: "Build Portfolio", desc: "Verified Professional Assets", icon: "mdi:folder-star-outline" },
    { step: "05", title: "Internship", desc: "Real Business Workplace Exposure", icon: "mdi:briefcase-outline" },
    { step: "06", title: "Placement Assistance", desc: "Hiring Drives & Interview Coaching", icon: "mdi:check-circle-outline" },
  ];

  const whoCanJoin = [
    { label: "Students", desc: "Looking to build practical career skills early", icon: "mdi:account-school-outline" },
    { label: "Fresh Graduates", desc: "Seeking job-ready practical training & placements", icon: "mdi:certificate-outline" },
    { label: "Job Seekers", desc: "Aiming for high-growth tech & creative roles", icon: "mdi:briefcase-search-outline" },
    { label: "Working Professionals", desc: "Upskilling with modern AI tools & strategies", icon: "mdi:account-tie-outline" },
    { label: "Freelancers", desc: "Scaling client services & project quality", icon: "mdi:laptop-account" },
    { label: "Entrepreneurs", desc: "Growing their own business & brand presence", icon: "mdi:rocket-launch-outline" },
    { label: "Career Switchers", desc: "Transitioning into digital marketing, design or video", icon: "mdi:swap-horizontal-bold" },
  ];

  const promisePillars = [
    { label: "Practical Implementation", icon: "mdi:laptop" },
    { label: "AI-Powered Tools", icon: "mdi:robot-outline" },
    { label: "Verified Portfolio", icon: "mdi:folder-star-outline" },
    { label: "Career Mentorship", icon: "mdi:handshake-outline" },
  ];

  return (
    <div className="qy">
      {/* 1. HERO */}
      <section className="qy-hero" data-qx="off">
        <div className="qy-wrap qy-hero-grid">
          <div className="qy-hero-copy">
            <span className="qy-kicker">
              <span className="qy-kicker-bar" aria-hidden="true" />
              Why Choose QIMD?
            </span>
            <h1 className="qy-h1">
              Build Your Career Through <span className="qy-accent">AI-Powered Practical Learning</span>
            </h1>
            <p className="qy-lead">
              Whether you&apos;re a student, graduate, job seeker, freelancer, entrepreneur, or working professional, our training prepares you to become confident, skilled, and industry-ready.
            </p>
            <div className="qy-actions">
              <Link href="/courses" className="qy-btn qy-btn-main">
                <Icon icon="mdi:compass-outline" />
                <span>Explore Our Programs</span>
              </Link>
              <Link href="/contact" className="qy-btn qy-btn-soft">
                <Icon icon="mdi:calendar-check-outline" />
                <span>Book Free Career Session</span>
              </Link>
            </div>
          </div>

          <div className="qy-statement">
            <p>
              At <strong>QIMD (Quickupp Institute of Marketing &amp; Design)</strong>, we believe that successful careers are built through practical experience, not just theory. Our AI-powered, industry-driven programs are designed to help students develop real-world skills by working on live projects under the guidance of experienced professionals.
            </p>
          </div>
        </div>
      </section>

      {/* 2. KEY ADVANTAGES — sticky heading, numbered list */}
      <section className="qy-sec">
        <div className="qy-wrap qy-split">
          <div className="qy-split-head">
            <span className="qy-kicker">
              <span className="qy-kicker-bar" aria-hidden="true" />
              Key Advantages
            </span>
            <h2 className="qy-h2">Why Thousands of Students Choose QIMD</h2>
            <p className="qy-lead">
              Every detail of our institute is engineered to bridge the gap between classroom education and high-growth industry careers.
            </p>
          </div>
          <ol className="qy-reasons">
            {whyChoosePoints.map((point, i) => (
              <li key={point.title} className="qy-reason">
                <span className="qy-reason-num">{String(i + 1).padStart(2, "0")}</span>
                <span className="qy-reason-ic"><Icon icon={point.icon} /></span>
                <div>
                  <h3>{point.title}</h3>
                  <p>{point.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 3. LEARNING JOURNEY & ELIGIBILITY */}
      <section className="qy-sec qy-sec-blue">
        <div className="qy-wrap">
          <div className="qy-head">
            <span className="qy-kicker">
              <span className="qy-kicker-bar" aria-hidden="true" />
              Structured Framework
            </span>
            <h2 className="qy-h2">Learning Journey &amp; Eligibility</h2>
            <p className="qy-lead">We ensure every student gains practical knowledge through continuous implementation.</p>
          </div>

          <div className="qy-sub-head">
            <span className="qy-sub-ic"><Icon icon="mdi:school-outline" /></span>
            <div>
              <h3>Our Learning Methodology</h3>
              <span>6-Step Execution Flow</span>
            </div>
          </div>
          <ol className="qy-stairs">
            {methodology.map((m, i) => (
              <li key={m.step} className="qy-stair" style={{ ['--i' as any]: i }}>
                <span className="qy-stair-num">{m.step}</span>
                <span className="qy-stair-ic"><Icon icon={m.icon} /></span>
                <strong>{m.title}</strong>
                <span className="qy-stair-desc">{m.desc}</span>
              </li>
            ))}
          </ol>

          <div className="qy-sub-head">
            <span className="qy-sub-ic"><Icon icon="mdi:account-group-outline" /></span>
            <div>
              <h3>Who Can Join QIMD?</h3>
              <span>No Prior Experience Required</span>
            </div>
          </div>
          <div className="qy-joiners">
            {whoCanJoin.map((item) => (
              <div key={item.label} className="qy-joiner">
                <span className="qy-joiner-ic"><Icon icon={item.icon} /></span>
                <strong>{item.label}</strong>
                <span>{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. OUR PROMISE */}
      <section className="qy-sec qy-sec-navy">
        <div className="qy-wrap">
          <div className="qy-promise">
            <span className="qy-kicker is-light">
              <Icon icon="mdi:shield-check" />
              The QIMD Commitment
            </span>
            <h2 className="qy-h2 is-light">Our Promise to Every Student</h2>
            <p className="qy-promise-text">
              At QIMD, we don&apos;t just teach software or concepts. We help you develop practical skills, build confidence, create a professional portfolio, and prepare for real career opportunities.
            </p>
            <p className="qy-promise-mission">
              Our mission is to transform aspiring learners into industry-ready professionals through AI-powered education, practical implementation, and expert mentorship.
            </p>
            <div className="qy-pillars">
              {promisePillars.map((item) => (
                <div key={item.label} className="qy-pillar">
                  <Icon icon={item.icon} />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. WHY WAIT? */}
      <section className="qy-sec qy-sec-last">
        <div className="qy-wrap">
          <div className="qy-cta">
            <div>
              <span className="qy-kicker">
                <Icon icon="mdi:rocket-launch-outline" />
                Start Today
              </span>
              <h2 className="qy-h2">Why Wait?</h2>
            </div>
            <div className="qy-cta-body">
              <p className="qy-strong">Your career deserves more than theoretical knowledge.</p>
              <p>
                Join QIMD and learn through AI-powered practical training, live client projects, internships, and expert guidance to become industry-ready from day one.
              </p>
              <div className="qy-actions">
                <Link href="/courses" className="qy-btn qy-btn-main">
                  View All Programs
                </Link>
                <Link href="/contact" className="qy-btn qy-btn-soft">
                  Contact Admissions
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

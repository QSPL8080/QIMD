'use client'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Icon } from '@iconify/react/dist/iconify.js'
import { placedStudentsData, testimonialsData, placementPartnersData } from '@/data'
import PlacementCard from '@/components/Common/PlacementCard'
import VideoModal from '@/components/Common/VideoModal'
import { getPublicPartnersAction, getPublicTestimonialsAction, getPublicPlacementsAction, getPublicStudentReviewsAction } from '@/app/actions/partnerActions'

const StarRating: React.FC<{ rating: number }> = ({ rating = 5 }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Icon
        key={i}
        icon={i < rating ? 'mdi:star' : 'mdi:star-outline'}
        className={i < rating ? 'text-amber-400 text-sm sm:text-base' : 'text-slate-300 dark:text-white/20 text-sm sm:text-base'}
      />
    ))}
  </div>
)

const PlacementPartnerLogo: React.FC<{ partner: any }> = ({ partner }) => {
  const fallback = placementPartnersData.find(
    (p) => p.name.toLowerCase() === (partner.name || '').toLowerCase()
  )?.logo || ''

  const [src, setSrc] = useState<string>(partner.logo || fallback)
  const [hasError, setHasError] = useState(false)

  if (hasError || !src) {
    return (
      <span className="text-xs font-extrabold text-slate-800 dark:text-white/90 px-2.5 py-1 bg-slate-100 dark:bg-darklight rounded-lg">
        {partner.name}
      </span>
    )
  }

  return (
    <img
      src={src}
      alt={partner.name}
      onError={() => {
        if (fallback && src !== fallback) {
          setSrc(fallback)
        } else {
          setHasError(true)
        }
      }}
      className="max-h-10 max-w-full object-contain transition-transform duration-300 hover:scale-110"
    />
  )
}

const PlacementPhilosophySection: React.FC<{ hiringIndustries: string[] }> = ({ hiringIndustries }) => {
  const [inView, setInView] = useState(false)
  const sectionRef = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
      },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const graduatePoints = [
    "Industry-Relevant Skills",
    "Live Project Experience",
    "Professional Portfolio",
    "Resume & LinkedIn Profile",
    "Interview Preparation",
    "Career Guidance",
  ]

  return (
    <section
      ref={sectionRef}
      className="py-16 lg:py-24 text-white relative overflow-hidden border-b border-white/10"
      style={{
        background: 'linear-gradient(135deg, #180e29 0%, #2b1654 35%, #3e1f7d 70%, #0284c7 100%)',
      }}
    >
      {/* Subtle Ambient Decorative Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#764DFF]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#0284c7]/20 blur-3xl pointer-events-none" />

      <div className="container mx-auto max-w-7xl px-4 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          
          {/* Left Column: Our Placement Philosophy */}
          <div
            className={`bg-white/10 dark:bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl space-y-5 flex flex-col justify-between h-full hover:border-cyan-300 hover:shadow-2xl transition-all duration-700 text-white ${
              inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-white/15">
                <div className="w-10 h-10 rounded-2xl bg-white/15 text-cyan-300 flex items-center justify-center text-xl shrink-0 border border-white/25">
                  <Icon icon="mdi:lightbulb-on-outline" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    Our Placement Philosophy
                  </h2>
                  <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider">Skill-First Approach</span>
                </div>
              </div>

              <p className="text-white font-bold text-xs sm:text-sm">
                We believe that practical skills create confident professionals.
              </p>
              <p className="text-slate-200 text-xs sm:text-sm leading-relaxed font-normal">
                That&apos;s why our placement process focuses on developing not only technical expertise but also the communication, confidence, and professional readiness employers look for.
              </p>
            </div>

            <div className="pt-3 border-t border-white/15">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-300 mb-3">Our Students Graduate With:</p>
              <div className="grid grid-cols-2 gap-2.5">
                {graduatePoints.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      transitionDelay: `${idx * 110 + 150}ms`,
                    }}
                    className={`bg-white/10 p-2.5 rounded-xl border border-white/15 text-[11px] font-bold text-white flex items-center gap-2 shadow-xs hover:border-cyan-300 hover:bg-white/20 hover:scale-[1.03] cursor-default group transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] ${
                      inView
                        ? 'opacity-100 scale-100 translate-y-0 blur-none'
                        : 'opacity-0 scale-40 translate-y-6 blur-xs pointer-events-none'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-md bg-white/15 text-cyan-300 flex items-center justify-center text-xs shrink-0 group-hover:bg-white group-hover:text-[#180e29] group-hover:scale-110 transition-all duration-200">
                      <Icon icon="mdi:check-bold" />
                    </div>
                    <span className="group-hover:text-cyan-300 transition-colors">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Hiring Opportunities Across Industries */}
          <div
            className={`bg-white/10 dark:bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl space-y-5 flex flex-col justify-between h-full hover:border-cyan-300 hover:shadow-2xl transition-all duration-700 delay-100 text-white ${
              inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-white/15">
                <div className="w-10 h-10 rounded-2xl bg-white/15 text-cyan-300 flex items-center justify-center text-xl shrink-0 border border-white/25">
                  <Icon icon="mdi:domain" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    Hiring Opportunities Across Industries
                  </h2>
                  <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider">Diverse Career Reach</span>
                </div>
              </div>

              <p className="text-slate-200 text-xs sm:text-sm leading-relaxed font-normal">
                Our students are prepared for high-demand opportunities across diverse companies, agencies, and growing startups:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 flex-1">
              {hiringIndustries.map((ind, i) => (
                <div
                  key={i}
                  style={{
                    transitionDelay: `${i * 80 + 200}ms`,
                  }}
                  className={`bg-white/10 p-3 rounded-2xl border border-white/15 text-xs font-bold text-white flex items-center gap-2.5 shadow-xs hover:border-cyan-300 hover:bg-white/20 hover:scale-[1.03] group cursor-default transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] ${
                    inView
                      ? 'opacity-100 scale-100 translate-y-0 blur-none'
                      : 'opacity-0 scale-40 translate-y-6 blur-xs pointer-events-none'
                  }`}
                >
                  <div className="w-7 h-7 rounded-xl bg-white/15 text-cyan-300 flex items-center justify-center text-xs shrink-0 border border-white/20 group-hover:bg-white group-hover:text-[#180e29] group-hover:rotate-6 transition-all duration-200">
                    <Icon icon="mdi:briefcase-outline" />
                  </div>
                  <span className="leading-tight group-hover:text-cyan-300 transition-colors">{ind}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

export default function PlacementsPage() {
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string } | null>(null)
  const [hiringPartners, setHiringPartners] = useState(placementPartnersData)
  const [allTestimonials, setAllTestimonials] = useState<any[]>(testimonialsData)
  const [placedStudents, setPlacedStudents] = useState<any[]>(placedStudentsData)
  const [studentReviewsList, setStudentReviewsList] = useState<any[]>([])

  useEffect(() => {
    getPublicPartnersAction('HIRING').then((data) => {
      if (data && data.length > 0) {
        setHiringPartners(data as any)
      }
    })
    getPublicTestimonialsAction().then((data) => {
      if (data && data.length > 0) {
        setAllTestimonials(data as any)
      }
    })
    getPublicPlacementsAction().then((data) => {
      if (data && data.length > 0) {
        setPlacedStudents(data as any)
      }
    })
    getPublicStudentReviewsAction().then((data) => {
      if (data && data.length > 0) {
        setStudentReviewsList(data as any)
      }
    })
  }, [])

  const videoReviews = allTestimonials.filter((t) => t.isVideo && t.videoUrl && t.videoUrl.trim() !== '')

  const defaultStudentReviews = [
    {
      name: "Rohan Verma",
      course: "Digital Marketing Master Program",
      review: "The practical training and live client projects helped me build confidence and prepare for interviews. The trainers were supportive throughout my learning journey.",
      rating: 5,
    },
    {
      name: "Sneha More",
      course: "UI/UX & Graphic Design Program",
      review: "The AI-powered curriculum, internships, and placement guidance gave me the skills I needed to start my career with confidence.",
      rating: 5,
    },
    {
      name: "Aniket Kulkarni",
      course: "Video Editing & Content Creation",
      review: "Unlike traditional institutes, QIMD focuses on practical implementation. Every assignment and project helped me understand how the industry actually works.",
      rating: 5,
    },
    {
      name: "Pooja Sharma",
      course: "Full-Stack Digital Marketing & AI",
      review: "From zero experience to working on real client projects, the journey at QIMD has been truly rewarding. I highly recommend it to anyone looking to build a career in the digital industry.",
      rating: 5,
    },
  ]

  const combinedTextReviews = studentReviewsList.length > 0 ? studentReviewsList : defaultStudentReviews

  const placementAssistance = [
    {
      title: "Resume Building",
      desc: "Create a professional resume that highlights your practical experience, projects, and achievements.",
      icon: "mdi:file-document-edit-outline",
    },
    {
      title: "Portfolio Development",
      desc: "Build an impressive portfolio showcasing your work to stand out during interviews.",
      icon: "mdi:folder-star-outline",
    },
    {
      title: "LinkedIn Profile Optimization",
      desc: "Learn how to build a strong professional presence and attract recruiters.",
      icon: "mdi:linkedin",
    },
    {
      title: "Mock Interviews",
      desc: "Practice HR and technical interviews with expert feedback to improve confidence.",
      icon: "mdi:account-voice",
    },
    {
      title: "Soft Skills Training",
      desc: "Develop communication, presentation, and workplace skills required for professional success.",
      icon: "mdi:account-group-outline",
    },
    {
      title: "Career Counselling",
      desc: "Receive personalized career guidance to choose the right job opportunities based on your interests and strengths.",
      icon: "mdi:compass-outline",
    },
    {
      title: "Placement Assistance",
      desc: "Our placement team supports eligible students by sharing relevant job openings and coordinating interview opportunities.",
      icon: "mdi:handshake-outline",
    },
  ]

  const hiringIndustries = [
    "Digital Marketing Agencies",
    "Creative & Branding Agencies",
    "IT & Software Companies",
    "E-commerce Businesses",
    "Media & Production Houses",
    "Startups",
    "Corporate Marketing Teams",
    "Advertising Agencies",
    "Freelancing & Consulting",
    "Entrepreneurial Ventures",
  ]

  const jobRolesMap = [
    {
      category: "Digital Marketing",
      icon: "mdi:bullhorn-outline",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      roles: [
        "Digital Marketing Executive",
        "SEO Executive",
        "Performance Marketing Executive",
        "Google Ads Specialist",
        "Meta Ads Specialist",
        "Social Media Executive",
        "Content Marketing Executive",
        "Email Marketing Executive",
      ],
    },
    {
      category: "Graphic Design",
      icon: "mdi:palette-outline",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
      roles: [
        "Graphic Designer",
        "Social Media Designer",
        "Brand Designer",
        "Creative Designer",
        "Visual Designer",
        "UI Design Trainee",
      ],
    },
    {
      category: "Video Editing",
      icon: "mdi:movie-open-play-outline",
      badgeColor: "bg-pink-50 text-pink-700 border-pink-200",
      roles: [
        "Video Editor",
        "Motion Graphics Designer",
        "Reels & Shorts Editor",
        "YouTube Video Editor",
        "Creative Video Editor",
        "Content Editor",
      ],
    },
  ]

  const placementSteps = [
    { step: "Step 1", desc: "Complete your practical training and live projects." },
    { step: "Step 2", desc: "Build your portfolio and resume with mentor guidance." },
    { step: "Step 3", desc: "Attend mock interviews and career preparation sessions." },
    { step: "Step 4", desc: "Apply for opportunities through our placement support." },
    { step: "Step 5", desc: "Interview with hiring partners." },
    { step: "Step 6", desc: "Begin your professional career with confidence." },
  ]

  return (
    <div className="bg-grey dark:bg-dark min-h-screen">
      
      {/* 1. HERO HEADER: OUR PLACEMENTS */}
      <section
        className="py-16 lg:py-20 relative overflow-hidden text-midnight_text border-b border-slate-200/80 dark:border-dark_border"
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #ffffff 15%, #e6d9ff 55%, #cde4fd 100%)',
        }}
      >
        <div className="container mx-auto max-w-7xl px-4 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-5" data-aos="fade-up">
            <div className="inline-flex items-center gap-2 bg-[#764DFF]/15 text-[#5c38d6] border border-[#764DFF]/25 text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full shadow-2xs backdrop-blur-md">
              <Icon icon="mdi:trophy-outline" className="text-[#764DFF]" />
              Career Outcomes &amp; Placement Support
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#111827] dark:text-white leading-tight tracking-tight">
              Your Career Starts Here
            </h1>

            <div className="space-y-3 text-[#374151] text-xs sm:text-sm leading-relaxed font-medium max-w-3xl mx-auto">
              <p>
                At <strong>QIMD (Quickupp Institute of Marketing &amp; Design)</strong>, our mission doesn&apos;t end when your program is completed - it begins with helping you build a successful career.
              </p>
              <p>
                Our AI-powered, industry-driven training programs are designed to make students job-ready through practical learning, live client projects, internship opportunities, and comprehensive placement assistance. We also collaborate with hiring partners to connect eligible students with career opportunities that align with their skills and goals.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <a
                href="#placement-gallery"
                className="bg-[#764DFF] hover:bg-[#5c38d6] text-white font-bold text-xs sm:text-sm px-7 py-3 rounded-xl transition-all shadow-md"
              >
                View Placed Students
              </a>
              <a
                href="tel:+918087897288"
                className="border border-[#764DFF] text-[#764DFF] hover:bg-[#764DFF]/5 font-bold text-xs sm:text-sm px-7 py-3 rounded-xl transition-all flex items-center gap-2"
              >
                <Icon icon="mdi:phone" />
                <span>+91 80878 97288</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2 & 3. OUR PLACEMENT PHILOSOPHY & HIRING OPPORTUNITIES (2-COLUMN SIDE-BY-SIDE) */}
      <PlacementPhilosophySection hiringIndustries={hiringIndustries} />

      {/* 3. PLACEMENT ASSISTANCE INCLUDES (INFINITE MARQUEE TICKER / ANIMATED LOOP - FULL SCREEN WIDTH & SLOW SPEED) */}
      <section
        className="py-16 lg:py-24 border-b border-slate-200/80 dark:border-dark_border overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #ffffff 40%, #f0e8ff 70%, #dcecfe 100%)',
        }}
      >
        <div className="space-y-10">
          <div className="container mx-auto max-w-7xl px-4 lg:px-8 text-center space-y-2" data-aos="fade-up">
            <span className="text-xs font-bold uppercase tracking-widest text-[#764DFF]">End-to-End Support</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-midnight_text dark:text-white tracking-tight">
              Placement Assistance Includes
            </h2>
            <p className="text-muted dark:text-white/70 text-xs sm:text-sm font-medium max-w-2xl mx-auto">
              Comprehensive career acceleration programs designed to make every graduate stand out to recruiters.
            </p>
          </div>

          {/* Full Screen Edge-to-Edge Animated Marquee Ticker (Slower speed: 45s) */}
          <div className="w-full overflow-hidden select-none py-4">
            <div className="flex animate-marquee-left-slow items-stretch gap-6 w-max">
              {[...placementAssistance, ...placementAssistance, ...placementAssistance].map((item, i) => (
                <div
                  key={i}
                  className="w-80 sm:w-96 shrink-0 bg-white dark:bg-dark p-6 rounded-3xl border border-slate-200/80 dark:border-dark_border shadow-xs hover:shadow-xl hover:border-[#764DFF]/50 transition-all duration-300 space-y-3 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-[#764DFF]/10 text-[#764DFF] flex items-center justify-center text-2xl group-hover:bg-[#764DFF] group-hover:text-white group-hover:scale-110 transition-all duration-300">
                        <Icon icon={item.icon} />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#764DFF] bg-[#764DFF]/10 px-2.5 py-1 rounded-full">
                        Module 0{ (i % placementAssistance.length) + 1 }
                      </span>
                    </div>

                    <h3 className="text-lg font-extrabold text-midnight_text dark:text-white leading-tight group-hover:text-[#764DFF] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-white/70 leading-relaxed font-medium">
                      {item.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-dark_border flex items-center gap-1.5 text-xs font-bold text-[#764DFF]">
                    <Icon icon="mdi:check-circle" className="text-sm" />
                    <span>Included in Placement Program</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. JOB ROLES OUR STUDENTS PREPARE FOR (DARK GRADIENT & DYNAMIC STAGGERED POINTS) */}
      <section
        className="py-16 lg:py-24 text-white relative overflow-hidden border-b border-white/10"
        style={{
          background: 'linear-gradient(135deg, #180e29 0%, #2b1654 35%, #3e1f7d 70%, #0284c7 100%)',
        }}
      >
        {/* Subtle Ambient Decorative Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#764DFF]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#0284c7]/20 blur-3xl pointer-events-none" />

        <div className="container mx-auto max-w-7xl px-4 lg:px-8 space-y-12 relative z-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-2" data-aos="fade-up">
            <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-300">Career Paths</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Job Roles Our Students Prepare For
            </h2>
            <p className="text-slate-200 text-xs sm:text-sm font-medium">
              Targeted role specializations engineered for fast-track career entry across marketing, design, and media.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {jobRolesMap.map((cat, idx) => (
              <div
                key={idx}
                data-aos="fade-up"
                data-aos-delay={idx * 120}
                className="bg-white/10 dark:bg-white/10 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/20 space-y-6 shadow-2xl hover:border-cyan-300 transition-all flex flex-col justify-between group text-white"
              >
                <div className="space-y-6">
                  {/* Category Header */}
                  <div className="flex items-center gap-3.5 pb-4 border-b border-white/15">
                    <div className="w-12 h-12 rounded-2xl bg-white/15 text-cyan-300 flex items-center justify-center text-2xl border border-white/25 group-hover:bg-white group-hover:text-[#180e29] transition-colors duration-300 shrink-0">
                      <Icon icon={cat.icon} />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-extrabold text-white leading-tight">
                        {cat.category}
                      </h3>
                      <span className="text-[11px] font-extrabold text-cyan-300 uppercase tracking-wider">
                        {cat.roles.length} Specialized Roles
                      </span>
                    </div>
                  </div>

                  {/* One-by-One Attractive Points */}
                  <div className="space-y-2.5">
                    {cat.roles.map((role, rIdx) => (
                      <div
                        key={rIdx}
                        data-aos="zoom-in"
                        data-aos-delay={rIdx * 50 + 50}
                        data-aos-duration="400"
                        className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 border border-white/15 hover:border-cyan-300 hover:bg-white/20 transition-all duration-200 shadow-xs group/role"
                      >
                        <div className="w-7 h-7 rounded-xl bg-white/15 text-cyan-300 flex items-center justify-center text-xs shrink-0 group-hover/role:bg-white group-hover/role:text-[#180e29] transition-colors">
                          <Icon icon="mdi:star-four-points" />
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-white leading-tight group-hover/role:text-cyan-300 transition-colors">
                          {role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/15 flex items-center justify-between text-xs font-bold text-cyan-300">
                  <span>Industry Ready Trainee</span>
                  <Icon icon="mdi:arrow-right" className="text-base group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. OUR PLACEMENT PROCESS (6 STEPS) */}
      <section
        className="py-16 lg:py-24 border-b border-slate-200/80 dark:border-dark_border overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #ffffff 40%, #f0e8ff 70%, #dcecfe 100%)',
        }}
      >
        <div className="container mx-auto max-w-7xl px-4 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2" data-aos="fade-up">
            <span className="text-xs font-bold uppercase tracking-widest text-[#764DFF]">Execution Roadmap</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-midnight_text dark:text-white tracking-tight">
              Our Placement Process
            </h2>
            <p className="text-muted dark:text-white/70 text-xs sm:text-sm font-medium">
              A structured 6-step path from practical training to launching your career.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {placementSteps.map((st, i) => (
              <div
                key={i}
                data-aos="fade-up"
                data-aos-delay={i * 80}
                className="bg-white dark:bg-dark p-6 rounded-3xl border border-slate-200/80 dark:border-dark_border shadow-2xs space-y-3 relative hover:border-[#764DFF]/40 transition-all"
              >
                <div className="inline-block bg-[#764DFF]/10 text-[#764DFF] text-xs font-extrabold px-3 py-1 rounded-full">
                  {st.step}
                </div>
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white leading-relaxed">
                  {st.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5.5. MEET OUR HIRING PARTNERS (FULL SCREEN EDGE-TO-EDGE) */}
      <section className="py-16 lg:py-20 bg-white dark:bg-dark border-b border-slate-200/80 dark:border-dark_border overflow-hidden" id="partners">
        <div className="space-y-8 text-center" data-aos="fade-up">
          <div className="container mx-auto max-w-7xl px-4 lg:px-8 max-w-3xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#764DFF]">Corporate Relationships</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-midnight_text dark:text-white tracking-tight">
              Meet Our Hiring Partners
            </h2>
            <p className="text-slate-600 dark:text-white/70 text-xs sm:text-sm font-medium leading-relaxed">
              QIMD continues to build relationships with agencies, startups, businesses, and companies looking for skilled digital professionals.
            </p>
          </div>

          {/* Full Screen Edge-to-Edge Hiring Partner Logo Marquee */}
          <div className="w-full overflow-hidden select-none py-4">
            <div className="flex animate-marquee-left items-center gap-12 sm:gap-16 w-max">
              {[...hiringPartners, ...hiringPartners, ...hiringPartners].map((partner, i) => (
                <div
                  key={`${partner.id || i}-${i}`}
                  className="flex items-center justify-center h-12 w-32 sm:w-40 shrink-0"
                >
                  <PlacementPartnerLogo partner={partner} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. STUDENT PLACEMENT GALLERY (DARK GRADIENT) */}
      <section
        className="py-16 lg:py-24 text-white relative overflow-hidden border-b border-white/10"
        id="success-stories"
        style={{
          background: 'linear-gradient(135deg, #180e29 0%, #2b1654 35%, #3e1f7d 70%, #0284c7 100%)',
        }}
      >
        <div className="container mx-auto max-w-7xl px-4 lg:px-8 space-y-10 relative z-10">
          <div className="text-center max-w-2xl mx-auto space-y-2" data-aos="fade-up">
            <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-300">Placement Gallery</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Student Placement Gallery
            </h2>
            <p className="text-slate-200 text-xs sm:text-sm font-medium">
              Celebrate the achievements of our students who have successfully launched their careers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {placedStudents.map((student, i) => (
              <PlacementCard key={student.id || i} student={student} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* 9. PLACEMENT SUCCESS BEGINS WITH PRACTICAL LEARNING */}
      <section
        className="py-16 lg:py-20 border-b border-slate-200/80 dark:border-dark_border overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #ffffff 40%, #f0e8ff 70%, #dcecfe 100%)',
        }}
      >
        <div className="container mx-auto max-w-7xl px-4 lg:px-8 text-center space-y-4 max-w-3xl" data-aos="fade-up">
          <div className="w-12 h-12 rounded-2xl bg-[#764DFF]/10 text-[#764DFF] flex items-center justify-center mx-auto text-2xl font-bold">
            <Icon icon="mdi:star-circle-outline" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-midnight_text dark:text-white tracking-tight">
            Placement Success Begins with Practical Learning
          </h2>
          <p className="text-slate-600 dark:text-white/80 text-xs sm:text-sm leading-relaxed font-medium">
            Our focus has always been on creating professionals who can contribute from day one. Through AI-powered learning, practical implementation, and live client experience, we prepare students for real workplace challenges.
          </p>
          <p className="text-[#764DFF] font-extrabold text-sm sm:text-base pt-2">
            Your success is our greatest achievement.
          </p>
        </div>
      </section>

      {/* 10. CLOSING CTA BANNER: READY TO LAUNCH YOUR CAREER? */}
      <section className="py-16 bg-white dark:bg-dark border-t border-slate-200/80 dark:border-dark_border">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8 text-center space-y-5" data-aos="fade-up">
          <div className="inline-flex items-center gap-2 bg-[#764DFF]/10 text-[#764DFF] text-xs font-extrabold px-4 py-1 rounded-full">
            <Icon icon="mdi:rocket-launch" />
            Build Skills. Gain Experience. Create Opportunity
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-midnight_text dark:text-white tracking-tight">
            Ready to Launch Your Career?
          </h2>

          <div className="text-muted dark:text-white/80 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed font-medium">
            <p>
              Join QIMD and gain the practical skills, industry exposure, and placement support needed to build a rewarding career in Digital Marketing, Graphic Design, or Video Editing.
            </p>
          </div>

          <div className="pt-3 flex flex-wrap justify-center gap-4">
            <a
              href="tel:+918087897288"
              className="bg-[#764DFF] hover:bg-[#5c38d6] text-white font-bold text-xs sm:text-sm px-8 py-3.5 rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <Icon icon="mdi:phone" className="text-base" />
              <span>Call Us: +91 80878 97288</span>
            </a>
            <Link
              href="/contact"
              className="border border-[#764DFF] text-[#764DFF] hover:bg-[#764DFF]/5 font-bold text-xs sm:text-sm px-8 py-3.5 rounded-xl transition-all flex items-center gap-2"
            >
              <Icon icon="mdi:account-badge-outline" className="text-base" />
              <span>Book Free Career Session</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Video Modal Player */}
      {selectedVideo && (
        <VideoModal
          isOpen={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
          videoUrl={selectedVideo.url}
          title={selectedVideo.title}
        />
      )}
    </div>
  )
}

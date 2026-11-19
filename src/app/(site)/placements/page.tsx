'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react/dist/iconify.js'
import { placedStudentsData, testimonialsData, placementPartnersData } from '@/data'
import PlacementCard from '@/components/Common/PlacementCard'
import VideoModal from '@/components/Common/VideoModal'
import { getPublicTestimonialsAction, getPublicPlacementsAction, getPublicStudentReviewsAction } from '@/app/actions/publicActions'
import { QwHero, QwHead, QwStickers, QwCta } from '@/components/WhyQimd/WhyKit'

const PlacementPartnerLogo: React.FC<{ partner: any }> = ({ partner }) => {
  const fallback = placementPartnersData.find(
    (p) => p.name.toLowerCase() === (partner.name || '').toLowerCase()
  )?.logo || ''

  const [src, setSrc] = useState<string>(partner.logo || fallback)
  const [hasError, setHasError] = useState(false)

  if (hasError || !src) {
    return (
      <span className="qw-partner-name">
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
      className="qw-partner-img"
    />
  )
}

const PlacementPhilosophySection: React.FC<{ hiringIndustries: string[] }> = ({ hiringIndustries }) => {
  const graduatePoints = [
    "Industry-Relevant Skills",
    "Live Project Experience",
    "Professional Portfolio",
    "Resume & LinkedIn Profile",
    "Interview Preparation",
    "Career Guidance",
  ]

  return (
    <section className="qw-sec qw-sec-dark">
      <div className="qw-wrap">
        <div className="qw-panels is-dark">
          {/* Our Placement Philosophy */}
          <div className="qw-panel">
            <div className="qw-panel-head">
              <span className="qw-panel-ic"><Icon icon="mdi:lightbulb-on-outline" /></span>
              <div>
                <h2 className="qw-panel-title">Our Placement Philosophy</h2>
                <span>Skill-First Approach</span>
              </div>
            </div>
            <p className="qw-strong-light">We believe that practical skills create confident professionals.</p>
            <p>
              That&apos;s why our placement process focuses on developing not only technical expertise but also the communication, confidence, and professional readiness employers look for.
            </p>
            <p className="qw-panel-label">Our Students Graduate With:</p>
            <QwStickers light items={graduatePoints.map((label) => ({ label, icon: 'mdi:check-bold' }))} />
          </div>

          {/* Hiring Opportunities Across Industries */}
          <div className="qw-panel">
            <div className="qw-panel-head">
              <span className="qw-panel-ic"><Icon icon="mdi:domain" /></span>
              <div>
                <h2 className="qw-panel-title">Hiring Opportunities Across Industries</h2>
                <span>Diverse Career Reach</span>
              </div>
            </div>
            <p>
              Our students are prepared for high-demand opportunities across diverse companies, agencies, and growing startups:
            </p>
            <QwStickers light items={hiringIndustries.map((label) => ({ label, icon: 'mdi:briefcase-outline' }))} />
          </div>
        </div>
      </div>
    </section>
  )
}

export default function PlacementsPage() {
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string } | null>(null)
  const hiringPartners = placementPartnersData
  const [allTestimonials, setAllTestimonials] = useState<any[]>(testimonialsData)
  const [placedStudents, setPlacedStudents] = useState<any[]>(placedStudentsData)
  const [studentReviewsList, setStudentReviewsList] = useState<any[]>([])

  useEffect(() => {
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
    <div className="qw">
      <QwHero
        kicker="Career Outcomes & Placement Support"
        icon="mdi:trophy-outline"
        title="Your Career Starts Here"
        intro={
          <p>
            At <strong>QIMD (Quickupp Institute of Marketing &amp; Design)</strong>, our mission doesn&apos;t end when your program is completed - it begins with helping you build a successful career.
          </p>
        }
        actions={
          <>
            <a href="#placement-gallery" className="qw-btn qw-btn-main">
              <span>View Placed Students</span>
              <Icon icon="mdi:arrow-down" />
            </a>
            <a href="tel:+918087897288" className="qw-btn qw-btn-soft">
              <Icon icon="mdi:phone" />
              <span>+91 80878 97288</span>
            </a>
          </>
        }
        aside={
          <p>
            Our AI-powered, industry-driven training programs are designed to make students job-ready through practical learning, live client projects, internship opportunities, and comprehensive placement assistance. We also collaborate with hiring partners to connect eligible students with career opportunities that align with their skills and goals.
          </p>
        }
      />

      <PlacementPhilosophySection hiringIndustries={hiringIndustries} />

      {/* Placement Assistance Includes */}
      <section className="qw-sec">
        <div className="qw-wrap">
          <QwHead
            kicker="End-to-End Support"
            title="Placement Assistance Includes"
            desc="Comprehensive career acceleration programs designed to make every graduate stand out to recruiters."
          />
          <div className="qw-index-cards">
            {placementAssistance.map((item, i) => (
              <div key={i} className={`qw-index-card t${i % 3}`}>
                <div className="qw-index-top">
                  <span className="qw-index-ic"><Icon icon={item.icon} /></span>
                  <span className="qw-index-num">Module 0{i + 1}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
                <span className="qw-index-foot">
                  <Icon icon="mdi:check-circle" />
                  <span>Included in Placement Program</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Job Roles Our Students Prepare For */}
      <section className="qw-sec qw-sec-tint">
        <div className="qw-wrap">
          <QwHead
            kicker="Career Paths"
            title="Job Roles Our Students Prepare For"
            desc="Targeted role specializations engineered for fast-track career entry across marketing, design, and media."
          />
          <div className="qw-roles">
            {jobRolesMap.map((cat, idx) => (
              <div key={idx} className={`qw-role-col t${idx % 3}`}>
                <div className="qw-role-head">
                  <span className="qw-role-ic"><Icon icon={cat.icon} /></span>
                  <div>
                    <h3>{cat.category}</h3>
                    <span>{cat.roles.length} Specialized Roles</span>
                  </div>
                </div>
                <ol className="qw-role-list">
                  {cat.roles.map((role, rIdx) => (
                    <li key={rIdx}>
                      <Icon icon="mdi:star-four-points" />
                      <span>{role}</span>
                    </li>
                  ))}
                </ol>
                <div className="qw-role-foot">
                  <span>Industry Ready Trainee</span>
                  <Icon icon="mdi:arrow-right" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Placement Process */}
      <section className="qw-sec">
        <div className="qw-wrap">
          <QwHead
            kicker="Execution Roadmap"
            title="Our Placement Process"
            desc="A structured 6-step path from practical training to launching your career."
          />
          <ol className="qw-zigzag">
            {placementSteps.map((st, i) => (
              <li key={i} className={`qw-zig t${i % 3}`}>
                <span className="qw-zig-dot">{i + 1}</span>
                <div className="qw-zig-card">
                  <span className="qw-zig-step">{st.step}</span>
                  <p>{st.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Meet Our Hiring Partners */}
      <section className="qw-sec qw-sec-tint" id="partners">
        <div className="qw-wrap">
          <QwHead
            kicker="Corporate Relationships"
            title="Meet Our Hiring Partners"
            desc="QIMD continues to build relationships with agencies, startups, businesses, and companies looking for skilled digital professionals."
          />
        </div>
        <div className="qw-marquee" aria-label="Hiring partners">
          <div className="qw-marquee-track">
            {[...hiringPartners, ...hiringPartners, ...hiringPartners].map((partner, i) => (
              <div key={`${partner.id || i}-${i}`} className="qw-partner">
                <PlacementPartnerLogo partner={partner} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Student Placement Gallery */}
      <section className="qw-sec" id="success-stories">
        <div id="placement-gallery" className="qw-anchor" />
        <div className="qw-wrap">
          <QwHead
            kicker="Placement Gallery"
            title="Student Placement Gallery"
            desc="Celebrate the achievements of our students who have successfully launched their careers."
          />
          <div className="qw-polaroids">
            {placedStudents.map((student, i) => (
              <PlacementCard key={student.id || i} student={student} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Placement Success Begins with Practical Learning */}
      <section className="qw-sec qw-sec-tint">
        <div className="qw-wrap">
          <div className="qw-story">
            <div className="qw-story-head">
              <span className="qw-story-ic"><Icon icon="mdi:star-circle-outline" /></span>
              <h2 className="qw-h2">Placement Success Begins with Practical Learning</h2>
            </div>
            <div className="qw-story-body">
              <p>
                Our focus has always been on creating professionals who can contribute from day one. Through AI-powered learning, practical implementation, and live client experience, we prepare students for real workplace challenges.
              </p>
              <p className="qw-strong">Your success is our greatest achievement.</p>
            </div>
          </div>
        </div>
      </section>

      <QwCta
        kicker="Build Skills. Gain Experience. Create Opportunity"
        icon="mdi:rocket-launch"
        title="Ready to Launch Your Career?"
        actions={
          <>
            <a href="tel:+918087897288" className="qw-btn qw-btn-light">
              <Icon icon="mdi:phone" />
              <span>Call Us: +91 80878 97288</span>
            </a>
            <Link href="/contact" className="qw-btn qw-btn-glass">
              <Icon icon="mdi:account-badge-outline" />
              <span>Book Free Career Session</span>
            </Link>
          </>
        }
      >
        <p>
          Join QIMD and gain the practical skills, industry exposure, and placement support needed to build a rewarding career in Digital Marketing, Graphic Design, or Video Editing.
        </p>
      </QwCta>

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

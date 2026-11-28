'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react/dist/iconify.js'
import { placedStudentsData, testimonialsData, placementPartnersData } from '@/data'
import PlacementCard from '@/components/Common/PlacementCard'
import VideoModal from '@/components/Common/VideoModal'
import { getPublicTestimonialsAction, getPublicPlacementsAction, getPublicStudentReviewsAction } from '@/app/actions/publicActions'
import { resolveTestimonialVideo } from '@/lib/testimonialVideos'
import { QwHero, QwHead, QwStickers, QwReview, QwCta } from '@/components/WhyQimd/WhyKit'

export default function SuccessStoriesPage() {
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string } | null>(null)
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
      course: "Digital Marketing Program",
      review: "I joined QIMD for the Digital Marketing Program and had a really good learning experience. The best part was the practical training and live projects. We learned about SEO, social media marketing, Google Ads and other digital marketing tools with practical examples. The trainers were supportive and cleared our doubts whenever needed.",
      rating: 5,
    },
    {
      name: "Sneha More",
      course: "Digital Marketing Program",
      review: "I was looking for a good digital marketing institute in Pune and joined QIMD after checking the program details. The training was practical and easy to understand. I especially liked the live project sessions because they helped me understand how digital marketing works for real businesses.",
      rating: 5,
    },
    {
      name: "Aniket Kulkarni",
      course: "Graphic Design Program",
      review: "My experience of Graphic Design Program with Pune’s QIMD was great. The program covered practical designing concepts and gave us assignments to work on. The trainers were helpful and guided us throughout the learning process.",
      rating: 5,
    },
    {
      name: "Pooja Sharma",
      course: "Video Editing Program",
      review: "I joined QIMD to learn video editing and really enjoyed the practical sessions. We worked on different types of videos and learned how to improve editing, storytelling and presentation. The overall learning environment was very supportive.",
      rating: 5,
    },
  ]

  const combinedTextReviews = studentReviewsList.length > 0 ? studentReviewsList : defaultStudentReviews

  const sectors = [
    { label: "Digital Marketing Agencies", icon: "mdi:bullhorn-outline" },
    { label: "Branding & Creative Agencies", icon: "mdi:palette-outline" },
    { label: "IT Companies", icon: "mdi:laptop" },
    { label: "Startups", icon: "mdi:rocket-launch-outline" },
    { label: "E-commerce Companies", icon: "mdi:cart-outline" },
    { label: "Media & Production Houses", icon: "mdi:movie-open-play-outline" },
    { label: "Corporate Marketing Teams", icon: "mdi:domain" },
    { label: "Freelancing & Consulting", icon: "mdi:account-tie-outline" },
    { label: "Entrepreneurship", icon: "mdi:lightbulb-on-outline" },
  ]

  const whySucceedPoints = [
    { label: "AI-Powered Industry Curriculum", icon: "mdi:robot-outline" },
    { label: "100% Live Project-Based Learning", icon: "mdi:laptop" },
    { label: "Practical Classroom Training", icon: "mdi:school-outline" },
    { label: "Industry Expert Mentorship", icon: "mdi:account-star-outline" },
    { label: "Portfolio Development", icon: "mdi:folder-star-outline" },
    { label: "Internship Opportunities", icon: "mdi:briefcase-check-outline" },
    { label: "Resume Building", icon: "mdi:file-document-edit-outline" },
    { label: "Mock Interviews", icon: "mdi:account-voice" },
    { label: "Placement Assistance", icon: "mdi:handshake-outline" },
    { label: "Career Guidance", icon: "mdi:compass-outline" },
  ]

  const playVideo = (review: any) =>
    setSelectedVideo({
      url: resolveTestimonialVideo(review).src || 'https://www.youtube.com/embed/L_LUpnjgPso',
      title: `${review.studentName} Video Review`,
    })

  return (
    <div className="qw">
      <QwHero
        kicker="Success Stories"
        icon="mdi:trophy-outline"
        title={
          <>
            Real Students. Real Skills. <span className="qw-accent">Real Careers.</span>
          </>
        }
        intro={
          <p>
            At <strong>QIMD (Quickupp Institute of Marketing &amp; Design)</strong>, success is measured by the careers our students build after completing their training.
          </p>
        }
        actions={
          <>
            <a href="#placements" className="qw-btn qw-btn-main">
              <Icon icon="mdi:briefcase-check-outline" />
              <span>Explore Recent Placements</span>
            </a>
            <Link href="/reviews-testimonials#video-testimonials" className="qw-btn qw-btn-soft">
              <Icon icon="mdi:play-circle-outline" />
              <span>Watch Video Testimonials</span>
            </Link>
          </>
        }
        aside={
          <p>
            Through AI-powered practical learning, live client projects, expert mentorship, internship opportunities, and placement assistance, our students gain the confidence and skills required to excel in today&apos;s digital industry. Every success story motivates us to continue creating industry-ready professionals.
          </p>
        }
      />

      {/* From Learning to Earning */}
      <section className="qw-sec">
        <div className="qw-wrap">
          <div className="qw-story">
            <div className="qw-story-head">
              <span className="qw-story-ic"><Icon icon="mdi:trending-up" /></span>
              <h2 className="qw-h2">From Learning to Earning</h2>
            </div>
            <div className="qw-story-body">
              <p>
                Our students have transformed their careers by applying practical knowledge gained at QIMD. Whether they started as freshers, students, career switchers, freelancers, or entrepreneurs, they all shared one thing in common - a desire to build real skills that employers value.
              </p>
              <p className="qw-strong">
                Today, many of them are working with digital agencies, startups, established companies, and growing brands, while others have successfully launched their own freelance careers and businesses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Where & Why Our Students Excel */}
      <section className="qw-sec qw-sec-tint">
        <div className="qw-wrap">
          <QwHead
            kicker="Career Ecosystem"
            title="Where & Why Our Students Excel"
            desc="Equipping learners with the practical capabilities top industries actively hire for."
          />
          <div className="qw-panels">
            <div className="qw-panel">
              <div className="qw-panel-head">
                <span className="qw-panel-ic"><Icon icon="mdi:domain" /></span>
                <div>
                  <h3>Building Successful Careers In</h3>
                  <span>Top Hiring Sectors</span>
                </div>
              </div>
              <QwStickers items={sectors} />
            </div>
            <div className="qw-panel">
              <div className="qw-panel-head">
                <span className="qw-panel-ic"><Icon icon="mdi:star-outline" /></span>
                <div>
                  <h3>Why Our Students Succeed</h3>
                  <span>The QIMD Advantage</span>
                </div>
              </div>
              <QwStickers items={whySucceedPoints} />
            </div>
          </div>
        </div>
      </section>

      {/* Recently Placed Students */}
      <section className="qw-sec" id="placements">
        <div className="qw-wrap">
          <QwHead
            kicker="Hiring Outcomes"
            icon="mdi:briefcase-check-outline"
            title="Recently Placed Students"
            desc="Our students continue to secure exciting career opportunities across leading companies, agencies, and growing startups."
          />
          <div className="qw-polaroids">
            {placedStudents.map((student, i) => (
              <PlacementCard key={student.id || i} student={student} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Student Reviews */}
      <section className="qw-sec qw-sec-tint">
        <div className="qw-wrap">
          <QwHead
            kicker="Verified Ratings"
            title="Student Reviews"
            desc="Real feedback from learners who built their practical skills and careers at QIMD."
          />
          <div className="qw-reviews">
            {combinedTextReviews.map((rev, i) => (
              <QwReview key={rev.id || i} rev={rev} index={i} />
            ))}
          </div>
        </div>
      </section>

      <QwCta
        kicker="Start Your Journey"
        icon="mdi:rocket-launch-outline"
        title="Become Our Next Success Story"
        actions={
          <>
            <a href="tel:+917410106608" className="qw-btn qw-btn-light">
              <Icon icon="mdi:phone" />
              <span>Call Us: +91 7410-106608</span>
            </a>
            <Link href="/contact" className="qw-btn qw-btn-glass">
              <Icon icon="mdi:account-badge-outline" />
              <span>Book Free Career Session</span>
            </Link>
          </>
        }
      >
        <p>
          Your journey to a successful career begins with the right skills, the right mentors, and the right opportunities.
        </p>
        <p className="qw-strong-light">
          Join QIMD and learn through AI-powered practical training, live client projects, internships, and career-focused mentorship designed to make you industry-ready.
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

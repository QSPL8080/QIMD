'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react/dist/iconify.js'
import { testimonialsData, placedStudentsData } from '@/data'
import VideoModal from '@/components/Common/VideoModal'
import { getPublicTestimonialsAction, getPublicStudentReviewsAction, getPublicPlacementsAction } from '@/app/actions/partnerActions'
import { resolveTestimonialVideo } from '@/lib/testimonialVideos'
import { QwHero, QwHead, QwStickers, QwReview, QwVideo, QwCta } from '@/components/WhyQimd/WhyKit'

export default function ReviewsTestimonialsPage() {
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string } | null>(null)
  const [allTestimonials, setAllTestimonials] = useState<any[]>(testimonialsData)
  const [studentReviewsList, setStudentReviewsList] = useState<any[]>([])
  const [placedStudents, setPlacedStudents] = useState<any[]>(placedStudentsData)

  useEffect(() => {
    getPublicTestimonialsAction().then((data) => {
      if (data && data.length > 0) {
        setAllTestimonials(data as any)
      }
    })
    getPublicStudentReviewsAction().then((data) => {
      if (data && data.length > 0) {
        setStudentReviewsList(data as any)
      }
    })
    getPublicPlacementsAction().then((data) => {
      if (data && data.length > 0) {
        setPlacedStudents(data as any)
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

  const whyStudentsLove = [
    { title: "AI-Powered Learning", icon: "mdi:robot-outline" },
    { title: "100% Live Project-Based Training", icon: "mdi:laptop" },
    { title: "Practical Classroom Sessions", icon: "mdi:school-outline" },
    { title: "Industry Expert Trainers", icon: "mdi:account-star-outline" },
    { title: "Real Client Projects", icon: "mdi:folder-account-outline" },
    { title: "Internship Opportunities", icon: "mdi:briefcase-check-outline" },
    { title: "Portfolio Development", icon: "mdi:folder-star-outline" },
    { title: "Career Mentorship", icon: "mdi:compass-outline" },
    { title: "Placement Assistance", icon: "mdi:handshake-outline" },
    { title: "Friendly & Supportive Environment", icon: "mdi:emoticon-happy-outline" },
  ]

  const learningExperiencePoints = [
    "Interactive Practical Classes",
    "Live Client Projects",
    "Workshops & Activities",
    "AI Tool Training",
    "Team Collaboration",
    "Portfolio Reviews",
    "Career Guidance",
    "Interview Preparation",
  ]

  const playVideo = (review: any) =>
    setSelectedVideo({
      url: resolveTestimonialVideo(review).src || 'https://www.youtube.com/embed/L_LUpnjgPso',
      title: `${review.studentName} Video Review`,
    })

  return (
    <div className="qw">
      <QwHero
        kicker="Student Voice & Feedback"
        icon="mdi:star-circle-outline"
        title={
          <>
            Hear Directly <span className="qw-accent">From Our Students</span>
          </>
        }
        intro={<p>The true measure of an institute is the success and satisfaction of its students.</p>}
        actions={
          <>
            <a href="#video-testimonials" className="qw-btn qw-btn-main">
              <Icon icon="mdi:play-circle-outline" />
              <span>Watch Video Testimonials</span>
            </a>
            <a href="#text-reviews" className="qw-btn qw-btn-soft">
              <Icon icon="mdi:comment-text-multiple-outline" />
              <span>Read Text Reviews</span>
            </a>
          </>
        }
        aside={
          <>
            <p>
              At <strong>QIMD (Quickupp Institute of Marketing &amp; Design)</strong>, we take pride in helping students build practical skills, gain real industry experience, and confidently begin their professional careers.
            </p>
            <p>
              Our students come from different educational and professional backgrounds, but they all share one common goal—to become industry-ready through practical learning. Their success stories and feedback inspire us to continuously deliver high-quality, AI-powered education.
            </p>
          </>
        }
      />

      {/* Why Students Love Learning at QIMD */}
      <section className="qw-sec qw-sec-tint">
        <div className="qw-wrap">
          <QwHead
            kicker="The QIMD Advantage"
            title="Why Students Love Learning at QIMD"
            desc="Students appreciate QIMD because our programs are built around practical implementation rather than traditional classroom teaching. Here's what they value the most:"
          />
          <div className="qw-loves">
            {whyStudentsLove.map((item, i) => (
              <div key={i} className={`qw-love t${i % 3}`}>
                <span className="qw-love-ic"><Icon icon={item.icon} /></span>
                <div>
                  <h3>{item.title}</h3>
                  <span>Practical Skill-First Pillar</span>
                </div>
                <Icon icon="mdi:check-circle" className="qw-love-check" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Student Video Testimonials */}
      {videoReviews.length > 0 && (
        <section className="qw-sec qw-sec-dark" id="video-testimonials">
          <div className="qw-wrap">
            <QwHead
              light
              kicker="Real Experiences"
              title="Student Video Testimonials"
              desc="Nothing speaks louder than the experiences of our students. Watch our students share their journey—from joining QIMD with little or no experience to working on live projects, building professional portfolios, and preparing for successful careers."
            />
            <div className="qw-films">
              {videoReviews.map((review) => (
                <QwVideo key={review.id} review={review} onPlay={() => playVideo(review)} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* What Our Students Say */}
      <section className="qw-sec" id="text-reviews">
        <div className="qw-wrap">
          <QwHead
            kicker="Verified Ratings"
            icon="mdi:certificate-outline"
            title="What Our Students Say"
            desc="Authentic feedback from graduates who transformed their skills and careers with us."
          />
          <div className="qw-reviews">
            {combinedTextReviews.map((rev, i) => (
              <QwReview key={rev.id || i} rev={rev} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Our Learning Experience & Share Your Experience */}
      <section className="qw-sec qw-sec-dark">
        <div className="qw-wrap">
          <div className="qw-panels is-dark">
            <div className="qw-panel">
              <div className="qw-panel-head">
                <span className="qw-panel-ic"><Icon icon="mdi:school" /></span>
                <div>
                  <h2 className="qw-panel-title">Our Learning Experience</h2>
                  <span>Holistic Practical Approach</span>
                </div>
              </div>
              <p>
                At QIMD, learning doesn&apos;t stop with classroom sessions. This holistic approach ensures every learner graduates with practical experience and professional confidence:
              </p>
              <QwStickers light items={learningExperiencePoints.map((label) => ({ label, icon: 'mdi:check-decagram' }))} />
            </div>

            <div className="qw-panel">
              <div className="qw-panel-head">
                <span className="qw-panel-ic"><Icon icon="mdi:heart" /></span>
                <div>
                  <h2 className="qw-panel-title">Share Your Experience</h2>
                  <span>Student Reviews</span>
                </div>
              </div>
              <p>
                We love hearing from our students. Your feedback helps future learners make informed decisions and motivates our team to continue delivering exceptional training. If you&apos;ve completed your journey with QIMD, we&apos;d love to hear your story.
              </p>
              <div className="qw-share">
                <a href="https://g.page/r/QIMDInstitute/review" target="_blank" rel="noopener noreferrer" className="qw-share-link">
                  <Icon icon="mdi:google" />
                  <span>Leave a Google Review</span>
                  <Icon icon="mdi:arrow-right" className="qw-share-arrow" />
                </a>
                <Link href="/contact" className="qw-share-link">
                  <Icon icon="mdi:pencil-box-outline" />
                  <span>Submit Student Feedback</span>
                  <Icon icon="mdi:chevron-right" className="qw-share-arrow" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <QwCta
        kicker="Start Learning. Build Skills. Create Success."
        icon="mdi:rocket-launch"
        title="Become Our Next Success Story"
        actions={
          <>
            <a href="tel:+918087897288" className="qw-btn qw-btn-light">
              <Icon icon="mdi:phone" />
              <span>Call Us: +91 80878 97288</span>
            </a>
            <Link href="/contact" className="qw-btn qw-btn-glass">
              <Icon icon="mdi:account-badge-outline" />
              <span>Book Free Counselling Session</span>
            </Link>
          </>
        }
      >
        <p>
          Join hundreds of aspiring professionals who are building successful careers through AI-powered practical learning, live projects, internships, and expert mentorship.
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

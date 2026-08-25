'use client'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Icon } from '@iconify/react/dist/iconify.js'
import { testimonialsData, placedStudentsData } from '@/data'
import PlacementCard from '@/components/Common/PlacementCard'
import VideoModal from '@/components/Common/VideoModal'
import { getPublicTestimonialsAction, getPublicStudentReviewsAction, getPublicPlacementsAction } from '@/app/actions/partnerActions'

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
      name: "Rohan V.",
      course: "Digital Marketing Master Program",
      review: "The practical approach at QIMD completely changed the way I learn. Working on live projects gave me the confidence to handle real client work.",
      rating: 5,
    },
    {
      name: "Sneha M.",
      course: "UI/UX & Graphic Design Course",
      review: "The trainers explain every concept with practical examples. The AI tools, assignments, and live sessions helped me become job-ready.",
      rating: 5,
    },
    {
      name: "Aniket K.",
      course: "Video Editing & Content Creation",
      review: "The internship experience and placement guidance were extremely valuable. I built a strong portfolio before attending interviews.",
      rating: 5,
    },
    {
      name: "Pooja S.",
      course: "Full-Stack Digital Marketing & AI",
      review: "Unlike traditional courses, QIMD focuses on implementation. Every module includes hands-on practice, which makes learning enjoyable and effective.",
      rating: 5,
    },
    {
      name: "Vikram R.",
      course: "Performance Marketing & AI",
      review: "The trainers are supportive, the classroom environment is interactive, and the learning experience exceeded my expectations.",
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

  return (
    <div className="bg-grey dark:bg-dark min-h-screen">
      
      {/* 1. HERO HEADER: REVIEWS & TESTIMONIALS - DARK GRADIENT */}
      <section
        className="pt-20 sm:pt-28 pb-16 sm:pb-24 relative overflow-hidden text-white border-b border-white/10"
        style={{
          background: 'linear-gradient(135deg, #180e29 0%, #2b1654 35%, #3e1f7d 70%, #0284c7 100%)',
        }}
      >
        {/* Ambient Decorative Background Elements */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#764DFF]/20 rounded-full blur-3xl pointer-events-none -z-0" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#0284c7]/20 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="container mx-auto max-w-7xl px-4 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column (Heading, Subtitle & CTAs) */}
            <div className="lg:col-span-6 space-y-5 text-left" data-aos="fade-up">
              <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 text-white text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full shadow-2xs backdrop-blur-md">
                <Icon icon="mdi:star-circle-outline" className="text-cyan-300 text-base" />
                <span>Student Voice &amp; Feedback</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-white leading-tight tracking-tight">
                Hear Directly{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-white">
                  From Our Students
                </span>
              </h1>

              <div className="py-3 px-4 rounded-2xl bg-white/10 dark:bg-white/10 border border-white/20 shadow-sm backdrop-blur-md">
                <p className="font-medium text-slate-200 text-xs sm:text-sm leading-relaxed">
                  The true measure of an institute is the success and satisfaction of its students.
                </p>
              </div>

              <div className="pt-1 flex flex-wrap gap-3.5">
                <a
                  href="#video-testimonials"
                  className="bg-primary hover:bg-darkprimary text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-xl hover:scale-[1.02] flex items-center gap-2"
                >
                  <Icon icon="mdi:play-circle-outline" className="text-lg" />
                  <span>Watch Video Testimonials</span>
                </a>
                <a
                  href="#text-reviews"
                  className="bg-white/15 hover:bg-white/25 border border-white/25 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all flex items-center gap-2 hover:scale-[1.02] shadow-2xs backdrop-blur-md"
                >
                  <Icon icon="mdi:comment-text-multiple-outline" className="text-base text-cyan-300" />
                  <span>Read Text Reviews</span>
                </a>
              </div>
            </div>

            {/* Right Column (Elevated Content Card) */}
            <div className="lg:col-span-6" data-aos="fade-up" data-aos-delay="100">
              <div className="relative p-6 sm:p-8 rounded-3xl bg-white/10 dark:bg-white/10 border border-white/20 shadow-2xl backdrop-blur-md space-y-4 text-white">
                {/* Decorative Quote Icon in Top Right */}
                <div className="absolute top-3 right-5 text-white/10 text-7xl pointer-events-none select-none">
                  <Icon icon="mdi:format-quote-close" />
                </div>

                <div className="space-y-4 text-slate-200 text-sm sm:text-[15px] lg:text-base leading-relaxed font-medium relative z-10">
                  <p>
                    At <strong>QIMD (Quickupp Institute of Marketing &amp; Design)</strong>, we take pride in helping students build practical skills, gain real industry experience, and confidently begin their professional careers.
                  </p>
                  <p>
                    Our students come from different educational and professional backgrounds, but they all share one common goal—to become industry-ready through practical learning. Their success stories and feedback inspire us to continuously deliver high-quality, AI-powered education.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. WHY STUDENTS LOVE LEARNING AT QIMD (TOP-SIDE LIGHT GRADIENT) */}
      <section
        className="py-16 lg:py-24 border-b border-slate-200/80 dark:border-dark_border relative overflow-hidden text-midnight_text"
        style={{
          background: 'linear-gradient(180deg, #c8e0fe 0%, #e8dcff 25%, #f8f9ff 60%, #ffffff 100%)',
        }}
      >
        <div className="container mx-auto max-w-7xl px-4 lg:px-8 space-y-10 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-3" data-aos="fade-up">
            <span className="inline-flex items-center gap-1.5 bg-[#764DFF]/15 border border-[#764DFF]/25 text-[#5c38d6] text-[11px] font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-xs mb-1">
              <Icon icon="mdi:star-four-points" className="text-sm" />
              <span>The QIMD Advantage</span>
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111827] dark:text-white tracking-tight">
              Why Students Love Learning at QIMD
            </h2>
            <p className="text-slate-600 dark:text-white/70 text-xs sm:text-sm font-medium leading-relaxed max-w-2xl mx-auto">
              Students appreciate QIMD because our programs are built around practical implementation rather than traditional classroom teaching. Here&apos;s what they value the most:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 max-w-5xl mx-auto">
            {whyStudentsLove.map((item, i) => (
              <div
                key={i}
                data-aos="fade-up"
                data-aos-delay={i * 40}
                className="flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-white dark:bg-darklight border border-slate-200/80 dark:border-dark_border shadow-xs hover:shadow-lg hover:border-[#764DFF]/50 transition-all duration-200 group"
              >
                <div className="w-11 h-11 rounded-xl bg-[#764DFF]/10 text-[#764DFF] flex items-center justify-center text-xl shrink-0 group-hover:bg-[#764DFF] group-hover:text-white transition-colors duration-200">
                  <Icon icon={item.icon} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-white group-hover:text-[#764DFF] transition-colors">
                    {item.title}
                  </h3>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-white/60 block pt-0.5">
                    Practical Skill-First Pillar
                  </span>
                </div>
                <Icon icon="mdi:check-circle" className="text-[#764DFF] text-lg shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. STUDENT VIDEO TESTIMONIALS - DARK GRADIENT */}
      {videoReviews.length > 0 && (
        <section
          className="py-16 lg:py-24 text-white relative overflow-hidden border-b border-white/10"
          id="video-testimonials"
          style={{
            background: 'linear-gradient(135deg, #180e29 0%, #2b1654 35%, #3e1f7d 70%, #0284c7 100%)',
          }}
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#764DFF]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#0284c7]/20 blur-3xl pointer-events-none" />

          <div className="container mx-auto max-w-7xl px-4 lg:px-8 space-y-10 relative z-10">
            <div className="text-center max-w-2xl mx-auto space-y-3" data-aos="fade-up">
              <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-300">Real Experiences</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Student Video Testimonials
              </h2>
              <p className="text-slate-200 text-xs sm:text-sm font-medium leading-relaxed">
                Nothing speaks louder than the experiences of our students. Watch our students share their journey—from joining QIMD with little or no experience to working on live projects, building professional portfolios, and preparing for successful careers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videoReviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white/10 dark:bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-xl hover:border-cyan-300 hover:shadow-2xl transition-all flex flex-col justify-between text-white group"
                  data-aos="fade-up"
                >
                  <div>
                    <div
                      onClick={() =>
                        setSelectedVideo({
                          url: review.videoUrl || 'https://www.youtube.com/embed/L_LUpnjgPso',
                          title: `${review.studentName} Video Review`,
                        })
                      }
                      className="relative w-full aspect-video rounded-xl overflow-hidden mb-4 group cursor-pointer border border-white/20"
                    >
                      <Image
                        src={review.videoThumbnail || review.image || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80'}
                        alt={review.studentName}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                      <button
                        aria-label="Play review video"
                        className="absolute inset-0 m-auto w-11 h-11 rounded-full bg-[#764DFF] text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-cyan-400 group-hover:text-slate-900 transition-all duration-300"
                      >
                        <Icon icon="mdi:play" className="text-2xl translate-x-0.5" />
                      </button>
                      <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Icon icon="mdi:video" className="text-cyan-300" /> Video Review
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="font-bold text-white text-sm sm:text-base">
                        {review.studentName}
                      </h4>
                      <StarRating rating={review.rating || 5} />
                    </div>
                    <p className="text-xs text-cyan-300 font-semibold mb-2">{review.courseTaken || review.course}</p>
                    <p className="text-xs text-slate-200 italic leading-relaxed line-clamp-3 font-normal">
                      &quot;{review.review}&quot;
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setSelectedVideo({
                        url: review.videoUrl || 'https://www.youtube.com/embed/L_LUpnjgPso',
                        title: `${review.studentName} Video Review`,
                      })
                    }
                    className="mt-4 pt-3 border-t border-white/15 text-xs font-bold text-cyan-300 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Icon icon="mdi:play-circle" className="text-base" />
                    <span>Watch Full Story</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. WHAT OUR STUDENTS SAY (LIGHT GRADIENT FROM BOTTOM ONLY) */}
      <section
        className="py-16 lg:py-24 border-b border-slate-200/80 dark:border-dark_border relative overflow-hidden text-midnight_text"
        id="text-reviews"
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #ffffff 40%, #e8dcff 75%, #c8e0fe 100%)',
        }}
      >
        <div className="container mx-auto max-w-7xl px-4 lg:px-8 space-y-10 relative z-10">
          <div className="text-center max-w-2xl mx-auto space-y-2" data-aos="fade-up">
            <span className="inline-flex items-center gap-1.5 bg-[#764DFF]/15 border border-[#764DFF]/25 text-[#5c38d6] text-[11px] font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-xs mb-1">
              <Icon icon="mdi:certificate-outline" className="text-sm" />
              <span>Verified Ratings</span>
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111827] dark:text-white tracking-tight">
              What Our Students Say
            </h2>
            <p className="text-slate-600 dark:text-white/70 text-xs sm:text-sm font-medium">
              Authentic feedback from graduates who transformed their skills and careers with us.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {combinedTextReviews.map((rev, i) => {
              const name = rev.studentName || rev.name || 'Anonymous Student'
              const courseName = rev.courseTaken || rev.course || 'QIMD Program'
              return (
                <div
                  key={rev.id || i}
                  data-aos="fade-up"
                  data-aos-delay={i * 80}
                  className="bg-white dark:bg-darklight p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-dark_border shadow-md hover:shadow-xl hover:border-[#764DFF]/40 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <StarRating rating={rev.rating || 5} />
                      <span className="text-[11px] font-bold text-[#764DFF] bg-[#764DFF]/10 px-3 py-1 rounded-full">
                        {courseName}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-white/80 leading-relaxed font-medium italic">
                      &quot;{rev.review}&quot;
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-3 border-t border-slate-200/60 dark:border-dark_border/60">
                    {rev.photo || rev.image ? (
                      <img
                        src={rev.photo || rev.image}
                        alt={name}
                        className="w-8 h-8 rounded-full object-cover border border-[#764DFF]/20"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#764DFF]/10 text-[#764DFF] flex items-center justify-center text-xs font-extrabold">
                        {name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-extrabold text-midnight_text dark:text-white">
                        {name}
                      </h4>
                      <span className="text-[10px] text-slate-500 dark:text-white/50 block">
                        {rev.company ? `@ ${rev.company}` : 'Verified Graduate'}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 6 & 7. OUR LEARNING EXPERIENCE & SHARE YOUR EXPERIENCE (DARK GRADIENT & 2-COLUMN SIDE-BY-SIDE) */}
      <section
        className="py-16 lg:py-24 text-white relative overflow-hidden border-b border-white/10"
        style={{
          background: 'linear-gradient(135deg, #180e29 0%, #2b1654 35%, #3e1f7d 70%, #0284c7 100%)',
        }}
      >
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#764DFF]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#0284c7]/20 blur-3xl pointer-events-none" />

        <div className="container mx-auto max-w-7xl px-4 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            
            {/* Left Column: Our Learning Experience (Fade-Right) */}
            <div
              data-aos="fade-right"
              className="bg-white/10 dark:bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl space-y-6 flex flex-col justify-between h-full hover:border-cyan-300 transition-all text-white"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-white/15">
                  <div className="w-11 h-11 rounded-2xl bg-white/15 text-cyan-300 flex items-center justify-center shrink-0 border border-white/25">
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                      Our Learning Experience
                    </h2>
                    <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider">Holistic Practical Approach</span>
                  </div>
                </div>

                <p className="text-slate-200 text-xs sm:text-sm leading-relaxed font-normal">
                  At QIMD, learning doesn&apos;t stop with classroom sessions. This holistic approach ensures every learner graduates with practical experience and professional confidence:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 flex-1">
                {learningExperiencePoints.map((point, idx) => (
                  <div
                    key={idx}
                    className="bg-white/10 p-3 rounded-2xl border border-white/15 text-xs font-bold text-white flex items-center gap-2.5 shadow-xs hover:border-cyan-300 hover:bg-white/20 transition-all group"
                  >
                    <div className="w-6 h-6 rounded-lg bg-white/15 text-cyan-300 flex items-center justify-center text-xs shrink-0 group-hover:bg-cyan-300 group-hover:text-slate-900 transition-colors">
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M23,12L20.56,9.22L20.9,5.54L17.29,4.72L15.4,1.61L12,3.07L8.6,1.61L6.71,4.72L3.1,5.53L3.44,9.21L1,12L3.44,14.78L3.1,18.47L6.71,19.29L8.6,22.39L12,20.93L15.4,22.39L17.29,19.28L20.9,18.46L20.56,14.78L23,12M10,16.5L6,12.5L7.41,11.09L10,13.67L16.59,7.09L18,8.5L10,16.5Z" />
                      </svg>
                    </div>
                    <span className="leading-tight group-hover:text-cyan-300 transition-colors">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Share Your Experience (Fade-Left) */}
            <div
              data-aos="fade-left"
              className="bg-white/10 dark:bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl space-y-6 flex flex-col justify-between h-full hover:border-cyan-300 transition-all text-white"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-white/15">
                  <div className="w-11 h-11 rounded-2xl bg-white/15 text-cyan-300 flex items-center justify-center shrink-0 border border-white/25">
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                      Share Your Experience
                    </h2>
                    <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider">Student Reviews</span>
                  </div>
                </div>

                <p className="text-slate-200 text-xs sm:text-sm leading-relaxed font-normal">
                  We love hearing from our students. Your feedback helps future learners make informed decisions and motivates our team to continue delivering exceptional training. If you&apos;ve completed your journey with QIMD, we&apos;d love to hear your story.
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/15">
                <a
                  href="https://g.page/r/QIMDInstitute/review"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-r from-primary to-[#BD69F2] hover:opacity-90 text-white font-bold text-xs sm:text-sm py-3.5 px-6 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 group"
                >
                  <Icon icon="mdi:google" className="text-base" />
                  <span>Leave a Google Review</span>
                  <Icon icon="mdi:arrow-right" className="text-base group-hover:translate-x-1 transition-transform ml-auto" />
                </a>

                <Link
                  href="/contact"
                  className="w-full bg-white/15 hover:bg-white/25 border border-white/25 text-white font-bold text-xs sm:text-sm py-3.5 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 group backdrop-blur-md"
                >
                  <Icon icon="mdi:pencil-box-outline" className="text-base text-cyan-300" />
                  <span>Submit Student Feedback</span>
                  <Icon icon="mdi:chevron-right" className="text-base group-hover:translate-x-1 transition-transform ml-auto" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 8. CLOSING CTA: BECOME OUR NEXT SUCCESS STORY */}
      <section className="py-16 bg-white dark:bg-dark border-t border-slate-200/80 dark:border-dark_border">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8 text-center space-y-5" data-aos="fade-up">
          <div className="inline-flex items-center gap-2 bg-[#764DFF]/10 text-[#764DFF] text-xs font-extrabold px-4 py-1 rounded-full">
            <Icon icon="mdi:rocket-launch" />
            Start Learning. Build Skills. Create Success.
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-midnight_text dark:text-white tracking-tight">
            Become Our Next Success Story
          </h2>

          <div className="text-muted dark:text-white/80 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed font-medium">
            <p>
              Join hundreds of aspiring professionals who are building successful careers through AI-powered practical learning, live projects, internships, and expert mentorship.
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
              <span>Book Free Counselling Session</span>
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

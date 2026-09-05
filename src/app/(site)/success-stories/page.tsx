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
      name: "Rohan V.",
      course: "Digital Marketing Program",
      review: "I joined QIMD for the Digital Marketing Program and had a really good learning experience. The best part was the practical training and live projects. We learned about SEO, social media marketing, Google Ads and other digital marketing tools with practical examples. The trainers were supportive and cleared our doubts whenever needed.",
      rating: 5,
    },
    {
      name: "Sneha M.",
      course: "Digital Marketing Program",
      review: "I was looking for a good digital marketing institute in Pune and joined QIMD after checking the program details. The training was practical and easy to understand. I especially liked the live project sessions because they helped me understand how digital marketing works for real businesses.",
      rating: 5,
    },
    {
      name: "Aniket K.",
      course: "Graphic Design Program",
      review: "My experience of Graphic Design Program with Pune’s QIMD was great. The program covered practical designing concepts and gave us assignments to work on. The trainers were helpful and guided us throughout the learning process.",
      rating: 5,
    },
    {
      name: "Pooja S.",
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

  return (
    <div className="bg-grey dark:bg-dark min-h-screen">
      
      {/* 1. HERO HEADER: SUCCESS STORIES - DARK GRADIENT */}
      <section
        className="pt-20 sm:pt-28 pb-16 sm:pb-24 relative overflow-hidden text-white border-b border-white/10"
        style={{
          background: 'linear-gradient(135deg, #180e29 0%, #2b1654 35%, #3e1f7d 70%, #0284c7 100%)',
        }}
      >
        {/* Subtle Ambient Decorative Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#764DFF]/20 rounded-full blur-3xl pointer-events-none -z-0" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#0284c7]/20 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="container mx-auto max-w-7xl px-4 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column: Heading, Subtitle Card & Action Buttons */}
            <div className="lg:col-span-6 space-y-5 text-left" data-aos="fade-up">
              <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 text-white text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full shadow-2xs backdrop-blur-md">
                <Icon icon="mdi:trophy-outline" className="text-cyan-300 text-base animate-pulse" />
                <span>Success Stories</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-white leading-tight tracking-tight">
                Real Students. Real Skills. <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-white">
                  Real Careers.
                </span>
              </h1>

              <div className="py-3.5 px-4 sm:px-5 rounded-2xl bg-white/10 dark:bg-white/10 border border-white/20 shadow-sm backdrop-blur-md">
                <p className="text-slate-200 font-medium text-xs sm:text-sm leading-relaxed">
                  At <strong>QIMD (Quickupp Institute of Marketing &amp; Design)</strong>, success is measured by the careers our students build after completing their training.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap gap-3.5">
                <a
                  href="#placements"
                  className="bg-primary hover:bg-darkprimary text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-xl hover:scale-[1.02] flex items-center gap-2"
                >
                  <Icon icon="mdi:briefcase-check-outline" className="text-base" />
                  <span>Explore Recent Placements</span>
                </a>
                <a
                  href="#video-testimonials"
                  className="bg-white/15 hover:bg-white/25 border border-white/25 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all flex items-center gap-2 hover:scale-[1.02] shadow-2xs backdrop-blur-md"
                >
                  <Icon icon="mdi:play-circle-outline" className="text-base text-cyan-300" />
                  <span>Watch Video Testimonials</span>
                </a>
              </div>
            </div>

            {/* Right Column: Elevated Student Journey Card */}
            <div className="lg:col-span-6" data-aos="fade-up" data-aos-delay="100">
              <div className="relative p-6 sm:p-8 rounded-3xl bg-white/10 dark:bg-white/10 border border-white/20 shadow-2xl backdrop-blur-md space-y-4 text-white">
                {/* Decorative Trophy Icon Watermark */}
                <div className="absolute top-4 right-6 text-white/10 text-6xl pointer-events-none select-none">
                  <Icon icon="mdi:trophy-outline" />
                </div>

                <div className="space-y-4 text-slate-200 text-sm sm:text-[15px] lg:text-base leading-relaxed font-medium relative z-10">
                  <p>
                    Through AI-powered practical learning, live client projects, expert mentorship, internship opportunities, and placement assistance, our students gain the confidence and skills required to excel in today&apos;s digital industry. Every success story motivates us to continue creating industry-ready professionals.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. FROM LEARNING TO EARNING - TOP-SIDE LIGHT GRADIENT */}
      <section
        className="py-16 sm:py-24 border-b border-slate-200/80 dark:border-dark_border relative overflow-hidden text-midnight_text"
        style={{
          background: 'linear-gradient(180deg, #c8e0fe 0%, #e8dcff 25%, #f8f9ff 60%, #ffffff 100%)',
        }}
      >
        <div className="container mx-auto max-w-7xl px-4 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto bg-white dark:bg-darklight rounded-3xl p-8 sm:p-12 border border-slate-200/80 dark:border-dark_border shadow-xl space-y-6 text-center" data-aos="fade-up">
            <div className="w-12 h-12 rounded-2xl bg-[#764DFF]/10 text-[#764DFF] flex items-center justify-center mx-auto shadow-xs border border-[#764DFF]/20">
              <Icon icon="mdi:trending-up" className="text-2xl text-[#764DFF]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] dark:text-white tracking-tight">
              From Learning to Earning
            </h2>
            <div className="space-y-3 text-slate-700 dark:text-white/80 text-xs sm:text-sm leading-relaxed font-medium">
              <p>
                Our students have transformed their careers by applying practical knowledge gained at QIMD. Whether they started as freshers, students, career switchers, freelancers, or entrepreneurs, they all shared one thing in common - a desire to build real skills that employers value.
              </p>
              <p className="text-slate-900 dark:text-white font-bold text-xs sm:text-sm pt-1">
                Today, many of them are working with digital agencies, startups, established companies, and growing brands, while others have successfully launched their own freelance careers and businesses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3 & 4. SECTORS & WHY STUDENTS SUCCEED */}
      <section
        className="py-16 lg:py-24 border-b border-slate-200/80 dark:border-dark_border overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #ffffff 40%, #f0e8ff 70%, #dcecfe 100%)',
        }}
      >
        <div className="container mx-auto max-w-7xl px-4 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2" data-aos="fade-up">
            <span className="text-xs font-bold uppercase tracking-widest text-[#764DFF]">Career Ecosystem</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-midnight_text dark:text-white tracking-tight">
              Where &amp; Why Our Students Excel
            </h2>
            <p className="text-muted dark:text-white/70 text-xs sm:text-sm font-medium">
              Equipping learners with the practical capabilities top industries actively hire for.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch pt-2">
            
            {/* Left Column: Building Successful Careers In */}
            <div className="space-y-4 bg-white dark:bg-dark p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-dark_border shadow-2xs flex flex-col justify-between h-full">
              <div className="flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-dark_border min-h-[54px]">
                <div className="w-9 h-9 rounded-xl bg-[#764DFF]/10 text-[#764DFF] flex items-center justify-center text-lg font-bold shrink-0">
                  <Icon icon="mdi:domain" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-midnight_text dark:text-white leading-tight">
                    Building Successful Careers In
                  </h3>
                  <span className="text-[10px] font-bold text-[#764DFF] uppercase tracking-wider">Top Hiring Sectors</span>
                </div>
              </div>

              <div className="space-y-2.5 pt-1 flex-1 flex flex-col justify-between">
                {sectors.map((sec, i) => (
                  <div
                    key={i}
                    data-aos="fade-right"
                    data-aos-delay={i * 70}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-grey/60 dark:bg-darklight border border-slate-200/60 dark:border-dark_border/60 hover:border-[#764DFF]/40 transition-all group min-h-[46px]"
                  >
                    <div className="w-6 h-6 rounded-lg bg-[#764DFF]/10 text-[#764DFF] flex items-center justify-center text-xs shrink-0 group-hover:bg-[#764DFF] group-hover:text-white transition-colors">
                      <Icon icon={sec.icon} />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-white/90 leading-tight">
                      {sec.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Why Our Students Succeed */}
            <div className="space-y-4 bg-white dark:bg-dark p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-dark_border shadow-2xs flex flex-col justify-between h-full">
              <div className="flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-dark_border min-h-[54px]">
                <div className="w-9 h-9 rounded-xl bg-[#BD69F2]/10 text-[#BD69F2] flex items-center justify-center text-lg font-bold shrink-0">
                  <Icon icon="mdi:star-outline" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-midnight_text dark:text-white leading-tight">
                    Why Our Students Succeed
                  </h3>
                  <span className="text-[10px] font-bold text-[#BD69F2] uppercase tracking-wider">The QIMD Advantage</span>
                </div>
              </div>

              <div className="space-y-2.5 pt-1 flex-1 flex flex-col justify-between">
                {whySucceedPoints.map((item, i) => (
                  <div
                    key={i}
                    data-aos="fade-left"
                    data-aos-delay={i * 70}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-grey/60 dark:bg-darklight border border-slate-200/60 dark:border-dark_border/60 hover:border-[#BD69F2]/40 transition-all group min-h-[46px]"
                  >
                    <div className="w-6 h-6 rounded-lg bg-[#BD69F2]/10 text-[#BD69F2] flex items-center justify-center text-xs shrink-0 group-hover:bg-[#BD69F2] group-hover:text-white transition-colors">
                      <Icon icon={item.icon} />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-white/90 leading-tight">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. STUDENT VIDEO TESTIMONIALS - DARK GRADIENT */}
      {videoReviews.length > 0 && (
        <section
          className="py-16 lg:py-24 text-white relative overflow-hidden border-b border-white/10"
          id="video-testimonials"
          style={{
            background: 'linear-gradient(135deg, #180e29 0%, #2b1654 35%, #3e1f7d 70%, #0284c7 100%)',
          }}
        >
          <div className="container mx-auto max-w-7xl px-4 lg:px-8 space-y-10 relative z-10">
            <div className="text-center max-w-2xl mx-auto space-y-2" data-aos="fade-up">
              <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-300">Direct Feedback</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Student Video Testimonials
              </h2>
              <p className="text-slate-200 text-xs sm:text-sm font-medium">
                Hear directly from our students about their learning journey, classroom experience, live projects, internships, and career growth after joining QIMD.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videoReviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white/10 dark:bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-xl hover:border-cyan-300 transition-all flex flex-col justify-between text-white"
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
                      className="relative w-full aspect-video rounded-xl overflow-hidden mb-4 group cursor-pointer border border-white/25"
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
                        className="absolute inset-0 m-auto w-11 h-11 rounded-full bg-[#764DFF] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
                      >
                        <Icon icon="mdi:play" className="text-2xl translate-x-0.5" />
                      </button>
                      <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-sm">
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

      {/* 6. RECENTLY PLACED STUDENTS - TOP & BOTTOM LIGHT GRADIENT */}
      <section
        className="py-16 lg:py-24 border-b border-slate-200/80 dark:border-dark_border relative overflow-hidden text-midnight_text"
        id="placements"
        style={{
          background: 'linear-gradient(180deg, #c8e0fe 0%, #e8dcff 15%, #ffffff 40%, #ffffff 65%, #e8dcff 85%, #c8e0fe 100%)',
        }}
      >
        {/* Soft Ambient Floating Background Accents */}
        <div className="pointer-events-none absolute -top-20 -left-20 w-80 h-80 rounded-full bg-[#764DFF]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-[#38bdf8]/10 blur-3xl" />

        <div className="container mx-auto max-w-7xl px-4 lg:px-8 space-y-10 relative z-10">
          <div className="text-center max-w-2xl mx-auto space-y-2" data-aos="fade-up">
            <span className="inline-flex items-center gap-1.5 bg-[#764DFF]/15 border border-[#764DFF]/25 text-[#5c38d6] text-[11px] font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-xs mb-1">
              <Icon icon="mdi:briefcase-check-outline" className="text-sm" />
              <span>Hiring Outcomes</span>
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111827] dark:text-white tracking-tight">
              Recently Placed Students
            </h2>
            <p className="text-slate-600 dark:text-white/70 text-xs sm:text-sm font-medium">
              Our students continue to secure exciting career opportunities across leading companies, agencies, and growing startups.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {placedStudents.map((student, i) => (
              <PlacementCard key={student.id || i} student={student} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* 7. STUDENT REVIEWS - DARK GRADIENT */}
      <section
        className="py-16 lg:py-24 text-white relative overflow-hidden border-b border-white/10"
        style={{
          background: 'linear-gradient(135deg, #180e29 0%, #2b1654 35%, #3e1f7d 70%, #0284c7 100%)',
        }}
      >
        <div className="container mx-auto max-w-7xl px-4 lg:px-8 space-y-10 relative z-10">
          <div className="text-center max-w-2xl mx-auto space-y-2" data-aos="fade-up">
            <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-300">Verified Ratings</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Student Reviews
            </h2>
            <p className="text-slate-200 text-xs sm:text-sm font-medium">
              Real feedback from learners who built their practical skills and careers at QIMD.
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
                  className="bg-white/10 dark:bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-xl flex flex-col justify-between space-y-4 hover:border-cyan-300 transition-all text-white"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <StarRating rating={rev.rating || 5} />
                      <span className="text-[11px] font-bold text-cyan-300 bg-white/15 border border-white/25 px-3 py-1 rounded-full">
                        {courseName}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal italic">
                      &quot;{rev.review}&quot;
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-3 border-t border-white/15">
                    {rev.photo || rev.image ? (
                      <img
                        src={rev.photo || rev.image}
                        alt={name}
                        className="w-8 h-8 rounded-full object-cover border border-white/30"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center text-xs font-extrabold">
                        {name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-extrabold text-white">
                        {name}
                      </h4>
                      <span className="text-[10px] text-cyan-300/90 block">
                        Verified Student
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 8. CLOSING CTA BANNER - LIGHT GRADIENT FROM BOTTOM */}
      <section
        className="py-16 sm:py-24 border-t border-slate-200/80 dark:border-dark_border relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #ffffff 40%, #e8dcff 75%, #c8e0fe 100%)',
        }}
      >
        <div className="container mx-auto max-w-7xl px-4 lg:px-8 text-center space-y-5 relative z-10" data-aos="fade-up">
          <span className="inline-flex items-center gap-1.5 bg-[#764DFF]/15 border border-[#764DFF]/25 text-[#5c38d6] text-[11px] font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
            <Icon icon="mdi:rocket-launch-outline" className="text-sm text-[#764DFF]" />
            <span>Start Your Journey</span>
          </span>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111827] dark:text-white tracking-tight">
            Become Our Next Success Story
          </h2>

          <div className="text-slate-700 dark:text-white/80 text-xs sm:text-sm max-w-2xl mx-auto space-y-2 leading-relaxed font-medium">
            <p>
              Your journey to a successful career begins with the right skills, the right mentors, and the right opportunities.
            </p>
            <p className="text-slate-900 dark:text-white font-bold text-xs sm:text-sm">
              Join QIMD and learn through AI-powered practical training, live client projects, internships, and career-focused mentorship designed to make you industry-ready.
            </p>
          </div>

          <div className="pt-3 flex flex-wrap justify-center gap-4">
            <a
              href="tel:+918087897288"
              className="bg-primary hover:bg-darkprimary text-white font-extrabold text-xs sm:text-sm px-8 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Icon icon="mdi:phone" className="text-base" />
              <span>Call Us: +91 80878 97288</span>
            </a>
            <Link
              href="/contact"
              className="bg-white dark:bg-darklight hover:bg-slate-50 text-midnight_text dark:text-white font-extrabold text-xs sm:text-sm px-8 py-3.5 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Icon icon="mdi:account-badge-outline" className="text-base text-[#764DFF]" />
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

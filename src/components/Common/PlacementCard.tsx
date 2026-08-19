'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import { Icon } from '@iconify/react/dist/iconify.js'
import type { PlacedStudent } from '@/types'
import VideoModal from '@/components/Common/VideoModal'

interface PlacementCardProps {
  student: PlacedStudent
  index?: number
}

const PlacementCard: React.FC<PlacementCardProps> = ({ student, index = 0 }) => {
  const [isVideoOpen, setIsVideoOpen] = useState(false)

  const studentPhoto = (student as any).studentPhoto || student.image || student.videoThumbnail
  const studentName = student.name || (student as any).studentName || 'Placed Student'
  const designation = student.role || (student as any).designation || 'Specialist'
  const company = student.company || (student as any).companyName || 'Hiring Partner'

  return (
    <>
      <div
        className="group relative bg-white dark:bg-darklight rounded-2xl border border-border dark:border-dark_border shadow-card hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden flex flex-col h-full"
        data-aos="fade-up"
        data-aos-delay={index * 80}
      >
        {/* Card Header Media (Student Photo / Video Thumbnail / Avatar Fallback) */}
        <div className="relative w-full h-56 bg-slate-900 overflow-hidden">
          {studentPhoto && studentPhoto.trim() !== '' ? (
            <Image
              src={studentPhoto}
              alt={studentName}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#764DFF]/80 via-[#BD69F2]/70 to-[#4999D4] flex flex-col items-center justify-center text-white">
              <div className="w-20 h-20 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-3xl font-extrabold shadow-lg mb-2">
                {studentName.charAt(0)}
              </div>
              <span className="text-xs font-semibold text-white/80">Student Profile</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Badges on Top of Image */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            {student.isVerified && (
              <span className="inline-flex items-center gap-1 bg-emerald-500/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md shadow">
                <Icon icon="mdi:check-decagram" className="text-xs" />
                <span>Verified Placement</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1 bg-[#764DFF]/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md shadow">
              <Icon icon="mdi:school" className="text-xs" />
              <span>Successfully Placed</span>
            </span>
          </div>

          {/* Package Badge Top Right */}
          {student.package && (
            <div className="absolute top-3 right-3 bg-white text-[#764DFF] font-extrabold text-xs px-3 py-1 rounded-full shadow-lg border border-[#764DFF]/30 z-10">
              {student.package}
            </div>
          )}

          {/* Animated Play Button if Video Exists */}
          {student.isVideo && student.videoUrl && (
            <button
              onClick={() => setIsVideoOpen(true)}
              aria-label={`Play placement video of ${student.name}`}
              className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-white/90 hover:bg-white text-[#764DFF] flex items-center justify-center shadow-xl group-hover:scale-110 transition-all duration-300 z-20 cursor-pointer"
            >
              {/* Glowing Pulse Ring */}
              <span className="absolute inset-0 rounded-full bg-[#764DFF] opacity-75 animate-ping" />
              <Icon icon="mdi:play" className="text-3xl relative z-10 translate-x-0.5" />
            </button>
          )}

          {/* Bottom Student Overlay Name & Location */}
          <div className="absolute bottom-3 left-3 right-3 z-10 text-white">
            <h3 className="font-extrabold text-lg leading-snug drop-shadow">
              {student.name || (student as any).studentName || 'Placed Student'}
            </h3>
            <div className="flex items-center gap-3 text-xs text-white/80 mt-0.5">
              {student.location && (
                <span className="flex items-center gap-1">
                  <Icon icon="mdi:map-marker" className="text-secondary text-xs" />
                  {student.location}
                </span>
              )}
              {student.joiningYear && (
                <span className="flex items-center gap-1">
                  <Icon icon="mdi:calendar-check" className="text-secondary text-xs" />
                  {student.joiningYear}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 flex flex-col flex-1 justify-between bg-white dark:bg-darklight space-y-4">
          <div className="space-y-3">
            {/* Course Completed */}
            <div className="inline-flex items-center gap-1.5 bg-[#764DFF]/10 dark:bg-[#764DFF]/20 text-[#764DFF] dark:text-[#BD69F2] text-xs font-bold px-2.5 py-1 rounded-md max-w-full break-words">
              <Icon icon="mdi:book-open-variant" className="text-sm flex-shrink-0" />
              <span className="break-words">{student.course || (student as any).courseName || 'Professional Course'}</span>
            </div>

            {/* Designation & Company */}
            <div>
              <h4 className="text-sm sm:text-base font-bold text-midnight_text dark:text-white leading-snug break-words">
                {student.role || (student as any).designation || 'Specialist'}
              </h4>
              <div className="flex items-center gap-1.5 mt-1">
                <Icon icon="mdi:office-building" className="text-[#4999D4] text-sm flex-shrink-0" />
                <span className="text-xs font-semibold text-muted dark:text-white/75 break-words">
                  {student.company || (student as any).companyName || 'Hiring Partner'}
                </span>
              </div>
            </div>

            {/* Short Success Story */}
            {(student.shortSuccessStory || (student as any).quote || (student as any).successStory) && (
              <div className="bg-grey dark:bg-dark/60 p-3 rounded-xl border border-border/60 dark:border-dark_border/60">
                <p className="text-xs text-muted dark:text-white/75 leading-relaxed italic break-words">
                  &quot;{student.shortSuccessStory || (student as any).quote || (student as any).successStory}&quot;
                </p>
              </div>
            )}
          </div>


          {/* Card Footer Actions */}
          <div className="pt-3 border-t border-border dark:border-dark_border flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Icon icon="mdi:shield-check" className="text-sm flex-shrink-0" />
              Verified Candidate
            </span>

            {student.isVideo && student.videoUrl ? (
              <button
                onClick={() => setIsVideoOpen(true)}
                className="text-xs text-[#764DFF] dark:text-[#BD69F2] font-bold hover:underline flex items-center gap-1 cursor-pointer flex-shrink-0"
              >
                <span>Watch Story</span>
                <Icon icon="mdi:play-circle" className="text-sm" />
              </button>
            ) : (
              <span className="text-xs text-muted dark:text-white/40 font-medium flex-shrink-0">
                QIMD Alumnus
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox / Video Modal */}
      {student.isVideo && student.videoUrl && (
        <VideoModal
          isOpen={isVideoOpen}
          onClose={() => setIsVideoOpen(false)}
          videoUrl={student.videoUrl}
          title={`${student.name} – Success Story Video`}
        />
      )}
    </>
  )
}

export default PlacementCard

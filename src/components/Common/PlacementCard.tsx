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

/** Polaroid-style placed-student card (Why QIMD pages) */
const PlacementCard: React.FC<PlacementCardProps> = ({ student, index = 0 }) => {
  const [isVideoOpen, setIsVideoOpen] = useState(false)

  const studentPhoto = (student as any).studentPhoto || student.image || student.videoThumbnail
  const studentName = student.name || (student as any).studentName || 'Placed Student'
  const designation = student.role || (student as any).designation || 'Specialist'
  const company = student.company || (student as any).companyName || 'Hiring Partner'
  const story = student.shortSuccessStory || (student as any).quote || (student as any).successStory
  const hasVideo = !!(student.isVideo && student.videoUrl)

  return (
    <>
      <article className={`qw-polaroid t${index % 3}`}>
        <div className="qw-polaroid-photo">
          {studentPhoto && studentPhoto.trim() !== '' ? (
            <Image
              src={studentPhoto}
              alt={studentName}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="qw-polaroid-fallback">
              <span>{studentName.charAt(0)}</span>
              <small>Student Profile</small>
            </div>
          )}

          {student.isVerified && (
            <span className="qw-badge is-verified qw-badge-tl">
              <Icon icon="mdi:check-decagram" />
              <span>Verified Placement</span>
            </span>
          )}
          <span className="qw-badge qw-badge-bl">
            <Icon icon="mdi:school" />
            <span>Successfully Placed</span>
          </span>

          {student.package && <span className="qw-polaroid-package">{student.package}</span>}

          {hasVideo && (
            <button
              type="button"
              onClick={() => setIsVideoOpen(true)}
              aria-label={`Play placement video of ${student.name}`}
              className="qw-polaroid-play"
            >
              <Icon icon="mdi:play" />
            </button>
          )}
        </div>

        <div className="qw-polaroid-body">
          <h3 className="qw-polaroid-name">{studentName}</h3>
          {(student.location || student.joiningYear) && (
            <div className="qw-polaroid-meta">
              {student.location && (
                <span>
                  <Icon icon="mdi:map-marker" />
                  {student.location}
                </span>
              )}
              {student.joiningYear && (
                <span>
                  <Icon icon="mdi:calendar-check" />
                  {student.joiningYear}
                </span>
              )}
            </div>
          )}

          <span className="qw-polaroid-course">
            <Icon icon="mdi:book-open-variant" />
            <span>{student.course || (student as any).courseName || 'Professional Program'}</span>
          </span>

          <div className="qw-polaroid-job">
            <strong>{designation}</strong>
            <span>
              <Icon icon="mdi:office-building" />
              {company}
            </span>
          </div>

          {story && <p className="qw-polaroid-story">&quot;{story}&quot;</p>}

          <div className="qw-polaroid-foot">
            <span className="qw-polaroid-verified">
              <Icon icon="mdi:shield-check" />
              Verified Candidate
            </span>
            {hasVideo ? (
              <button type="button" onClick={() => setIsVideoOpen(true)} className="qw-polaroid-watch">
                <span>Watch Story</span>
                <Icon icon="mdi:play-circle" />
              </button>
            ) : (
              <span className="qw-polaroid-alum">QIMD Alumnus</span>
            )}
          </div>
        </div>
      </article>

      {hasVideo && (
        <VideoModal
          isOpen={isVideoOpen}
          onClose={() => setIsVideoOpen(false)}
          videoUrl={student.videoUrl!}
          title={`${student.name} – Success Story Video`}
        />
      )}
    </>
  )
}

export default PlacementCard

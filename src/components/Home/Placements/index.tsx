'use client'
import React, { useState } from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'
import { placementPartnersData } from '@/data'
import GoogleReviewCard from '@/components/Common/GoogleReviewCard'

const studentReviewsList = [
  {
    name: "Rohan Verma",
    initial: "R",
    program: "Digital Marketing Program",
    rating: 5,
    review: "I joined QIMD for the Digital Marketing Program and had a really good learning experience. The best part was the practical training and live projects. We learned about SEO, social media marketing, Google Ads and other digital marketing tools with practical examples. The trainers were supportive and cleared our doubts whenever needed."
  },
  {
    name: "Sneha More",
    initial: "S",
    program: "Digital Marketing Program",
    rating: 5,
    review: "I was looking for a good digital marketing institute in Pune and joined QIMD after checking the program details. The training was practical and easy to understand. I especially liked the live project sessions because they helped me understand how digital marketing works for real businesses."
  },
  {
    name: "Aniket Kulkarni",
    initial: "A",
    program: "Graphic Design Program",
    rating: 5,
    review: "My experience of Graphic Design Program with Pune’s QIMD was great. The program covered practical designing concepts and gave us assignments to work on. The trainers were helpful and guided us throughout the learning process."
  },
  {
    name: "Pooja Sharma",
    initial: "P",
    program: "Video Editing Program",
    rating: 5,
    review: "I joined QIMD to learn video editing and really enjoyed the practical sessions. We worked on different types of videos and learned how to improve editing, storytelling and presentation. The overall learning environment was very supportive."
  }
]

const PartnerLogoItem: React.FC<{ partner: any }> = ({ partner }) => {
  const fallback = placementPartnersData.find(
    (p) => p.name.toLowerCase() === (partner.name || '').toLowerCase()
  )?.logo || ''

  const [src, setSrc] = useState<string>(partner.logo || fallback)
  const [hasError, setHasError] = useState(false)

  if (hasError || !src) {
    return (
      <span className="qo-partner-name">
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
      className="qo-partner-img"
    />
  )
}

const PlacementsSection: React.FC<{
  placements?: any[];
  partners?: any[];
  testimonials?: any[];
  studentReviews?: any[];
}> = ({
  partners,
  studentReviews,
}) => {
  const displayPartners = partners && partners.length > 0 ? partners : placementPartnersData
  const displayReviews = studentReviews && studentReviews.length > 0 ? studentReviews : studentReviewsList

  return (
    <section className="qo-sec qo-reviews" id="student-reviews">
      <div className="qo-wrap">
        <div className="qo-reviews-grid">
          <div className="qo-reviews-head">
            <span className="qo-kicker">
              <Icon icon="mdi:star-check" />
              VERIFIED RATINGS
            </span>
            <h2 className="qo-h2">What Our Students Say</h2>
            <p className="qo-lead" suppressHydrationWarning>
              Authentic feedback from graduates who transformed their skills and careers with us.
            </p>
          </div>

          <div className="qo-review-cards">
            {displayReviews.map((item, index) => (
              <GoogleReviewCard
                key={item.id || index}
                name={item.name || item.studentName}
                program={item.program || item.course}
                rating={item.rating}
                review={item.review}
                photo={item.photo || null}
              />
            ))}
          </div>
        </div>

        {/* Hiring partners */}
        <div className="qo-partners">
          <p className="qo-partners-title">Trusted Hiring Partners &amp; Recruiters</p>
          <div className="qo-marquee">
            <div className="qo-marquee-track">
              {[...displayPartners, ...displayPartners, ...displayPartners].map((partner, i) => (
                <div key={`${partner.id || i}-${i}`} className="qo-partner">
                  <PartnerLogoItem partner={partner} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PlacementsSection

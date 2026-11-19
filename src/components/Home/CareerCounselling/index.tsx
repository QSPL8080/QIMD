'use client'
import React from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react/dist/iconify.js'
import { siteConfig } from '@/data'
import EnquiryForm from '@/components/Common/EnquiryForm'

const CareerCounsellingCTA: React.FC = () => {
  const counselStats = [
    { icon: 'mdi:account-group-outline', label: '10,000+', sub: 'Trained Students' },
    { icon: 'mdi:briefcase-check-outline', label: '100%', sub: 'Job Assistance' },
    { icon: 'mdi:laptop', label: '100%', sub: 'Live Client Work' },
    { icon: 'mdi:calendar-sync-outline', label: '2 Years', sub: 'Repeat Access' },
  ]

  return (
    <section className="qo-sec qo-counsel">
      <div className="qo-wrap qo-counsel-grid">
        <div className="qo-counsel-copy">
          <span className="qo-counsel-badge">
            <Icon icon="mdi:star-four-points" />
            <span>
              <strong>India&apos;s #1</strong> AI-Powered Marketing &amp; Design Institute
            </span>
          </span>

          <h2 className="qo-h2 is-light">Connect With Our Career Counselling Team</h2>

          <p className="qo-counsel-lead">
            Not sure which program is right for you? Our experts will help you choose the best program based on your career goals, skills, and interests.
          </p>

          <div className="qo-counsel-stats">
            {counselStats.map((item, i) => (
              <div key={i} className="qo-counsel-stat">
                <Icon icon={item.icon} />
                <strong>{item.label}</strong>
                <span>{item.sub}</span>
              </div>
            ))}
          </div>

          <div className="qo-counsel-actions">
            <Link href="/contact" className="qo-counsel-btn">
              <Icon icon="mdi:email-outline" />
              <span>Contact Us</span>
            </Link>
            <Link href={siteConfig.socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="qo-counsel-btn">
              <Icon icon="mdi:whatsapp" />
              <span>Talk to Expert</span>
            </Link>
            <Link href="/hire-from-us" className="qo-counsel-btn">
              <Icon icon="mdi:briefcase-account" />
              <span>Hire From Us</span>
            </Link>
          </div>
        </div>

        <div id="career-counselling-form-card" className="qo-counsel-form">
          <div className="qo-counsel-form-head">
            <h3>Get Personalized Guidance</h3>
          </div>
          <p>Fill in your details below and an expert counsellor will contact you within 30 minutes.</p>
          <EnquiryForm showTitle={false} compact />
        </div>
      </div>
    </section>
  )
}

export default CareerCounsellingCTA

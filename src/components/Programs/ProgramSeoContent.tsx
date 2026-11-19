import React from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'
import type { ProgramSeo } from '@/data/programSeo'

const CHOOSE_ICONS = ['mdi:briefcase-check-outline', 'mdi:rocket-launch-outline', 'mdi:account-tie-outline', 'mdi:robot-outline', 'mdi:folder-star-outline']
const PLACEMENT_ICONS = ['mdi:compass-outline', 'mdi:account-voice', 'mdi:file-account-outline', 'mdi:handshake-outline', 'mdi:domain']

function Head({ num, title }: { num: string; title: string }) {
  return (
    <div className="qp-block-head">
      <span className="qp-block-num">{num}</span>
      <h2 className="qp-h3">{title}</h2>
    </div>
  )
}

/** Main column of an SEO program page (form sits in the right column). */
export default function ProgramSeoContent({ seo }: { seo: ProgramSeo }) {
  return (
    <>
      {/* Why AI-powered */}
      <div className="qp-block">
        <Head num="01" title={seo.why.title} />
        <div className="qs-prose">
          {seo.why.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </div>

      {/* Modules */}
      <div className="qp-block">
        <Head num="02" title={seo.learn.title} />
        <p className="qs-intro">{seo.learn.intro}</p>
        <div className="qs-modules">
          {seo.learn.modules.map((m, i) => (
            <div key={i} className="qs-module">
              <span className="qs-module-num">{String(i + 1).padStart(2, '0')}</span>
              <h3>{m.title}</h3>
              <p>{m.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Why Quickupp */}
      <div className="qp-block">
        <Head num="03" title={seo.choose.title} />
        <div className="qs-prose">
          {seo.choose.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        </div>
        <div className="qs-cards">
          {seo.choose.cards.map((c, i) => (
            <div key={i} className="qs-card">
              <span className="qs-card-ic"><Icon icon={CHOOSE_ICONS[i % CHOOSE_ICONS.length]} /></span>
              <h3>{c.title}</h3>
              <p>{c.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Placement */}
      <div className="qp-block">
        <Head num="04" title={seo.placement.title} />
        <p className="qs-intro">{seo.placement.intro}</p>
        <ul className="qs-list">
          {seo.placement.cards.map((c, i) => (
            <li key={i}>
              <span className="qs-list-ic"><Icon icon={PLACEMENT_ICONS[i % PLACEMENT_ICONS.length]} /></span>
              <span>
                <strong>{c.title}</strong>
                <small>{c.text}</small>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Careers */}
      <div className="qp-block">
        <Head num="05" title={seo.careers.title} />
        <p className="qs-intro">{seo.careers.intro}</p>
        <div className="qs-roles">
          {seo.careers.roles.map((r, i) => (
            <div key={i} className="qs-role">
              <h3>{r.title}</h3>
              <p>{r.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mentors */}
      <div className="qp-block">
        <Head num="06" title={seo.mentors.title} />
        <div className="qs-prose">
          {seo.mentors.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </div>

      {/* Closing */}
      <div className="qp-block qs-closing">
        <Head num="07" title={seo.closing.title} />
        <div className="qs-prose">
          {seo.closing.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </div>

      {/* FAQs */}
      <div className="qp-block" id="faqs">
        <Head num="08" title={seo.faqTitle} />
        <div className="qs-faqs">
          {seo.faqs.map((f, i) => (
            <details key={i} className="qs-faq" open={i === 0}>
              <summary>
                <span className="qs-faq-num">{String(i + 1).padStart(2, '0')}</span>
                <h3>{f.question}</h3>
                <Icon icon="mdi:plus" className="qs-faq-ic" />
              </summary>
              <p>{f.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </>
  )
}

/** JSON-LD for a program SEO page: LocalBusiness, Course and FAQPage. */
export function ProgramSeoSchema({ seo, slug }: { seo: ProgramSeo; slug: string }) {
  const base = 'https://quickuppinstitute.com'
  const localBusiness = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Quickupp Institute of Marketing & Design',
    image: `${base}/images/logo/qimd-logo.png`,
    '@id': `${base}/#localbusiness`,
    url: `${base}/`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Suratwala Mark Plazzo, Hinjawadi Rd, Phase 1',
      addressLocality: 'Pune',
      postalCode: '411057',
      addressCountry: 'IN',
    },
  }
  const course = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: seo.course.name,
    description: seo.course.description,
    provider: { '@type': 'EducationalOrganization', name: 'Quickupp Institute', url: `${base}/` },
    educationalLevel: seo.course.educationalLevel,
    inLanguage: 'en',
    courseMode: seo.course.courseMode,
    occupationalCredentialAwarded: seo.course.credential,
    url: `${base}/courses/${slug}`,
  }
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: seo.faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }
  return (
    <>
      {[localBusiness, course, faq].map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}
    </>
  )
}

import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Icon } from '@iconify/react/dist/iconify.js'
import EnquiryForm from '@/components/Common/EnquiryForm'
import { coursesData, siteConfig } from '@/data'
import { getSeoPage, type SeoPage } from '@/data/seoPages'

const SITE = 'https://quickuppinstitute.com'

/** Icon per "why choose" card, picked by its title. */
function chooseIcon(title: string) {
  const t = title.toLowerCase()
  if (t.includes('placement')) return 'mdi:briefcase-check-outline'
  if (t.includes('live project')) return 'mdi:rocket-launch-outline'
  if (t.includes('mentor')) return 'mdi:account-tie-outline'
  if (t.includes('hiring')) return 'mdi:office-building-outline'
  if (t.includes('curriculum')) return 'mdi:robot-outline'
  if (t.includes('portfolio')) return 'mdi:folder-star-outline'
  if (t.includes('freelanc')) return 'mdi:laptop'
  return 'mdi:check-decagram-outline'
}

const PLACEMENT_ICONS = ['mdi:compass-outline', 'mdi:account-voice', 'mdi:file-account-outline', 'mdi:handshake-outline', 'mdi:domain']

export function seoMetadata(path: string): Metadata {
  const page = getSeoPage(path)
  if (!page) return { title: 'Page Not Found' }
  const url = `${SITE}/${page.path}`
  return {
    title: { absolute: page.metaTitle },
    description: page.metaDescription,
    alternates: { canonical: url },
    openGraph: { title: page.metaTitle, description: page.metaDescription, url, type: 'website' },
  }
}

function Head({ num, title }: { num: string; title: string }) {
  return (
    <div className="qp-block-head">
      <span className="qp-block-num">{num}</span>
      <h2 className="qp-h3">{title}</h2>
    </div>
  )
}

function Schemas({ page }: { page: SeoPage }) {
  const localBusiness = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Quickupp Institute of Marketing & Design',
    image: `${SITE}/images/logo/qimd-logo.png`,
    url: `${SITE}/`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Suratwala Mark Plazzo, Hinjawadi Rd, Phase 1',
      addressLocality: 'Pune',
      postalCode: '411057',
      addressCountry: 'IN',
    },
  }
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }
  return (
    <>
      {[localBusiness, page.courseSchema, faq].map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}
    </>
  )
}

export default function SeoLandingPage({ path }: { path: string }) {
  const page = getSeoPage(path)
  if (!page) notFound()
  const course: any = coursesData.find((c) => c.slug === page.program)
  const whatsappUrl: string = siteConfig.socialLinks.whatsapp

  return (
    <div className="qp qp-detail qs-page">
      <Schemas page={page} />

      {/* Hero: copy on the left, enquiry form on the right */}
      <section className="qp-hero qp-dhero qs-hero" data-qx="off">
        <div className="qp-wrap">
          <nav className="qp-crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <Icon icon="mdi:chevron-right" />
            <span>{page.h1}</span>
          </nav>

          <div className="qs-hero-grid">
            <div className="qp-dhero-copy">
              <h1 className="qp-h1">{page.h1}</h1>
              <p className="qs-tagline">{page.tagline}</p>
              {page.intro.map((p, i) => (
                <p key={i} className="qp-lead qs-lead">{p}</p>
              ))}
              <div className="qp-actions">
                <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="qp-btn qp-btn-ghost">
                  <Icon icon="mdi:whatsapp" />
                  <span>Chat on WhatsApp</span>
                </Link>
              </div>
            </div>

            <div id="enquire" className="qp-formcard qs-hero-form">
              <EnquiryForm title="Enquire Now" showTitle={true} compact selectedCourse={page.program} />
            </div>
          </div>
        </div>
      </section>

      <section className="qp-dbody">
        <div className="qp-wrap qp-dgrid">
          <div className="qp-dmain">
            <div className="qp-block">
              <Head num="01" title={page.why.title} />
              <div className="qs-prose">
                {page.why.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </div>

            <div className="qp-block">
              <Head num="02" title={page.learn.title} />
              <p className="qs-intro">{page.learn.intro}</p>
              <div className="qs-modules">
                {page.learn.modules.map((m, i) => (
                  <div key={i} className="qs-module">
                    <span className="qs-module-num">{String(i + 1).padStart(2, '0')}</span>
                    <h3>{m.title}</h3>
                    <p>{m.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="qp-block">
              <Head num="03" title={page.choose.title} />
              <div className="qs-prose">
                {page.choose.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
              </div>
              <div className="qs-cards">
                {page.choose.cards.map((c, i) => (
                  <div key={i} className="qs-card">
                    <span className="qs-card-ic"><Icon icon={chooseIcon(c.title)} /></span>
                    <h3>{c.title}</h3>
                    <p>{c.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="qp-block">
              <Head num="04" title={page.placement.title} />
              <div className="qs-prose qs-prose-gap">
                {page.placement.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
              </div>
              <ul className="qs-list">
                {page.placement.cards.map((c, i) => (
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

            <div className="qp-block">
              <Head num="05" title={page.careers.title} />
              <p className="qs-intro">{page.careers.intro}</p>
              <div className="qs-roles">
                {page.careers.roles.map((r, i) => (
                  <div key={i} className="qs-role">
                    <h3>{r.title}</h3>
                    <p>{r.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="qp-block">
              <Head num="06" title={page.mentors.title} />
              <div className="qs-prose">
                {page.mentors.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </div>

            <div className="qp-block qs-closing">
              <Head num="07" title={page.closing.title} />
              <div className="qs-prose">
                {page.closing.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </div>

            <div className="qp-block" id="faqs">
              <Head num="08" title={page.faqTitle} />
              <div className="qs-faqs">
                {page.faqs.map((f, i) => (
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
          </div>

          <aside className="qp-dside">
            <div className="qp-dside-inner">
              {course && (
                <Link href={`/courses/${course.slug}`} className="qs-prog">
                  {course.image && (
                    <span className="qs-prog-img">
                      <Image src={course.image} alt={course.title} width={600} height={340} />
                    </span>
                  )}
                  <span className="qs-prog-body">
                    <strong>{course.title}</strong>
                    <span className="qs-prog-link">
                      View program <Icon icon="solar:arrow-right-linear" />
                    </span>
                  </span>
                </Link>
              )}
              <div className="qp-help">
                <h4>Need Help?</h4>
                <p>Talk to our counsellors for personalized guidance.</p>
                <Link href={`tel:${siteConfig.phone}`} className="qp-help-link">
                  <Icon icon="mdi:phone" />
                  {siteConfig.phone}
                </Link>
                <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="qp-help-link is-wa">
                  <Icon icon="mdi:whatsapp" />
                  Chat on WhatsApp
                </Link>
                <Link href="#enquire" className="qp-btn qp-btn-main qs-help-cta">Enquire Now</Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}

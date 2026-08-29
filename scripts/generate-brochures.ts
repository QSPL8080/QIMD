import fs from 'fs'
import path from 'path'
import PDFDocument from 'pdfkit'
import { db } from '../src/lib/db'

interface CourseBrochureData {
  slug: string
  title: string
  tagline: string
  duration: string
  mode: string
  eligibility: string
  overview: string
  highlights: string[]
  tools: string[]
  modules: { moduleNumber: number; title: string; topics: string[] }[]
  careerRoles: string[]
}

const coursesBrochureInfo: CourseBrochureData[] = [
  {
    slug: 'ai-digital-marketing',
    title: 'AI Powered Digital Marketing Course',
    tagline: 'Master Performance Marketing, SEO, Social Media & Generative AI Tools',
    duration: '6 Months (Full-Time / Weekend Batches)',
    mode: '100% Practical Offline Classroom Training',
    eligibility: '10+2 / Graduates / Career Switchers / Entrepreneurs / Working Professionals',
    overview:
      "Join QIMD's industry-defining Digital Marketing Program integrated with cutting-edge AI tools. Master end-to-end performance marketing, SEO, Google & Meta Ads, Content Strategy, Email Automation, and Data Analytics through hands-on live client campaigns and real ad budgets.",
    highlights: [
      'Live Client Budget Campaigns with Real ROI Tracking',
      'AI Marketing Workflows: ChatGPT, Midjourney & Copilot',
      'Guaranteed 100% Internship & Dedicated Placement Cell',
      '2 Years Repeat Batch Access & Lifetime Mentor Support',
      'Recognized Global Certifications (Google, Meta & HubSpot)',
      '1-on-1 Interview Preparation & Portfolio Showcase'
    ],
    tools: [
      'Google Ads Manager',
      'Meta Business Suite',
      'Google Analytics 4 (GA4)',
      'SEMrush & Ahrefs',
      'Mailchimp & ActiveCampaign',
      'ChatGPT & Claude AI',
      'Midjourney & Canva Pro',
      'WordPress & Webflow CMS'
    ],
    modules: [
      {
        moduleNumber: 1,
        title: 'Digital Marketing Fundamentals & Growth Frameworks',
        topics: [
          'Consumer Psychology, Buyer Personas & Inbound Marketing Architecture',
          'Brand Positioning, Messaging & Unique Value Proposition (UVP) Strategy'
        ]
      },
      {
        moduleNumber: 2,
        title: 'Advanced Search Engine Optimization (SEO)',
        topics: [
          'Keyword Research, Intent Mapping, On-Page & Technical SEO Audits',
          'High-Authority Link Building, Local SEO & Google Business Profile Domination'
        ]
      },
      {
        moduleNumber: 3,
        title: 'Social Media Marketing & Community Growth',
        topics: [
          'Organic Instagram, LinkedIn, YouTube & Facebook Growth Strategies',
          'Short-Form Viral Video Strategy, Influencer Marketing & Brand Partnerships'
        ]
      },
      {
        moduleNumber: 4,
        title: 'Paid Performance Advertising (PPC & Meta Ads)',
        topics: [
          'Google Search, Display, Shopping & Performance Max Campaigns',
          'Meta Ads: Advanced Retargeting, Lookalike Audiences & Conversion Optimization'
        ]
      },
      {
        moduleNumber: 5,
        title: 'Content Marketing, Email Automation & Funnels',
        topics: [
          'High-Converting Copywriting, Lead Magnet Design & Landing Page Optimization',
          'Automated Drip Email Sequences, List Segmentation & Lead Nurturing'
        ]
      },
      {
        moduleNumber: 6,
        title: 'AI Marketing Tools, Analytics & Freelancing',
        topics: [
          'Prompt Engineering for AI Marketing Automation & Generative Campaigns',
          'GA4 Custom Dashboards, Google Tag Manager & Freelance Agency Setup'
        ]
      }
    ],
    careerRoles: [
      'Digital Marketing Manager',
      'Performance Marketing Specialist',
      'SEO & Content Strategist',
      'Social Media & Growth Lead',
      'Paid Ads (PPC) Specialist',
      'Freelance Marketing Consultant'
    ]
  },
  {
    slug: 'ai-graphic-design',
    title: 'AI Powered Graphic Design Course',
    tagline: 'Master Professional Visual Design, Brand Identity & Generative AI Tools',
    duration: '6 Months (Full-Time / Weekend Batches)',
    mode: '100% Practical Offline Classroom Training',
    eligibility: '10+2 / Any Graduate / Creative Aspirants / Beginners / Working Professionals',
    overview:
      "Transform your creative potential into high-paying design skills with QIMD's AI-Powered Graphic Design Program. Master typography, branding, advertising creatives, UI/UX fundamentals, Adobe Creative Cloud suite, and advanced generative AI design tools.",
    highlights: [
      'Commercial Brand Identity & Live Client Design Briefs',
      'Generative AI Design: Midjourney, Adobe Firefly & DALL-E 3',
      'Full Adobe Suite Mastery: Photoshop, Illustrator & InDesign',
      'Guaranteed 100% Internship & Creative Agency Placements',
      '2 Years Repeat Batch Access & Industry Mentor Reviews',
      'World-Class Design Portfolio with 15+ Polished Case Studies'
    ],
    tools: [
      'Adobe Photoshop',
      'Adobe Illustrator',
      'Adobe InDesign',
      'Figma & FigJam',
      'Adobe Firefly (Generative AI)',
      'Midjourney v6',
      'Canva Pro & Vectorizer',
      'Freepik & Adobe Stock'
    ],
    modules: [
      {
        moduleNumber: 1,
        title: 'Visual Design Fundamentals & Creative Thinking',
        topics: [
          'Elements & Principles of Graphic Design, Visual Balance & Contrast',
          'Color Theory, Psychology, Harmonious Palettes & Typography Hierarchy'
        ]
      },
      {
        moduleNumber: 2,
        title: 'Adobe Photoshop Mastery & Photo Manipulation',
        topics: [
          'Advanced Photo Retouching, Compositing, Layer Masks & Smart Objects',
          'High-Impact Social Media Ad Creatives, Banners & Poster Design'
        ]
      },
      {
        moduleNumber: 3,
        title: 'Adobe Illustrator & Vector Brand Identity',
        topics: [
          'Pen Tool Mastery, Custom Vector Illustrations & Iconography',
          'Logo Design Process, Golden Ratio, Stationery & Brand Guidelines'
        ]
      },
      {
        moduleNumber: 4,
        title: 'Editorial Design, Packaging & Print Production',
        topics: [
          'Adobe InDesign: Brochures, Magazines, Catalogs & Annual Reports',
          'Product Packaging, Dielines, Label Design & CMYK Pre-Press Preparation'
        ]
      },
      {
        moduleNumber: 5,
        title: 'UI/UX Fundamentals, Web Assets & Figma',
        topics: [
          'Wireframing, User Flows & Mobile App UI Layouts in Figma',
          'Interactive Prototyping, Design Systems & Responsive Web Assets'
        ]
      },
      {
        moduleNumber: 6,
        title: 'AI Generative Design & Portfolio Showcase',
        topics: [
          'Prompt Engineering for Photorealistic Visuals in Midjourney & Firefly',
          'Behance & Dribbble Portfolio Presentation, Case Studies & Freelancing'
        ]
      }
    ],
    careerRoles: [
      'Senior Graphic Designer',
      'Brand Identity Designer',
      'Creative Visualizer & Art Director',
      'UI/UX Visual Designer',
      'Packaging & Print Specialist',
      'Freelance Creative Director'
    ]
  },
  {
    slug: 'ai-video-editing',
    title: 'AI Powered Video Editing Course',
    tagline: 'Master Cinematic Storytelling, Motion Graphics, Color Grading & AI Tools',
    duration: '6 Months (Full-Time / Weekend Batches)',
    mode: '100% Practical Offline Classroom Training',
    eligibility: '10+2 / Any Graduate / Content Creators / Video Aspirants / Career Switchers',
    overview:
      "Become a top-tier video editor and motion graphics artist with QIMD's AI-Powered Video Editing Program. Learn high-end cinematic editing, short-form viral content production, DaVinci Resolve color grading, After Effects visual effects, and automated AI video workflows.",
    highlights: [
      'Live Commercial Project Footage & Multi-Camera Productions',
      'AI Video Generation & Automation: Runway Gen-2, Topaz AI & ElevenLabs',
      'Industry-Standard Tools: Premiere Pro, After Effects & DaVinci Resolve',
      'Guaranteed 100% Internship with Media & Production Houses',
      '2 Years Repeat Batch Access & Dedicated Career Mentor',
      'Showreel Development for YouTube, Commercial Ads & OTT Films'
    ],
    tools: [
      'Adobe Premiere Pro',
      'Adobe After Effects',
      'DaVinci Resolve Studio',
      'Adobe Audition (Sound Design)',
      'Runway Gen-2 & Sora AI',
      'ElevenLabs Voice Synthesis',
      'Topaz Video AI Upscaling',
      'CapCut Desktop Pro'
    ],
    modules: [
      {
        moduleNumber: 1,
        title: 'Cinematic Storytelling & Video Editing Fundamentals',
        topics: [
          'Film Grammar, Shot Composition, Non-Linear Editing (NLE) Workflow',
          'Pacing, J-Cuts, L-Cuts, Match Cuts & Dynamic Narrative Transitions'
        ]
      },
      {
        moduleNumber: 2,
        title: 'Adobe Premiere Pro Advanced Post-Production',
        topics: [
          'Multi-Camera Editing, Fast Proxy Workflows & Timeline Optimization',
          'Viral Social Media Reels/Shorts Editing & Sound Design in Audition'
        ]
      },
      {
        moduleNumber: 3,
        title: 'After Effects & Motion Graphics Design',
        topics: [
          'Kinetic Typography, Title Sequences, Lower Thirds & Keyframing',
          'Logo Reveals, 2D Explainer Animations & Dynamic Shape Layers'
        ]
      },
      {
        moduleNumber: 4,
        title: 'Visual Effects (VFX), Rotoscoping & Compositing',
        topics: [
          'Green Screen Chroma Keying, Camera Tracking & Screen Replacements',
          'Particle Effects, Light Leaks, Cinematic Glows & Clean Plate Generation'
        ]
      },
      {
        moduleNumber: 5,
        title: 'DaVinci Resolve & Professional Color Grading',
        topics: [
          'Color Science, Scopes, Primary Balance & Secondary Color Grading',
          'Skin Tone Isolation, Film Emulation LUTs & HDR Color Deliverables'
        ]
      },
      {
        moduleNumber: 6,
        title: 'AI Video Pipelines, Showreel & Freelancing',
        topics: [
          'AI Auto-Subtitles, Script-to-Video, Video Upscaling & AI B-Roll',
          'Building High-Impact Video Showreels & High-Ticket Client Outreach'
        ]
      }
    ],
    careerRoles: [
      'Lead Video Editor',
      'Motion Graphics Artist',
      'Colorist & Post-Production Lead',
      'YouTube & Social Media Content Producer',
      'Commercial Ad Editor',
      'Freelance Video Production Studio'
    ]
  }
]

async function generateBrochurePdf(course: CourseBrochureData, outputPath: string) {
  return new Promise<number>((resolve, reject) => {
    // Exact A4 dimensions: 595.28 x 841.89 pt with 0 margins to prevent automatic blank page triggers
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
      autoFirstPage: true,
      bufferPages: true,
    })

    const stream = fs.createWriteStream(outputPath)
    doc.pipe(stream)

    // Design System
    const primaryDark = '#180E29'
    const primaryPurple = '#764DFF'
    const cyanAccent = '#0284C7'
    const textDark = '#0F172A'
    const textMuted = '#475569'
    const lightBg = '#F8FAFC'
    const borderCol = '#E2E8F0'

    const logoPath = path.join(process.cwd(), 'public', 'images', 'logo', 'qimd-logo-white.png')
    const fallbackLogo = path.join(process.cwd(), 'public', 'images', 'logo', 'qimd-logo.png')

    // =========================================================================
    // --- PAGE 1: HERO OVERVIEW, HIGHLIGHTS, TOOLS, CAREER ROLES & STATS ---
    // =========================================================================

    // 1. Top Header Banner (Height: 124 pt)
    const headerGrad = doc.linearGradient(0, 0, 595.28, 124)
    headerGrad.stop(0, '#120924')
    headerGrad.stop(0.35, '#241249')
    headerGrad.stop(0.7, '#35186E')
    headerGrad.stop(1, '#0284C7')
    doc.rect(0, 0, 595.28, 124).fill(headerGrad)

    // Bottom cyan line
    doc.rect(0, 122, 595.28, 2).fill('#38BDF8')

    // Embed Logo
    let textLeftX = 35
    try {
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 35, 17, { width: 88 })
        textLeftX = 135
      } else if (fs.existsSync(fallbackLogo)) {
        doc.image(fallbackLogo, 35, 17, { width: 88 })
        textLeftX = 135
      }
    } catch (e) {
      console.warn('Could not embed logo image:', e)
    }

    // Header Institute Title & Course Details
    doc.fillColor('#38BDF8').fontSize(8).font('Helvetica-Bold').text('QUICKUPP INSTITUTE OF MARKETING AND DESIGN (QIMD)', textLeftX, 18, { lineBreak: false })
    doc.fillColor('#FFFFFF').fontSize(16).font('Helvetica-Bold').text(course.title, textLeftX, 32, { width: 555 - textLeftX, lineBreak: false })
    doc.fillColor('#E0E7FF').fontSize(8.5).font('Helvetica').text(course.tagline, textLeftX, 55, { width: 555 - textLeftX, lineBreak: false })

    // Polished Header Contact & Website Strip (Y = 78, Height: 32 pt)
    doc.roundedRect(35, 78, 525, 32, 5).fillOpacity(0.3).fill('#0B0517').fillOpacity(1)
    doc.roundedRect(35, 78, 525, 32, 5).strokeColor('#38BDF8').lineWidth(0.7).stroke()

    // 1. Helpline
    doc.fillColor('#38BDF8').fontSize(7.5).font('Helvetica-Bold').text('Admissions: ', 48, 89, { continued: true })
    doc.fillColor('#FFFFFF').font('Helvetica').text('+91 90000 00000', { lineBreak: false })

    // 2. Email
    doc.fillColor('#38BDF8').fontSize(7.5).font('Helvetica-Bold').text('Email: ', 195, 89, { continued: true })
    doc.fillColor('#FFFFFF').font('Helvetica').text('info@quickuppinstitute.com', { link: 'mailto:info@quickuppinstitute.com', lineBreak: false })

    // 3. Website
    doc.fillColor('#38BDF8').fontSize(7.5).font('Helvetica-Bold').text('Website: ', 390, 89, { continued: true })
    doc.fillColor('#FFFFFF').font('Helvetica-Bold').text('quickuppinstitute.com', { link: 'https://quickuppinstitute.com/', underline: true, lineBreak: false })

    // 2. Key Facts Bar (Y = 136, Height: 46 pt)
    doc.roundedRect(35, 136, 525, 46, 6).fill(lightBg).stroke(borderCol)
    
    doc.fillColor(primaryPurple).fontSize(7.5).font('Helvetica-Bold').text('DURATION', 50, 144, { lineBreak: false })
    doc.fillColor(textDark).fontSize(8).font('Helvetica').text(course.duration, 50, 158, { width: 140, lineBreak: false })

    doc.fillColor(primaryPurple).fontSize(7.5).font('Helvetica-Bold').text('LEARNING MODE', 200, 144, { lineBreak: false })
    doc.fillColor(textDark).fontSize(8).font('Helvetica').text(course.mode, 200, 158, { width: 160, lineBreak: false })

    doc.fillColor(primaryPurple).fontSize(7.5).font('Helvetica-Bold').text('LOCATION', 375, 144, { lineBreak: false })
    doc.fillColor(textDark).fontSize(8).font('Helvetica').text('Hinjewadi Phase 1, Pune', 375, 158, { width: 160, lineBreak: false })

    // 3. Course Overview (Y = 192)
    doc.fillColor(primaryDark).fontSize(11.5).font('Helvetica-Bold').text('Course Overview', 35, 192, { lineBreak: false })
    doc.rect(35, 207, 30, 2).fill(cyanAccent)

    doc.fillColor(textMuted).fontSize(8.5).font('Helvetica').text(course.overview, 35, 215, { width: 525, lineGap: 2.5 })

    // 4. Key Highlights Section (Y = 270)
    doc.fillColor(primaryDark).fontSize(11.5).font('Helvetica-Bold').text('Program Highlights & Key Benefits', 35, 270, { lineBreak: false })
    doc.rect(35, 285, 30, 2).fill(primaryPurple)

    let curY = 295
    course.highlights.forEach((hl, i) => {
      const col = i % 2
      const row = Math.floor(i / 2)
      const x = col === 0 ? 35 : 300
      const y = curY + row * 23

      doc.circle(x + 5, y + 4.5, 3).fill(cyanAccent)
      doc.fillColor(textDark).fontSize(8).font('Helvetica-Bold').text(hl, x + 14, y, { width: 245, lineBreak: false })
    })

    // 5. Tools & Technologies Covered (Y = 378)
    doc.fillColor(primaryDark).fontSize(11.5).font('Helvetica-Bold').text('Tools & AI Technologies Mastered', 35, 378, { lineBreak: false })
    doc.rect(35, 393, 30, 2).fill(cyanAccent)

    let toolY = 402
    course.tools.forEach((tool, i) => {
      const col = i % 2
      const row = Math.floor(i / 2)
      const x = col === 0 ? 35 : 300
      const y = toolY + row * 19

      doc.roundedRect(x, y, 250, 15, 3).fill('#EFF6FF').stroke('#DBEAFE')
      doc.fillColor('#1E40AF').fontSize(7.5).font('Helvetica-Bold').text(`•  ${tool}`, x + 8, y + 3.5, { lineBreak: false })
    })

    // 6. Career Opportunities (Y = 490)
    doc.fillColor(primaryDark).fontSize(11.5).font('Helvetica-Bold').text('Career Opportunities & High-Paying Roles', 35, 490, { lineBreak: false })
    doc.rect(35, 505, 30, 2).fill(primaryPurple)

    let roleY = 514
    course.careerRoles.forEach((role, i) => {
      const col = i % 2
      const row = Math.floor(i / 2)
      const x = col === 0 ? 35 : 300
      const y = roleY + row * 19

      doc.roundedRect(x, y, 250, 15, 3).fill('#FAF5FF').stroke('#F3E8FF')
      doc.fillColor('#6B21A8').fontSize(7.5).font('Helvetica-Bold').text(`✔  ${role}`, x + 8, y + 3.5, { lineBreak: false })
    })

    // 7. Key Stats Grid (Y = 582)
    doc.roundedRect(35, 582, 525, 48, 6).fill('#F1F5F9').stroke('#CBD5E1')
    const stats = [
      { val: '10,000+', lbl: 'Trained Students' },
      { val: '100%', lbl: 'Job Assistance' },
      { val: '100%', lbl: 'Live Client Work' },
      { val: '2 Years', lbl: 'Repeat Access' }
    ]
    stats.forEach((st, idx) => {
      const sx = 45 + (idx * 128)
      doc.fillColor(primaryPurple).fontSize(11).font('Helvetica-Bold').text(st.val, sx, 591, { width: 110, align: 'center', lineBreak: false })
      doc.fillColor(textMuted).fontSize(7).font('Helvetica').text(st.lbl, sx, 607, { width: 110, align: 'center', lineBreak: false })
    })

    // 8. Why Choose QIMD Card (Y = 640)
    doc.roundedRect(35, 640, 525, 78, 6).fill('#F8FAFC').stroke('#E2E8F0')
    doc.fillColor(primaryDark).fontSize(9.5).font('Helvetica-Bold').text('Why Choose Quickupp Institute of Marketing and Design (QIMD)?', 48, 650, { lineBreak: false })
    const reasons = [
      'Agency Mentorship: Learn from working digital leads managing real client accounts.',
      'Live Ad Budgets: Run live Google, Meta and YouTube campaigns during your training.',
      '1-on-1 Placement Coaching: Resume building, portfolio refinement & mock interview drills.',
      '2 Years Repeat Access: Re-attend future updated batches for 2 years at zero extra cost.'
    ]
    reasons.forEach((r, idx) => {
      const ry = 666 + (idx * 12)
      doc.circle(52, ry + 3, 2).fill(cyanAccent)
      doc.fillColor(textMuted).fontSize(7.5).font('Helvetica').text(r, 58, ry, { width: 490, lineBreak: false })
    })

    // Page 1 Footer (Y = 802, Height: 40 pt)
    const footerGrad = doc.linearGradient(0, 802, 595.28, 842)
    footerGrad.stop(0, '#120924')
    footerGrad.stop(1, '#241249')
    doc.rect(0, 802, 595.28, 40).fill(footerGrad)
    doc.fillColor('#94A3B8').fontSize(7.5).font('Helvetica').text('Quickupp Institute of Marketing and Design (QIMD)  |  Page 1 of 2', 35, 816, { lineBreak: false })
    doc.fillColor('#38BDF8').fontSize(7.5).font('Helvetica-Bold').text('Visit: quickuppinstitute.com', 320, 816, { align: 'right', width: 240, link: 'https://quickuppinstitute.com/', lineBreak: false })


    // =========================================================================
    // --- PAGE 2: IN-DEPTH 6-MODULE SYLLABUS & ENROLLMENT INFORMATION ---
    // =========================================================================
    doc.addPage()

    // Page 2 Header Banner (Height: 45 pt)
    const p2HeaderGrad = doc.linearGradient(0, 0, 595.28, 45)
    p2HeaderGrad.stop(0, '#120924')
    p2HeaderGrad.stop(1, '#35186E')
    doc.rect(0, 0, 595.28, 45).fill(p2HeaderGrad)
    doc.rect(0, 43, 595.28, 2).fill(cyanAccent)

    doc.fillColor('#FFFFFF').fontSize(11).font('Helvetica-Bold').text(`${course.title} — Detailed Syllabus`, 35, 16, { lineBreak: false })
    doc.fillColor('#38BDF8').fontSize(8.5).font('Helvetica-Bold').text('6-Month Practical Roadmap', 390, 17, { align: 'right', width: 170, lineBreak: false })

    // 6 Modules Container Loop (Y = 56)
    let modY = 56
    course.modules.forEach((mod) => {
      // Module Header Card (Height: 17 pt)
      doc.roundedRect(35, modY, 525, 17, 3).fill(primaryPurple)
      doc.fillColor('#FFFFFF').fontSize(8.5).font('Helvetica-Bold').text(`Module ${mod.moduleNumber}: ${mod.title}`, 45, modY + 4, { lineBreak: false })

      modY += 20

      // Module topics container (Height: 38 pt)
      doc.roundedRect(35, modY, 525, 38, 3).fill(lightBg).stroke(borderCol)
      
      mod.topics.forEach((topic, tidx) => {
        const topY = modY + 5 + (tidx * 15)
        doc.circle(46, topY + 4, 2).fill(cyanAccent)
        doc.fillColor(textDark).fontSize(7.5).font('Helvetica').text(topic, 54, topY, { width: 495, lineBreak: false })
      })

      modY += 46
    })

    // Placement & Hiring Partners Section (Y = 460)
    doc.roundedRect(35, 460, 525, 76, 6).fill('#F0FDF4').stroke('#BBF7D0')
    doc.fillColor('#166534').fontSize(9.5).font('Helvetica-Bold').text('100% Placement Assistance & Top Hiring Partners', 48, 470, { lineBreak: false })
    doc.fillColor('#15803D').fontSize(7.5).font('Helvetica').text(
      'Our dedicated placement cell conducts mock interviews, resume optimization, portfolio reviews, and connects you directly with our 100+ hiring network including Capgemini, Infosys, Wipro, Futurism Technologies, Kolte Patil, Kohinoor Group, Vilas Javadekar, and top-tier creative and marketing agencies.',
      48,
      485,
      { width: 495, lineGap: 2 }
    )

    // Certification & Recognition (Y = 546)
    doc.roundedRect(35, 546, 525, 68, 6).fill('#FEFCE8').stroke('#FEF08A')
    doc.fillColor('#854D0E').fontSize(9.5).font('Helvetica-Bold').text('Recognized Industry Certification & Live Project Portfolio', 48, 556, { lineBreak: false })
    doc.fillColor('#713F12').fontSize(7.5).font('Helvetica').text(
      'Upon successful completion of the course and capstone live projects, you will receive an Industry-Recognized Course Completion Certificate, Internship Certificate, and a verified professional portfolio ready for employer review.',
      48,
      572,
      { width: 495, lineGap: 2 }
    )

    // Admission & How to Enroll Box (Y = 624)
    const enrollGrad = doc.linearGradient(35, 624, 560, 700)
    enrollGrad.stop(0, '#120924')
    enrollGrad.stop(1, '#241249')
    doc.roundedRect(35, 624, 525, 76, 6).fill(enrollGrad)
    doc.fillColor('#38BDF8').fontSize(9.5).font('Helvetica-Bold').text('HOW TO ENROLL & VISIT CAMPUS', 48, 635, { lineBreak: false })
    doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica').text('Campus Address: Quickupp Institute of Marketing and Design, Hinjewadi Phase 1, Pune, Maharashtra, India', 48, 652, { lineBreak: false })
    doc.fillColor('#E2E8F0').fontSize(7.5).font('Helvetica').text('Call/WhatsApp Admissions: +91 90000 00000   |   Email: info@quickuppinstitute.com   |   Website: quickuppinstitute.com', 48, 668, { lineBreak: false })
    doc.fillColor('#7DD3FC').fontSize(7).font('Helvetica-Bold').text('Office Hours: Monday to Saturday (9:00 AM – 7:00 PM)  |  Walk-ins & Free Career Counselling Available', 48, 683, { lineBreak: false })

    // Page 2 Footer (Y = 802, Height: 40 pt)
    doc.rect(0, 802, 595.28, 40).fill(footerGrad)
    doc.fillColor('#94A3B8').fontSize(7.5).font('Helvetica').text('© 2026 Quickupp Institute of Marketing and Design. All Rights Reserved.  |  Page 2 of 2', 35, 816, { lineBreak: false })
    doc.fillColor('#38BDF8').fontSize(7.5).font('Helvetica-Bold').text('Visit: quickuppinstitute.com', 320, 816, { align: 'right', width: 240, link: 'https://quickuppinstitute.com/', lineBreak: false })

    doc.end()

    stream.on('finish', () => {
      const stats = fs.statSync(outputPath)
      resolve(stats.size)
    })

    stream.on('error', (err) => reject(err))
  })
}

async function main() {
  console.log('=== GENERATING STANDARD 2-PAGE PROFESSIONAL PDF BROCHURES ===')
  const brochuresDir = path.join(process.cwd(), 'public', 'brochures')
  if (!fs.existsSync(brochuresDir)) {
    fs.mkdirSync(brochuresDir, { recursive: true })
  }

  // Get courses from database
  const courses = await db.course.findMany({
    where: { isDeleted: false },
    orderBy: { courseName: 'asc' }
  })

  for (const brochureInfo of coursesBrochureInfo) {
    const fileName = `${brochureInfo.slug}-brochure.pdf`
    const filePath = path.join(brochuresDir, fileName)
    const publicUrl = `/brochures/${fileName}`

    console.log(`Generating PDF for ${brochureInfo.title}...`)
    const fileSize = await generateBrochurePdf(brochureInfo, filePath)
    const formattedSize = `${(fileSize / 1024).toFixed(1)} KB`
    console.log(`✓ Saved ${fileName} (${formattedSize})`)

    // Find course in DB
    const courseRecord = courses.find((c) =>
      c.slug.includes(brochureInfo.slug) ||
      brochureInfo.slug.includes(c.slug) ||
      c.courseName.toLowerCase().includes(brochureInfo.slug.replace('ai-', ''))
    )

    if (courseRecord) {
      console.log(`Linking brochure with course "${courseRecord.courseName}" (ID: ${courseRecord.id})...`)

      // Deactivate other brochures for this course
      await db.brochure.updateMany({
        where: { courseId: courseRecord.id },
        data: { isActive: false }
      })

      // Check if existing brochure record exists
      const existing = await db.brochure.findFirst({
        where: {
          courseId: courseRecord.id,
          fileUrl: publicUrl,
          isDeleted: false
        }
      })

      if (existing) {
        await db.brochure.update({
          where: { id: existing.id },
          data: {
            title: `${courseRecord.courseName} Brochure`,
            fileSize: formattedSize,
            isActive: true
          }
        })
      } else {
        await db.brochure.create({
          data: {
            title: `${courseRecord.courseName} Brochure`,
            courseId: courseRecord.id,
            fileUrl: publicUrl,
            fileSize: formattedSize,
            isActive: true
          }
        })
      }
      console.log(`✓ Brochure successfully linked and activated for ${courseRecord.courseName}`)
    } else {
      console.warn(`⚠ Course not found in database for slug: ${brochureInfo.slug}`)
    }
  }

  console.log('\n======================================================')
  console.log('🎉 ALL 3 STANDARD 2-PAGE BROCHURES GENERATED & SEEDED!')
  console.log('======================================================')
}

main()
  .then(async () => {
    await db.$disconnect()
  })
  .catch(async (e) => {
    console.error('Error generating brochures:', e)
    await db.$disconnect()
    process.exit(1)
  })

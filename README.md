# 📚 QIMD (Quickup Institute of Marketing & Design)

An enterprise-grade educational institute platform, content management system (CMS), and lead management CRM built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**, **Prisma ORM**, and **PostgreSQL (Supabase)**.

---

## 📑 Table of Contents

1. [Architectural Overview](#-architectural-overview)
2. [Tech Stack & Dependencies](#-tech-stack--dependencies)
3. [Database Schema & Models Reference](#-database-schema--models-reference)
4. [Project Directory & File Structure](#-project-directory--file-structure)
5. [Public Website Routes (`src/app/(site)`)](#-public-website-routes)
6. [CMS Admin Dashboard (`src/app/admin`)](#-cms-admin-dashboard)
7. [Server Actions Reference (`src/app/actions`)](#-server-actions-reference)
8. [API Endpoints Reference (`src/app/api`)](#-api-endpoints-reference)
9. [UI Component Architecture (`src/components`)](#-ui-component-architecture)
10. [Authentication & Authorization](#-authentication--authorization)
11. [Environment Variables Reference](#-environment-variables-reference)
12. [Installation & Getting Started](#-installation--getting-started)
13. [Database Management & Seeding](#-database-management--seeding)
14. [Deployment & Production Build](#-deployment--production-build)

---

## 🏛 Architectural Overview

QIMD is designed as a unified monorepo-style Next.js application powering three core operational pillars:

- **Public Marketing & Student Portal**: High-speed, SEO-optimized landing pages, dynamic course catalog, interactive curriculum viewer, brochure downloads, verified placement records, student testimonials, and responsive lead generation forms.
- **Dynamic Content Management System (CMS)**: Administrative management for hero banners, courses, categories, trainers, team members, blog posts, photo/video gallery albums, hiring partners, EMI financing partners, FAQs, and custom dynamic page sections.
- **Multi-Stream CRM & Enquiry Management**: Lead routing and CRM workflows for:
  - Admission Enquiries
  - Franchise Partner Applications
  - Corporate / Employer Hiring Requests
  - Faculty & Staff Career Applications (with resume uploads)
  - General Contact Messages
- **Header & Footer Customizer**: Live customizable navigation bars, top-header contact items, social links, footer columns, and quick links without redeploying code.

---

## 🛠 Tech Stack & Dependencies

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | Next.js 15.1+ (App Router) | React Server Components, Server Actions, API routes, Turbopack |
| **UI Library** | React 19 | Latest concurrent React features |
| **Language** | TypeScript 5 | End-to-end type safety |
| **Styling** | Tailwind CSS v4 | Modern styling with `@tailwindcss/postcss` |
| **Database** | PostgreSQL / Supabase | Scalable relational database with connection pooling |
| **ORM** | Prisma 6.4 | Type-safe query engine and schema migrations |
| **Auth** | NextAuth.js & JWT / bcryptjs | Role-Based Access Control (RBAC), secure sessions |
| **Icons** | Iconify React (`@iconify/react`) | Extended icon support across frontend and CMS |
| **Animations** | AOS & Framer Motion | Smooth scroll reveal and transition animations |
| **Carousels** | React Slick & Slick Carousel | Responsive hero banners and testimonial carousels |
| **Documents** | PDFKit | Automated server-side PDF document generation |
| **Notifications** | React Hot Toast | Real-time toast feedback across admin and frontend |

---

## 🗄 Database Schema & Models Reference

The database is defined in `prisma/schema.prisma` and includes the following models:

### 1. Users & Administration
- **`User` (`users`)**: Administrator accounts with role-based access (`SUPER_ADMIN`, `ADMIN`, `CONTENT_MANAGER`), hashed passwords (`bcryptjs`), and activity audit linkages.
- **`AuditLog` (`audit_logs`)**: Security and change log tracking user actions, affected modules, record IDs, IP addresses, and user agents.
- **`NotificationLog` (`notification_logs`)**: Delivery logs for system notifications and alerts.
- **`Report` (`reports`)**: Generated analytical and export reports (PDF / Excel).

### 2. Academics & Faculty
- **`CourseCategory` (`course_categories`)**: Academic domains (e.g., Digital Marketing, UI/UX Design, Full Stack Development).
- **`Course` (`courses`)**: Comprehensive course details including slug, pricing, discount fees, duration, mode (Online/Offline/Hybrid), syllabus, outcomes, demo videos, and brochure links.
- **`Brochure` (`brochures`)**: Downloadable course brochures and syllabi.
- **`Trainer` (`trainers`)**: Faculty profiles, bio, certifications, social links, and linked courses.
- **`TeamMember` (`teams`)**: Institute leadership and operational staff profiles.

### 3. Proof & Social Verification
- **`Placement` (`placements`)**: Student placement success records with salary package, hiring company, designation, photos, and optional video stories.
- **`Testimonial` (`testimonials`)**: Video and text student reviews with ratings and quotes.
- **`StudentReview` (`student_reviews`)**: Additional student ratings and feedback entries.
- **`Partner` (`partners`)**: Hiring partner company logos and links.
- **`EmiPartner` (`emi_partners`)**: Financial institutions and NBFC partners offering 0% EMI options.

### 4. Marketing & Content
- **`Banner` (`banners`)**: Hero carousel banners with title accents, badges, tags, custom color accents, and imagery.
- **`Blog` (`blogs`)**: MDX and rich-text blog posts with reading time estimates, author attribution, and SEO tags.
- **`Gallery` (`gallery`)**: Campus event media (photos and videos) grouped by album and category.
- **`Faq` (`faqs`)**: Categorized questions and answers for course and admissions support.
- **`WebPage` (`web_pages`) & `PageSection` (`page_sections`)**: Dynamic page builder for custom pages and customizable content blocks.

### 5. CRM & Lead Capture Enquiries
- **`AdmissionEnquiry` (`admission_enquiries`)**: Student course leads with status (`NEW`, `PENDING`, `CONTACTED`, `CLOSED`).
- **`FranchisePartnerEnquiry` (`franchise_partner_enquiries`)**: Franchise applications with investment capacity and city details.
- **`CompanyPlacementEnquiry` (`company_placement_enquiries`)**: Corporate recruiter hiring requests with job roles, vacancies, and skill requirements.
- **`CareerEnquiry` (`career_enquiries`)**: Faculty job applications linked to specific `JobOpening` entries with resume URLs.
- **`ContactEnquiry` (`contact_enquiries`)**: General inquiries from the contact form.
- **`JobOpening` (`job_openings`)**: Active institute job postings and faculty openings.

### 6. Dynamic Site Settings
- **`WebsiteSettings` (`website_settings`)**: Global site configurations (branding, contact information, social links, SEO tags).
- **`HeaderSettings` (`header_settings`) & `HeaderContactItem` (`header_contact_items`)**: Top navbar configuration, CTA buttons, and quick contacts.
- **`FooterSettings` (`footer_settings`), `FooterContactItem` (`footer_contact_items`), `FooterColumn` (`footer_columns`), `FooterColumnLink` (`footer_column_links`)**: Multi-column footer layout, copyright info, and link trees.

---

## 📁 Project Directory & File Structure

```
package/
├── markdown/                 # Static MDX blog content files
│   └── blog/                 # Sample and legacy MDX articles
├── prisma/
│   └── schema.prisma         # Prisma schema definitions (22 models)
├── public/
│   ├── images/               # Logos, hero graphics, partner logos, banners
│   └── uploads/              # Uploaded media (images, resumes, brochures)
├── src/
│   ├── app/
│   │   ├── (site)/           # Public-facing website pages & layout
│   │   ├── admin/            # CMS & CRM Admin dashboard pages
│   │   ├── actions/          # Next.js Server Actions (CMS, CRM, Media, Auth)
│   │   ├── api/              # REST API endpoints (Public, Admin, Upload, Export)
│   │   ├── favicon.ico
│   │   ├── globals.css       # Tailwind CSS v4 styles & theme variables
│   │   └── layout.tsx        # Root HTML wrapper with NextThemes & TopLoader
│   ├── components/
│   │   ├── Admin/            # Admin UI widgets, data tables, modals
│   │   ├── Auth/             # Login, register, and password forms
│   │   ├── Common/           # Shared UI (Breadcrumbs, CourseCard, PhoneInput, Loader)
│   │   ├── Contact/          # Contact page components and maps
│   │   ├── Home/             # Homepage components (Hero, Courses, WhyQimd, FAQ, etc.)
│   │   ├── Layout/           # Global Header, Navigation, and Footer
│   │   └── SharedComponent/  # Sub-hero banners and reusable widgets
│   ├── lib/
│   │   ├── db.ts             # Prisma Client singleton
│   │   ├── auth.ts           # Authentication session & RBAC helpers
│   │   ├── mediaService.ts   # Media management and safe delete validator
│   │   ├── validations.ts    # Zod schema validation rules
│   │   └── audit.ts          # Security audit logging engine
│   └── types/                # TypeScript interfaces and types
├── next.config.mjs           # Next.js configuration (images, domains)
├── package.json              # Project dependencies & npm scripts
├── postcss.config.mjs        # PostCSS configuration for Tailwind CSS v4
└── tsconfig.json             # TypeScript compiler settings & alias configuration
```

---

## 🌐 Public Website Routes

| Route | Page Name | Features & Highlights |
| :--- | :--- | :--- |
| `/` | **Homepage** | Hero slider carousel, course explorer, student placements showcase, EMI calculator, testimonials, campus gallery preview, FAQs |
| `/about/about-qimd` | **About QIMD** | History, mission, vision, key achievements, pedagogy, and institute story |
| `/about/our-team` | **Leadership & Faculty** | Executive board, senior instructors, and team directory |
| `/courses` | **Course Catalog** | Filterable course directory by category and mode |
| `/courses/[slug]` | **Course Detail** | Curriculum syllabus, fee structures, outcomes, demo preview, and brochure download form |
| `/brochure/[slug]` | **Brochure Viewer** | Dynamic PDF syllabus preview and direct download |
| `/admission` | **Admissions** | Admissions process, eligibility criteria, and direct application form |
| `/placements` | **Placements Portal** | Placed student gallery, hiring company badges, salary packages, and video stories |
| `/reviews-testimonials`| **Reviews & Stories** | Video interviews, Google reviews rating badges, and student success narratives |
| `/events` | **Events & Workshops** | Campus masterclasses, bootcamps, and seminar schedules |
| `/events/[slug]` | **Event Detail** | Detailed workshop registration and speaker schedule |
| `/blog` | **Blog & Articles** | Industry insights, design tutorials, and marketing trends |
| `/blog/[slug]` | **Blog Post** | Article reader with author bio, reading time, and related posts |
| `/gallery` | **Campus Gallery** | Interactive photo albums, events, workshops, and student activities |
| `/faqs` | **FAQ Knowledgebase**| Searchable accordion covering admissions, fees, and placements |
| `/contact` | **Contact Us** | Interactive Google Map, branch addresses, phone, and contact form |
| `/hire-from-us` | **Hire Talent (B2B)** | Corporate recruiter portal to request batches of certified graduates |
| `/qimd-franchise` | **Franchise Partner** | Franchise application form with investment tier calculator |
| `/careers` | **Join Our Team** | Current job openings for trainers and staff with resume submission |
| `/privacy-policy` | **Privacy Policy** | Data privacy and compliance terms |
| `/refund-policy` | **Refund Policy** | Transparent fee refund guidelines |
| `/sitemap` | **Visual Sitemap** | Directory tree of all public pages |

---

## 🛡 CMS Admin Dashboard

Accessible at `/admin` (or `/admin/login`):

- **`/admin/dashboard`**: High-level metrics overview (total leads, active courses, placed students, recent applications).
- **`/admin/banners`**: Manage homepage hero slider banners (upload images, customize badges, accent colors, and display order).
- **`/admin/courses` & `/admin/course-categories`**: Create, edit, and organize courses, pricing, syllabi, and categories.
- **`/admin/trainers` & `/admin/team`**: Manage instructors and team profiles.
- **`/admin/placements`**: Record student placements with company logos, package figures, and video success links.
- **`/admin/testimonials` & `/admin/reviews`**: Curate video testimonials and rating reviews.
- **`/admin/blogs`**: Write and publish blog articles.
- **`/admin/gallery`**: Organize photo albums and media assets.
- **`/admin/partners`**: Manage hiring partner company logos.
- **`/admin/brochures`**: Upload and link PDF course syllabi.
- **`/admin/faqs`**: Manage public FAQ items.
- **`/admin/careers`**: Post job openings and review candidate applicants.
- **`/admin/pages`**: Create custom dynamic web pages and manage modular page sections.
- **CRM Leads Management**:
  - `/admin/enquiries/admission`: Admission leads with follow-up status.
  - `/admin/enquiries/franchise`: Franchise partnership applications.
  - `/admin/enquiries/hire`: Corporate hiring talent requests.
  - `/admin/enquiries/careers`: Candidate job applications with resume downloads.
  - `/admin/enquiries/contact`: General website inquiries.
- **Site Layout & Settings**:
  - `/admin/header`: Customize navbar branding, contact info, and navigation items.
  - `/admin/footer`: Customize footer columns, links, social handles, and copyright.
  - `/admin/logo`: Global logo asset management.
  - `/admin/users`: Admin user accounts and role assignments.
  - `/admin/audit-logs`: System audit trail for security compliance.
  - `/admin/reports`: Data export tools for CRM leads and analytics.

---

## ⚡ Server Actions Reference

All data mutations are handled by server actions in `src/app/actions/`:

| File | Primary Functions |
| :--- | :--- |
| `authActions.ts` | `adminLoginAction`, `adminLogoutAction`, `changePasswordAction` |
| `bannerActions.ts` | `saveBannerAction`, `toggleBannerStatusAction`, `deleteBannerPermanentlyAction`, `getPublicBannersAction` |
| `cmsActions.ts` | Course, Trainer, Category, Blog, Placement, Testimonial, and FAQ CRUD operations |
| `crmActions.ts` | Lead submission and CRM status workflows for Admissions, Franchise, Hiring, Careers, and Contact |
| `careerActions.ts` | Job opening creation, editing, status toggling, and applicant status changes |
| `headerActions.ts` | Save header configuration, manage top-bar contact items |
| `footerActions.ts` | Save footer settings, manage footer columns and navigation links |
| `pageActions.ts` | Create, update, and manage dynamic WebPages |
| `sectionActions.ts` | Add, reorder, and modify modular PageSections |
| `partnerActions.ts` | Add and update Hiring and EMI financing partners |
| `mediaActions.ts` | Media upload verification and safe deletion validation |
| `userActions.ts` | Create admin accounts, update roles, deactivate users |
| `websiteManagementActions.ts` | Manage global SEO, analytics IDs, and contact info |

---

## 🔌 API Endpoints Reference

### Public APIs
- `GET /api/public/banners`: Returns active hero banners for the homepage carousel.
- `GET /api/public/reviews`: Returns published student reviews and star ratings.
- `GET /api/public-gallery`: Returns published gallery albums and photos.
- `GET /api/public-settings`: Returns public branding, social links, and header/footer data.
- `GET /api/public/brochures/download`: Handles secure brochure syllabus file downloads.

### Admin APIs
- `GET /api/admin/banners`: Fetch all banners (active and inactive).
- `GET /api/admin/courses`: Fetch all courses with category relations.
- `GET /api/admin/blogs`: Fetch blog articles.
- `GET /api/admin/enquiries`: Fetch CRM lead records by type and status.
- `GET /api/admin/placements`: Fetch placement records.
- `GET /api/admin/testimonials`: Fetch video and text testimonials.
- `GET /api/admin/trainers`: Fetch faculty members.
- `GET /api/admin/gallery`: Fetch all gallery items.
- `GET /api/admin/faqs`: Fetch FAQ list.
- `GET /api/admin/settings`: Fetch internal site configuration.

### Utilities & Uploads
- `POST /api/upload`: Handles file uploads (images, PDFs) saving to `/public/uploads`.
- `POST /api/upload/career-resume`: Handles resume uploads with file type and size validation.
- `GET /api/export`: Generates lead exports in CSV / Excel format.
- `GET/POST /api/auth/[...nextauth]`: NextAuth handler for session management.

---

## 🔐 Authentication & Authorization

- **Password Hashing**: Uses `bcryptjs` with salt rounds.
- **Session Tokens**: JWT-based session cookies verified on protected actions and routes.
- **RBAC Matrix**:
  - `SUPER_ADMIN`: Full access (user management, audit logs, database backups, all CMS/CRM).
  - `ADMIN`: Full CMS and CRM access (courses, banners, leads, inquiries).
  - `CONTENT_MANAGER`: Content creation and blog authoring permissions.
- **Route Protection**: Implemented via session verifiers in `src/lib/auth.ts` (`getAdminSession()`, `requireContentManagerSession()`).

---

## ⚙️ Environment Variables Reference

Create a `.env` file in the root of the `package` directory:

```env
# Database Connections (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# Authentication Secrets
JWT_SECRET="your_custom_jwt_secret_key_here"
NEXTAUTH_SECRET="your_custom_nextauth_secret_key_here"
NEXTAUTH_URL="http://localhost:3000"

# Application Settings
NODE_ENV="development"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

---

## 🚀 Installation & Getting Started

### 1. Prerequisites
- **Node.js**: `v18.18.0` or higher (Node `v20+` recommended)
- **npm** or **pnpm** / **yarn**
- **PostgreSQL** database instance (e.g. Supabase, AWS RDS, or local PostgreSQL)

### 2. Install Dependencies
```bash
cd package
npm install
```

### 3. Initialize Prisma
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the public website, or [http://localhost:3000/admin](http://localhost:3000/admin) to access the CMS admin panel.

---

## 💾 Database Management & Seeding

```bash
# Open Prisma Studio GUI
npx prisma studio

# Seed initial admin user and sample courses/banners (if configured)
npx tsx src/lib/seed.ts

# Format Prisma schema
npx prisma format
```

---

## 🚢 Deployment & Production Build

### Building for Production
```bash
# Create optimized production build
npm run build

# Start production server
npm run start
```

### Deployment Recommendations
- **Hosting**: Vercel, AWS Amplify, Railway, or Docker container on VPS.
- **Database**: Supabase PostgreSQL with connection pooling enabled.
- **File Storage**: Ensure persistent volume or cloud bucket storage is configured if scaling across multi-container serverless instances.

---

© 2026 **QIMD (Quickup Institute of Marketing & Design)**. All rights reserved.

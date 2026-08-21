# 📚 QIMD (Quickup Institute of Marketing & Design) - Exhaustive Technical Documentation

Comprehensive, line-by-line documentation of every file, component, database model, API endpoint, server action, and configuration script in the QIMD codebase.

---

## 📑 Table of Contents

1. [Architectural Overview](#1-architectural-overview)
2. [Database Schema & Field Reference (`prisma/schema.prisma`)](#2-database-schema--field-reference)
3. [Dual Database Sync Engine](#3-dual-database-sync-engine)
4. [Exhaustive Directory & File Index](#4-exhaustive-directory--file-index)
   - [Root Configuration Files](#root-configuration-files)
   - [Public Website Routes (`src/app/(site)`)](#public-website-routes-srcappsite)
   - [CMS Admin Dashboard Routes (`src/app/admin`)](#cms-admin-dashboard-routes-srcappadmin)
   - [API Endpoints (`src/app/api`)](#api-endpoints-srcappapi)
   - [Server Actions (`src/app/actions`)](#server-actions-srcappactions)
   - [UI Components (`src/components`)](#ui-components-srccomponents)
   - [Core Libraries & Auth (`src/lib`)](#core-libraries--auth-srclib)
5. [Authentication & Authorization Flow](#5-authentication--authorization-flow)
6. [Environment Variables Reference](#6-environment-variables-reference)
7. [Installation & Deployment Instructions](#7-installation--deployment-instructions)

---

## 1. Architectural Overview

QIMD is an enterprise-grade education institute web application powering:
- **Public Marketing Portal**: Fast SEO-optimized landing pages, course search engine, dynamic banner slideshow, brochure download forms, and lead generation.
- **CMS & CRM Admin System**: Role-based access dashboard to manage course content, team profiles, placed student stories, blog posts, and leads/enquiries.
- **Dual Database Architecture**: Automated real-time synchronization between **Supabase Cloud PostgreSQL** and **Local PostgreSQL (pgAdmin `qimd_db`)**.

---

## 2. Database Schema & Field Reference

All database tables are managed via Prisma ORM in `prisma/schema.prisma`.

### 📌 Core Table Models:

#### 1. `User` (`users`)
- `id` (UUID, Primary Key)
- `fullName` (VarChar 150) - Admin / Staff Name
- `email` (VarChar 255, Unique) - Login Email
- `passwordHash` (Text) - Bcrypt Hashed Password
- `role` (VarChar 50) - Role (`SUPER_ADMIN`, `ADMIN`, `CONTENT_MANAGER`)
- `status` (Boolean) - Active Account Flag
- `isDeleted` (Boolean) - Soft Delete Flag

#### 2. `Banner` (`banners`)
- `id` (UUID, Primary Key)
- `badge` (VarChar 100) - Pill Badge Text (e.g. `CAREER BOOSTER`)
- `title` (VarChar 200) - Primary Title Line
- `titleAccent` (VarChar 200) - Colored Accent Title Line
- `subtitle` (Text) - Banner Description
- `tag` (VarChar 150) - Feature Tag (e.g. `100% Job Assistance`)
- `accentColor` (VarChar 50) - Hex Color Code (e.g. `#764DFF`)
- `icon` (VarChar 100) - Iconify Icon Identifier
- `imageUrl` (Text) - Image File Path / Cloud URL
- `displayOrder` (Int) - Carousel Sorting Index
- `isActive` (Boolean) - Public Visibility Flag
- `isDeleted` (Boolean) - Soft Delete Flag

#### 3. `Course` (`courses`)
- `id` (UUID, Primary Key)
- `categoryId` (UUID, Foreign Key -> `CourseCategory`)
- `trainerId` (UUID, Foreign Key -> `Trainer`)
- `courseName` (VarChar 255) - Course Title
- `slug` (VarChar 255, Unique) - URL Slug
- `shortDescription` (Text) - Summary Text
- `description` (Text) - HTML / Detailed Overview
- `duration` (VarChar 100) - Duration (e.g. `6 Months`)
- `fees` (Decimal 10,2) - Original Fee Amount
- `discountPrice` (Decimal 10,2) - Offer Price Amount
- `courseMode` (VarChar 50) - Mode (`Offline`, `Online`, `Hybrid`)
- `syllabus` (Text) - Syllabus Outline JSON / HTML
- `brochure` (Text) - PDF Download URL

#### 4. `Placement` (`placements`)
- `id` (UUID, Primary Key)
- `studentName` (VarChar 200) - Student Name
- `studentPhoto` (Text) - Student Avatar Image URL
- `companyName` (VarChar 200) - Employer Name
- `companyLogo` (Text) - Employer Logo Image URL
- `package` (VarChar 100) - Salary Package (e.g. `8.5 LPA`)
- `designation` (VarChar 150) - Job Role (e.g. `UI/UX Designer`)

---

## 3. Dual Database Sync Engine

All CMS mutation routines (`src/app/actions/bannerActions.ts`, etc.) interact with two Prisma client instances:
1. **Primary Instance (`db`)**: Connects to `DATABASE_URL` (Supabase Cloud PostgreSQL).
2. **Local Backup Instance (`localDb`)**: Connects to `postgresql://postgres:8080@localhost:5432/qimd_db?schema=public` (Local pgAdmin).

When any admin modifies records in `/admin/banners` or `/admin/courses`, both instances are updated in parallel, guaranteeing 100% database parity between local development and cloud hosting.

---

## 4. Exhaustive Directory & File Index

### 📁 Root Configuration Files

| File Path | Description & Purpose |
| :--- | :--- |
| `package.json` | Project dependencies, Next.js version (15.3.2), Prisma scripts, and dev commands |
| `tsconfig.json` | TypeScript compiler options, paths aliases (`@/*` -> `./src/*`) |
| `next.config.js` | Next.js configuration, image domains, and headers |
| `postcss.config.mjs` | PostCSS config for Tailwind CSS v4 |
| `.env` | Environment secrets, database connection URLs, JWT keys |
| `prisma/schema.prisma` | Master PostgreSQL data model definitions and indexes |

---

### 🌐 Public Website Routes (`src/app/(site)`)

| File Path | Description & Purpose |
| :--- | :--- |
| `src/app/(site)/page.tsx` | Main Homepage landing page rendering Hero, Courses, Stats, Testimonials & FAQs |
| `src/app/(site)/about/page.tsx` | About Institute page server entry point |
| `src/app/(site)/about/AboutContent.tsx` | Client UI for institute history, vision, mission & awards |
| `src/app/(site)/about/our-team/page.tsx` | Team & leadership team page |
| `src/app/(site)/courses/page.tsx` | Course catalog page listing all active courses |
| `src/app/(site)/courses/[slug]/page.tsx` | Dynamic course detail page rendering syllabus, fees, and brochure form |
| `src/app/(site)/placements/page.tsx` | Student placement portal rendering packages & company logos |
| `src/app/(site)/reviews-testimonials/page.tsx` | Video reviews and student testimonial gallery page |
| `src/app/(site)/blog/page.tsx` | Blog articles listing page |
| `src/app/(site)/blog/[slug]/page.tsx` | Dynamic blog post detail page with markdown / HTML content |
| `src/app/(site)/contact/page.tsx` | Contact us page with address, Google Maps & enquiry form |
| `src/app/(site)/hire-from-us/page.tsx` | B2B employer placement request portal |
| `src/app/(site)/qimd-franchise/page.tsx` | Franchise partnership application portal |
| `src/app/(site)/careers/page.tsx` | Job openings page for hiring institute faculty |
| `src/app/(site)/faqs/page.tsx` | Public FAQ accordion page |
| `src/app/(site)/gallery/page.tsx` | Campus photo & event media gallery page |
| `src/app/(site)/privacy-policy/page.tsx` | Legal privacy policy document page |
| `src/app/(site)/refund-policy/page.tsx` | Legal refund & cancellation policy page |

---

### 🛡️ CMS Admin Dashboard Routes (`src/app/admin`)

| File Path | Description & Purpose |
| :--- | :--- |
| `src/app/admin/AdminShell.tsx` | Master Admin Sidebar & Navigation Layout |
| `src/app/admin/login/page.tsx` | Admin login page with credentials form |
| `src/app/admin/dashboard/page.tsx` | Admin overview dashboard showing analytics & lead counters |
| `src/app/admin/banners/page.tsx` | Homepage Banners server component fetching banner records |
| `src/app/admin/banners/BannerManagementClient.tsx` | Client UI for Banner CMS (upload, edit, deactivate, delete) |
| `src/app/admin/courses/page.tsx` | Course CMS page for managing curriculum & fees |
| `src/app/admin/course-categories/page.tsx` | Course category management page |
| `src/app/admin/placements/page.tsx` | Student placement CMS page |
| `src/app/admin/testimonials/page.tsx` | Student review & video testimonial CMS page |
| `src/app/admin/reviews/page.tsx` | Rating & text review CMS page |
| `src/app/admin/blogs/page.tsx` | Blog post creator & editor CMS page |
| `src/app/admin/trainers/page.tsx` | Instructor & trainer management CMS page |
| `src/app/admin/team/page.tsx` | Institute team member CMS page |
| `src/app/admin/partners/page.tsx` | Hiring partner company logo CMS page |
| `src/app/admin/faqs/page.tsx` | FAQ editor CMS page |
| `src/app/admin/enquiries/admission/page.tsx` | CRM Admission Enquiries lead table |
| `src/app/admin/enquiries/franchise/page.tsx` | CRM Franchise Partner lead table |
| `src/app/admin/enquiries/hire/page.tsx` | CRM Company Placement hiring lead table |
| `src/app/admin/enquiries/careers/page.tsx` | CRM Faculty Job applicant resume table |
| `src/app/admin/enquiries/contact/page.tsx` | CRM Contact Us lead table |
| `src/app/admin/header/page.tsx` | Navbar header settings CMS page |
| `src/app/admin/footer/page.tsx` | Footer settings & quick links CMS page |

---

### ⚡ Server Actions & Dual DB Sync (`src/app/actions`)

| File Path | Description & Purpose |
| :--- | :--- |
| `src/app/actions/bannerActions.ts` | Server Actions for Banner CRUD (`saveBannerAction`, `deleteBannerPermanentlyAction`, `getPublicBannersAction`) with 2-way Supabase & Local DB sync |

---

### 🔌 API Endpoints (`src/app/api`)

| Route Endpoint | HTTP Method | Description & Purpose |
| :--- | :--- | :--- |
| `src/app/api/public/banners/route.ts` | `GET` | Public API returning active banners for homepage carousel |
| `src/app/api/admin/banners/route.ts` | `GET` | Admin API returning all banner records for CMS grid |
| `src/app/api/upload/route.ts` | `POST` | File upload API processing images & saving to `/public/uploads` |
| `src/app/api/auth/[...nextauth]/route.ts` | `GET / POST` | NextAuth authentication handler |
| `src/app/api/settings/route.ts` | `GET` | Public API returning site header & footer settings |

---

### 🎨 UI Components (`src/components`)

| File Path | Description & Purpose |
| :--- | :--- |
| `src/components/Home/Hero/index.tsx` | Main hero section component containing search, counters, CTA & form |
| `src/components/Home/Hero/HeroBannerCarousel.tsx` | Auto-rotating banner carousel component supporting dynamic images & blank states |
| `src/components/Common/EnquiryForm.tsx` | Lead enquiry form component with input validation |

---

### 🔐 Core Libraries & Auth (`src/lib`)

| File Path | Description & Purpose |
| :--- | :--- |
| `src/lib/db.ts` | Prisma Client singleton database connection instance |
| `src/lib/auth.ts` | Authentication session verifier & RBAC middleware helpers |
| `src/lib/mediaService.ts` | Media reference checker preventing safe file deletion if used elsewhere |

---

## 5. Authentication & Authorization Flow

1. Admin inputs credentials at `/admin/login`.
2. Auth handler validates email against `User` table password hash using `bcryptjs`.
3. Validated sessions issue a secure HTTP-Only JWT token.
4. Protected admin routes call `requireContentManagerSession()` or `getAdminSession()` from `src/lib/auth.ts` before rendering data or executing server actions.

---

## 6. Environment Variables Reference

| Variable Name | Purpose | Example Value |
| :--- | :--- | :--- |
| `DATABASE_URL` | Supabase Pooled PostgreSQL URL | `postgresql://user:pass@host:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | Supabase Direct PostgreSQL URL | `postgresql://user:pass@host:5432/postgres` |
| `JWT_SECRET` | Secret key for JWT signing | `qimd_super_secret_jwt_key_2026_secure` |
| `NEXTAUTH_SECRET` | NextAuth encryption secret | `98E3B2CC28F61492C6934531C828C` |
| `NEXTAUTH_URL` | Application base URL | `http://localhost:3000` |

---

## 7. Installation & Deployment Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Push Prisma Schema to Databases**:
   ```bash
   npx prisma db push
   npx prisma generate
   ```
3. **Run Local Dev Server**:
   ```bash
   npm run dev
   ```
4. **Build for Production**:
   ```bash
   npm run build
   npm run start
   ```

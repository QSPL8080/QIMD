# 🚀 QIMD (Quickup Institute of Marketing & Design)

A modern, full-stack Next.js web application and CMS platform built for **Quickup Institute of Marketing & Design (QIMD)**.

---

## 📑 Table of Contents
1. [Project Overview](#-project-overview)
2. [Tech Stack & Architecture](#-tech-stack--architecture)
3. [Key Features & Modules](#-key-features--modules)
4. [Database Architecture & Dual Sync](#-database-architecture--dual-sync)
5. [Complete Project Directory Structure](#-complete-project-directory-structure)
6. [Environment Variables Setup](#-environment-variables-setup)
7. [Installation & Local Setup](#-installation--local-setup)
8. [Available Scripts](#-available-scripts)
9. [Troubleshooting & FAQs](#-troubleshooting--faqs)

---

## 🌟 Project Overview

QIMD provides practical, industry-oriented training in Digital Marketing, Graphic Design, Video Editing, and AI Tools with 100% job placement support.

This repository powers both the **Public Marketing Website** and the **Admin CMS Dashboard**, allowing administrators to manage courses, enquiries, student placements, testimonials, team trainers, blog posts, and dynamic homepage banner carousels in real time.

---

## 🏗️ Tech Stack & Architecture

- **Framework**: Next.js 15.3.2 (App Router)
- **UI & Styling**: React 19, Tailwind CSS v4, Iconify Icons (`@iconify/react`), Framer Motion
- **Database & ORM**: PostgreSQL with Prisma ORM (v6.4.0)
- **Dual Database Engines**:
  - **Primary Cloud DB**: Supabase Cloud PostgreSQL
  - **Local Backup DB**: PostgreSQL (`localhost:5432/qimd_db` in pgAdmin)
- **Authentication**: NextAuth.js / JWT Session Handling with Role-Based Access Control (RBAC)
- **File Uploads**: Local Media Service (`/public/uploads`) & Supabase Storage Integration

---

## 🔑 Key Features & Modules

### 1. Public Marketing Website (`/src/app/(site)`)
- **Hero Section & Quick Search**: Fast course search bar, live counting statistics, and interactive lead enquiry forms.
- **Dynamic Banner Carousel**: Support for uploading and auto-rotating custom image banners (PNG, JPG, GIF, WEBP) every 4 seconds.
- **Courses & Syllabi**: Comprehensive course listing with pricing, duration, syllabus modules, and course category filters.
- **Student Success & Placements**: Placed student profiles, company logos, package details, and video reviews.
- **Hire From Us & Franchise**: Dedicated B2B lead generation pages for partner companies and franchise applicants.
- **SEO Ready**: Built-in `sitemap.xml`, `robots.txt`, dynamic metadata, and canonical URL support.

### 2. CMS Admin Dashboard (`/admin`)
- **WEBSITE CMS CONTENT**:
  - **Homepage Banners (`/admin/banners`)**: Real-time management of homepage carousel banners (upload PNG/JPG, display order, active/inactive state, permanent delete).
  - **Courses & Categories (`/admin/courses`)**: Add, edit, or remove courses, fees, discount pricing, and syllabi.
  - **Student Testimonials (`/admin/testimonials`)**: Video and text reviews from students.
  - **Recently Placed Students (`/admin/placements`)**: Manage hiring partner logos, salary packages, and designations.
  - **Blogs & Articles (`/admin/blogs`)**: Full blog CMS for content marketing.
  - **Team & Trainers (`/admin/trainers` & `/admin/team`)**: Manage instructor bio cards and social links.
  - **Header & Footer Management (`/admin/header` & `/admin/footer`)**: Custom logos, contact details, social links, and navigation menus.
- **CRM & ENQUIRIES**:
  - Admission Enquiries (`/admin/enquiries/admission`)
  - Franchise/Partner Enquiries (`/admin/enquiries/franchise`)
  - Company Placement Enquiries (`/admin/enquiries/hire`)
  - Career Enquiries (`/admin/enquiries/careers`)
  - Contact Enquiries (`/admin/enquiries/contact`)

---

## 🗄️ Database Architecture & Dual Sync

### Prisma Schema Models (`prisma/schema.prisma`)

| Model | Table Name | Purpose |
| :--- | :--- | :--- |
| `User` | `users` | Admin and staff user accounts |
| `Banner` | `banners` | Homepage banner carousel images & settings |
| `Course` | `courses` | Course catalog, duration, fees & syllabus |
| `CourseCategory` | `course_categories` | Categories for organizing courses |
| `Trainer` | `trainers` | Instructor profiles & experience |
| `TeamMember` | `teams` | Institute staff & management team |
| `Placement` | `placements` | Placed student stories, packages & logos |
| `Testimonial` | `testimonials` | Student reviews & video testimonials |
| `StudentReview` | `student_reviews` | General course rating reviews |
| `Partner` | `partners` | Hiring partner company logos |
| `EmiPartner` | `emi_partners` | EMI & loan partner company logos |
| `Blog` | `blogs` | Blog articles & SEO guides |
| `Faq` | `faqs` | Frequently Asked Questions |
| `AdmissionEnquiry` | `admission_enquiries` | Lead submissions from course pages |
| `JobOpening` | `job_openings` | Faculty & staff hiring openings |
| `CareerEnquiry` | `career_enquiries` | Job applicant resume submissions |
| `FranchisePartnerEnquiry` | `franchise_partner_enquiries` | Franchise partnership applications |
| `CompanyPlacementEnquiry` | `company_placement_enquiries` | B2B hiring partner enquiries |
| `HeaderSettings` | `header_settings` | Navbar logos, phone numbers & links |
| `FooterSettings` | `footer_settings` | Footer logos, address & maps |

### Dual Database 2-Way Sync
All CMS server actions in `src/app/actions/bannerActions.ts` feature **2-way dual synchronization**. When an admin creates, edits, deactivates, or deletes a banner or content record:
1. It commits directly to **Supabase Cloud PostgreSQL**.
2. It simultaneously mirrors the change to **Local pgAdmin PostgreSQL (`qimd_db`)**.

---

## 📁 Complete Project Directory Structure

```
package/
├── prisma/
│   └── schema.prisma                   # PostgreSQL database schema & models
├── public/
│   ├── images/                         # Static site artwork & banner uploads
│   └── uploads/                        # Dynamic uploaded files & media
├── src/
│   ├── app/
│   │   ├── (site)/                     # Public website routes & pages
│   │   │   ├── page.tsx                # Homepage
│   │   │   ├── about/                  # About & Team pages
│   │   │   ├── courses/                # Course catalog & course details
│   │   │   ├── placements/             # Placements & success stories
│   │   │   ├── blog/                   # Blog listing & detail pages
│   │   │   ├── contact/                # Contact page
│   │   │   ├── hire-from-us/           # B2B hiring page
│   │   │   └── qimd-franchise/         # Franchise application page
│   │   ├── actions/                    # Next.js Server Actions & Dual DB Sync
│   │   │   └── bannerActions.ts        # Banner CRUD server actions
│   │   ├── admin/                      # CMS Admin Dashboard pages
│   │   │   ├── banners/                # Banner management UI (`BannerManagementClient.tsx`)
│   │   │   ├── courses/                # Course CMS
│   │   │   ├── enquiries/              # CRM Lead management
│   │   │   ├── placements/             # Placement CMS
│   │   │   └── settings/               # System settings
│   │   ├── api/                        # REST API routes
│   │   │   ├── public/banners/         # Public API for homepage carousel
│   │   │   ├── admin/banners/          # Admin API for banner management
│   │   │   └── upload/                 # File upload handler API
│   │   ├── globals.css                 # Global CSS & Tailwind imports
│   │   ├── layout.tsx                  # Root HTML layout
│   │   └── page.tsx                    # Root entry point
│   ├── components/                     # Reusable React UI components
│   │   ├── Home/
│   │   │   └── Hero/
│   │   │       ├── index.tsx           # Hero section wrapper
│   │   │       └── HeroBannerCarousel.tsx # Homepage banner carousel
│   │   └── Common/                     # Shared buttons, modals & forms
│   └── lib/                            # Database client, auth & media service
├── .env                                # Environment variables
├── package.json                        # Node dependencies & build scripts
└── README.md                           # Detailed project documentation
```

---

## ⚙️ Environment Variables Setup (`.env`)

Create a `.env` file in the root directory:

```env
# Primary Cloud Database (Supabase)
DATABASE_URL="your_supabase_database_url"
DIRECT_URL="your_supabase_direct_database_url"

# Supabase Storage Integration
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"

# Auth and Security Secrets
JWT_SECRET="your_jwt_secret"
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:3000"

# Admin Credentials
ADMIN_DEFAULT_EMAIL="admin@example.com"
ADMIN_DEFAULT_PASSWORD="your_secure_admin_password"
```

---

## 🚀 Installation & Local Setup

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd package
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Synchronize Database Schemas**:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

5. **Open Applications**:
   - **Public Website**: `http://localhost:3000`
   - **CMS Admin Panel**: `http://localhost:3000/admin`
   - **CMS Banner Management**: `http://localhost:3000/admin/banners`

---

## 🛠️ Available Scripts

- **`npm run dev`**: Starts local development server on port 3000.
- **`npm run build`**: Runs Next.js production build and checks TypeScript types.
- **`npm run start`**: Runs production build server.
- **`npx prisma db push`**: Syncs Prisma schema with PostgreSQL database instances.
- **`npx prisma studio`**: Opens Prisma interactive database GUI.

---

## ❓ Troubleshooting & FAQs

- **Port 3000 In Use**:
  ```bash
  npx kill-port 3000
  ```
- **Prisma Client Generation Locking DLL**:
  Stop the running Next.js dev server first, then run `npx prisma generate`.
- **Local pgAdmin Table Viewing**:
  Ensure local PostgreSQL service is running on `localhost:5432` with database `qimd_db`. Look under **Schemas** -> **public** -> **Tables** 

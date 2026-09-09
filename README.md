# 📚 QIMD (Quickup Institute of Marketing & Design)

> **Enterprise Educational Portal, Dynamic Content Management System (CMS) & Multi-Stream Lead Generation CRM**  
> Built with **Next.js 15 (App Router)**, **React 19**, **TypeScript 5**, **Tailwind CSS v4**, **Prisma ORM 6**, and **PostgreSQL (Supabase)**.

---

## 📑 Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Technology Stack & Core Libraries](#2-technology-stack--core-libraries)
3. [Exhaustive Database Schema & Data Dictionary](#3-exhaustive-database-schema--data-dictionary)
4. [File System Index & Component Hierarchy](#4-file-system-index--component-hierarchy)
5. [Public Website Routes & User Experiences](#5-public-website-routes--user-experiences)
6. [CMS & CRM Admin Dashboard](#6-cms--crm-admin-dashboard)
7. [Server Actions Technical Reference](#7-server-actions-technical-reference)
8. [REST API Endpoints Specification](#8-rest-api-endpoints-specification)
9. [Global State & Live Settings Engine](#9-global-state--live-settings-engine)
10. [Authentication, Security & RBAC Hierarchy](#10-authentication-security--rbac-hierarchy)
11. [Design System & UI Architecture](#11-design-system--ui-architecture)
12. [Environment Configuration](#12-environment-configuration)
13. [Installation, Database Setup & Seeding](#13-installation-database-setup--seeding)
14. [Production Build & Deployment](#14-production-build--deployment)

---

## 1. System Architecture

QIMD operates as an integrated, multi-tier web application built on Next.js 15 App Router:

```mermaid
flowchart TD
    subgraph ClientLayer ["Client Layer (React 19 & Tailwind CSS v4)"]
        PublicUI["Public Student Portal (SEO SSR / ISR)"]
        AdminUI["CMS & CRM Admin Dashboard (CSR / React Hook Form)"]
        Context["WebsiteSettingsContext (Live Dynamic Sync)"]
    end

    subgraph ServerLayer ["Next.js 15 Server Layer (Node.js Runtime)"]
        ServerActions["Server Actions (src/app/actions/*)"]
        APIRoutes["REST API Endpoints (src/app/api/*)"]
        AuthMiddleware["RBAC & Session Security (bcryptjs / JWT)"]
        DataCache["unstable_cache & ISR Revalidation (src/lib/getDynamicData.ts)"]
    end

    subgraph StorageLayer ["Persistence & Storage Layer"]
        PrismaORM["Prisma Client ORM 6.4"]
        CloudPostgres[("Supabase Cloud PostgreSQL (Pooler + Direct)")]
        LocalMedia["Local Media Storage (/public/uploads)"]
        PDFKit["PDFKit Engine (Dynamic Brochures & Reports)"]
    end

    PublicUI --> Context
    PublicUI --> DataCache
    DataCache --> PrismaORM
    AdminUI --> ServerActions
    AdminUI --> APIRoutes
    ServerActions --> AuthMiddleware
    AuthMiddleware --> PrismaORM
    APIRoutes --> PrismaORM
    PrismaORM --> CloudPostgres
    ServerActions --> LocalMedia
    ServerActions --> PDFKit
```

### Core Architecture Highlights:
- **Server Components & Caching**: Public catalog pages utilize React Server Components with Next.js `unstable_cache` tagged revalidation for sub-millisecond TTFB.
- **Unified Mutations via Server Actions**: All CMS data entry, user role changes, and CRM status workflows run through validated Server Actions protected with session validators.
- **Zero-Redeploy Live Customizer**: Header navigation, contact numbers, social icons, logo branding, and footer column links are managed via database records and synchronized in real time across client sessions via `WebsiteSettingsContext`.

---

## 2. Technology Stack & Core Libraries

| Category | Technology | Version | Purpose / Architectural Note |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | `15.1.1` | Turbopack compilation, React Server Components, Server Actions |
| **UI Library** | React & React DOM | `19.0.0` | React 19 concurrent features, transitions, hooks |
| **Language** | TypeScript | `5.x` | Strict type checking throughout models, actions, and UI props |
| **Styling** | Tailwind CSS | `4.1.2` | Configured with `@tailwindcss/postcss` for lightning-fast modern CSS |
| **Database** | PostgreSQL / Supabase | `Latest` | Enterprise relational database with connection pooling and direct endpoints |
| **ORM** | Prisma | `6.4.0` | Type-safe schema definition, Prisma Client, auto-generated migrations |
| **Auth** | NextAuth.js & JWT | `4.24.11` | Cookie-based JWT sessions, credential provider, RBAC guards |
| **Encryption** | bcryptjs | `3.0.3` | Salted hashing for administrator and staff password credentials |
| **Validation** | Zod | `4.4.3` | Schema validation for lead forms, contact requests, and file uploads |
| **Icons** | Iconify React | `5.0.1` | Modular icon rendering with `@iconify/react` and `@iconify/icons-ion` |
| **Animations** | AOS & Framer Motion | `2.3.4` / `13.0.0` | Scroll-triggered entrance reveals, stagger animations, modals |
| **Sliders** | React Slick & Slick Carousel | `0.30.2` | Hardware-accelerated banners, testimonials, and gallery carousels |
| **Document Engine**| PDFKit | `0.20.1` | Dynamic server-side course syllabus and lead report PDF generation |
| **Notifications**| React Hot Toast | `2.4.1` | Real-time feedback alerts across frontend and admin dashboard |
| **Theme / UX** | Next Themes & TopLoader | `0.3.0` / `3.7.15` | Theme context support and animated page-transition loading bars |

---

## 3. Exhaustive Database Schema & Data Dictionary

All database models are defined in `prisma/schema.prisma` and mapped to PostgreSQL tables:

### Model 1: `User` (`users`)
Administrative accounts, staff logins, and author profiles.
- `id` (`Uuid`, Primary Key, `default(uuid())`)
- `fullName` (`VarChar(150)`, `@map("full_name")`) - Admin/User display name.
- `email` (`VarChar(255)`, `@unique`, Indexed) - Login identifier.
- `passwordHash` (`Text`, `@map("password_hash")`) - Bcrypt salted hash.
- `phone` (`VarChar(20)`, Optional) - Contact phone number.
- `role` (`VarChar(50)`, Default: `"ADMIN"`) - Access tier (`SUPER_ADMIN`, `ADMIN`, `CONTENT_MANAGER`).
- `profileImage` (`Text`, Optional, `@map("profile_image")`) - Avatar image URL.
- `status` (`Boolean`, Default: `true`) - Active account flag.
- `isDeleted` (`Boolean`, Default: `false`, `@map("is_deleted")`) - Soft delete flag.
- `lastLogin` (`DateTime`, Optional, `@map("last_login")`) - Timestamp of latest login.
- `createdAt` / `updatedAt` (`DateTime`) - Audit timestamps.

### Model 2: `CourseCategory` (`course_categories`)
Taxonomy categories grouping academic programs.
- `id` (`Uuid`, Primary Key)
- `name` (`VarChar(150)`) - Category title (e.g. "Digital Marketing", "Graphic Design").
- `slug` (`VarChar(150)`, `@unique`) - URL safe slug.
- `description` (`Text`, Optional) - Overview description.
- `displayOrder` (`Int`, Default: `0`, `@map("display_order")`) - Sorting position index.
- `status` (`Boolean`, Default: `true`) / `isDeleted` (`Boolean`, Default: `false`)
- `courses` (`Relation` -> `Course[]`)

### Model 3: `Trainer` (`trainers`)
Faculty members and instructors.
- `id` (`Uuid`, Primary Key)
- `fullName` (`VarChar(200)`, `@map("full_name")`) - Instructor name.
- `photo` (`Text`, Optional) - Profile image URL.
- `designation` (`VarChar(150)`, Optional) - Academic/Industry role.
- `qualification` (`VarChar(255)`, Optional) - Educational degrees.
- `experience` (`VarChar(100)`, Optional) - Years of practical experience.
- `biography` (`Text`, Optional) - Professional bio.
- `skills` (`Json`, Optional) - Array of expert skill tags.
- `certifications` (`Text`, Optional) - Industry certifications held.
- `linkedin` / `instagram` / `email` / `phone` (Optional) - Contact & social links.
- `featured` (`Boolean`, Default: `false`) - Homepage highlight flag.
- `displayOrder` (`Int`, Default: `0`)
- `isActive` (`Boolean`, Default: `true`) / `isDeleted` (`Boolean`, Default: `false`)

### Model 4: `TeamMember` (`teams`)
Executive leadership, founders, and core management staff.
- `id` (`Uuid`, Primary Key)
- `fullName` (`VarChar(200)`, `@map("full_name")`)
- `photo` (`Text`, Optional)
- `designation` (`VarChar(150)`, Optional)
- `qualification` (`VarChar(255)`, Optional)
- `experience` (`VarChar(100)`, Optional)
- `biography` (`Text`, Optional)
- `skills` (`Json`, Optional)
- `linkedin` / `instagram` / `email` / `phone` (Optional)
- `featured` (`Boolean`, Default: `false`)
- `displayOrder` (`Int`, Default: `0`)
- `isActive` (`Boolean`, Default: `true`) / `isDeleted` (`Boolean`, Default: `false`)

### Model 5: `Course` (`courses`)
Master course directory with fees, syllabi, modes, and outcomes.
- `id` (`Uuid`, Primary Key)
- `categoryId` (`Uuid`, Foreign Key -> `CourseCategory.id`)
- `trainerId` (`Uuid`, Optional, Foreign Key -> `Trainer.id`)
- `courseName` (`VarChar(255)`, `@map("course_name")`)
- `slug` (`VarChar(255)`, `@unique`)
- `shortDescription` (`Text`, Optional, `@map("short_description")`)
- `description` (`Text`, Optional) - Rich HTML detailed curriculum description.
- `bannerImage` (`Text`, Optional, `@map("banner_image")`) - Main hero cover image.
- `gallery` (`Json`, Optional) - Additional course photo gallery URLs.
- `duration` (`VarChar(100)`, Optional) - Course duration (e.g. "6 Months").
- `fees` (`Decimal(10,2)`, Optional) - Standard fee amount.
- `discountPrice` (`Decimal(10,2)`, Optional, `@map("discount_price")`) - Promotional offer price.
- `eligibility` (`Text`, Optional) - Admission qualification requirements.
- `courseMode` (`VarChar(50)`, Default: `"Offline"`, `@map("course_mode")`)
- `level` (`VarChar(100)`, Optional) - Beginner / Intermediate / Advanced.
- `syllabus` (`Text`, Optional) - Newline-separated syllabus modules.
- `learningOutcomes` (`Text`, Optional, `@map("learning_outcomes")`) - Key competencies acquired.
- `certification` (`Text`, Optional) - Details of certificates awarded upon graduation.
- `brochure` (`Text`, Optional) - Attached PDF file URL.
- `demoVideo` (`Text`, Optional, `@map("demo_video")`) - Embedded preview video URL.
- `featured` (`Boolean`, Default: `false`) - Featured course flag for homepage.
- `displayOrder` (`Int`, Default: `0`)
- `status` (`Enum: ContentStatus`, Default: `PUBLISHED`)
- `isActive` (`Boolean`, Default: `true`) / `isDeleted` (`Boolean`, Default: `false`)

### Model 6: `Blog` (`blogs`)
News, technical tutorials, and educational articles.
- `id` (`Uuid`, Primary Key)
- `title` (`VarChar(255)`)
- `slug` (`VarChar(255)`, `@unique`)
- `category` (`VarChar(150)`, Default: `"General"`)
- `excerpt` (`Text`, Optional)
- `featuredImage` (`Text`, Optional, `@map("featured_image")`)
- `images` (`Json`, Optional) - Array of inline image URLs.
- `tags` (`Json`, Optional) - Array of topic tags.
- `author` (`VarChar(150)`, Optional)
- `authorId` (`Uuid`, Optional, Foreign Key -> `User.id`)
- `readingTime` (`Int`, Default: `5`, `@map("reading_time")`) - Estimated minutes to read.
- `content` (`Text`) - Markdown / Rich text body content.
- `metaTitle` / `metaDescription` / `canonicalUrl` (Optional) - SEO meta properties.
- `featured` (`Boolean`, Default: `false`)
- `status` (`Enum: ContentStatus`, Default: `PUBLISHED`)
- `isActive` (`Boolean`, Default: `true`) / `isDeleted` (`Boolean`, Default: `false`)

### Model 7: `Placement` (`placements`)
Verified student placement track record.
- `id` (`Uuid`, Primary Key)
- `studentName` (`VarChar(200)`, `@map("student_name")`)
- `studentPhoto` (`Text`, Optional, `@map("student_photo")`)
- `companyName` (`VarChar(200)`, `@map("company_name")`)
- `companyLogo` (`Text`, Optional, `@map("company_logo")`)
- `package` (`VarChar(100)`, Optional) - CTC Package (e.g. "7.5 LPA").
- `designation` (`VarChar(150)`, Optional) - Role secured.
- `courseId` (`Uuid`, Optional, Foreign Key -> `Course.id`)
- `courseName` (`VarChar(150)`, Optional, `@map("course_name")`)
- `placementDate` (`DateTime`, Optional, `@map("placement_date")`)
- `location` (`VarChar(150)`, Optional) - Job city.
- `joiningYear` (`VarChar(50)`, Optional, `@map("joining_year")`)
- `isVideo` (`Boolean`, Default: `false`, `@map("is_video")`)
- `videoUrl` (`Text`, Optional, `@map("video_url")`) - YouTube or MP4 video URL.
- `videoThumbnail` (`Text`, Optional, `@map("video_thumbnail")`)
- `isVerified` (`Boolean`, Default: `true`, `@map("is_verified")`)
- `successStory` (`Text`, Optional, `@map("success_story")`) - Student testimonial quote.
- `featured` (`Boolean`, Default: `false`)
- `displayOrder` (`Int`, Default: `0`)
- `isActive` (`Boolean`, Default: `true`) / `isDeleted` (`Boolean`, Default: `false`)

### Model 8: `Gallery` (`gallery`)
Campus facilities, workshop photos, and event media.
- `id` (`Uuid`, Primary Key)
- `album` (`VarChar(150)`, Optional) - Album group (e.g. "Convocation 2025", "Classroom").
- `category` (`VarChar(150)`, Optional) - Media category filter.
- `mediaType` (`Enum: MediaType`, Default: `IMAGE`, `@map("media_type")`) - `IMAGE` or `VIDEO`.
- `fileUrl` (`Text`, `@map("file_url")`) - High-resolution file asset URL.
- `thumbnail` (`Text`, Optional) - Optimized thumbnail preview.
- `altText` (`VarChar(255)`, Optional, `@map("alt_text")`) - Accessible image description.
- `caption` (`Text`, Optional) - Media title / caption.
- `featured` (`Boolean`, Default: `false`)
- `displayOrder` (`Int`, Default: `0`)
- `createdById` (`Uuid`, Optional, Foreign Key -> `User.id`)
- `isDeleted` (`Boolean`, Default: `false`)

### Model 9: `Testimonial` (`testimonials`)
Featured student video interviews and long-form feedback.
- `id` (`Uuid`, Primary Key)
- `studentName` (`VarChar(200)`, `@map("student_name")`)
- `heading` (`VarChar(255)`, Optional) - Highlight quote headline.
- `photo` (`Text`, Optional) - Student avatar.
- `course` (`VarChar(150)`, Optional) - Enrolled program.
- `role` (`VarChar(150)`, Optional) - Current job title.
- `company` (`VarChar(150)`, Optional) - Current employer.
- `rating` (`Int`, Default: `5`) - Star rating (1-5).
- `review` (`Text`) - Detailed review text.
- `isVideo` (`Boolean`, Default: `true`, `@map("is_video")`)
- `videoUrl` / `videoThumbnail` (Optional)
- `studentStory` (`Text`, Optional, `@map("student_story")`)
- `featured` (`Boolean`, Default: `false`)
- `displayOrder` (`Int`, Default: `0`)
- `isActive` (`Boolean`, Default: `true`) / `isDeleted` (`Boolean`, Default: `false`)

### Model 10: `StudentReview` (`student_reviews`)
Curated reviews and star feedback ratings.
- `id` (`Uuid`, Primary Key)
- `studentName` (`VarChar(200)`, `@map("student_name")`)
- `photo` (`Text`, Optional)
- `course` (`VarChar(150)`, Optional)
- `rating` (`Int`, Default: `5`)
- `review` (`Text`)
- `company` (`VarChar(150)`, Optional)
- `displayOrder` (`Int`, Default: `0`)
- `isActive` (`Boolean`, Default: `true`) / `isDeleted` (`Boolean`, Default: `false`)

### Model 11: `Partner` (`partners`)
Corporate recruitment partners.
- `id` (`Uuid`, Primary Key)
- `name` (`VarChar(200)`) - Partner company name.
- `logo` (`Text`) - Employer brand logo URL.
- `type` (`VarChar(50)`, Default: `"HIRING"`) - Partner classification.
- `websiteUrl` (`Text`, Optional, `@map("website_url")`) - Company website.
- `displayOrder` (`Int`, Default: `0`)
- `isActive` (`Boolean`, Default: `true`) / `isDeleted` (`Boolean`, Default: `false`)

### Model 12: `EmiPartner` (`emi_partners`)
Education loan and 0% interest EMI financing institutions.
- `id` (`Uuid`, Primary Key)
- `name` (`VarChar(200)`) - Financial institution name.
- `logo` (`Text`) - Financial institution logo URL.
- `description` (`Text`, Optional) - Financing scheme details.
- `displayOrder` (`Int`, Default: `0`)
- `isActive` (`Boolean`, Default: `true`) / `isDeleted` (`Boolean`, Default: `false`)

### Model 13: `Faq` (`faqs`)
Frequently asked questions and answers.
- `id` (`Uuid`, Primary Key)
- `question` (`Text`)
- `answer` (`Text`)
- `displayOrder` (`Int`, Default: `0`)
- `createdById` (`Uuid`, Optional, Foreign Key -> `User.id`)
- `isActive` (`Boolean`, Default: `true`) / `isDeleted` (`Boolean`, Default: `false`)

### Model 14: `AdmissionEnquiry` (`admission_enquiries`)
Student course admission lead submissions.
- `id` (`Uuid`, Primary Key)
- `studentName` (`VarChar(200)`, `@map("student_name")`)
- `email` (`VarChar(255)`)
- `phone` (`VarChar(20)`)
- `courseId` (`Uuid`, Optional, Foreign Key -> `Course.id`)
- `city` (`VarChar(150)`, Optional)
- `qualification` (`VarChar(150)`, Optional) - Highest qualification.
- `message` (`Text`, Optional)
- `status` (`Enum: EnquiryStatus`, Default: `NEW`) - `NEW`, `PENDING`, `CONTACTED`, `CLOSED`.
- `assignedToId` (`Uuid`, Optional, Foreign Key -> `User.id`, `@map("assigned_to")`) - Assigned counselor.
- `remarks` (`Text`, Optional) - Counselor notes and follow-up log.
- `isDeleted` (`Boolean`, Default: `false`)

### Model 15: `FranchisePartnerEnquiry` (`franchise_partner_enquiries`)
Business franchise expansion inquiries.
- `id` (`Uuid`, Primary Key)
- `fullName` (`VarChar(200)`, `@map("full_name")`)
- `companyName` (`VarChar(255)`, Optional, `@map("company_name")`)
- `email` (`VarChar(255)`)
- `phone` (`VarChar(20)`)
- `city` / `state` (`VarChar(150)`, Optional)
- `investmentCapacity` (`VarChar(150)`, Optional, `@map("investment_capacity")`)
- `message` (`Text`, Optional)
- `status` (`Enum: EnquiryStatus`, Default: `NEW`)
- `assignedToId` (`Uuid`, Optional, Foreign Key -> `User.id`)
- `remarks` (`Text`, Optional)
- `isDeleted` (`Boolean`, Default: `false`)

### Model 16: `CompanyPlacementEnquiry` (`company_placement_enquiries`)
B2B corporate recruiter placement and talent hiring requests.
- `id` (`Uuid`, Primary Key)
- `companyName` (`VarChar(255)`, `@map("company_name")`)
- `contactPerson` (`VarChar(200)`, `@map("contact_person")`)
- `email` (`VarChar(255)`)
- `phone` (`VarChar(20)`)
- `jobRole` (`VarChar(200)`, `@map("job_role")`) - Roles to be filled.
- `requiredSkills` (`Text`, Optional, `@map("required_skills")`)
- `vacancies` (`Int`, Default: `1`, Optional)
- `jobLocation` (`VarChar(200)`, Optional, `@map("job_location")`)
- `message` (`Text`, Optional)
- `status` (`Enum: EnquiryStatus`, Default: `NEW`)
- `assignedToId` (`Uuid`, Optional, Foreign Key -> `User.id`)
- `remarks` (`Text`, Optional)
- `isDeleted` (`Boolean`, Default: `false`)

### Model 17: `JobOpening` (`job_openings`)
Institute career postings for faculty and corporate staff.
- `id` (`Uuid`, Primary Key)
- `title` (`VarChar(200)`) - Job title.
- `department` (`VarChar(150)`, Optional) - Academic / Marketing / Operations.
- `location` (`VarChar(150)`, Default: `"Offline Classroom"`)
- `jobType` (`VarChar(100)`, Default: `"Full-Time"`, `@map("job_type")`)
- `description` (`Text`) - Detailed job overview.
- `requirements` (`Text`, Optional) - Candidate requirements.
- `displayOrder` (`Int`, Default: `0`)
- `status` (`Enum: ContentStatus`, Default: `PUBLISHED`)
- `isActive` (`Boolean`, Default: `true`) / `isDeleted` (`Boolean`, Default: `false`)
- `careerEnquiries` (`Relation` -> `CareerEnquiry[]`)

### Model 18: `CareerEnquiry` (`career_enquiries`)
Job applicant submissions.
- `id` (`Uuid`, Primary Key)
- `fullName` (`VarChar(200)`, `@map("full_name")`)
- `email` (`VarChar(255)`)
- `phone` (`VarChar(20)`)
- `jobTitle` (`VarChar(200)`, `@map("job_title")`)
- `jobOpeningId` (`Uuid`, Optional, Foreign Key -> `JobOpening.id`)
- `resume` (`Text`) - Uploaded resume PDF/DOCX URL in `/public/uploads`.
- `coverLetter` (`Text`, Optional, `@map("cover_letter")`)
- `status` (`Enum: EnquiryStatus`, Default: `NEW`)
- `remarks` (`Text`, Optional)
- `isDeleted` (`Boolean`, Default: `false`)

### Model 19: `ContactEnquiry` (`contact_enquiries`)
General inquiries from the contact page.
- `id` (`Uuid`, Primary Key)
- `fullName` (`VarChar(150)`, `@map("full_name")`)
- `email` (`VarChar(255)`)
- `phone` (`VarChar(20)`)
- `subject` (`VarChar(255)`, Optional)
- `message` (`Text`)
- `status` (`Enum: EnquiryStatus`, Default: `NEW`)
- `assignedToId` (`Uuid`, Optional, Foreign Key -> `User.id`)
- `remarks` (`Text`, Optional)
- `isDeleted` (`Boolean`, Default: `false`)

### Model 20: `Banner` (`banners`)
Homepage hero carousel banners.
- `id` (`Uuid`, Primary Key)
- `badge` (`VarChar(100)`, Default: `"CAREER BOOSTER"`) - Top pill tag.
- `title` (`VarChar(200)`, Optional) - First line of heading.
- `titleAccent` (`VarChar(200)`, Optional, `@map("title_accent")`) - Second colored line of heading.
- `subtitle` (`Text`, Optional) - Explanatory text.
- `tag` (`VarChar(150)`, Optional) - Bottom feature pill tag.
- `accentColor` (`VarChar(50)`, Default: `"#764DFF"`, `@map("accent_color")`) - Hex color code.
- `icon` (`VarChar(100)`, Default: `"mdi:rocket-launch"`) - Iconify identifier.
- `imageUrl` (`Text`, `@map("image_url")`) - Banner artwork URL.
- `displayOrder` (`Int`, Default: `0`)
- `isActive` (`Boolean`, Default: `true`) / `isDeleted` (`Boolean`, Default: `false`)

### Model 21: `Brochure` (`brochures`)
Course curriculum and institute brochure files.
- `id` (`Uuid`, Primary Key)
- `title` (`VarChar(255)`)
- `courseId` (`Uuid`, Foreign Key -> `Course.id`)
- `fileUrl` (`Text`, `@map("file_url")`) - PDF document URL.
- `fileSize` (`VarChar(50)`, Optional, `@map("file_size")`) - Human-readable size (e.g. "4.2 MB").
- `isActive` (`Boolean`, Default: `true`) / `isDeleted` (`Boolean`, Default: `false`)

### Model 22: Dynamic Page Builder & Layout Models
- **`WebPage` (`web_pages`)**: Custom web pages with `slug`, `pageKey`, SEO metadata, and `sections` relation.
- **`PageSection` (`page_sections`)**: Modular blocks belonging to a page with `sectionKey`, `sectionType`, `sectionTitle`, `subtitle`, `content`, `image`, `buttonText`, `buttonUrl`, `extraData` (JSON), and `displayOrder`.
- **`HeaderSettings` (`header_settings`)**: Navigation logo, alternate text, social links visibility, Hire From Us CTA button config, Enquire Now CTA config, and WhatsApp button config.
- **`HeaderContactItem` (`header_contact_items`)**: Dynamic phone numbers and email addresses displayed in the top navbar.
- **`FooterSettings` (`footer_settings`)**: Footer logo, Google Maps URL, address label, full physical address, copyright notice, and scroll-to-top button toggle.
- **`FooterContactItem` (`footer_contact_items`)**: Dynamic contact rows in the footer.
- **`FooterColumn` (`footer_columns`) & `FooterColumnLink` (`footer_column_links`)**: Multi-column footer tree with links, URLs, and target tabs.
- **`WebsiteSettings` (`website_settings`)**: Global site configurations, SEO metadata, Google Analytics ID, Google Search Console ID, and robots.txt.
- **`AuditLog` (`audit_logs`)**: Security audit trail (`userId`, `module`, `action`, `recordId`, `ipAddress`, `userAgent`, `createdAt`).
- **`NotificationLog` (`notification_logs`)**: Delivery logs for system alerts (`recipient`, `notificationType`, `subject`, `deliveryStatus`, `errorMessage`).
- **`Report` (`reports`)**: Generated analytical and export documents (`reportName`, `reportType`, `generatedById`, `filePath`, `format`).

---

## 4. File System Index & Component Hierarchy

```
package/
├── prisma/
│   └── schema.prisma                      # Master schema definition (22 models)
├── public/
│   ├── images/                            # Static images (logo, hero banners, icons)
│   └── uploads/                           # Dynamic file uploads (resumes, banners, PDFs)
├── src/
│   ├── app/
│   │   ├── (site)/                        # Public frontend routing group
│   │   │   ├── (auth)/                    # Public auth pages (signin, signup, forgot-password)
│   │   │   ├── about/
│   │   │   │   ├── page.tsx               # Redirects to /about/about-qimd
│   │   │   │   ├── AboutContent.tsx       # Comprehensive About Us UI component
│   │   │   │   ├── about-qimd/page.tsx    # Live About QIMD page
│   │   │   │   └── our-team/page.tsx      # Leadership & faculty team page
│   │   │   ├── admission/page.tsx         # Direct admission & eligibility page
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx               # Blog articles directory
│   │   │   │   └── [slug]/page.tsx        # Dynamic blog reader page
│   │   │   ├── brochure/[slug]/page.tsx   # PDF brochure reader & download page
│   │   │   ├── careers/page.tsx           # Job openings & candidate submission
│   │   │   ├── contact/page.tsx           # Contact form & location map
│   │   │   ├── courses/
│   │   │   │   ├── page.tsx               # Course catalog page
│   │   │   │   └── [slug]/page.tsx        # Dynamic course detail page
│   │   │   ├── events/
│   │   │   │   ├── page.tsx               # Workshops & masterclasses list
│   │   │   │   └── [slug]/page.tsx        # Event details & registration
│   │   │   ├── faqs/page.tsx              # Public FAQ accordion knowledgebase
│   │   │   ├── gallery/page.tsx           # Campus photo & event gallery
│   │   │   ├── hire-from-us/page.tsx      # Corporate employer recruitment portal
│   │   │   ├── placements/page.tsx        # Placed student packages & company badges
│   │   │   ├── privacy-policy/page.tsx    # Privacy policy terms
│   │   │   ├── qimd-franchise/page.tsx    # Franchise partnership application
│   │   │   ├── refund-policy/page.tsx     # Fee refund policy guidelines
│   │   │   ├── reviews-testimonials/page.tsx # Video reviews & student stories
│   │   │   ├── sitemap/page.tsx           # Visual sitemap navigation
│   │   │   ├── trainers/
│   │   │   │   ├── page.tsx               # Faculty & trainers directory page
│   │   │   │   └── TrainersContent.tsx    # Interactive trainers showcase UI component
│   │   │   └── page.tsx                   # Main Institute Homepage
│   │   ├── admin/                         # CMS & CRM Admin dashboard
│   │   │   ├── audit-logs/page.tsx        # System change logs & security audit trail
│   │   │   ├── banners/page.tsx           # Homepage hero banner customizer
│   │   │   ├── blogs/page.tsx             # Blog article publisher
│   │   │   ├── brochures/page.tsx         # PDF syllabus manager
│   │   │   ├── careers/page.tsx           # Job postings & applicant tracker
│   │   │   ├── course-categories/page.tsx # Course category manager
│   │   │   ├── courses/page.tsx           # Course curriculum & fee manager
│   │   │   ├── dashboard/page.tsx         # Overview metrics dashboard
│   │   │   ├── enquiries/                 # CRM lead management tables
│   │   │   │   ├── admission/page.tsx     # Admission leads
│   │   │   │   ├── careers/page.tsx       # Faculty job applications & resumes
│   │   │   │   ├── contact/page.tsx       # Contact us messages
│   │   │   │   ├── franchise/page.tsx     # Franchise applications
│   │   │   │   └── hire/page.tsx          # Corporate recruiter talent requests
│   │   │   ├── faqs/page.tsx              # FAQ creator
│   │   │   ├── footer/page.tsx            # Footer column & link tree builder
│   │   │   ├── gallery/page.tsx           # Campus media & album manager
│   │   │   ├── header/page.tsx            # Header navigation & contact items
│   │   │   ├── login/page.tsx             # Admin authentication portal
│   │   │   ├── logo/page.tsx              # Global branding & logo manager
│   │   │   ├── pages/                     # Dynamic Page Builder
│   │   │   ├── partners/page.tsx          # Hiring partner logos manager
│   │   │   ├── placements/page.tsx        # Student placement records manager
│   │   │   ├── reports/page.tsx           # CRM export & reporting tool
│   │   │   ├── reviews/page.tsx           # Text ratings manager
│   │   │   ├── settings/page.tsx          # General site settings
│   │   │   ├── social-links/page.tsx      # Social media handles manager
│   │   │   ├── team/page.tsx              # Institute team profiles & hero banner
│   │   │   ├── testimonials/page.tsx      # Video testimonials manager
│   │   │   ├── trainers/page.tsx          # Faculty member profiles
│   │   │   ├── users/page.tsx             # Admin user management & RBAC roles
│   │   │   ├── website-management/page.tsx # Global SEO & tracking codes
│   │   │   └── AdminShell.tsx             # Master Admin sidebar navigation layout
│   │   ├── actions/                       # Next.js Server Actions
│   │   │   ├── authActions.ts             # Admin login, logout, password reset
│   │   │   ├── bannerActions.ts           # Banner CRUD & reordering
│   │   │   ├── careerActions.ts           # Job openings & applicant actions
│   │   │   ├── cmsActions.ts              # Course, trainer, category, blog CRUD
│   │   │   ├── crmActions.ts              # Leads submission & status workflows
│   │   │   ├── footerActions.ts           # Footer settings, column & link actions
│   │   │   ├── headerActions.ts           # Header settings & contact items
│   │   │   ├── mediaActions.ts            # Media upload & safe deletion
│   │   │   ├── pageActions.ts             # WebPage builder actions
│   │   │   ├── partnerActions.ts          # Hiring & EMI partner actions
│   │   │   ├── sectionActions.ts          # PageSection block actions
│   │   │   ├── userActions.ts             # User accounts & role assignments
│   │   │   └── websiteManagementActions.ts# SEO, analytics, and contact actions
│   │   ├── api/                           # REST API routes
│   │   │   ├── admin/                     # Admin data endpoints
│   │   │   ├── auth/[...nextauth]/        # NextAuth handler
│   │   │   ├── export/route.ts            # CRM CSV export endpoint
│   │   │   ├── public/                    # Public API endpoints (banners, reviews)
│   │   │   ├── public-gallery/route.ts    # Public gallery feed
│   │   │   ├── public-settings/route.ts   # Public settings feed
│   │   │   ├── settings/route.ts          # Combined settings API
│   │   │   └── upload/                    # File & resume upload endpoints
│   │   ├── context/                       # React Context Providers
│   │   │   ├── AuthDialogContext.tsx      # Auth modal state
│   │   │   └── WebsiteSettingsContext.tsx # Live settings state synchronization
│   │   ├── favicon.ico
│   │   ├── globals.css                    # Tailwind CSS v4 directives & theme variables
│   │   └── layout.tsx                     # Root HTML wrapper
│   ├── components/                        # Reusable UI component library
│   │   ├── Admin/                         # Admin widgets, modals, data tables
│   │   ├── Auth/                          # Signin, signup, password reset forms
│   │   ├── Common/                        # Shared UI components (Breadcrumb, CourseCard, PlacementCard, etc.)
│   │   ├── Contact/                       # Contact page forms & Google Map embed
│   │   ├── Events/                        # Event cards and detail layouts
│   │   ├── Home/                          # Homepage sections (Hero, Courses, WhyQimd, Placements, FAQ, etc.)
│   │   ├── Layout/                        # Header, Navigation, Logo, Footer, ScrollToTop
│   │   └── SharedComponent/               # Sub-hero page banners & blog cards
│   ├── data/
│   │   └── index.ts                       # Static fallback dataset & mock catalog
│   ├── lib/
│   │   ├── audit.ts                       # Audit logging helper
│   │   ├── auth.ts                        # JWT session verifiers & RBAC middleware guards
│   │   ├── db.ts                          # Prisma Client singleton
│   │   ├── getDynamicData.ts              # Cached dynamic database queries with fallbacks
│   │   ├── mediaService.ts                # Media dependency checker & safe deletion
│   │   ├── seed.ts                        # Initial seed script
│   │   └── validations.ts                 # Zod validation schemas
│   └── types/                             # TypeScript type definitions
```

---

## 5. Public Website Routes & User Experiences

The public website consists of the following official pages structured across the main navigation:

| Navigation Menu | Route Path | Page Title | Key Features & Implementation Details |
| :--- | :--- | :--- | :--- |
| **Home** | `/` | **Homepage** | Hero slider carousel ([`HeroBannerCarousel.tsx`](file:///c:/Users/Admin/Downloads/QMID%20Website/QIMD/package/src/components/Home/Hero/HeroBannerCarousel.tsx)), quick search, popular courses, why choose QIMD stats, student placement marquee, 0% EMI financing calculator, student video testimonials, campus photo gallery, FAQ accordion, instant lead form. |
| **Programs** | `/courses` | **Course Catalog** | Filterable course directory with category tabs, duration badges, offline mode indicators, and curriculum highlights. |
| **Programs** | `/courses/[slug]` | **Course Detail Page** | Deep curriculum overview, modular syllabus breakdown, learning outcomes, demo preview video, fee structure, career pathways, and instant brochure download form. |
| **About Us** | `/about/about-qimd` | **About QIMD** | In-depth story of the institute, core values, mission, vision, key achievements, pedagogy methodology, and leadership message. |
| **About Us** | `/about/our-team` | **Our Team** | Executive directors, leadership board, and core team member directory with designations and bios. |
| **About Us** | `/trainers` | **Our Trainers** | Comprehensive faculty directory with experience tags, industry specializations, qualifications, AI skills, and LinkedIn badges. |
| **Why QIMD?** | `/why-qimd` | **Why QIMD?** | Detailed breakdown of the QIMD advantage, AI-powered practical training, live client projects, and 100% placement assistance. |
| **Why QIMD?** | `/success-stories` | **Success Stories** | In-depth student success narratives, sector-wise hiring breakdown, video testimonials, recent placements, and verified student ratings. |
| **Why QIMD?** | `/placements` | **Our Placements** | Real-time placed student gallery, hiring company badges, salary packages (LPA), designations, student photos, and video stories. |
| **Why QIMD?** | `/reviews-testimonials`| **Reviews & Testimonials** | Authentic video interview gallery, Google ratings badge, verified alumnus quotes, and career transition stories. |
| **Why QIMD?** | `/gallery` | **Life at QIMD (Gallery)**| Filterable photo and video albums (Classrooms, Labs, Student Projects, Convocation, Cultural Events). |
| **Blogs** | `/blog` | **Blogs & Articles** | Categorized industry articles on AI in marketing, UX design principles, video editing techniques, and career tips. |
| **Blogs** | `/blog/[slug]` | **Blog Post Reader** | Full-width article reader with estimated reading time, author bio, social share buttons, and related articles carousel. |
| **Career** | `/careers` | **Current Openings** | Active job openings for trainers, counselors, and staff with direct resume upload. |
| **Career** | `/hire-from-us` | **Hire From QIMD (B2B)** | Dedicated corporate recruiter portal to hire pre-vetted students with specific skill sets. |
| **Career** | `/qimd-franchise` | **QIMD Franchise** | Institute franchise model breakdown, ROI calculator, and franchise partnership application form. |
| **Contact** | `/contact` | **Contact Us** | Interactive Google Maps locator, institute address, primary phone/email, and multi-field general inquiry form. |
| **Support** | `/faqs` | **FAQs** | Searchable accordion covering eligibility, fee installment options, placement assistance, and practical project requirements. |
| **Legal** | `/privacy-policy` | **Privacy Policy** | Comprehensive data privacy and compliance document. |
| **Legal** | `/refund-policy` | **Refund Policy** | Transparent fee refund and cancellation rules. |
| **Legal** | `/terms-and-conditions`| **Terms & Conditions** | Website terms of service and usage conditions. |
| **Utility** | `/brochure/[slug]` | **Brochure Viewer** | Embedded interactive PDF brochure reader with direct download option. |
| **Utility** | `/sitemap` | **Visual Sitemap** | Structured tree listing all active website links. |

---

## 6. CMS & CRM Admin Dashboard

Accessible at `/admin` (or `/admin/login`):

```
┌────────────────────────────────────────────────────────┐
│ QIMD Admin Dashboard                                   │
├───────────────┬────────────────────────────────────────┤
│ Navigation    │ Main Workspace                         │
│ ───────────── │ ────────────────────────────────────── │
│ • Dashboard   │ 📊 Metrics: Total Leads, Active Courses│
│ • Banners     │ 🖼️ Hero Slider Banners & Accents       │
│ • Courses     │ 📚 Curriculum, Syllabi & Fee Structures│
│ • Categories  │ 🏷️ Academic Taxonomy Categories       │
│ • Trainers    │ 👨‍🏫 Faculty Members & Qualifications    │
│ • Team        │ 👥 Leadership Profiles & Group Banner  │
│ • Blogs       │ ✍️ Blog Post Publisher & SEO Tags     │
│ • Placements  │ 💼 Placed Students & Employer Badges   │
│ • Testimonials│ 🎥 Video Testimonials & Star Reviews   │
│ • Gallery     │ 📸 Campus Photo Albums & Media Assets  │
│ • Partners    │ 🤝 Hiring Companies & EMI Partners     │
│ • Brochures   │ 📄 PDF Syllabi Uploads & Links         │
│ • FAQs        │ ❓ FAQ Accordion Content Editor        │
│ • Careers     │ 💼 Job Openings & Candidate Resumes    │
│ • Page Builder│ 🧩 Modular Page Builder & PageSections │
│ • CRM Leads   │ 📥 Admissions, Franchise, Hiring Leads │
│ • Layout CMS  │ 🎨 Header, Footer, Logo & Social Links │
│ • Security    │ 🔐 Users, RBAC Roles & Audit Logs      │
│ • Reports     │ 📈 CSV / Excel Lead Data Export Suite  │
└───────────────┴────────────────────────────────────────┘
```

### Key Admin Modules:
1. **Homepage Banner Customizer (`/admin/banners`)**: Drag-and-drop ordering, upload custom banner images, set custom title accents, pill badges, and background color accents.
2. **Course Curriculum CMS (`/admin/courses`)**: Full curriculum editor supporting syllabus module lines, learning outcome bullet points, discounted fees, trainer assignment, and PDF brochure attachments.
3. **Multi-Stream CRM Inbox (`/admin/enquiries/*`)**: Unified lead management for Admissions, Franchise, Corporate Hiring, Careers, and Contact submissions. Supports status updating (`NEW` -> `PENDING` -> `CONTACTED` -> `CLOSED`), counselor assignment, and internal notes.
4. **Visual Layout Customizer (`/admin/header` & `/admin/footer`)**: Edit top bar phone/email items, customize button labels and URLs, configure footer columns, and update copyright statements without modifying code.
5. **Security & Audit Logs (`/admin/audit-logs`)**: Complete immutable audit log capturing every administrative mutation with timestamp, IP address, user agent, module, and affected record ID.

---

## 7. Server Actions Technical Reference

All data mutations are handled by server actions in `src/app/actions/`:

### 1. `bannerActions.ts`
- `saveBannerAction(data: BannerInput)`: Creates or updates a hero banner with ordering and accent settings.
- `toggleBannerStatusAction(id: string, isActive: boolean)`: Toggles public visibility.
- `deleteBannerPermanentlyAction(id: string)`: Permanently deletes a banner record.
- `getPublicBannersAction()`: Returns active, published banners sorted by display order.

### 2. `cmsActions.ts`
- `saveCourseAction(data: CourseInput)`: Creates/updates a course, manages slug uniqueness, and revalidates cached tags.
- `deleteCourseAction(id: string)`: Soft-deletes or removes a course record.
- `saveCategoryAction(data: CategoryInput)` / `deleteCategoryAction(id: string)`
- `saveTrainerAction(data: TrainerInput)` / `deleteTrainerAction(id: string)`
- `saveTeamMemberAction(data: TeamInput)` / `deleteTeamMemberAction(id: string)`
- `saveBlogAction(data: BlogInput)` / `deleteBlogAction(id: string)`
- `savePlacementAction(data: PlacementInput)` / `deletePlacementAction(id: string)`
- `saveTestimonialAction(data: TestimonialInput)` / `deleteTestimonialAction(id: string)`
- `saveFaqAction(data: FaqInput)` / `deleteFaqAction(id: string)`

### 3. `crmActions.ts`
- `submitAdmissionEnquiryAction(data: AdmissionInput)`: Validates and records student admission leads.
- `updateAdmissionStatusAction(id: string, status: EnquiryStatus, remarks?: string)`
- `submitFranchiseEnquiryAction(data: FranchiseInput)` / `updateFranchiseStatusAction(id, status)`
- `submitCompanyPlacementEnquiryAction(data: CompanyInput)` / `updateCompanyPlacementStatusAction(id, status)`
- `submitContactEnquiryAction(data: ContactInput)` / `updateContactStatusAction(id, status)`

### 4. `careerActions.ts`
- `saveJobOpeningAction(data: JobOpeningInput)`: Publishes faculty/staff job postings.
- `submitCareerApplicationAction(data: CareerApplicationInput)`: Records candidate submissions with resume URLs.
- `updateCareerApplicationStatusAction(id: string, status: CareerStatus, remarks?: string)`

### 5. `headerActions.ts` & `footerActions.ts`
- `saveHeaderSettingsAction(settings: HeaderSettingsInput)`: Updates navbar branding, CTA buttons, and social visibility.
- `addHeaderContactItemAction(item)` / `deleteHeaderContactItemAction(id)`
- `saveFooterSettingsAction(settings: FooterSettingsInput)`
- `addFooterColumnAction(column)` / `deleteFooterColumnAction(id)`
- `addFooterLinkAction(link)` / `deleteFooterLinkAction(id)`

### 6. `pageActions.ts` & `sectionActions.ts`
- `createWebPageAction(data)` / `updateWebPageAction(data)`
- `savePageSectionAction(data: SectionInput)`: Creates or updates modular page content blocks.
- `reorderPageSectionsAction(items: { id: string; displayOrder: number }[])`

### 7. `userActions.ts` & `authActions.ts`
- `adminLoginAction(credentials)`: Validates bcrypt password hash and generates signed session.
- `createUserAction(userData)`: Creates staff/admin accounts with specific RBAC roles.
- `updateUserRoleAction(id: string, role: string)`: Modifies user privileges.
- `toggleUserStatusAction(id: string, status: boolean)`: Activates/deactivates accounts.

---

## 8. REST API Endpoints Specification

### Public REST Endpoints
- `GET /api/public/banners`: Returns JSON array of active hero banners for the homepage slider.
- `GET /api/public/reviews`: Returns published student testimonials and star ratings.
- `GET /api/public-gallery`: Returns active gallery albums and media items.
- `GET /api/public-settings`: Returns public website settings, branding, header/footer configuration.
- `GET /api/public/brochures/download`: Serves dynamic PDF downloads.
- `GET /api/settings`: Returns combined header, footer, social links, and contact settings.

### Admin REST Endpoints
- `GET /api/admin/banners`: Retrieves all banner records (active and inactive).
- `GET /api/admin/courses`: Retrieves courses with category and trainer relations.
- `GET /api/admin/blogs`: Retrieves all blog articles.
- `GET /api/admin/enquiries`: Retrieves filtered CRM leads by type and status.
- `GET /api/admin/placements`: Retrieves placement records.
- `GET /api/admin/testimonials`: Retrieves video and text reviews.
- `GET /api/admin/trainers`: Retrieves faculty member list.
- `GET /api/admin/gallery`: Retrieves gallery items and media details.
- `GET /api/admin/faqs`: Retrieves all FAQ entries.
- `GET /api/admin/settings`: Retrieves full site configuration.

### File Upload & Export Endpoints
- `POST /api/upload`: Handles multipart file uploads (JPEG, PNG, WebP, PDF) saving to `/public/uploads`.
- `POST /api/upload/career-resume`: Handles resume uploads (PDF, DOCX, maximum 10MB) with MIME-type validation.
- `GET /api/export`: Generates downloadable CSV exports of CRM leads and inquiries.
- `GET/POST /api/auth/[...nextauth]`: NextAuth session handler.

---

## 9. Global State & Live Settings Engine

The application features a real-time settings synchronization engine powered by React Context (`src/app/context/WebsiteSettingsContext.tsx`):

```
┌────────────────────────────────────────────────────────┐
│ Admin modifies Header / Footer / Phone in CMS          │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Server Action updates PostgreSQL Database              │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Window dispatches 'websiteSettingsUpdated' Event        │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ WebsiteSettingsContext re-fetches /api/settings        │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ TopBar, NavLinks, Footer & Floating WhatsApp Update    │
└────────────────────────────────────────────────────────┘
```

- **Dynamic Favicon Switching**: Automatically updates the browser tab favicon dynamically if changed in `/admin/logo`.
- **Custom WhatsApp Link Generator**: Formats numbers automatically to generate direct `https://wa.me/<number>` URLs.
- **Top Bar Contact Items**: Renders multiple phones and emails dynamically in both mobile drawer and desktop header.

---

## 10. Authentication, Security & RBAC Hierarchy

### Role-Based Access Control (RBAC)
- **`SUPER_ADMIN`**: Unrestricted privileges. Can create/delete admin users, modify user roles, inspect audit logs, perform data exports, and edit all CMS/CRM content.
- **`ADMIN`**: Operational manager. Full access to manage courses, banners, gallery, blogs, team members, trainers, FAQs, and manage CRM leads.
- **`CONTENT_MANAGER`**: Content editor. Permitted to write and edit blog articles, FAQs, and media items.

### Security Defenses:
- **Password Security**: Bcrypt with 10 salt rounds.
- **Session Protection**: Encrypted HTTP-Only cookies with secure flags.
- **Safe Media Deletion (`mediaService.ts`)**: Prevents deleting image files if they are actively referenced by courses, banners, trainers, or team records.
- **Input Sanitization**: Zod validation schemas across all public forms.

---

## 11. Design System & UI Architecture

- **CSS Engine**: Built on **Tailwind CSS v4** with `@tailwindcss/postcss`.
- **Theme Support**: Dark and light mode variables configured via `next-themes`.
- **Responsive Layout**: Designed for mobile (320px+), tablet (768px+), desktop (1024px+), and ultra-wide screens (1440px+).
- **Component Design System**:
  - `Breadcrumb`: Accessible page navigation breadcrumb.
  - `CourseCard`: Interactive course badge with fee display, duration, and enrollment CTA.
  - `PlacementCard`: Student success card with employer logo and salary badge.
  - `EnquiryForm`: Lead generation form with input validation and instant toast feedback.
  - `VideoModal`: Accessible video player modal supporting YouTube and self-hosted MP4s.

---

## 12. Environment Configuration

Create a `.env` file in the root of the `package` directory:

```env
# ============================================================
# Database Connections (Supabase PostgreSQL)
# ============================================================
# Pooled connection string (Port 6543 / 5432 with pooler)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection string for Prisma migrations
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# ============================================================
# Authentication & Security Secrets
# ============================================================
JWT_SECRET="qimd_super_secret_jwt_encryption_key_2026"
NEXTAUTH_SECRET="your_custom_generated_nextauth_secret_key"
NEXTAUTH_URL="http://localhost:3000"

# ============================================================
# Application Settings
# ============================================================
NODE_ENV="development"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

---

## 13. Installation, Database Setup & Seeding

### 1. Prerequisites
- **Node.js**: `v18.18.0` or higher (`v20.x LTS` recommended)
- **npm** (or **pnpm** / **yarn**)
- **PostgreSQL** database (Supabase Cloud or local PostgreSQL)

### 2. Install Dependencies
```bash
cd package
npm install
```

### 3. Initialize Prisma & Push Database Schema
```bash
# Generate Prisma Client types
npx prisma generate

# Push schema directly to PostgreSQL
npx prisma db push
```

### 4. Seed Database (Optional)
```bash
# Seed initial admin user and sample data
npx tsx src/lib/seed.ts
```

### 5. Start Development Server
```bash
npm run dev
```

- Public Website: [http://localhost:3000](http://localhost:3000)
- Admin Panel: [http://localhost:3000/admin](http://localhost:3000/admin)

### 6. Useful Prisma Commands
```bash
# Launch interactive Prisma Studio database GUI
npx prisma studio

# Validate and format schema file
npx prisma format
```

---

## 14. Production Build & Deployment

### Building for Production
```bash
# Compile and create optimized production build
npm run build

# Start production server
npm run start
```

### Deployment Guidelines:
- **Hosting Platforms**: Vercel, Railway, AWS Amplify, Render, or Docker on VPS.
- **Database Connection Pooling**: Ensure `DATABASE_URL` uses PgBouncer or Supabase connection pooling to avoid connection exhaustion in serverless environments.
- **Persistent Storage**: For multi-instance deployments, configure AWS S3 or Supabase Storage for `/public/uploads` media persistence.

---

© 2026 **QIMD (Quickup Institute of Marketing & Design)**. All rights reserved.

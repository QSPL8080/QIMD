-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "Theme" AS ENUM ('LIGHT', 'DARK');

-- CreateEnum
CREATE TYPE "ReportFormat" AS ENUM ('PDF', 'EXCEL');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "EnquiryStatus" AS ENUM ('NEW', 'PENDING', 'CONTACTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "CareerStatus" AS ENUM ('NEW', 'PENDING', 'SHORTLISTED', 'REJECTED', 'HIRED', 'CLOSED');

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "role_name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "full_name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "phone" VARCHAR(20),
    "role_id" UUID NOT NULL,
    "profile_image" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_categories" (
    "id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trainers" (
    "id" UUID NOT NULL,
    "full_name" VARCHAR(200) NOT NULL,
    "photo" TEXT,
    "designation" VARCHAR(150),
    "qualification" VARCHAR(255),
    "experience" VARCHAR(100),
    "biography" TEXT,
    "skills" JSONB,
    "certifications" TEXT,
    "linkedin" TEXT,
    "instagram" TEXT,
    "email" VARCHAR(255),
    "phone" VARCHAR(20),
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "meta_title" VARCHAR(255),
    "meta_description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trainers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" UUID NOT NULL,
    "full_name" VARCHAR(200) NOT NULL,
    "photo" TEXT,
    "designation" VARCHAR(150),
    "qualification" VARCHAR(255),
    "experience" VARCHAR(100),
    "biography" TEXT,
    "skills" JSONB,
    "certifications" TEXT,
    "linkedin" TEXT,
    "instagram" TEXT,
    "email" VARCHAR(255),
    "phone" VARCHAR(20),
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "trainer_id" UUID,
    "course_name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "short_description" TEXT,
    "description" TEXT,
    "banner_image" TEXT,
    "gallery" JSONB,
    "duration" VARCHAR(100),
    "fees" DECIMAL(10,2),
    "discount_price" DECIMAL(10,2),
    "eligibility" TEXT,
    "course_mode" VARCHAR(50) NOT NULL DEFAULT 'Offline',
    "level" VARCHAR(100),
    "syllabus" TEXT,
    "learning_outcomes" TEXT,
    "certification" TEXT,
    "brochure" TEXT,
    "demo_video" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "meta_title" VARCHAR(255),
    "meta_description" TEXT,
    "canonical_url" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blogs" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "category" VARCHAR(150) DEFAULT 'General',
    "excerpt" TEXT,
    "featured_image" TEXT,
    "images" JSONB,
    "tags" JSONB,
    "author" VARCHAR(150),
    "author_id" UUID,
    "reading_time" INTEGER NOT NULL DEFAULT 5,
    "content" TEXT NOT NULL,
    "meta_title" VARCHAR(255),
    "meta_description" TEXT,
    "canonical_url" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "placements" (
    "id" UUID NOT NULL,
    "student_name" VARCHAR(200) NOT NULL,
    "student_photo" TEXT,
    "company_name" VARCHAR(200) NOT NULL,
    "company_logo" TEXT,
    "package" VARCHAR(100),
    "designation" VARCHAR(150),
    "course_id" UUID,
    "course_name" VARCHAR(150),
    "placement_date" TIMESTAMP(3),
    "location" VARCHAR(150),
    "joining_year" VARCHAR(50),
    "is_video" BOOLEAN NOT NULL DEFAULT false,
    "video_url" TEXT,
    "video_thumbnail" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT true,
    "success_story" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "placements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gallery" (
    "id" UUID NOT NULL,
    "album" VARCHAR(150),
    "category" VARCHAR(150),
    "media_type" "MediaType" NOT NULL DEFAULT 'IMAGE',
    "file_url" TEXT NOT NULL,
    "thumbnail" TEXT,
    "alt_text" VARCHAR(255),
    "caption" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_by_id" UUID,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gallery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testimonials" (
    "id" UUID NOT NULL,
    "student_name" VARCHAR(200) NOT NULL,
    "heading" VARCHAR(255),
    "photo" TEXT,
    "course" VARCHAR(150),
    "role" VARCHAR(150),
    "company" VARCHAR(150),
    "rating" INTEGER NOT NULL DEFAULT 5,
    "review" TEXT NOT NULL,
    "is_video" BOOLEAN NOT NULL DEFAULT true,
    "video_url" TEXT,
    "video_thumbnail" TEXT,
    "student_story" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_by_id" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_reviews" (
    "id" UUID NOT NULL,
    "student_name" VARCHAR(200) NOT NULL,
    "photo" TEXT,
    "course" VARCHAR(150),
    "rating" INTEGER NOT NULL DEFAULT 5,
    "review" TEXT NOT NULL,
    "company" VARCHAR(150),
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partners" (
    "id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "logo" TEXT NOT NULL,
    "type" VARCHAR(50) NOT NULL DEFAULT 'HIRING',
    "website_url" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emi_partners" (
    "id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "logo" TEXT NOT NULL,
    "description" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emi_partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faqs" (
    "id" UUID NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_by_id" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_enquiries" (
    "id" UUID NOT NULL,
    "full_name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "subject" VARCHAR(255),
    "message" TEXT NOT NULL,
    "status" "EnquiryStatus" NOT NULL DEFAULT 'NEW',
    "assigned_to" UUID,
    "remarks" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_enquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admission_enquiries" (
    "id" UUID NOT NULL,
    "student_name" VARCHAR(200) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "course_id" UUID,
    "city" VARCHAR(150),
    "qualification" VARCHAR(150),
    "message" TEXT,
    "status" "EnquiryStatus" NOT NULL DEFAULT 'NEW',
    "assigned_to" UUID,
    "remarks" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admission_enquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_openings" (
    "id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "department" VARCHAR(150),
    "location" VARCHAR(150) DEFAULT 'Offline Classroom',
    "job_type" VARCHAR(100) DEFAULT 'Full-Time',
    "description" TEXT NOT NULL,
    "requirements" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_openings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_enquiries" (
    "id" UUID NOT NULL,
    "full_name" VARCHAR(200) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "job_title" VARCHAR(200) NOT NULL,
    "job_opening_id" UUID,
    "resume" TEXT NOT NULL,
    "cover_letter" TEXT,
    "status" "EnquiryStatus" NOT NULL DEFAULT 'NEW',
    "remarks" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "career_enquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "franchise_partner_enquiries" (
    "id" UUID NOT NULL,
    "full_name" VARCHAR(200) NOT NULL,
    "company_name" VARCHAR(255),
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "city" VARCHAR(150),
    "state" VARCHAR(150),
    "investment_capacity" VARCHAR(150),
    "message" TEXT,
    "status" "EnquiryStatus" NOT NULL DEFAULT 'NEW',
    "assigned_to" UUID,
    "remarks" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "franchise_partner_enquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_placement_enquiries" (
    "id" UUID NOT NULL,
    "company_name" VARCHAR(255) NOT NULL,
    "contact_person" VARCHAR(200) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "job_role" VARCHAR(200) NOT NULL,
    "required_skills" TEXT,
    "vacancies" INTEGER DEFAULT 1,
    "job_location" VARCHAR(200),
    "message" TEXT,
    "status" "EnquiryStatus" NOT NULL DEFAULT 'NEW',
    "assigned_to" UUID,
    "remarks" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_placement_enquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_library" (
    "id" UUID NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_type" VARCHAR(50) NOT NULL,
    "file_size" BIGINT NOT NULL,
    "file_url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "folder" VARCHAR(150),
    "alt_text" VARCHAR(255),
    "uploaded_by" UUID,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_library_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "website_settings" (
    "id" UUID NOT NULL,
    "website_name" VARCHAR(255) NOT NULL DEFAULT 'QIMD - Quickup Institute of Marketing & Design',
    "logo" TEXT,
    "favicon" TEXT,
    "contact_email" VARCHAR(255),
    "contact_phone" VARCHAR(20),
    "whatsapp_number" VARCHAR(20),
    "address" TEXT,
    "google_map" TEXT,
    "google_analytics" TEXT,
    "search_console" TEXT,
    "social_links" JSONB,
    "homepage_sections" JSONB,
    "footer_content" JSONB,
    "robots_txt" TEXT,
    "sitemap" TEXT,
    "theme" "Theme" NOT NULL DEFAULT 'LIGHT',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "website_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" UUID NOT NULL,
    "report_name" VARCHAR(200) NOT NULL,
    "report_type" VARCHAR(100) NOT NULL,
    "generated_by" UUID NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "file_path" TEXT NOT NULL,
    "format" "ReportFormat" NOT NULL DEFAULT 'PDF',

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_logs" (
    "id" UUID NOT NULL,
    "recipient" VARCHAR(255) NOT NULL,
    "notification_type" VARCHAR(100) NOT NULL,
    "subject" VARCHAR(255) NOT NULL,
    "delivery_status" "DeliveryStatus" NOT NULL DEFAULT 'SENT',
    "error_message" TEXT,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "module" VARCHAR(150) NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "record_id" UUID,
    "ip_address" VARCHAR(100),
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "web_pages" (
    "id" UUID NOT NULL,
    "page_name" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(150) NOT NULL,
    "page_key" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "meta_title" VARCHAR(255),
    "meta_description" TEXT,
    "canonical_url" TEXT,
    "og_image" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "web_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_sections" (
    "id" UUID NOT NULL,
    "page_id" UUID,
    "page_key" VARCHAR(100) NOT NULL,
    "section_key" VARCHAR(100) NOT NULL,
    "section_type" VARCHAR(100) DEFAULT 'CUSTOM',
    "section_title" VARCHAR(255),
    "subtitle" TEXT,
    "content" TEXT,
    "image" TEXT,
    "button_text" VARCHAR(150),
    "button_url" VARCHAR(255),
    "extra_data" JSONB,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "header_settings" (
    "id" UUID NOT NULL,
    "logo" TEXT,
    "logo_alt_text" VARCHAR(255) DEFAULT 'QIMD Logo',
    "logo_link" VARCHAR(255) DEFAULT '/',
    "logo_active" BOOLEAN NOT NULL DEFAULT true,
    "show_social_links" BOOLEAN NOT NULL DEFAULT true,
    "hire_from_us_text" VARCHAR(150) DEFAULT 'Hire From Us',
    "hire_from_us_url" VARCHAR(255) DEFAULT '/hire-from-us',
    "hire_from_us_new_tab" BOOLEAN NOT NULL DEFAULT false,
    "hire_from_us_active" BOOLEAN NOT NULL DEFAULT true,
    "enquire_now_text" VARCHAR(150) DEFAULT 'Enquire Now',
    "enquire_now_url" VARCHAR(255) DEFAULT '/contact',
    "enquire_now_new_tab" BOOLEAN NOT NULL DEFAULT false,
    "enquire_now_active" BOOLEAN NOT NULL DEFAULT true,
    "whatsapp_text" VARCHAR(150) DEFAULT 'WhatsApp',
    "whatsapp_number" VARCHAR(50),
    "whatsapp_active" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "header_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "header_contact_items" (
    "id" UUID NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "label" VARCHAR(150) NOT NULL,
    "value" VARCHAR(255) NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "header_contact_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "footer_settings" (
    "id" UUID NOT NULL,
    "logo" TEXT,
    "logo_alt_text" VARCHAR(255) DEFAULT 'QIMD Footer Logo',
    "logo_link" VARCHAR(255) DEFAULT '/',
    "logo_active" BOOLEAN NOT NULL DEFAULT true,
    "show_social_icons" BOOLEAN NOT NULL DEFAULT true,
    "address_label" VARCHAR(150) DEFAULT 'Physical Institute Address',
    "fullAddress" TEXT,
    "google_maps_url" TEXT,
    "address_active" BOOLEAN NOT NULL DEFAULT true,
    "whatsapp_text" VARCHAR(150) DEFAULT 'Chat with Us on WhatsApp',
    "whatsapp_number" VARCHAR(50),
    "whatsapp_active" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "footer_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "footer_contact_items" (
    "id" UUID NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "label" VARCHAR(150) NOT NULL,
    "value" VARCHAR(255) NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "footer_contact_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "footer_columns" (
    "id" UUID NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "icon" VARCHAR(100),
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "footer_columns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "footer_column_links" (
    "id" UUID NOT NULL,
    "column_id" UUID NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "url" VARCHAR(255) NOT NULL,
    "link_type" VARCHAR(50) NOT NULL DEFAULT 'INTERNAL',
    "open_in_new_tab" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "footer_column_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_role_name_key" ON "roles"("role_name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_id_idx" ON "users"("role_id");

-- CreateIndex
CREATE INDEX "users_status_is_deleted_idx" ON "users"("status", "is_deleted");

-- CreateIndex
CREATE UNIQUE INDEX "course_categories_slug_key" ON "course_categories"("slug");

-- CreateIndex
CREATE INDEX "course_categories_slug_idx" ON "course_categories"("slug");

-- CreateIndex
CREATE INDEX "course_categories_status_is_deleted_idx" ON "course_categories"("status", "is_deleted");

-- CreateIndex
CREATE INDEX "trainers_is_active_is_deleted_idx" ON "trainers"("is_active", "is_deleted");

-- CreateIndex
CREATE INDEX "trainers_featured_idx" ON "trainers"("featured");

-- CreateIndex
CREATE INDEX "teams_is_active_is_deleted_idx" ON "teams"("is_active", "is_deleted");

-- CreateIndex
CREATE INDEX "teams_featured_idx" ON "teams"("featured");

-- CreateIndex
CREATE UNIQUE INDEX "courses_slug_key" ON "courses"("slug");

-- CreateIndex
CREATE INDEX "courses_slug_idx" ON "courses"("slug");

-- CreateIndex
CREATE INDEX "courses_category_id_idx" ON "courses"("category_id");

-- CreateIndex
CREATE INDEX "courses_trainer_id_idx" ON "courses"("trainer_id");

-- CreateIndex
CREATE INDEX "courses_status_is_active_is_deleted_idx" ON "courses"("status", "is_active", "is_deleted");

-- CreateIndex
CREATE INDEX "courses_featured_idx" ON "courses"("featured");

-- CreateIndex
CREATE UNIQUE INDEX "blogs_slug_key" ON "blogs"("slug");

-- CreateIndex
CREATE INDEX "blogs_slug_idx" ON "blogs"("slug");

-- CreateIndex
CREATE INDEX "blogs_author_id_idx" ON "blogs"("author_id");

-- CreateIndex
CREATE INDEX "blogs_status_is_active_is_deleted_idx" ON "blogs"("status", "is_active", "is_deleted");

-- CreateIndex
CREATE INDEX "blogs_featured_idx" ON "blogs"("featured");

-- CreateIndex
CREATE INDEX "placements_course_id_idx" ON "placements"("course_id");

-- CreateIndex
CREATE INDEX "placements_is_active_is_deleted_idx" ON "placements"("is_active", "is_deleted");

-- CreateIndex
CREATE INDEX "placements_featured_idx" ON "placements"("featured");

-- CreateIndex
CREATE INDEX "gallery_album_idx" ON "gallery"("album");

-- CreateIndex
CREATE INDEX "gallery_category_idx" ON "gallery"("category");

-- CreateIndex
CREATE INDEX "gallery_media_type_idx" ON "gallery"("media_type");

-- CreateIndex
CREATE INDEX "gallery_is_deleted_idx" ON "gallery"("is_deleted");

-- CreateIndex
CREATE INDEX "gallery_featured_idx" ON "gallery"("featured");

-- CreateIndex
CREATE INDEX "testimonials_is_active_is_deleted_idx" ON "testimonials"("is_active", "is_deleted");

-- CreateIndex
CREATE INDEX "testimonials_featured_idx" ON "testimonials"("featured");

-- CreateIndex
CREATE INDEX "student_reviews_is_active_is_deleted_idx" ON "student_reviews"("is_active", "is_deleted");

-- CreateIndex
CREATE INDEX "partners_type_is_active_is_deleted_idx" ON "partners"("type", "is_active", "is_deleted");

-- CreateIndex
CREATE INDEX "emi_partners_is_active_is_deleted_idx" ON "emi_partners"("is_active", "is_deleted");

-- CreateIndex
CREATE INDEX "faqs_is_active_is_deleted_idx" ON "faqs"("is_active", "is_deleted");

-- CreateIndex
CREATE INDEX "contact_enquiries_status_is_deleted_idx" ON "contact_enquiries"("status", "is_deleted");

-- CreateIndex
CREATE INDEX "contact_enquiries_assigned_to_idx" ON "contact_enquiries"("assigned_to");

-- CreateIndex
CREATE INDEX "admission_enquiries_status_is_deleted_idx" ON "admission_enquiries"("status", "is_deleted");

-- CreateIndex
CREATE INDEX "admission_enquiries_course_id_idx" ON "admission_enquiries"("course_id");

-- CreateIndex
CREATE INDEX "admission_enquiries_assigned_to_idx" ON "admission_enquiries"("assigned_to");

-- CreateIndex
CREATE INDEX "job_openings_status_is_active_is_deleted_idx" ON "job_openings"("status", "is_active", "is_deleted");

-- CreateIndex
CREATE INDEX "career_enquiries_status_is_deleted_idx" ON "career_enquiries"("status", "is_deleted");

-- CreateIndex
CREATE INDEX "career_enquiries_job_opening_id_idx" ON "career_enquiries"("job_opening_id");

-- CreateIndex
CREATE INDEX "franchise_partner_enquiries_status_is_deleted_idx" ON "franchise_partner_enquiries"("status", "is_deleted");

-- CreateIndex
CREATE INDEX "franchise_partner_enquiries_assigned_to_idx" ON "franchise_partner_enquiries"("assigned_to");

-- CreateIndex
CREATE INDEX "company_placement_enquiries_status_is_deleted_idx" ON "company_placement_enquiries"("status", "is_deleted");

-- CreateIndex
CREATE INDEX "company_placement_enquiries_assigned_to_idx" ON "company_placement_enquiries"("assigned_to");

-- CreateIndex
CREATE INDEX "media_library_uploaded_by_idx" ON "media_library"("uploaded_by");

-- CreateIndex
CREATE INDEX "media_library_file_type_idx" ON "media_library"("file_type");

-- CreateIndex
CREATE INDEX "media_library_folder_idx" ON "media_library"("folder");

-- CreateIndex
CREATE INDEX "media_library_is_deleted_idx" ON "media_library"("is_deleted");

-- CreateIndex
CREATE INDEX "reports_generated_by_idx" ON "reports"("generated_by");

-- CreateIndex
CREATE INDEX "notification_logs_delivery_status_idx" ON "notification_logs"("delivery_status");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_module_idx" ON "audit_logs"("module");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "web_pages_slug_key" ON "web_pages"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "web_pages_page_key_key" ON "web_pages"("page_key");

-- CreateIndex
CREATE INDEX "web_pages_slug_idx" ON "web_pages"("slug");

-- CreateIndex
CREATE INDEX "web_pages_page_key_idx" ON "web_pages"("page_key");

-- CreateIndex
CREATE INDEX "web_pages_status_is_deleted_idx" ON "web_pages"("status", "is_deleted");

-- CreateIndex
CREATE INDEX "page_sections_page_key_section_key_idx" ON "page_sections"("page_key", "section_key");

-- CreateIndex
CREATE INDEX "page_sections_page_key_is_active_is_deleted_idx" ON "page_sections"("page_key", "is_active", "is_deleted");

-- CreateIndex
CREATE INDEX "page_sections_page_id_idx" ON "page_sections"("page_id");

-- CreateIndex
CREATE INDEX "header_contact_items_type_is_active_idx" ON "header_contact_items"("type", "is_active");

-- CreateIndex
CREATE INDEX "footer_contact_items_type_is_active_idx" ON "footer_contact_items"("type", "is_active");

-- CreateIndex
CREATE INDEX "footer_columns_display_order_idx" ON "footer_columns"("display_order");

-- CreateIndex
CREATE INDEX "footer_columns_is_active_idx" ON "footer_columns"("is_active");

-- CreateIndex
CREATE INDEX "footer_column_links_column_id_idx" ON "footer_column_links"("column_id");

-- CreateIndex
CREATE INDEX "footer_column_links_display_order_idx" ON "footer_column_links"("display_order");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "course_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "trainers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placements" ADD CONSTRAINT "placements_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gallery" ADD CONSTRAINT "gallery_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faqs" ADD CONSTRAINT "faqs_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_enquiries" ADD CONSTRAINT "contact_enquiries_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admission_enquiries" ADD CONSTRAINT "admission_enquiries_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admission_enquiries" ADD CONSTRAINT "admission_enquiries_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_enquiries" ADD CONSTRAINT "career_enquiries_job_opening_id_fkey" FOREIGN KEY ("job_opening_id") REFERENCES "job_openings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "franchise_partner_enquiries" ADD CONSTRAINT "franchise_partner_enquiries_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_placement_enquiries" ADD CONSTRAINT "company_placement_enquiries_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_library" ADD CONSTRAINT "media_library_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_generated_by_fkey" FOREIGN KEY ("generated_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_sections" ADD CONSTRAINT "page_sections_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "web_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "footer_column_links" ADD CONSTRAINT "footer_column_links_column_id_fkey" FOREIGN KEY ("column_id") REFERENCES "footer_columns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

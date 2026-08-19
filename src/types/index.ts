// ============================================================
// QIMD Institute – Centralized TypeScript Type Definitions
// All types mirror future database models for CMS/CRM readiness
// ============================================================

// ─── Navigation ─────────────────────────────────────────────
export interface SubmenuItem {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  href: string;
  submenu?: SubmenuItem[];
}

// ─── Course ─────────────────────────────────────────────────
export interface CourseTopic {
  title: string;
  subtopics?: string[];
}

export interface CourseModule {
  moduleNumber: number;
  title: string;
  topics: CourseTopic[];
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  shortTitle?: string;
  tagline?: string;
  description: string;
  duration: string;
  mode: string;
  fee?: string;
  badge?: string;
  highlights?: string[];
  learningOutcomes?: string[];
  outcomes?: string[];
  curriculum?: CourseModule[];
  icon?: string;
  image?: string;
  brochureUrl?: string;
  featured?: boolean;
}

// ─── Trainer ────────────────────────────────────────────────
export interface Trainer {
  id: string;
  slug: string;
  name: string;
  role: string;
  specialization: string;
  bio: string;
  image: string;
  socialLinks?: {
    linkedin?: string;
    instagram?: string;
    twitter?: string;
  };
  yearsOfExperience?: number;
}

// ─── Testimonial ────────────────────────────────────────────
export interface Testimonial {
  id: string;
  studentName: string;
  heading?: string | null;
  courseTaken: string;
  review: string;
  rating: number;
  image: string;
  role?: string | null;
  company?: string | null;
  placedAt?: string | null;
  isVideo?: boolean;
  videoUrl?: string | null;
  videoThumbnail?: string | null;
  studentStory?: string | null;
  isFeatured?: boolean;
}

// ─── Placement ──────────────────────────────────────────────
export interface PlacedStudent {
  id: string;
  name: string;
  image?: string;
  isVideo?: boolean;
  videoUrl?: string;
  videoThumbnail?: string;
  course: string;
  company: string;
  role: string;
  package?: string;
  companyLogo?: string;
  testimonial?: string;
  isVerified?: boolean;
  location?: string;
  joiningYear?: string;
  shortSuccessStory?: string;
}

export interface PlacementPartner {
  id: string;
  name: string;
  logo: string;
  website?: string;
}

// ─── Gallery ────────────────────────────────────────────────
export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  category: string;
  caption?: string;
}

// ─── Blog ───────────────────────────────────────────────────
export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  coverImage: string;
  images?: string[]; // Multiple images/gallery support
  author: string;
  authorImage?: string;
  publishedAt: string;
  category: string;
  tags: string[];
  readTime?: string;
}

// ─── Event ──────────────────────────────────────────────────
export interface Event {
  id: string;
  slug: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  venue: string;
  image: string;
  type: string;
  registrationUrl?: string;
  isFree: boolean;
}

// ─── FAQ ────────────────────────────────────────────────────
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

// ─── Form ───────────────────────────────────────────────────
export interface EnquiryFormData {
  name: string;
  phone: string;
  email: string;
  location: string;
  courseInterest: string;
  message?: string;
  subject?: string;
}

export interface BrochureFormData {
  name: string;
  phone: string;
  email: string;
}

// ─── Contact ────────────────────────────────────────────────
export interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  mapEmbedUrl?: string;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
    linkedin?: string;
    twitter?: string;
    whatsapp?: string;
  };
}

// ─── Stat / Counter ─────────────────────────────────────────
export interface StatItem {
  value: string;
  label: string;
  icon?: string;
}

// ─── Feature ────────────────────────────────────────────────
export interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

// ─── Job Opening ────────────────────────────────────────────
export interface JobOpening {
  id: string;
  title: string;
  department: string;
  type: string;
  location: string;
  description: string;
  requirements: string[];
  postedAt: string;
}

// ─── SEO ────────────────────────────────────────────────────
export interface SeoMeta {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  canonical?: string;
}

// ─── Breadcrumb ─────────────────────────────────────────────
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

// ─── EMI Partner ────────────────────────────────────────────
export interface EmiPartner {
  id: string;
  name: string;
  logo: string;
  website?: string;
}

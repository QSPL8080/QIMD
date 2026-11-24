import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const userSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  phone: z.string().optional().nullable(),
  role: z.enum([
    'SUPER_ADMIN',
    'ADMIN',
    'SALES_MANAGER',
    'COUNSELLOR',
    'ADMISSION_HEAD',
    'SEO_MANAGER',
    'VIEWER',
    'SEO',
    'LEAD_MANAGER',
  ]).default('ADMIN'),
  status: z.boolean().default(true),
})

export const jobOpeningSchema = z.object({
  title: z.string().min(3, 'Job title is required'),
  department: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  jobType: z.string().optional().nullable(),
  description: z.string().min(10, 'Job description is required'),
  requirements: z.string().optional().nullable(),
  displayOrder: z.number().int().default(0),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('PUBLISHED'),
  isActive: z.boolean().default(true),
})

export const contactEnquirySchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(5, 'Valid phone number is required').max(20, 'Phone number too long'),
  subject: z.string().optional(),
  message: z.string().min(5, 'Message must be at least 5 characters'),
})

export const admissionEnquirySchema = z.object({
  studentName: z.string().min(2, 'Student name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(5, 'Valid phone number is required').max(20, 'Phone number too long'),
  courseId: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  qualification: z.string().optional().nullable(),
  message: z.string().optional().nullable(),
})

export const careerApplicationSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(5, 'Valid phone number is required').max(20, 'Phone number too long'),
  jobTitle: z.string().min(2, 'Job title is required'),
  jobOpeningId: z.string().uuid().optional().nullable(),
  resume: z.string().min(1, 'Resume file is required'),
  coverLetter: z.string().optional().nullable(),
})

export const franchiseEnquirySchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  companyName: z.string().optional().nullable(),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(5, 'Valid phone number is required').max(20, 'Phone number too long'),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  investmentCapacity: z.string().optional().nullable(),
  message: z.string().optional().nullable(),
})

export const hireRequestSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  contactPerson: z.string().min(2, 'Contact person name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(5, 'Valid phone number is required').max(20, 'Phone number too long'),
  jobRole: z.string().min(2, 'Job role is required'),
  requiredSkills: z.string().optional().nullable(),
  vacancies: z.number().int().positive().optional().default(1),
  jobLocation: z.string().optional().nullable(),
  message: z.string().optional().nullable(),
})

export const blogSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  slug: z.string().min(2, 'Slug is required'),
  category: z.string().optional().nullable(),
  featuredImage: z.string().optional().nullable(),
  images: z.array(z.string()).optional().nullable(),
  author: z.string().optional().nullable(),
  readingTime: z.number().int().default(5),
  content: z.string().min(10, 'Blog content is required'),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  canonicalUrl: z.string().optional().nullable(),
  featured: z.boolean().default(false),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('PUBLISHED'),
  isActive: z.boolean().default(true),
})

export const placementSchema = z.object({
  studentName: z.string().min(2, 'Student name is required'),
  studentPhoto: z.string().optional().nullable(),
  companyName: z.string().min(2, 'Company name is required'),
  companyLogo: z.string().optional().nullable(),
  package: z.string().optional().nullable(),
  designation: z.string().optional().nullable(),
  courseName: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  joiningYear: z.string().optional().nullable(),
  isVideo: z.boolean().default(false),
  videoUrl: z.string().optional().nullable(),
  videoThumbnail: z.string().optional().nullable(),
  successStory: z.string().optional().nullable(),
  featured: z.boolean().default(false),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
})

export const testimonialSchema = z.object({
  studentName: z.string().min(2, 'Student name is required'),
  heading: z.string().optional().nullable(),
  photo: z.string().optional().nullable(),
  course: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  rating: z.number().int().min(1).max(5).default(5),
  review: z.string().min(5, 'Review text is required'),
  videoUrl: z.string().optional().nullable(),
  isVideo: z.boolean().default(false),
  featured: z.boolean().default(false),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
})

export const faqSchema = z.object({
  question: z.string().min(3, 'Question is required'),
  answer: z.string().min(3, 'Answer is required'),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
})


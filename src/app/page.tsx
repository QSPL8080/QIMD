import type { Metadata } from "next";

export const dynamic = 'force-dynamic'
export const revalidate = 0
import HeroSection from "@/components/Home/Hero";
import CoursesSection from "@/components/Home/Courses";
import WhyQimdSection from "@/components/Home/WhyQimd";
import TestimonialsSection from "@/components/Home/Testimonial";
import PlacementsSection from "@/components/Home/Placements";
import GalleryPreviewSection from "@/components/Home/Gallery";
import EmiSection from "@/components/Home/Emi";
import CareerCounsellingCTA from "@/components/Home/CareerCounselling";
import FaqsSection from "@/components/Home/Faqs";
import { siteConfig } from "@/data";
import {
  getDynamicCourses,
  getDynamicPageSections,
  getDynamicPlacements,
  getDynamicTestimonials,
  getDynamicHiringPartners,
  getDynamicEmiPartners,
  getDynamicGallery,
} from "@/lib/getDynamicData";

export const metadata: Metadata = {
  title: "AI-Powered Digital Marketing, Graphic Design & Video Editing Courses in Pune | QIMD",
  description: siteConfig.description,
  alternates: {
    canonical: "https://www.qimd.in",
  },
  openGraph: {
    title: "AI-Powered Digital Marketing, Graphic Design & Video Editing Courses in Pune | QIMD",
    description: siteConfig.description,
    url: "https://www.qimd.in",
    images: [{ url: "/images/logo/qimd-logo.png" }],
  },
};

export default async function HomePage() {
  const courses = await getDynamicCourses();
  const sections = await getDynamicPageSections("HOME");
  const placements = await getDynamicPlacements();
  const testimonials = await getDynamicTestimonials();
  const hiringPartners = await getDynamicHiringPartners();
  const emiPartners = await getDynamicEmiPartners();
  const galleryItems = await getDynamicGallery();

  const isEnabled = (key: string) => {
    if (!sections || !sections[key]) return true;
    return sections[key].isActive !== false && sections[key].status !== 'DRAFT';
  };

  return (
    <>
      {isEnabled("HERO") && <HeroSection section={sections?.HERO} />}
      {isEnabled("COURSES") && <CoursesSection courses={courses} />}
      {isEnabled("WHY_QIMD") && <WhyQimdSection />}
      {isEnabled("TESTIMONIALS") && <TestimonialsSection testimonials={testimonials} />}
      {isEnabled("PLACEMENT") && <PlacementsSection testimonials={testimonials} partners={hiringPartners} />}
      {isEnabled("EMI_PARTNERS") && <EmiSection emiPartners={emiPartners} />}
      {isEnabled("GALLERY") && <GalleryPreviewSection items={galleryItems} />}
      {isEnabled("ENQUIRY_FORM") && <CareerCounsellingCTA />}
      {isEnabled("FAQ") && <FaqsSection limit={10} />}
    </>
  );
}

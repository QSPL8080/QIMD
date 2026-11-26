import type { Metadata } from "next";

export const dynamic = 'force-dynamic'
export const revalidate = 0
import HeroSection from "@/components/Home/Hero";
import CoursesSection from "@/components/Home/Courses";
import WhyQimdSection from "@/components/Home/WhyQimd";
import TestimonialsSection from "@/components/Home/Testimonial";
import PlacementsSection from "@/components/Home/Placements";
import GalleryPreviewSection from "@/components/Home/Gallery";
import { getSetting, orderGalleryCategories } from "@/lib/settings";
import EmiSection from "@/components/Home/Emi";
import CareerCounsellingCTA from "@/components/Home/CareerCounselling";
import FaqsSection from "@/components/Home/Faqs";
import { siteConfig, coursesData, placementPartnersData, emiPartnersData } from "@/data";
import {
  getDynamicPlacements,
  getDynamicTestimonials,
  getDynamicGallery,
  getDynamicFaqs,
  getDynamicStudentReviews,
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
  const placements = await getDynamicPlacements();
  const testimonials = await getDynamicTestimonials();
  const galleryItems = await getDynamicGallery();
  const galleryCats = orderGalleryCategories(await getSetting('galleryCategories'), galleryItems.map((g: any) => g.category));
  const faqs = await getDynamicFaqs();
  const studentReviews = await getDynamicStudentReviews();

  return (
    <>
      <HeroSection />
      <CoursesSection courses={coursesData} />
      <WhyQimdSection />
      <TestimonialsSection testimonials={testimonials} />
      <PlacementsSection
        testimonials={testimonials}
        partners={placementPartnersData}
        studentReviews={studentReviews}
      />
      <EmiSection emiPartners={emiPartnersData} />
      <GalleryPreviewSection items={galleryItems} categories={galleryCats} />
      <CareerCounsellingCTA />
      <FaqsSection limit={10} items={faqs} />
    </>
  );
}

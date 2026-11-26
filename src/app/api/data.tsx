// ============================================================
// DEPRECATED: Use @/data instead
// This file is kept for backward compatibility only
// ============================================================

export {
  footerLinks as footerLinksLegacy,
  siteConfig,
  coursesData,
  testimonialsData,
} from "@/data";

// Legacy footer links format
export const footerLinks = [
  { link: "AI Digital Marketing Course", href: "/courses/ai-digital-marketing" },
  { link: "AI Graphic Design Course", href: "/courses/ai-graphic-design" },
  { link: "AI Video Editing Course", href: "/courses/ai-video-editing" },
  { link: "About Us", href: "/about" },
  { link: "Trainers", href: "/trainers" },
  { link: "Placements", href: "/placements" },
  { link: "Gallery", href: "/gallery" },
  { link: "Blog", href: "/blog" },
  { link: "Contact", href: "/contact" },
  { link: "FAQs", href: "/faqs" },
];

export const Reviews = [
  {
    clientImg: "/images/testimonials/student-1.jpg",
    clientName: "Aisha Sharma",
    review: "QIMD transformed my career! The practical training and placement support helped me land my dream job.",
    post: "Digital Marketing Executive",
  },
  {
    clientImg: "/images/testimonials/student-2.jpg",
    clientName: "Rahul Deshmukh",
    review: "The graphic design course at QIMD is outstanding. Real industry professionals teaching real skills.",
    post: "Graphic Designer",
  },
  {
    clientImg: "/images/testimonials/student-3.jpg",
    clientName: "Priya Joshi",
    review: "Zero experience to professional video editor in 6 months. QIMD's support is incredible.",
    post: "Video Editor",
  },
  {
    clientImg: "/images/testimonials/student-4.jpg",
    clientName: "Arjun Patil",
    review: "The placement team was always there to guide me. Best decision I made for my career.",
    post: "SEO Specialist",
  },
];

export const CauseData = [
  {
    id: 1,
    title: "AI-Powered Digital Marketing Workshop",
    slug: "ai-powered-digital-marketing-workshop",
    image: "/images/programs/digital-marketing-poster.jpg",
    raised: 150,
    goal: 200,
    detail: "Master modern AI tools for digital marketing, SEO, social media and analytics.",
    category: "Marketing",
    location: "QIMD Pune Campus",
    date: "Aug 15, 2026",
  },
  {
    id: 2,
    title: "Graphic Design Masterclass",
    slug: "graphic-design-masterclass",
    image: "/images/programs/graphic-design-poster.jpg",
    raised: 180,
    goal: 200,
    detail: "Learn Photoshop, Illustrator, Figma, and AI design tools from industry experts.",
    category: "Design",
    location: "QIMD Pune Campus",
    date: "Aug 20, 2026",
  },
];

export const Eventdata = [
  {
    id: 1,
    title: "Annual Design & AI Conference 2026",
    slug: "annual-design-ai-conference-2026",
    image: "/images/programs/graphic-design-poster.jpg",
    detail: "Explore the future of creative technology and design with industry experts.",
    category: "Conference",
    location: "Pune, MH",
    date: "Sep 10, 2026",
    duration: "Full Day",
    type: "Offline",
    entrants: "50",
  },
];

export const helpdata = [
  {
    icon: "/images/programs/digital-marketing-poster.jpg",
    title: "Practical Training",
    text: "Learn through hands-on live projects using real industry workflows and modern AI tools.",
  },
  {
    icon: "/images/programs/graphic-design-poster.jpg",
    title: "100% Placement Support",
    text: "Dedicated placement cell offering interview preparation, resume assistance, and job leads.",
  },
  {
    icon: "/images/programs/video-editing-poster.jpg",
    title: "Expert Instructors",
    text: "Guidance from experienced industry professionals focused on practical skills.",
  },
];


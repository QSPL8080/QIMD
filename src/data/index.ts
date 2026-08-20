// ============================================================
// QIMD Institute – Centralized Content Data
// All content sourced from website info.docx
// Replace static data with API calls in the future without
// changing any UI components
// ============================================================

import type {
  NavItem,
  Course,
  Trainer,
  Testimonial,
  PlacedStudent,
  PlacementPartner,
  GalleryImage,
  BlogPost,
  FAQ,
  ContactInfo,
  StatItem,
  FeatureItem,
  JobOpening,
  EmiPartner,
  Event,
} from "@/types";

// ─── Site Configuration ──────────────────────────────────────
export const siteConfig = {
  name: "QIMD Institute",
  fullName: "Quality Institute of Modern Design",
  tagline: "India's First Industry-Oriented & AI Powered Marketing & Design Institute",
  description:
    "Join QIMD's AI-Powered & Performance-Driven Practical Training Program in Digital Marketing, Graphic Design & Video Editing with 100% Job Assistance & Placement Opportunities. Offline Learning Only.",
  phone: "+91 90000 00000",
  email: "info@qimd.in",
  address: "Hinjewadi, Pune, Maharashtra, India",
  whatsapp: "+910000000000",
  socialLinks: {
    instagram: "https://instagram.com/qimdinstitute",
    facebook: "https://facebook.com/qimdinstitute",
    youtube: "https://youtube.com/@qimdinstitute",
    linkedin: "https://linkedin.com/company/qimdinstitute",
    twitter: "https://twitter.com/qimdinstitute",
    whatsapp: "https://wa.me/910000000000",
  },
  logoLight: "/images/logo/qimd-logo.png",
  logoDark: "/images/logo/qimd-logo.png",
  logoIcon: "/images/logo/qimd-logo.png",
} as const;

// ─── Navigation ─────────────────────────────────────────────
export const headerData: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Courses",
    href: "/courses",
    submenu: [
      { label: "AI Powered Digital Marketing Course", href: "/courses/ai-digital-marketing" },
      { label: "AI Powered Graphic Design Course", href: "/courses/ai-graphic-design" },
      { label: "AI Powered Video Editing Course", href: "/courses/ai-video-editing" },
    ],
  },
  {
    label: "About Us",
    href: "/about",
    submenu: [
      { label: "Our Team", href: "/about/our-team" },
      { label: "Our Trainers", href: "/trainers" },
    ],
  },
  {
    label: "Why QIMD?",
    href: "/why-qimd",
    submenu: [
      { label: "Success Stories", href: "/success-stories" },
      { label: "Our Placements", href: "/placements" },
      { label: "Reviews & Testimonials", href: "/reviews-testimonials" },
      { label: "Life at QIMD", href: "/gallery" },
    ],
  },
  { label: "Blogs", href: "/blog" },
  {
    label: "Career",
    href: "#",
    submenu: [
      { label: "Current Openings", href: "/careers" },
      { label: "Hire From QIMD", href: "/hire-from-us" },
      { label: "QIMD Franchise", href: "/qimd-franchise" },
    ],
  },
  { label: "Contact Us", href: "/contact" },
];

// ─── Footer Links ────────────────────────────────────────────
export const footerLinks = {
  popularCourses: [
    { label: "AI Digital Marketing Course", href: "/courses/ai-digital-marketing" },
    { label: "AI Graphic Design Course", href: "/courses/ai-graphic-design" },
    { label: "AI Video Editing Course", href: "/courses/ai-video-editing" },
  ],
  quickLinks: [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "Our Trainers", href: "/trainers" },
    { label: "Placements", href: "/placements" },
    { label: "Gallery", href: "/gallery" },
    { label: "Blogs", href: "/blog" },
    { label: "Contact Us", href: "/contact" },
    { label: "Admission Information", href: "/admission" },
    { label: "FAQs", href: "/faqs" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms & Conditions", href: "/terms-and-conditions" },
    { label: "Refund Policy", href: "/refund-policy" },
    { label: "Sitemap", href: "/sitemap" },
  ],
};

// ─── Contact Info ────────────────────────────────────────────
export const contactInfo: ContactInfo = {
  phone: "+91 90000 00000",
  email: "info@qimd.in",
  address: "Hinjewadi, Pune, Maharashtra, India",
  socialLinks: {
    instagram: "https://instagram.com/qimdinstitute",
    facebook: "https://facebook.com/qimdinstitute",
    youtube: "https://youtube.com/@qimdinstitute",
    linkedin: "https://linkedin.com/company/qimdinstitute",
    twitter: "https://twitter.com/qimdinstitute",
    whatsapp: "https://wa.me/910000000000",
  },
};

// ─── Stats / Counters ────────────────────────────────────────
export const statsData: StatItem[] = [
  { value: "10000+", label: "Candidates Trained", icon: "mdi:account-group" },
  { value: "100%", label: "Live Project-Based Learning", icon: "mdi:laptop" },
  { value: "100%", label: "Job Assistance & Placement", icon: "mdi:briefcase-check" },
  { value: "100%", label: "Internship Opportunity", icon: "mdi:school" },
];

// ─── Why QIMD Features ───────────────────────────────────────
export const whyQimdFeatures: FeatureItem[] = [
  {
    icon: "mdi:book-open-page-variant",
    title: "100% Practical Learning",
    description: "Hands-on training with real-world projects and live client work from day one.",
  },
  {
    icon: "mdi:certificate",
    title: "Industry Certifications",
    description: "Earn recognized certifications that boost your professional profile and career prospects.",
  },
  {
    icon: "mdi:rocket-launch",
    title: "Entrepreneurship Development",
    description: "Learn to build your own freelance career or start your own agency.",
  },
  {
    icon: "mdi:lifebuoy",
    title: "Lifetime Support",
    description: "Get continuous guidance and support from our mentors even after course completion.",
  },
  {
    icon: "mdi:refresh",
    title: "2 Years Repeat Batch Access",
    description: "Revisit and revise any topic by attending batches for up to 2 years.",
  },
  {
    icon: "mdi:book-multiple",
    title: "Study Material",
    description: "Comprehensive and up-to-date study material covering all course topics.",
  },
  {
    icon: "mdi:account-star",
    title: "Expert Trainers",
    description: "Learn from experienced industry professionals who work on real client projects.",
  },
  {
    icon: "mdi:clipboard-list",
    title: "Live Projects",
    description: "Work on actual client projects and case studies to build a strong portfolio.",
  },
  {
    icon: "mdi:domain",
    title: "100% Internship Opportunity",
    description: "Gain real industry experience through our guaranteed internship program.",
  },
  {
    icon: "mdi:account-tie",
    title: "Interview Preparation",
    description: "Mock interviews, resume building, and dedicated coaching to crack your dream job.",
  },
  {
    icon: "mdi:handshake",
    title: "Placement Opportunities",
    description: "Connect with our network of hiring partners for placement and career opportunities.",
  },
];

// ─── Courses ─────────────────────────────────────────────────
export const coursesData: Course[] = [
  {
    id: "course-001",
    slug: "ai-digital-marketing",
    title: "AI Powered Digital Marketing Course",
    shortTitle: "Digital Marketing",
    tagline: "Master Digital Marketing with AI Tools",
    description:
      "Industry-oriented AI-powered digital marketing training covering SEO, Social Media Marketing, Google Ads, Meta Ads, Email Marketing, Content Marketing, and more. Learn with live client projects and AI tools.",
    duration: "6 Months",
    mode: "Offline Course",
    highlights: [
      "Live Client Projects",
      "AI-Powered Tools & Workflows",
      "100% Practical Learning",
      "Internship Opportunity",
      "100% Job Assistance",
      "Placement Opportunities",
    ],
    outcomes: [
      "Run successful digital marketing campaigns",
      "Master Google Ads & Meta Ads",
      "Use AI tools in marketing workflows",
      "Build a professional portfolio",
      "Get industry-recognized certification",
    ],
    curriculum: [
      {
        moduleNumber: 1,
        title: "Digital Marketing Fundamentals",
        topics: [
          { title: "Introduction to Digital Marketing" },
          { title: "Marketing Strategy & Planning" },
          { title: "Understanding Target Audience" },
        ],
      },
      {
        moduleNumber: 2,
        title: "Search Engine Optimization (SEO)",
        topics: [
          { title: "On-Page SEO" },
          { title: "Off-Page SEO & Link Building" },
          { title: "Technical SEO" },
          { title: "Local SEO" },
        ],
      },
      {
        moduleNumber: 3,
        title: "Social Media Marketing",
        topics: [
          { title: "Instagram Marketing" },
          { title: "Facebook Marketing" },
          { title: "LinkedIn Marketing" },
          { title: "YouTube Marketing" },
        ],
      },
      {
        moduleNumber: 4,
        title: "Paid Advertising",
        topics: [
          { title: "Google Ads (Search, Display, Shopping)" },
          { title: "Meta Ads (Facebook & Instagram)" },
          { title: "Campaign Optimization" },
        ],
      },
      {
        moduleNumber: 5,
        title: "Content & Email Marketing",
        topics: [
          { title: "Content Marketing Strategy" },
          { title: "Email Marketing & Automation" },
          { title: "Copywriting Fundamentals" },
        ],
      },
      {
        moduleNumber: 6,
        title: "AI Tools & Advanced Topics",
        topics: [
          { title: "AI Tools for Marketing" },
          { title: "Analytics & Data-Driven Marketing" },
          { title: "Freelancing & Agency Setup" },
        ],
      },
    ],
    icon: "mdi:chart-line",
    image: "/images/courses/digital-marketing.jpg",
    featured: true,
  },
  {
    id: "course-002",
    slug: "ai-graphic-design",
    title: "AI Powered Graphic Design Course",
    shortTitle: "Graphic Design",
    tagline: "Design with AI – Create Without Limits",
    description:
      "Comprehensive graphic design training using industry-leading tools like Adobe Photoshop, Illustrator, InDesign, Canva, and AI-powered design tools. Build a stunning portfolio with live project experience.",
    duration: "6 Months",
    mode: "Offline Course",
    highlights: [
      "Live Client Projects",
      "AI Design Tools (Adobe Firefly, Midjourney)",
      "Adobe Creative Suite",
      "100% Practical Learning",
      "Internship Opportunity",
      "100% Job Assistance",
    ],
    outcomes: [
      "Create professional brand identities",
      "Design marketing materials and social media creatives",
      "Use AI tools for design workflow",
      "Build a strong design portfolio",
      "Work as a freelance or agency designer",
    ],
    curriculum: [
      {
        moduleNumber: 1,
        title: "Design Fundamentals",
        topics: [
          { title: "Principles of Design" },
          { title: "Typography & Color Theory" },
          { title: "Layout & Composition" },
        ],
      },
      {
        moduleNumber: 2,
        title: "Adobe Photoshop",
        topics: [
          { title: "Photo Editing & Retouching" },
          { title: "Digital Illustrations" },
          { title: "Social Media Creatives" },
        ],
      },
      {
        moduleNumber: 3,
        title: "Adobe Illustrator",
        topics: [
          { title: "Vector Graphics & Logo Design" },
          { title: "Brand Identity Design" },
          { title: "Print & Digital Design" },
        ],
      },
      {
        moduleNumber: 4,
        title: "Canva & Digital Design Tools",
        topics: [
          { title: "Advanced Canva Design" },
          { title: "Marketing Collateral Design" },
          { title: "Presentation Design" },
        ],
      },
      {
        moduleNumber: 5,
        title: "UI/UX Basics",
        topics: [
          { title: "Introduction to UI/UX" },
          { title: "Wireframing & Prototyping" },
          { title: "Figma Basics" },
        ],
      },
      {
        moduleNumber: 6,
        title: "AI Design Tools & Portfolio",
        topics: [
          { title: "AI Tools for Designers" },
          { title: "Portfolio Building" },
          { title: "Freelancing & Client Management" },
        ],
      },
    ],
    icon: "mdi:palette",
    image: "/images/courses/graphic-design.jpg",
    featured: true,
  },
  {
    id: "course-003",
    slug: "ai-video-editing",
    title: "AI Powered Video Editing Course",
    shortTitle: "Video Editing",
    tagline: "Edit Videos Like a Pro with AI",
    description:
      "Professional video editing training using Adobe Premiere Pro, After Effects, DaVinci Resolve, and cutting-edge AI video tools. Learn storytelling, motion graphics, color grading, and content creation.",
    duration: "6 Months",
    mode: "Offline Course",
    highlights: [
      "Live Client Projects",
      "AI Video Tools",
      "Adobe Premiere Pro & After Effects",
      "DaVinci Resolve",
      "100% Practical Learning",
      "100% Job Assistance",
    ],
    outcomes: [
      "Edit professional quality videos",
      "Create motion graphics and animations",
      "Master color grading techniques",
      "Use AI tools in video production",
      "Build a video production portfolio",
    ],
    curriculum: [
      {
        moduleNumber: 1,
        title: "Video Production Basics",
        topics: [
          { title: "Storytelling & Video Planning" },
          { title: "Camera & Lighting Basics" },
          { title: "Video Formats & Export Settings" },
        ],
      },
      {
        moduleNumber: 2,
        title: "Adobe Premiere Pro",
        topics: [
          { title: "Timeline Editing & Sequencing" },
          { title: "Audio Mixing & Sound Design" },
          { title: "Transitions & Effects" },
        ],
      },
      {
        moduleNumber: 3,
        title: "After Effects & Motion Graphics",
        topics: [
          { title: "Motion Graphics Design" },
          { title: "Text Animation & Kinetic Typography" },
          { title: "Visual Effects (VFX) Basics" },
        ],
      },
      {
        moduleNumber: 4,
        title: "DaVinci Resolve",
        topics: [
          { title: "Color Grading & Correction" },
          { title: "Advanced Editing Techniques" },
          { title: "Audio Post-Production" },
        ],
      },
      {
        moduleNumber: 5,
        title: "Content Creation",
        topics: [
          { title: "YouTube & Social Media Video Creation" },
          { title: "Reels & Shorts Creation" },
          { title: "Corporate Video Production" },
        ],
      },
      {
        moduleNumber: 6,
        title: "AI Video Tools & Portfolio",
        topics: [
          { title: "AI-Powered Video Tools" },
          { title: "Portfolio Building" },
          { title: "Freelancing & Client Projects" },
        ],
      },
    ],
    icon: "mdi:video",
    image: "/images/courses/video-editing.jpg",
    featured: true,
  },
];

// ─── Testimonials ────────────────────────────────────────────
export const testimonialsData: Testimonial[] = [
  {
    id: "test-001",
    studentName: "Aisha Sharma",
    courseTaken: "AI Powered Digital Marketing Course",
    review:
      "QIMD completely transformed my career path! Coming from a non-technical background, I was apprehensive about digital marketing. However, the hands-on practical training with real client ad budgets, live SEO tools, and ChatGPT/Midjourney integration gave me the exact skills companies test for. Within 2 weeks of graduation, I landed a role as Digital Marketing Executive at a top Pune agency with a great package!",
    rating: 5,
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
    role: "Digital Marketing Executive",
    company: "Growth Media Agency",
    isVideo: true,
    videoUrl: "https://www.youtube.com/embed/L_LUpnjgPso",
    videoThumbnail: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80",
    studentStory: "Transitioned from non-tech to leading performance marketing campaigns.",
    isFeatured: true,
  },
  {
    id: "test-002",
    studentName: "Arjun Patil",
    courseTaken: "AI Powered Digital Marketing Course",
    review:
      "The offline classroom environment and live project assignments at QIMD are unmatched. Being able to ask questions directly to mentors who manage actual client campaigns made a huge difference. I learned end-to-end performance marketing, Google Search/Meta ads, and automated email sequences that doubled lead conversions for our demo project.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    role: "SEO & Growth Specialist",
    company: "E-commerce Brand",
    isVideo: true,
    videoUrl: "https://www.youtube.com/embed/tgbNymZ7vqY",
    videoThumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
    studentStory: "Doubled organic traffic for live client during practical training.",
    isFeatured: true,
  },
  {
    id: "test-003",
    studentName: "Rahul Deshmukh",
    courseTaken: "AI Powered Graphic Design Course",
    review:
      "The graphic design program at QIMD is truly world-class. We didn't just learn Photoshop and Illustrator — we mastered generative AI tools like Adobe Firefly, Midjourney, and Figma prototyping. The portfolio I built during my 6 months helped me stand out instantly. The trainers are working industry leads who give honest, real-world feedback on every assignment.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
    role: "Senior Graphic Designer",
    company: "Creative Studio Pune",
    isVideo: true,
    videoUrl: "https://www.youtube.com/embed/ScMzIvxBSi4",
    videoThumbnail: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80",
    studentStory: "Built an award-winning brand identity portfolio in 6 months.",
    isFeatured: true,
  },
];

// ─── Placed Students ─────────────────────────────────────────
export const placedStudentsData: PlacedStudent[] = [
  {
    id: "placed-001",
    name: "Sneha Kulkarni",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&q=80",
    isVideo: true,
    videoUrl: "https://www.youtube.com/embed/L_LUpnjgPso",
    videoThumbnail: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80",
    course: "AI Digital Marketing",
    company: "Growth Media Agency",
    role: "Digital Marketing Executive",
    package: "₹6.5 LPA",
    isVerified: true,
    location: "Pune, India",
    joiningYear: "2024",
    shortSuccessStory: "Mastered performance ads & AI content tools. Hired within 10 days of course completion.",
  },
  {
    id: "placed-002",
    name: "Vikram Nair",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80",
    isVideo: true,
    videoUrl: "https://www.youtube.com/embed/ScMzIvxBSi4",
    videoThumbnail: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80",
    course: "AI Graphic Design",
    company: "Creative Studio Pune",
    role: "Senior Graphic Designer",
    package: "₹7.2 LPA",
    isVerified: true,
    location: "Pune, India",
    joiningYear: "2024",
    shortSuccessStory: "Built a stunning 15-project design portfolio with AI visual tools & Photoshop.",
  },
  {
    id: "placed-003",
    name: "Meera Patel",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&q=80",
    isVideo: true,
    videoUrl: "https://www.youtube.com/embed/tgbNymZ7vqY",
    videoThumbnail: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&q=80",
    course: "AI Video Editing",
    company: "Production Studio",
    role: "Lead Video Editor",
    package: "₹8.0 LPA",
    isVerified: true,
    location: "Mumbai, India",
    joiningYear: "2024",
    shortSuccessStory: "Mastered DaVinci Resolve color grading & After Effects motion graphics in 6 months.",
  },
  {
    id: "placed-004",
    name: "Rohan Singh",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80",
    isVideo: false,
    course: "AI Digital Marketing",
    company: "Tech Mahindra Partner Agency",
    role: "Social Media Manager",
    package: "₹5.8 LPA",
    isVerified: true,
    location: "Pune, India",
    joiningYear: "2024",
    shortSuccessStory: "Managed live budget campaigns during QIMD internship and got absorbed full-time.",
  },
  {
    id: "placed-005",
    name: "Ananya Rao",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&q=80",
    isVideo: false,
    course: "AI Graphic Design",
    company: "Pixel Craft Media",
    role: "Brand Strategist & Designer",
    package: "₹6.8 LPA",
    isVerified: true,
    location: "Bangalore, India",
    joiningYear: "2024",
    shortSuccessStory: "Specialized in AI brand identity design & client presentation skills.",
  },
  {
    id: "placed-006",
    name: "Karan Mehta",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&q=80",
    isVideo: true,
    videoUrl: "https://www.youtube.com/embed/L_LUpnjgPso",
    videoThumbnail: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80",
    course: "AI Video Editing",
    company: "Digital Reel Studios",
    role: "Motion Graphics Designer",
    package: "₹7.5 LPA",
    isVerified: true,
    location: "Pune, India",
    joiningYear: "2024",
    shortSuccessStory: "Created viral Instagram Reels & YouTube ad edits for top client portfolios.",
  },
];

// ─── Placement Partners ──────────────────────────────────────
export const placementPartnersData: PlacementPartner[] = [
  { id: "partner-001", name: "Capgemini", logo: "/images/hiring/capgemini.svg" },
  { id: "partner-002", name: "Infosys", logo: "/images/hiring/infosys.svg" },
  { id: "partner-003", name: "Wipro", logo: "/images/hiring/wipro.svg" },
  { id: "partner-004", name: "Futurism Technologies", logo: "/images/hiring/FUTURISM.png" },
  { id: "partner-005", name: "Indomitech Global", logo: "/images/hiring/indomitech-global.jpeg" },
  { id: "partner-006", name: "Kohinoor Group", logo: "/images/hiring/KOHINOOR.png" },
  { id: "partner-007", name: "Kolte Patil Developers", logo: "/images/hiring/kolte-patil.png" },
  { id: "partner-008", name: "Quickupp Softech", logo: "/images/hiring/quickupp-softech.png" },
  { id: "partner-009", name: "Rhinestone Media", logo: "/images/hiring/rhinestone-media.png" },
  { id: "partner-010", name: "Softech Cloud", logo: "/images/hiring/softech-cloud.png" },
  { id: "partner-011", name: "Vilas Javadekar Developers", logo: "/images/hiring/vilas-javadekar.svg" },
  { id: "partner-012", name: "Yathiq Media", logo: "/images/hiring/yathiq-media.png" },
];

// ─── Gallery ─────────────────────────────────────────────────
export const galleryData: GalleryImage[] = [
  {
    id: "gallery-001",
    src: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80",
    alt: "QIMD Interactive Classroom Session",
    category: "Classroom",
    caption: "Interactive classroom sessions with industry experts",
  },
  {
    id: "gallery-002",
    src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80",
    alt: "QIMD Hands-on Practical Training",
    category: "Training",
    caption: "Hands-on practical training with live tools",
  },
  {
    id: "gallery-003",
    src: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80",
    alt: "QIMD Live Workshop",
    category: "Workshop",
    caption: "Live workshops and industry masterclasses",
  },
  {
    id: "gallery-004",
    src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80",
    alt: "QIMD Student Activities",
    category: "Activities",
    caption: "Student activities and group projects",
  },
  {
    id: "gallery-005",
    src: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    alt: "QIMD Training Facilities",
    category: "Facilities",
    caption: "Modern training facilities and labs",
  },
  {
    id: "gallery-006",
    src: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80",
    alt: "QIMD Placement Drive",
    category: "Placements",
    caption: "Placement drives and hiring events",
  },
];

// ─── Blogs ───────────────────────────────────────────────────
export const blogsData: BlogPost[] = [
  {
    id: "blog-001",
    slug: "ai-tools-digital-marketing-2024",
    title: "Top AI Tools Every Digital Marketer Must Know in 2025",
    excerpt:
      "Artificial Intelligence has fundamentally altered how digital marketing campaigns are planned, executed, and optimized. From prompt-driven copywriting and automated Google Ads bid strategies to AI graphic generation with Midjourney and predictive customer analytics, today's marketing teams accomplish in hours what used to take entire weeks. In this comprehensive guide, we unpack the top 10 AI tools that every ambitious digital marketer needs to integrate into their daily workflow to maximize ROI and stay competitive in the fast-evolving digital landscape.",
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&q=80",
    images: [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&q=80",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1000&q=80",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&q=80",
    ],
    author: "QIMD AI Marketing Lab",
    publishedAt: "2025-07-15",
    category: "Digital Marketing",
    tags: ["AI Tools", "Digital Marketing", "SEO", "Automation"],
    readTime: "6 min read",
  },
  {
    id: "blog-002",
    slug: "graphic-design-trends-2025",
    title: "Graphic Design Trends That Will Dominate 2025 & Beyond",
    excerpt:
      "Visual communication is undergoing a seismic transformation driven by generative AI technology, hyper-personalized branding, and 3D kinetic typography. Modern graphic designers are no longer restricted to static layout software; instead, they act as creative directors combining prompt engineering, vector mastery, and interactive micro-animations. Learn about the emerging aesthetic paradigms, color palettes, and workflow breakthroughs shaping top-tier agency design standards in 2025.",
    coverImage: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=1000&q=80",
    images: [
      "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=1000&q=80",
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1000&q=80",
      "https://images.unsplash.com/photo-1542744094-3a31b272c490?w=1000&q=80",
      "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=1000&q=80",
    ],
    author: "Creative Design Faculty",
    publishedAt: "2025-07-08",
    category: "Graphic Design",
    tags: ["Design Trends", "Graphic Design", "AI Design", "Creative"],
    readTime: "5 min read",
  },
  {
    id: "blog-003",
    slug: "video-editing-career-guide",
    title: "How to Build a Successful High-Paying Career in Video Editing",
    excerpt:
      "Video content now consumes over 82% of all internet traffic. As brands, content creators, and media companies scramble to publish compelling short-form Reels, documentary-style YouTube videos, and high-budget ad creatives, skilled video editors are in record demand. Discover how mastering Premiere Pro, After Effects, DaVinci Resolve color grading, and AI automated editing pipelines can help you command premium salaries or build a lucrative freelance agency.",
    coverImage: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1000&q=80",
    images: [
      "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1000&q=80",
      "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=1000&q=80",
      "https://images.unsplash.com/photo-1579632652768-6cb9dcf85912?w=1000&q=80",
    ],
    author: "Video Production Lead",
    publishedAt: "2025-07-01",
    category: "Video Editing",
    tags: ["Video Editing", "Career Guide", "Adobe Premiere", "After Effects"],
    readTime: "7 min read",
  },
  {
    id: "blog-004",
    slug: "digital-marketing-career-pune",
    title: "Why Pune is Emerging as India's premier Digital Marketing & Tech Hub",
    excerpt:
      "With over 1,500 active IT companies, startups, and creative agencies located across Hinjewadi, Kharadi, and Baner, Pune has fast become the epicentre for digital careers. Top national and multinational brands are aggressively hiring practical-trained digital marketers who hold hands-on experience in AI automation, SEO strategy, and performance advertising. Learn why starting your career in Pune offers unparalleled growth opportunities.",
    coverImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&q=80",
    images: [
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&q=80",
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1000&q=80",
    ],
    author: "QIMD Career Desk",
    publishedAt: "2025-06-20",
    category: "Career Guidance",
    tags: ["Pune", "Digital Marketing", "Career", "Jobs"],
    readTime: "5 min read",
  },
];

// ─── FAQs ────────────────────────────────────────────────────
export const faqsData: FAQ[] = [
  {
    id: "faq-001",
    question: "What courses does QIMD offer?",
    answer:
      "We offer industry-focused training in Digital Marketing, Graphic Design, and Video Editing, designed with practical learning and AI-powered tools.",
  },
  {
    id: "faq-002",
    question: "Are the classes online or offline?",
    answer:
      "We currently conduct offline classroom training only to ensure hands-on practical learning, live interaction, and better mentorship.",
  },
  {
    id: "faq-003",
    question: "Do I need prior experience to join?",
    answer:
      "No. Our courses are suitable for beginners, students, job seekers, entrepreneurs, and working professionals.",
  },
  {
    id: "faq-004",
    question: "Will I work on live projects?",
    answer:
      "Yes. Students gain practical experience by working on live client projects, case studies, and real-world assignments.",
  },
  {
    id: "faq-005",
    question: "Is an internship included?",
    answer: "Yes. We provide internship opportunities to help students gain real industry experience.",
  },
  {
    id: "faq-006",
    question: "Do you provide placement assistance?",
    answer:
      "Yes. We offer 100% Job Assistance & Placement Opportunities, including resume building, interview preparation, and hiring support.",
  },
  {
    id: "faq-007",
    question: "Will I receive a certificate?",
    answer:
      "Yes. You will receive a Course Completion Certificate & Internship Certificate after successfully completing your program.",
  },
  {
    id: "faq-008",
    question: "Who will teach the courses?",
    answer:
      "Our programs are taught by experienced industry professionals who work on real client projects and stay updated with the latest trends.",
  },
  {
    id: "faq-009",
    question: "Do you teach AI tools?",
    answer:
      "Yes. Our curriculum includes AI-powered tools and workflows used in Digital Marketing, Graphic Design, and Video Editing.",
  },
  {
    id: "faq-010",
    question: "What is the course duration?",
    answer:
      "Course duration varies by program. Please contact our admissions team for the latest batch schedules and timelines.",
  },
  {
    id: "faq-011",
    question: "Are EMI options available?",
    answer: "Yes. We offer flexible payment plans and easy EMI options for eligible students.",
  },
  {
    id: "faq-012",
    question: "Where is QIMD located?",
    answer: "QIMD is located in Hinjewadi, Pune, with modern classrooms and practical training facilities.",
  },
  {
    id: "faq-013",
    question: "Who can join these courses?",
    answer:
      "Our programs are ideal for Students, Freshers, Working Professionals, Business Owners, Freelancers, and Career Switchers.",
  },
  {
    id: "faq-014",
    question: "How do I enroll?",
    answer:
      "Simply fill out the enquiry form, call our admissions team, or visit our campus to complete your enrollment.",
  },
  {
    id: "faq-015",
    question: "Why should I choose QIMD?",
    answer:
      "Because we focus on AI-powered practical learning, live client projects, industry mentors, internships, and career-focused training to help students become job-ready professionals.",
  },
];

// ─── EMI Partners ────────────────────────────────────────────
export const emiPartnersData: EmiPartner[] = [
  { id: "emi-001", name: "Bajaj Finance", logo: "/images/emi/bajaj.svg" },
  { id: "emi-002", name: "HDFC Bank", logo: "/images/emi/hdfc.svg" },
  { id: "emi-003", name: "IDFC First Bank", logo: "/images/emi/idfc.svg" },
  { id: "emi-004", name: "Kotak Mahindra Bank", logo: "/images/emi/kotak.svg" },
];

// ─── Job Openings ────────────────────────────────────────────
export const jobOpeningsData: JobOpening[] = [
  {
    id: "job-001",
    title: "Digital Marketing Trainer",
    department: "Academics",
    type: "Full-Time",
    location: "Hinjewadi, Pune",
    description: "We're looking for an experienced Digital Marketing professional to train students on performance marketing, SEO, Google Ads, Meta Ads, and AI marketing workflows.",
    requirements: [
      "Minimum 3 years of practical digital marketing experience",
      "Strong communication and teaching skills",
      "Proficiency with Google Ads, Meta Ads, SEO, and AI marketing tools",
    ],
    postedAt: "2025-08-01",
  },
  {
    id: "job-002",
    title: "Graphic Design Trainer",
    department: "Academics",
    type: "Full-Time",
    location: "Hinjewadi, Pune",
    description: "Seeking a creative Graphic Design professional to mentor students in Photoshop, Illustrator, Figma, brand identity, and AI creative workflows.",
    requirements: [
      "Minimum 3 years of professional design experience",
      "Proficiency in Adobe Creative Suite & AI design tools",
      "Strong portfolio and presentation skills",
    ],
    postedAt: "2025-08-01",
  },
  {
    id: "job-003",
    title: "Video Editing Trainer",
    department: "Academics",
    type: "Full-Time",
    location: "Hinjewadi, Pune",
    description: "Looking for an expert Video Editor to train candidates on Premiere Pro, DaVinci Resolve, After Effects, color grading, reels production, and AI editing software.",
    requirements: [
      "3+ years commercial video editing & motion graphics experience",
      "Proficiency in Premiere Pro, After Effects & DaVinci Resolve",
      "Passion for mentoring aspiring video editors",
    ],
    postedAt: "2025-08-01",
  },
  {
    id: "job-004",
    title: "Academic Counsellor",
    department: "Admissions",
    type: "Full-Time",
    location: "Hinjewadi, Pune",
    description: "Guide prospective students, understand their career goals, and recommend the ideal AI-powered practical training program.",
    requirements: [
      "Excellent communication and interpersonal skills",
      "1+ years experience in education counselling or sales",
      "Student-centric approach with active listening skills",
    ],
    postedAt: "2025-08-01",
  },
  {
    id: "job-005",
    title: "Business Development Executive",
    department: "Sales & Growth",
    type: "Full-Time",
    location: "Hinjewadi, Pune",
    description: "Drive institute enrollment growth, build agency/corporate hiring partnerships, and manage prospective lead conversions.",
    requirements: [
      "Strong negotiation and relationship building skills",
      "Track record in B2C or B2B sales/business development",
      "Goal-driven with strong follow-up discipline",
    ],
    postedAt: "2025-08-01",
  },
  {
    id: "job-006",
    title: "Digital Marketing Executive",
    department: "In-House Marketing",
    type: "Full-Time",
    location: "Hinjewadi, Pune",
    description: "Manage QIMD's in-house performance ad campaigns, SEO organic growth, social media content, and lead generation funnels.",
    requirements: [
      "Hands-on experience running Meta & Google ad campaigns",
      "Understanding of landing page conversion optimization",
      "Proficiency in analytics and campaign reporting",
    ],
    postedAt: "2025-08-01",
  },
  {
    id: "job-007",
    title: "Graphic Designer",
    department: "Creative Studio",
    type: "Full-Time",
    location: "Hinjewadi, Pune",
    description: "Create engaging social media creatives, ad banners, brochures, marketing collateral, and brand assets for QIMD.",
    requirements: [
      "Proficiency in Photoshop, Illustrator, and Canva/Midjourney AI",
      "Strong eye for typography, composition, and color theory",
      "Speed and consistency in creative delivery",
    ],
    postedAt: "2025-08-01",
  },
  {
    id: "job-008",
    title: "Video Editor",
    department: "Content Production",
    type: "Full-Time",
    location: "Hinjewadi, Pune",
    description: "Produce promotional videos, student success story reels, YouTube clips, and ad creatives for QIMD marketing channels.",
    requirements: [
      "Solid knowledge of Premiere Pro, After Effects, and audio editing",
      "Experience creating fast-paced vertical reels and short-form content",
      "Portfolio of published commercial or social video edits",
    ],
    postedAt: "2025-08-01",
  },
  {
    id: "job-009",
    title: "Student Support Executive",
    department: "Operations",
    type: "Full-Time",
    location: "Hinjewadi, Pune",
    description: "Assist enrolled students with batch schedules, project assignments, LMS access, attendance tracking, and general queries.",
    requirements: [
      "Polite, helpful, and organized communication",
      "Basic computer proficiency and data management",
      "Ability to multi-task and assist students effectively",
    ],
    postedAt: "2025-08-01",
  },
];

// ─── Events ──────────────────────────────────────────────────
export const eventsData: Event[] = [
  {
    id: "event-001",
    slug: "new-batch-starting-digital-marketing",
    title: "New Batch Starting – AI Digital Marketing Course",
    description:
      "Join our upcoming batch for the AI Powered Digital Marketing Course. Limited seats available. Enroll now to secure your spot.",
    date: "2025-09-01",
    venue: "QIMD Institute, Hinjewadi, Pune",
    image: "/images/events/event-1.jpg",
    type: "New Batch",
    isFree: false,
  },
  {
    id: "event-002",
    slug: "new-batch-starting-graphic-design",
    title: "New Batch Starting – AI Graphic Design Course",
    description:
      "Enroll in our next batch for the AI Powered Graphic Design Course. Learn with industry experts and live projects.",
    date: "2025-09-01",
    venue: "QIMD Institute, Hinjewadi, Pune",
    image: "/images/events/event-2.jpg",
    type: "New Batch",
    isFree: false,
  },
  {
    id: "event-003",
    slug: "free-career-counselling-workshop",
    title: "Free Career Counselling Workshop",
    description:
      "Attend our free career counselling workshop and discover the right course for your goals, skills, and career path.",
    date: "2025-08-20",
    venue: "QIMD Institute, Hinjewadi, Pune",
    image: "/images/events/event-3.jpg",
    type: "Workshop",
    isFree: true,
  },
];

// ─── Hero Badges ─────────────────────────────────────────────
export const heroBadges = [
  "India's Trusted Practical Learning Institute",
  "AI-Powered & Practical Training Programs",
  "Live Client Projects & Case Studies",
  "Experienced Industry Mentors",
  "Dedicated Student Success Team",
  "Advanced Learning Platform",
  "Internship & 100% Job Assistance",
  "Placement Opportunities with Hiring Partners",
];

// ─── Course Categories (for search) ─────────────────────────
export const courseCategories = [
  "AI Powered Digital Marketing Course",
  "AI Powered Graphic Design Course",
  "AI Powered Video Editing Course",
];

// ─── Trainers Data Fallback (Exactly 1 per domain) ────────────
export const trainersData = [
  // 1. Performance Marketer & Growth Strategist
  {
    id: "trainer-001",
    name: "Rohan Sharma",
    fullName: "Rohan Sharma",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
    designation: "Performance Marketer & Growth Strategist",
    qualification: "MBA in Digital Marketing, Google & Meta Certified",
    experience: "9+ Years",
    category: "MARKETING",
    specialization: "AI Performance Marketing & Paid Media",
    biography: "Ex-agency growth consultant managing ₹50L+ monthly ad budgets across Google Ads, Meta Ads, and programmatic networks.",
    linkedin: "https://linkedin.com",
  },
  // 2. Creative Director & Brand Strategist
  {
    id: "trainer-004",
    name: "Vikramaditya Rao",
    fullName: "Vikramaditya Rao",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    designation: "Creative Director & Brand Strategist",
    qualification: "B.Des (Applied Art), Adobe Certified Expert",
    experience: "10+ Years",
    category: "DESIGN",
    specialization: "Brand Identity, Advertising Creatives & AI Design",
    biography: "Created brand identities and campaign visual design systems for 40+ international D2C brands and tech startups.",
    linkedin: "https://linkedin.com",
  },
  // 3. Lead Video Editor & Motion Graphics Artist
  {
    id: "trainer-007",
    name: "Aditya Verma",
    fullName: "Aditya Verma",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
    designation: "Lead Video Editor & Motion Graphics Artist",
    qualification: "Diploma in Film Editing & Visual Effects",
    experience: "8+ Years",
    category: "VIDEO",
    specialization: "Premiere Pro, After Effects, DaVinci Resolve & AI Editing",
    biography: "Edited commercial ads, YouTube documentaries, and high-converting short-form reels with millions of organic impressions.",
    linkedin: "https://linkedin.com",
  },
];


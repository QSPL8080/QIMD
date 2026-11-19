/**
 * SEO landing content for program pages (/courses/[slug]).
 * A program with an entry here shows this content, its meta tags and its
 * structured data instead of the default program layout.
 */

export type SeoCard = { title: string; text: string }
export type SeoFaq = { question: string; answer: string }

export type ProgramSeo = {
  metaTitle: string
  metaDescription: string
  h1: string
  tagline: string
  intro: string[]
  why: { title: string; paragraphs: string[] }
  learn: { title: string; intro: string; modules: SeoCard[] }
  choose: { title: string; paragraphs: string[]; cards: SeoCard[] }
  placement: { title: string; intro: string; cards: SeoCard[] }
  careers: { title: string; intro: string; roles: SeoCard[] }
  mentors: { title: string; paragraphs: string[] }
  closing: { title: string; paragraphs: string[] }
  faqTitle: string
  faqs: SeoFaq[]
  course: {
    name: string
    description: string
    educationalLevel: string
    courseMode: string
    credential: string
  }
}

export const programSeo: Record<string, ProgramSeo> = {
  'ai-graphic-design': {
    metaTitle: 'AI Powered Graphic Design Courses in Pune',
    metaDescription:
      'Join Quickupp Institute for Graphic Designing Courses in Pune with hands-on training, AI-powered design skills and 100% placement assistance.',
    h1: 'First AI Powered Graphic Design Courses in Pune',
    tagline: 'Learn Graphic Design Skills. Master AI Tools. Build Your Creative Career.',
    intro: [
      'Looking for industry-focused Graphic Designing Courses in Pune? Join Quickupp Institute and learn how modern graphic design works with the power of Artificial Intelligence. Our program covers graphic design fundamentals, typography, colour theory, logo design, branding, image editing, social media creatives and AI-powered design tools.',
      'Whether you are a student, fresher, working professional, freelancer or aspiring designer, our AI-powered graphic design training helps you develop creative skills and understand current design practices.',
      'Learn from industry expert mentors, gain practical experience through assignments and live projects, and receive 100% job placement assistance to prepare for opportunities in the graphic design industry.',
    ],
    why: {
      title: 'Why Choose AI-Powered Graphic Designing Courses in Pune?',
      paragraphs: [
        'The graphic design industry is evolving with Artificial Intelligence, creative automation and advanced design technologies. Businesses increasingly rely on visual communication, branding and digital creatives to connect with their audiences.',
        'Choosing the right Graphic Designing Courses in Pune can help you understand these changes and develop relevant creative skills. At Quickupp Institute, you learn essential design concepts alongside AI-powered tools that support image creation, editing, branding and creative workflows.',
        'Our training focuses on practical learning, creative development and career opportunities to help you understand modern graphic design.',
      ],
    },
    learn: {
      title: 'What Will You Learn in Our Graphic Designing Courses in Pune?',
      intro: 'Our AI-powered graphic design program covers essential design skills, modern AI tools and practical techniques through six key modules.',
      modules: [
        { title: 'Graphic Design Fundamentals', text: 'Learn design principles, colour theory, typography, layouts, composition and visual communication.' },
        { title: 'Professional Graphic Design Tools', text: 'Understand professional design software, image editing, vector graphics and creative design workflows.' },
        { title: 'Logo Design and Branding', text: 'Learn logo creation, brand identity, brand guidelines and visual branding techniques.' },
        { title: 'Social Media and Digital Creatives', text: 'Create social media posts, banners, advertisements, brochures and marketing creatives.' },
        { title: 'Image Editing and Creative Design', text: 'Explore photo editing, image manipulation, background removal, retouching and visual enhancement.' },
        { title: 'Generative AI Tools in Graphic Design', text: 'Discover AI-powered image generation, design automation, creative assistance and AI-based design workflows.' },
      ],
    },
    choose: {
      title: 'Why Choose Quickupp Institute for Graphic Design Courses in Pune?',
      paragraphs: [
        'Choosing the right training institute is an important step towards building your graphic design career.',
        'Quickupp Institute combines AI-powered learning, practical exposure, industry expert mentorship and placement assistance to help learners understand modern design requirements.',
      ],
      cards: [
        { title: '100% Job Placement Assistance', text: 'Get career guidance, interview preparation and placement support to explore suitable job opportunities.' },
        { title: 'Live Project Handling', text: 'Work on practical assignments and real-world graphic design projects.' },
        { title: 'Industry Expert Mentors', text: 'Learn professional design techniques from experienced industry mentors.' },
        { title: 'AI-Powered Graphic Design Curriculum', text: 'Master modern design concepts and AI-powered creative tools.' },
        { title: 'Portfolio Development', text: 'Build practical skills and create a professional design portfolio.' },
      ],
    },
    placement: {
      title: 'Placement Assistance and Career Support',
      intro: 'Our graphic design training focuses on practical skills and career readiness. Quickupp Institute supports learners with professional guidance and placement assistance.',
      cards: [
        { title: 'Career Guidance', text: 'Explore suitable graphic design career opportunities.' },
        { title: 'Interview Preparation', text: 'Prepare for interviews with expert guidance.' },
        { title: 'Resume & Portfolio Development', text: 'Showcase your creative skills and design projects.' },
        { title: 'Placement Assistance', text: 'Get support in exploring relevant job opportunities.' },
        { title: 'Industry Exposure', text: 'Understand professional design workflows and industry requirements.' },
      ],
    },
    careers: {
      title: 'Career Opportunities After Completing Graphic Designing Courses in Pune',
      intro: 'Develop practical design skills and explore career opportunities across advertising agencies, digital marketing companies, media houses and creative studios.',
      roles: [
        { title: 'Graphic Designer', text: 'Create visual designs for brands, businesses and marketing campaigns.' },
        { title: 'Logo Designer', text: 'Design logos and visual identities for businesses.' },
        { title: 'Social Media Designer', text: 'Create engaging graphics for social media platforms.' },
        { title: 'Brand Identity Designer', text: 'Develop branding elements and visual communication materials.' },
        { title: 'Creative Designer', text: 'Design advertisements, brochures, banners and promotional materials.' },
        { title: 'Freelance Graphic Designer', text: 'Offer creative design services to businesses and individual clients.' },
        { title: 'AI Graphic Designer', text: 'Use AI-powered tools to create and enhance digital designs.' },
      ],
    },
    mentors: {
      title: 'Learn from Industry Expert Mentors at Quickupp Institute',
      paragraphs: [
        'Learning from experienced professionals can help you understand how graphic design concepts are applied in real business environments.',
        'At Quickupp Institute, industry expert mentors guide learners through essential design principles, practical applications and AI-powered creative workflows.',
        'With guidance from experienced mentors, you can develop a better understanding of typography, branding, image editing, digital creatives and modern design techniques.',
      ],
    },
    closing: {
      title: 'Learn AI-Powered Graphic Design in Pune at Quickupp Institute',
      paragraphs: [
        'If you are exploring the best Graphic Designing Courses in Pune, Quickupp Institute offers an AI-powered learning program designed to introduce you to essential design concepts and modern AI applications.',
        'Located in Hinjewadi, Pune, our institute provides learners with an opportunity to develop practical graphic design knowledge and understand industry-relevant creative workflows.',
        'If you are comparing Graphic Design Courses in Pune Fees, contact our team to learn about the latest course fees, program duration and available batches.',
        'With live project handling, industry expert mentors and 100% job placement assistance, we aim to help learners prepare for professional opportunities in the creative industry.',
        'Whether you want to start your career, improve your creative skills or explore freelancing opportunities, take the next step with Quickupp Institute.',
      ],
    },
    faqTitle: 'Frequently Asked Questions About Graphic Designing Courses in Pune',
    faqs: [
      { question: 'What are AI-powered graphic designing courses?', answer: 'AI-powered graphic designing courses teach traditional design concepts along with Artificial Intelligence tools for image creation, editing, branding and creative content development.' },
      { question: 'Who can join graphic designing courses in Pune?', answer: 'Students, freshers, working professionals, freelancers, entrepreneurs and aspiring designers can enrol. Beginners can also start learning without prior design experience.' },
      { question: 'What topics are covered in the AI graphic design course?', answer: 'The program covers graphic design fundamentals, typography, colour theory, logo design, branding, image editing, social media creatives and generative AI tools.' },
      { question: 'Do I need drawing skills to learn graphic design?', answer: 'No. Drawing skills are not compulsory. You can learn graphic design through design principles, creative tools and practical exercises.' },
      { question: 'What are the Graphic Design Courses in Pune Fees?', answer: 'Graphic Design Courses in Pune Fees may vary depending on the course duration, curriculum and training structure. Contact Quickupp Institute for the latest fee details and batch information.' },
      { question: 'Does Quickupp Institute provide placement assistance?', answer: 'Yes, Quickupp Institute highlights 100% job placement assistance to help learners explore relevant career opportunities through placement guidance and interview preparation.' },
      { question: 'Does the course include practical training?', answer: 'Yes. The program focuses on practical assignments, hands-on exercises and live project handling to help learners understand real-world design requirements.' },
      { question: 'Which AI tools will I learn in the graphic design program?', answer: 'The program introduces learners to AI-powered design and image creation tools. Specific tools may depend on the curriculum and current industry requirements.' },
      { question: 'What career opportunities are available after learning graphic design?', answer: 'You can explore opportunities as a Graphic Designer, Logo Designer, Social Media Designer, Brand Identity Designer, Creative Designer, Freelance Graphic Designer or AI Graphic Designer.' },
      { question: 'Where is Quickupp Institute located in Pune?', answer: 'Quickupp Institute is located in Hinjewadi, Pune, Maharashtra. Contact the institute to learn more about the course and available training options.' },
      { question: 'Does Quickupp Institute offer graphic design courses with placement?', answer: 'Yes, Quickupp Institute offers Graphic Design Courses in Pune with Placement Assistance, including career guidance and interview preparation to help learners explore job opportunities.' },
      { question: 'How can I enrol in the AI graphic design course?', answer: 'You can contact Quickupp Institute through the website enquiry form or WhatsApp to speak with a counsellor, understand the curriculum and get enrolment information.' },
    ],
    course: {
      name: 'AI Powered Graphic Design Program',
      description:
        'Learn graphic design with AI-powered tools and practical training through Quickupp Institute. Develop creative design skills, work on real-world projects, and gain industry-relevant knowledge with placement assistance.',
      educationalLevel: 'Beginner to Advanced',
      courseMode: 'Offline',
      credential: 'Certificate in AI Powered Graphic Design',
    },
  },
}

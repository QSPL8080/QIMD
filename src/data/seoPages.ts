/**
 * SEO landing pages (content from "Quickupp Institute SEO Content").
 * These are standalone pages, separate from the program pages under /courses.
 * Each key is the page path, e.g. /digital-marketing-courses-pune.
 */

export type SeoCard = { title: string; text: string }
export type SeoFaq = { question: string; answer: string }

export type SeoPage = {
  path: string
  /** Program slug used for the enquiry form and the hero image. */
  program: string
  metaTitle: string
  metaDescription: string
  h1: string
  tagline: string
  intro: string[]
  why: { title: string; paragraphs: string[] }
  learn: { title: string; intro: string; modules: SeoCard[] }
  choose: { title: string; paragraphs: string[]; cards: SeoCard[] }
  placement: { title: string; paragraphs: string[]; cards: SeoCard[] }
  careers: { title: string; intro: string; roles: SeoCard[] }
  mentors: { title: string; paragraphs: string[] }
  closing: { title: string; paragraphs: string[] }
  faqTitle: string
  faqs: SeoFaq[]
  /** Course structured data, as supplied. */
  courseSchema: Record<string, unknown>
}

const PLACEMENT_FAQ =
  'Yes, Quickupp Institute highlights 100% job placement assistance to help learners explore relevant career opportunities through placement guidance and interview preparation.'

export const seoPages: SeoPage[] = [
  /* ───────────────────────── Digital Marketing ───────────────────────── */
  {
    path: 'digital-marketing-courses-pune',
    program: 'ai-digital-marketing',
    metaTitle: 'Best Digital Marketing Courses in Pune With 100% Placement',
    metaDescription:
      'Join QIMD for Best Digital Marketing Courses in Pune with 100% Job placement. Learn all Digital Marketing Strategies to boost your career with help of AI.',
    h1: 'First AI Powered Digital Marketing Courses in Pune',
    tagline: 'Learn Digital Marketing Skills. Master AI Tools. Build Your Career.',
    intro: [
      'Looking for industry-focused Digital Marketing Courses in Pune? Join Quickupp Institute and learn how modern digital marketing works with the power of Artificial Intelligence. Our program covers SEO, social media marketing, Google Ads, Meta Ads, content marketing, marketing automation and generative AI tools.',
      'Whether you are a student, fresher, working professional, freelancer or business owner, our AI-powered digital marketing training helps you develop practical skills and understand current marketing practices.',
      'Learn from industry expert mentors, gain experience through live project handling and receive 100% job placement assistance to prepare for opportunities in the digital marketing industry.',
    ],
    why: {
      title: 'Why Choose AI-Powered Digital Marketing Courses in Pune?',
      paragraphs: [
        'The digital marketing industry is evolving with Artificial Intelligence, automation and changing consumer behaviour. Businesses increasingly rely on online platforms to reach customers, generate leads and build their brands.',
        'Choosing the right Digital Marketing Courses in Pune can help you understand these changes and develop relevant industry skills. At Quickupp Institute, you learn essential marketing concepts alongside AI-powered tools that support content creation, keyword research, campaign planning and marketing automation.',
        'Our training focuses on practical learning, industry knowledge and career development to help you understand how modern marketing works.',
      ],
    },
    learn: {
      title: 'What Will You Learn in Our Digital Marketing Courses in Pune?',
      intro: 'Our AI-powered digital marketing program covers essential marketing skills, modern AI tools and practical strategies through six key modules.',
      modules: [
        { title: 'Digital Marketing Fundamentals & Strategy', text: 'Learn digital marketing basics, marketing channels, audience research, campaign planning and customer journeys.' },
        { title: 'Search Engine Optimization (SEO)', text: 'Master keyword research, on-page SEO, off-page SEO, technical SEO, local SEO and website optimization.' },
        { title: 'Social Media Marketing', text: 'Learn Facebook, Instagram, LinkedIn and YouTube marketing, content planning, audience engagement and performance analysis.' },
        { title: 'Performance Marketing & Paid Advertising', text: 'Understand Google Ads, Meta Ads, audience targeting, ad creatives, campaign budgeting and conversion tracking.' },
        { title: 'Content Marketing, Email Marketing & Automation', text: 'Explore content strategy, content creation, email campaigns, lead nurturing and marketing automation.' },
        { title: 'Generative AI Tools in Digital Marketing', text: 'Discover AI-powered content creation, marketing research, prompt writing, campaign ideation and AI marketing workflows.' },
      ],
    },
    choose: {
      title: 'Why Choose Quickupp Institute for Digital Marketing Courses in Pune?',
      paragraphs: [
        'Choosing the right training institute is an important step towards building your digital marketing career.',
        'As a growing Digital Marketing Institute in Pune, Quickupp Institute combines AI-powered learning, practical exposure, industry expert mentorship and placement assistance to help learners understand modern marketing requirements.',
      ],
      cards: [
        { title: '100% Job Placement Assistance', text: 'Get career guidance, interview preparation and placement assistance to help you explore suitable job opportunities after completing your training.' },
        { title: 'Live Project Handling', text: 'Gain practical exposure by working on live projects and understanding how digital marketing strategies are implemented for real business requirements.' },
        { title: 'Industry Expert Mentors', text: 'Learn from industry expert mentors who share practical knowledge, marketing strategies and insights into current industry practices.' },
        { title: 'Opportunities with Top Hiring Companies', text: 'Prepare for career opportunities across digital marketing agencies, IT companies, startups, e-commerce businesses and corporate marketing teams.' },
        { title: 'AI-Powered Digital Marketing Curriculum', text: 'Learn essential marketing concepts alongside modern AI tools and technologies.' },
        { title: 'Practical Assignments and Portfolio Development', text: 'Develop your marketing knowledge through practical exercises and work towards building a professional portfolio.' },
        { title: 'Agency and Freelancing Guidance', text: 'Understand how to explore independent projects, freelance opportunities and digital marketing business development.' },
      ],
    },
    placement: {
      title: 'Placement Assistance and Career Support',
      paragraphs: [
        'Our Best Digital Marketing Courses in Pune focus on practical skills and career readiness. Quickupp Institute supports learners with placement assistance and professional guidance.',
        'If you are looking for Digital Marketing Courses in Pune with Placement, our program combines practical training with career support to help you prepare for industry opportunities.',
      ],
      cards: [
        { title: 'Career Guidance', text: 'Explore digital marketing career opportunities that match your skills and interests.' },
        { title: 'Interview Preparation', text: 'Build confidence with interview guidance and practical knowledge.' },
        { title: 'Resume & Portfolio Development', text: 'Showcase your skills and project experience to potential employers.' },
        { title: 'Placement Assistance', text: 'Get support in exploring relevant job opportunities.' },
        { title: 'Industry Exposure', text: 'Understand industry expectations and workplace requirements.' },
      ],
    },
    careers: {
      title: 'Career Opportunities After Completing Digital Marketing Courses in Pune',
      intro: 'Build practical skills and explore career opportunities across digital agencies, startups, e-commerce businesses and corporate marketing teams.',
      roles: [
        { title: 'SEO Executive', text: 'Improve website rankings, organic traffic and search visibility.' },
        { title: 'Social Media Executive', text: 'Manage social media accounts, content and audience engagement.' },
        { title: 'Digital Marketing Executive', text: 'Plan and execute digital marketing campaigns across platforms.' },
        { title: 'Performance Marketing Executive', text: 'Manage paid advertising campaigns and optimize results.' },
        { title: 'Content Marketing Executive', text: 'Create content strategies and engaging marketing content.' },
        { title: 'Digital Marketing Freelancer', text: 'Offer SEO, social media and advertising services to clients.' },
        { title: 'Digital Marketing Entrepreneur', text: 'Start your own digital marketing agency or consultancy.' },
      ],
    },
    mentors: {
      title: 'Learn from Industry Expert Mentors at Quickupp Institute',
      paragraphs: [
        'Learning from experienced professionals can help you understand how digital marketing concepts are applied in real business environments.',
        'At Quickupp Institute, industry expert mentors guide learners through essential marketing concepts, practical applications and AI-powered marketing workflows.',
        'With guidance from experienced mentors, you can develop a better understanding of SEO, social media marketing, paid advertising, content strategy and campaign management.',
      ],
    },
    closing: {
      title: 'Learn AI-Powered Digital Marketing in Pune at Quickupp Institute',
      paragraphs: [
        'If you are exploring the Best Digital Marketing Courses in Pune, Quickupp Institute offers an AI-powered learning program designed to introduce you to essential marketing concepts and modern AI applications.',
        'Located in Hinjewadi, Pune, our institute provides learners with an opportunity to develop practical digital marketing knowledge and understand industry-relevant workflows.',
        'We also welcome learners from nearby areas looking for Digital Marketing Courses in PCMC and practical digital marketing training in Pune.',
        'Whether you are searching for Digital Marketing Classes in Pune or the Best Digital Marketing Training in Pune, our program offers live project handling, industry expert mentors and 100% job placement assistance to help learners prepare for professional opportunities in the digital marketing industry.',
        'Whether you want to start your career, upgrade your professional skills or explore freelancing opportunities, take the next step with Quickupp Institute.',
      ],
    },
    faqTitle: 'Frequently Asked Questions About Digital Marketing Courses in Pune',
    faqs: [
      { question: 'What are AI-powered digital marketing courses?', answer: 'AI-powered digital marketing courses teach traditional marketing concepts along with the use of Artificial Intelligence tools for content creation, SEO, social media, advertising, research and automation.' },
      { question: 'Who can join digital marketing courses in Pune?', answer: 'Students, freshers, working professionals, business owners, entrepreneurs and freelancers can enrol. Beginners can also start learning without prior marketing experience.' },
      { question: 'What topics are covered in the AI digital marketing course?', answer: 'The program covers digital marketing fundamentals, SEO, social media marketing, Google Ads, Meta Ads, content marketing, email marketing, marketing automation and generative AI tools.' },
      { question: 'Do I need coding knowledge to learn digital marketing?', answer: 'No. You do not need programming or coding knowledge to learn digital marketing fundamentals. Most marketing activities involve strategy, research, content, advertising and analytics.' },
      { question: 'Does Quickupp Institute provide job placement assistance?', answer: PLACEMENT_FAQ },
      { question: 'Does the course include live project handling?', answer: 'The program highlights practical learning and live project handling to help learners understand how digital marketing strategies are implemented in real business environments.' },
      { question: 'Who will teach the AI digital marketing course?', answer: 'The training includes guidance from industry expert mentors who share practical knowledge, marketing strategies and insights into current industry practices.' },
      { question: 'What career opportunities are available after learning AI digital marketing?', answer: 'You can explore opportunities as an SEO Executive, Social Media Executive, Digital Marketing Executive, Performance Marketing Executive, Content Marketing Executive or Freelancer.' },
      { question: 'Where is Quickupp Institute located in Pune?', answer: 'Quickupp Institute is located in Hinjewadi, Pune, Maharashtra. You can contact the institute to learn more about the course and available training options.' },
      { question: 'How can I enroll in an AI digital marketing course?', answer: 'You can contact Quickupp Institute through the website enquiry form or WhatsApp to speak with a counsellor, understand the curriculum and get enrolment information.' },
    ],
    courseSchema: {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: 'AI Powered Digital Marketing Program',
      description:
        'Learn AI-powered digital marketing, SEO, social media marketing, paid advertising, content marketing and modern marketing strategies through practical training at Quickupp Institute.',
      provider: { '@type': 'Organization', name: 'Quickupp Institute', url: 'https://quickuppinstitute.com/' },
      educationalLevel: 'Beginner to Advanced',
      inLanguage: 'en',
      courseMode: 'Offline',
      url: 'https://quickuppinstitute.com/courses/ai-digital-marketing',
    },
  },

  /* ───────────────────────── Video Editing ───────────────────────── */
  {
    path: 'video-editing-courses-pune',
    program: 'ai-video-editing',
    metaTitle: 'Best AI Powered Video Editing Courses in Pune',
    metaDescription:
      'Looking for Video Editing Courses in Pune? Learn AI-powered video creation, advanced editing techniques and practical skills at Quickupp Institute.',
    h1: 'First AI Powered Video Editing Courses in Pune',
    tagline: 'Learn Video Editing Skills. Master AI Tools. Build Your Creative Career.',
    intro: [
      'Looking for industry-focused video editing courses in Pune? Join Quickupp Institute and learn how modern video editing works with the power of Artificial Intelligence. Our program covers video editing fundamentals, AI-powered video creation, professional editing techniques, motion graphics, visual effects, audio editing and generative AI tools.',
      'Whether you are a student, fresher, working professional, freelancer, content creator or aspiring video editor, our AI-powered video editing training helps you develop practical creative skills and understand current video production techniques.',
      'Learn from industry expert mentors, gain experience through practical assignments and live project handling, and receive 100% job placement assistance to prepare for opportunities in the video editing and creative industry.',
    ],
    why: {
      title: 'Why Choose AI-Powered Video Editing Courses in Pune?',
      paragraphs: [
        'The video editing industry is evolving with Artificial Intelligence, automation and advanced creative technologies. Businesses, brands and content creators increasingly rely on engaging video content to connect with audiences, promote products and build their online presence.',
        'Choosing the right video editing courses in Pune can help you understand these changes and develop relevant creative skills. At Quickupp Institute, you learn essential video editing concepts alongside AI-powered tools that support video creation, editing, animation, visual effects and content production.',
        'Our training focuses on practical learning, creative techniques and career development to help you understand how modern video production works.',
      ],
    },
    learn: {
      title: 'What Will You Learn in Our Video Editing Courses in Pune?',
      intro: 'Our AI-powered video editing program covers essential editing techniques, modern AI tools and practical skills through six key modules.',
      modules: [
        { title: 'Video Editing Fundamentals', text: 'Learn editing basics, timelines, video formats, sequencing and storytelling.' },
        { title: 'Professional Video Editing', text: 'Master cutting, trimming, transitions, effects and professional editing workflows.' },
        { title: 'AI-Powered Video Creation', text: 'Explore AI video generation, text-to-video, image-to-video and automated editing.' },
        { title: 'Motion Graphics and Visual Effects', text: 'Learn animation, text effects, motion graphics and creative transitions.' },
        { title: 'Audio Editing and Colour Grading', text: 'Understand audio enhancement, voiceovers, colour correction and colour grading.' },
        { title: 'Generative AI Tools in Video Editing', text: 'Discover AI tools for video creation, background removal, AI avatars, subtitles and voice generation.' },
      ],
    },
    choose: {
      title: 'Why Choose Quickupp Institute for Video Editing Courses in Pune?',
      paragraphs: [
        'Quickupp Institute combines AI-powered learning, practical training and career support to help you develop industry-relevant video editing skills.',
      ],
      cards: [
        { title: '100% Job Placement Assistance', text: 'Get career guidance, interview preparation and placement support.' },
        { title: 'Live Project Handling', text: 'Work on practical assignments and real-world video editing projects.' },
        { title: 'Industry Expert Mentors', text: 'Learn professional editing techniques from experienced mentors.' },
        { title: 'Opportunities with Top Hiring Companies', text: 'Prepare for opportunities in media companies, production houses and digital agencies.' },
        { title: 'AI-Powered Video Editing Curriculum', text: 'Learn modern editing techniques and AI-powered video creation tools.' },
        { title: 'Practical Assignments and Portfolio Development', text: 'Build editing skills and create a professional portfolio.' },
        { title: 'Freelancing and Content Creation Guidance', text: 'Explore freelance projects and social media content creation opportunities.' },
      ],
    },
    placement: {
      title: 'Placement Assistance and Career Support',
      paragraphs: ['Our Video Editing Training in Pune focuses on practical learning and career readiness.'],
      cards: [
        { title: 'Career Guidance', text: 'Explore suitable video editing career opportunities.' },
        { title: 'Interview Preparation', text: 'Prepare for interviews with expert guidance.' },
        { title: 'Resume & Portfolio Development', text: 'Showcase your skills and creative projects.' },
        { title: 'Placement Assistance', text: 'Get support in finding relevant job opportunities.' },
        { title: 'Industry Exposure', text: 'Understand professional video editing workflows and industry requirements.' },
      ],
    },
    careers: {
      title: 'Career Opportunities After Completing Video Editing Courses in Pune',
      intro: 'Build practical editing skills and explore career opportunities across digital agencies, production houses, media companies, advertising agencies and content creation businesses.',
      roles: [
        { title: 'Video Editor', text: 'Edit and assemble video footage to create engaging content for different platforms and audiences.' },
        { title: 'YouTube Video Editor', text: 'Edit YouTube videos, promotional content, vlogs, tutorials and other digital video formats.' },
        { title: 'Social Media Video Editor', text: 'Create engaging short-form videos, reels, promotional clips and social media content.' },
        { title: 'Motion Graphics Designer', text: 'Create animated graphics, text animations, visual effects and motion-based creative content.' },
        { title: 'Video Content Creator', text: 'Plan, create and edit videos for personal brands, businesses and digital platforms.' },
        { title: 'Freelance Video Editor', text: 'Offer professional video editing services to individual creators, businesses and marketing agencies.' },
        { title: 'AI Video Creator', text: 'Use AI-powered tools to generate, edit and produce videos for marketing, education and digital content.' },
      ],
    },
    mentors: {
      title: 'Learn from Industry Expert Mentors at Quickupp Institute',
      paragraphs: [
        'Learning from experienced professionals can help you understand how video editing concepts are applied in real-world projects.',
        'At Quickupp Institute, industry expert mentors guide learners through essential editing concepts, practical applications and AI-powered video production workflows.',
        'With guidance from experienced mentors, you can develop a better understanding of video editing, motion graphics, visual effects, audio enhancement, colour grading and AI-based content creation.',
      ],
    },
    closing: {
      title: 'Learn AI-Powered Video Editing in Pune at Quickupp Institute',
      paragraphs: [
        'If you are exploring the best Video Editing Courses in Pune, Quickupp Institute offers an AI-powered learning program designed to introduce you to essential video editing concepts and modern AI applications.',
        'Located in Hinjewadi, Pune, our institute provides learners with an opportunity to develop practical video editing knowledge and understand industry-relevant creative workflows.',
        'With live project handling, industry expert mentors and 100% job placement assistance, we aim to help learners prepare for professional opportunities in the video editing and creative industry.',
        'Whether you want to start your career, become a professional video editor, upgrade your creative skills or explore freelancing opportunities, take the next step with Quickupp Institute.',
      ],
    },
    faqTitle: 'Frequently Asked Questions About Video Editing Courses in Pune',
    faqs: [
      { question: 'What are AI-powered video editing courses?', answer: 'AI-powered video editing courses teach traditional video editing techniques along with the use of Artificial Intelligence tools for video generation, editing, animation, audio enhancement and content creation.' },
      { question: 'Who can join video editing courses in Pune?', answer: 'Students, freshers, working professionals, freelancers, content creators and aspiring video editors can enrol. Beginners can also start learning without prior video editing experience.' },
      { question: 'What topics are covered in the AI video editing course?', answer: 'The program covers video editing fundamentals, professional editing techniques, AI-powered video creation, motion graphics, visual effects, audio editing, colour grading and generative AI tools.' },
      { question: 'Do I need prior experience to learn video editing?', answer: 'No. Beginners can join the program and learn video editing from the fundamentals. The training introduces essential editing concepts and gradually progresses towards advanced techniques and AI-powered tools.' },
      { question: 'What are the Video Editing Course Fees in Pune?', answer: 'Video Editing Course Fees in Pune may vary depending on the course duration, curriculum and training structure. Contact Quickupp Institute to get the latest fee details and available batch information.' },
      { question: 'Does Quickupp Institute provide job placement assistance?', answer: PLACEMENT_FAQ },
      { question: 'Does the course include practical training?', answer: 'Yes. The program focuses on practical learning through editing assignments, hands-on exercises and live project handling to help learners understand real-world video production requirements.' },
      { question: 'Which AI tools will I learn in the video editing program?', answer: 'The program introduces learners to AI-powered video creation and editing tools. The specific tools covered may depend on the curriculum and current industry requirements.' },
      { question: 'What career opportunities are available after learning video editing?', answer: 'You can explore opportunities as a Video Editor, YouTube Video Editor, Social Media Video Editor, Motion Graphics Designer, Video Content Creator, Freelance Video Editor or AI Video Creator.' },
      { question: 'Where is Quickupp Institute located in Pune?', answer: 'Quickupp Institute is located in Hinjewadi, Pune, Maharashtra. You can contact the institute to learn more about the course and available training options.' },
    ],
    courseSchema: {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: 'AI Powered Video Editing Program',
      description:
        'Learn AI-powered video editing, video creation, advanced editing techniques and modern AI tools through practical training at Quickupp Institute.',
      provider: { '@type': 'Organization', name: 'Quickupp Institute', url: 'https://quickuppinstitute.com/' },
      educationalLevel: 'Beginner to Advanced',
      inLanguage: 'en',
      courseMode: 'Offline',
      url: 'https://quickuppinstitute.com/courses/ai-video-editing',
    },
  },

  /* ───────────────────────── Graphic Design ───────────────────────── */
  {
    path: 'graphic-design-courses-pune',
    program: 'ai-graphic-design',
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
      paragraphs: [
        'Our graphic design training focuses on practical skills and career readiness. Quickupp Institute supports learners with professional guidance and placement assistance.',
      ],
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
      { question: 'Does Quickupp Institute provide placement assistance?', answer: PLACEMENT_FAQ },
      { question: 'Does the course include practical training?', answer: 'Yes. The program focuses on practical assignments, hands-on exercises and live project handling to help learners understand real-world design requirements.' },
      { question: 'Which AI tools will I learn in the graphic design program?', answer: 'The program introduces learners to AI-powered design and image creation tools. Specific tools may depend on the curriculum and current industry requirements.' },
      { question: 'What career opportunities are available after learning graphic design?', answer: 'You can explore opportunities as a Graphic Designer, Logo Designer, Social Media Designer, Brand Identity Designer, Creative Designer, Freelance Graphic Designer or AI Graphic Designer.' },
      { question: 'Where is Quickupp Institute located in Pune?', answer: 'Quickupp Institute is located in Hinjewadi, Pune, Maharashtra. Contact the institute to learn more about the course and available training options.' },
      { question: 'Does Quickupp Institute offer graphic design courses with placement?', answer: 'Yes, Quickupp Institute offers Graphic Design Courses in Pune with Placement Assistance, including career guidance and interview preparation to help learners explore job opportunities.' },
      { question: 'How can I enrol in the AI graphic design course?', answer: 'You can contact Quickupp Institute through the website enquiry form or WhatsApp to speak with a counsellor, understand the curriculum and get enrolment information.' },
    ],
    courseSchema: {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: 'AI Powered Graphic Design Program',
      description:
        'Learn graphic design with AI-powered tools and practical training through Quickupp Institute. Develop creative design skills, work on real-world projects, and gain industry-relevant knowledge with placement assistance.',
      provider: { '@type': 'EducationalOrganization', name: 'Quickupp Institute', url: 'https://quickuppinstitute.com/' },
      educationalLevel: 'Beginner to Advanced',
      inLanguage: 'en',
      courseMode: 'Offline',
      occupationalCredentialAwarded: 'Certificate in AI Powered Graphic Design',
      url: 'https://quickuppinstitute.com/courses/ai-graphic-design',
    },
  },
]

export function getSeoPage(path: string) {
  return seoPages.find((p) => p.path === path) || null
}

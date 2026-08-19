import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react/dist/iconify.js";
// import Breadcrumb from "@/components/Common/Breadcrumb";
import EnquiryForm from "@/components/Common/EnquiryForm";
import { coursesData, siteConfig } from "@/data";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic'
export const revalidate = 0


interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const dbCourses = await db.course.findMany({
      where: { status: 'PUBLISHED', isDeleted: false },
      select: { slug: true },
    })
    if (dbCourses.length > 0) {
      return dbCourses.map((c) => ({ slug: c.slug }))
    }
  } catch (err) {
    console.error('Error fetching static course params:', err)
  }
  return coursesData.map((course) => ({ slug: course.slug }))
}


export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  let course: any = null;
  try {
    const dbCourse = await db.course.findFirst({
      where: {
        OR: [{ slug }, { slug: { contains: slug } }],
        isActive: true,
        status: 'PUBLISHED',
        isDeleted: false,
      },
    });
    if (dbCourse) {
      course = { title: dbCourse.courseName, description: dbCourse.shortDescription || dbCourse.description };
    }
  } catch (err) {}
  if (!course) {
    course = coursesData.find((c) => c.slug === slug || slug.includes(c.slug) || c.slug.includes(slug));
  }

  if (!course) return { title: "Course Not Found" };
  return {
    title: `${course.title} – ${siteConfig.name}`,
    description: course.description,
    alternates: { canonical: `https://www.qimd.in/courses/${slug}` },
    openGraph: {
      title: `${course.title} – ${siteConfig.name}`,
      description: course.description,
      url: `https://www.qimd.in/courses/${slug}`,
    },
  };
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { slug } = await params;
  let course: any = null;

  let whatsappUrl: string = siteConfig.socialLinks.whatsapp;
  try {
    const ws = await db.websiteSettings.findFirst({ select: { whatsappNumber: true } });
    if (ws?.whatsappNumber) {
      whatsappUrl = ws.whatsappNumber.startsWith('http')
        ? ws.whatsappNumber
        : `https://wa.me/${ws.whatsappNumber.replace(/[^\d]/g, '')}`;
    }
  } catch (err) {}

  try {
    // Extract core course key (e.g. 'digital-marketing', 'graphic-design', 'video-editing')
    const coreKey = slug
      .replace('ai-powered-', '')
      .replace('ai-', '')
      .replace('-course', '');

    const dbCourse = await db.course.findFirst({
      where: {
        OR: [
          { slug: slug },
          { slug: { contains: slug } },
          { slug: { contains: coreKey } },
          { courseName: { contains: coreKey, mode: 'insensitive' } },
        ],
        isActive: true,
        status: 'PUBLISHED',
        isDeleted: false,
      },
      include: { category: true, trainer: true },
    });

    if (dbCourse) {
      const syllabusLines = dbCourse.syllabus ? dbCourse.syllabus.split('\n').filter(Boolean) : [];
      const staticMatch = coursesData.find((c) => c.slug === slug || slug.includes(c.slug) || c.slug.includes(slug));
      const fallbackImg = staticMatch?.image || '/images/courses/digital-marketing.jpg';

      course = {
        id: dbCourse.id,
        title: dbCourse.courseName,
        shortTitle: dbCourse.courseName,
        slug: dbCourse.slug,
        category: dbCourse.category?.name || 'General',
        duration: dbCourse.duration || '6 Months',
        mode: dbCourse.courseMode || 'Offline',
        description: dbCourse.description || dbCourse.shortDescription || '',
        bannerImage: dbCourse.bannerImage || fallbackImg,
        image: dbCourse.bannerImage || fallbackImg,
        fees: dbCourse.fees ? Number(dbCourse.fees) : 45000,
        discountPrice: dbCourse.discountPrice ? Number(dbCourse.discountPrice) : 35000,
        eligibility: dbCourse.eligibility || 'Open for all',
        highlights: dbCourse.learningOutcomes ? dbCourse.learningOutcomes.split('\n').filter(Boolean) : ['Live Client Projects', 'AI-Powered Tools & Workflows', '100% Practical Learning', '100% Placement Support'],
        outcomes: dbCourse.learningOutcomes ? dbCourse.learningOutcomes.split('\n').filter(Boolean) : ['Master industry tools & workflows', 'Build a professional portfolio', 'Get industry certifications'],
        curriculum: syllabusLines.length > 0
          ? syllabusLines.map((line, idx) => ({ moduleNumber: idx + 1, title: line, topics: [{ title: line }] }))
          : [],
      };
    }
  } catch (err) {
    console.error('Error loading dynamic course detail:', err);
  }

  if (!course) {
    course = coursesData.find((c) => c.slug === slug || slug.includes(c.slug) || c.slug.includes(slug));
  }

  if (!course) notFound();

  const courseBanner = course.bannerImage || course.image;

  return (
    <>
      {/* <Breadcrumb
        title={course.title}
        items={[
          { label: "Home", href: "/" },
          { label: "Courses", href: "/courses" },
          { label: course.shortTitle },
        ]}
      /> */}

      <section className="section-py bg-grey dark:bg-dark">
        <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

            {/* Main Content */}
            <div className="lg:col-span-8">
              {/* Course Banner Image (Uploaded from Panel) */}
              {courseBanner && (
                <div className="relative w-full rounded-2xl overflow-hidden mb-8 shadow-card border border-border dark:border-dark_border">
                  <Image
                    src={courseBanner}
                    alt={course.title}
                    width={1200}
                    height={500}
                    className="w-full h-auto object-cover rounded-2xl"
                    priority
                  />
                </div>
              )}




              {/* Highlights */}
              <div className="bg-white dark:bg-darklight rounded-2xl p-6 shadow-card border border-border dark:border-dark_border mb-8">
                <h2 className="text-xl font-bold text-midnight_text dark:text-white mb-5">Course Highlights</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(course.highlights || course.outcomes || []).map((highlight: string, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <Icon icon="mdi:check" className="text-accent text-sm font-bold" />
                      </div>
                      <span className="text-sm text-midnight_text dark:text-white font-medium">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Learning Outcomes */}
              <div className="bg-white dark:bg-darklight rounded-2xl p-6 shadow-card border border-border dark:border-dark_border mb-8">
                <h2 className="text-xl font-bold text-midnight_text dark:text-white mb-5">What You Will Learn</h2>
                <ul className="space-y-3">
                  {(course.outcomes || []).map((outcome: string, i: number) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon icon="mdi:star" className="text-secondary text-xs" />
                      </div>
                      <span className="text-sm text-muted dark:text-white/70">{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Curriculum */}
              <div className="bg-white dark:bg-darklight rounded-2xl p-6 shadow-card border border-border dark:border-dark_border mb-8">
                <h2 className="text-xl font-bold text-midnight_text dark:text-white mb-6">Course Curriculum</h2>
                <div className="space-y-4">
                  {(course.curriculum || []).map((module: any) => (
                    <details key={module.moduleNumber} className="group border border-border dark:border-dark_border rounded-xl overflow-hidden">
                      <summary className="flex items-center justify-between p-4 cursor-pointer bg-primary/5 dark:bg-primary/10 hover:bg-primary/10 transition-colors list-none">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {String(module.moduleNumber).padStart(2, '0')}
                          </span>
                          <span className="font-semibold text-midnight_text dark:text-white text-sm">
                            Module {module.moduleNumber}: {module.title}
                          </span>
                        </div>
                        <Icon
                          icon="mdi:chevron-down"
                          className="text-xl text-primary transition-transform duration-300 group-open:rotate-180 flex-shrink-0"
                        />
                      </summary>
                      <div className="p-4 border-t border-border dark:border-dark_border">
                        <ul className="space-y-2">
                          {(module.topics || []).map((topic: any, i: number) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-muted dark:text-white/60">
                              <Icon icon="mdi:circle-small" className="text-primary flex-shrink-0" />
                              {topic.title}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar – Enquiry Form */}
            <div className="lg:col-span-4">
              <div className="sticky top-24">
                <div
                  id="download-brochure"
                  className="bg-white dark:bg-darklight rounded-2xl shadow-card border border-border dark:border-dark_border p-6 mb-6"
                >
                  <div className="text-center mb-5">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <Icon icon={course.icon || 'mdi:book-open-page-variant'} className="text-primary text-3xl" />
                    </div>
                    <h3 className="text-lg font-bold text-midnight_text dark:text-white">{course.shortTitle} Course</h3>

                  </div>
                  <EnquiryForm
                    title="Download Brochure"
                    showTitle={true}
                    compact
                    selectedCourse={course.slug}
                  />
                </div>

                {/* Quick Info */}
                <div className="bg-primary/5 dark:bg-primary/10 rounded-2xl p-5 border border-primary/20">
                  <h4 className="font-bold text-midnight_text dark:text-white mb-3 text-sm">Need Help?</h4>
                  <p className="text-xs text-muted dark:text-white/60 mb-3">
                    Talk to our counsellors for personalized guidance.
                  </p>
                  <Link
                    href={`tel:${siteConfig.phone}`}
                    className="flex items-center gap-2 text-primary font-semibold text-sm hover:underline"
                  >
                    <Icon icon="mdi:phone" />
                    {siteConfig.phone}
                  </Link>
                  <Link
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#25D366] font-semibold text-sm hover:underline mt-2"
                  >
                    <Icon icon="mdi:whatsapp" />
                    Chat on WhatsApp
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}

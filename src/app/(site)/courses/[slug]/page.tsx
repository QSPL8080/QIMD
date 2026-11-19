import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react/dist/iconify.js";
// import Breadcrumb from "@/components/Common/Breadcrumb";
import EnquiryForm from "@/components/Common/EnquiryForm";
import { coursesData, siteConfig } from "@/data";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return coursesData.map((c) => ({ slug: c.slug }));
}

function findCourse(slug: string) {
  return coursesData.find((c) => c.slug === slug) || null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = findCourse(slug);
  if (!course) return { title: "Program Not Found" };
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
  const course: any = findCourse(slug);
  const whatsappUrl: string = siteConfig.socialLinks.whatsapp;

  if (!course) notFound();

  const courseBanner = course.bannerImage || course.image;
  const modeLabel = !course.mode || /^offline/i.test(course.mode) ? 'Offline Program' : String(course.mode).replace(/Course/gi, 'Program');
  const highlights: string[] = course.highlights || course.outcomes || [];
  const outcomes: string[] = course.outcomes || [];
  const curriculum: any[] = course.curriculum || [];

  return (
    <div className="qp qp-detail">
      {/* Header */}
      <section className="qp-hero qp-dhero" data-qx="off">
        <div className="qp-wrap">
          <nav className="qp-crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <Icon icon="mdi:chevron-right" />
            <Link href="/courses">Programs</Link>
            <Icon icon="mdi:chevron-right" />
            <span>{course.shortTitle}</span>
          </nav>

          <div className="qp-dhero-grid">
            <div className="qp-dhero-copy">
              <div className="qp-chips">
                <span className="qp-chip">
                  <Icon icon="mdi:clock-outline" />
                  {course.duration}
                </span>
                <span className="qp-chip">
                  <Icon icon="mdi:school" />
                  {modeLabel}
                </span>
              </div>
              <h1 className="qp-h1">{course.title}</h1>
              {course.description && <p className="qp-lead">{course.description}</p>}
              <div className="qp-actions">
                <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="qp-btn qp-btn-ghost">
                  <Icon icon="mdi:whatsapp" />
                  <span>Chat on WhatsApp</span>
                </Link>
              </div>
            </div>

            {courseBanner && (
              <div className="qp-dhero-media">
                <Image
                  src={courseBanner}
                  alt={course.title}
                  width={1200}
                  height={500}
                  priority
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="qp-dbody">
        <div className="qp-wrap qp-dgrid">
          {/* Main Content */}
          <div className="qp-dmain">
            {/* Highlights */}
            <div className="qp-block">
              <div className="qp-block-head">
                <span className="qp-block-num">01</span>
                <h2 className="qp-h3">Program Highlights</h2>
              </div>
              <div className="qp-tiles">
                {highlights.map((highlight: string, i: number) => (
                  <div key={i} className="qp-tile">
                    <span className="qp-tile-ic"><Icon icon="mdi:check" /></span>
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Outcomes */}
            <div className="qp-block">
              <div className="qp-block-head">
                <span className="qp-block-num">02</span>
                <h2 className="qp-h3">What You Will Learn</h2>
              </div>
              <ol className="qp-learn">
                {outcomes.map((outcome: string, i: number) => (
                  <li key={i}>
                    <Icon icon="mdi:star-four-points" className="qp-learn-ic" />
                    <span>{outcome}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Curriculum */}
            {curriculum.length > 0 && (
              <div className="qp-block">
                <div className="qp-block-head">
                  <span className="qp-block-num">03</span>
                  <h2 className="qp-h3">Program Curriculum</h2>
                </div>
                <div className="qp-modules">
                  {curriculum.map((module: any) => (module.topics || []).length === 0 ? (
                    <div key={module.moduleNumber} className="qp-module is-static">
                      <div className="qp-module-row">
                        <span className="qp-module-num">{String(module.moduleNumber).padStart(2, '0')}</span>
                        <span className="qp-module-title">Module {module.moduleNumber}: {module.title}</span>
                      </div>
                    </div>
                  ) : (
                    <details key={module.moduleNumber} className="qp-module">
                      <summary>
                        <span className="qp-module-num">{String(module.moduleNumber).padStart(2, '0')}</span>
                        <span className="qp-module-title">
                          Module {module.moduleNumber}: {module.title}
                        </span>
                        <Icon icon="mdi:plus" className="qp-module-ic" />
                      </summary>
                      <ul>
                        {(module.topics || []).map((topic: any, i: number) => (
                          <li key={i}>{topic.title}</li>
                        ))}
                      </ul>
                    </details>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar – Enquiry Form */}
          <aside className="qp-dside">
            <div className="qp-dside-inner">
              <div id="enquire" className="qp-formcard">
                <div className="qp-formcard-head">
                  <span className="qp-formcard-ic">
                    <Icon icon={course.icon || 'mdi:book-open-page-variant'} />
                  </span>
                  <h3>{course.shortTitle?.replace(/Course/gi, 'Program')}</h3>
                </div>
                <EnquiryForm
                  title="Enquire Now"
                  showTitle={true}
                  compact
                  selectedCourse={course.slug}
                />
              </div>

              {/* Quick Info */}
              <div className="qp-help">
                <h4>Need Help?</h4>
                <p>Talk to our counsellors for personalized guidance.</p>
                <Link href={`tel:${siteConfig.phone}`} className="qp-help-link">
                  <Icon icon="mdi:phone" />
                  {siteConfig.phone}
                </Link>
                <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="qp-help-link is-wa">
                  <Icon icon="mdi:whatsapp" />
                  Chat on WhatsApp
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

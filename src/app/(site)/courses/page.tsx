import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react/dist/iconify.js";
import { siteConfig, coursesData } from "@/data";
import type { Course } from "@/types";

export const metadata: Metadata = {
  title: `Programs – ${siteConfig.name}`,
  description: "Explore QIMD's AI-powered programs in Digital Marketing, Graphic Design, and Video Editing. 6-month offline training with live projects and 100% placement support.",
  alternates: { canonical: "https://www.qimd.in/courses" },
};

function modeLabel(mode?: string) {
  return !mode || mode === 'Offline' || mode === 'Offline Only' || mode === 'Offline Course'
    ? 'Offline Program'
    : mode.replace(/Course/gi, 'Program');
}

export default function CoursesPage() {
  const courses: Course[] = coursesData;

  return (
    <div className="qp">
      {/* Header */}
      <section className="qp-hero" data-qx="off">
        <div className="qp-wrap">
          <div className="qp-hero-grid">
            <div>
              <span className="qp-kicker">
                <span className="qp-kicker-line" aria-hidden="true" />
                Programs
              </span>
              <h1 className="qp-h1">AI-Powered Training Programs</h1>
              <p className="qp-lead">
                Industry-oriented, practical, and AI-powered. All programs are{" "}
                <strong>offline only</strong> with live client projects, internships, and 100% job assistance.
              </p>
            </div>

            {/* Program index — jumps to each program below */}
            <nav className="qp-index" aria-label="Programs">
              {courses.map((course, index) => (
                <a key={course.id} href={`#program-${course.slug}`} className="qp-index-item">
                  <span className="qp-index-num">{String(index + 1).padStart(2, "0")}</span>
                  <span className="qp-index-title">{course.title}</span>
                  <Icon icon="mdi:arrow-down" className="qp-index-ic" />
                </a>
              ))}
            </nav>
          </div>
        </div>
      </section>

      {/* Program rows */}
      <section className="qp-list">
        <div className="qp-wrap">
          {courses.map((course, index) => {
            const courseImage = (course as any).bannerImage || course.image
            const highlightsList = course.highlights || course.learningOutcomes || ['100% Practical Training', 'AI Tools Integration', 'Live Client Projects', '100% Placement Support']
            return (
              <article
                key={course.id}
                id={`program-${course.slug}`}
                className={`qp-row${index % 2 === 1 ? ' is-flip' : ''}`}
              >
                <Link href={`/courses/${course.slug}`} className="qp-media" aria-label={course.title}>
                  {courseImage ? (
                    <Image
                      src={courseImage}
                      alt={course.title}
                      fill
                      unoptimized
                      quality={100}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  ) : (
                    <span className="qp-media-fallback">
                      <Icon icon={course.icon || 'mdi:book-open-page-variant'} />
                    </span>
                  )}
                </Link>

                <div className="qp-body">
                  <div className="qp-chips">
                    {course.featured && <span className="qp-chip is-popular">Popular</span>}
                    <span className="qp-chip">
                      <Icon icon="mdi:clock-outline" />
                      {course.duration}
                    </span>
                    <span className="qp-chip">
                      <Icon icon="mdi:school" />
                      {modeLabel(course.mode)}
                    </span>
                  </div>

                  <h2 className="qp-h2">
                    <Link href={`/courses/${course.slug}`}>{course.title}</Link>
                  </h2>
                  <p className="qp-desc">{course.description}</p>

                  <ul className="qp-points">
                    {highlightsList.slice(0, 4).map((highlight, i) => (
                      <li key={i}>
                        <span className="qp-point-ic"><Icon icon="mdi:check" /></span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="qp-actions">
                    <Link href={`/courses/${course.slug}`} className="qp-btn qp-btn-main">
                      <span>View Program</span>
                      <Icon icon="mdi:arrow-top-right" />
                    </Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  );
}

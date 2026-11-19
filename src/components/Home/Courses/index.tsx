'use client'

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react/dist/iconify.js";

interface CoursesSectionProps {
  courses?: any[];
}

function modeLabel(mode?: string) {
  return !mode || mode === 'Offline' || mode === 'Offline Only' || mode === 'Offline Course'
    ? 'Offline Program'
    : mode.replace(/Course/gi, 'Program');
}

/** Home: program showcase — programs change one by one as you scroll (desktop), tap to switch (mobile) */
const CoursesSection: React.FC<CoursesSectionProps> = ({ courses = [] }) => {
  const [active, setActive] = useState(0);
  const [scrollMode, setScrollMode] = useState(false);
  const [progress, setProgress] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const count = courses?.length || 0;

  // Scroll-driven switching only where the sticky panel fits the screen
  useEffect(() => {
    const check = () => setScrollMode(count > 1 && window.innerWidth >= 1024 && window.innerHeight >= 720);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [count]);

  useEffect(() => {
    if (!scrollMode) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = trackRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const total = el.offsetHeight - window.innerHeight;
        const p = total > 0 ? Math.min(Math.max(-rect.top / total, 0), 0.9999) : 0;
        setProgress(p);
        setActive(Math.floor(p * count));
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, [scrollMode, count]);

  const selectProgram = useCallback((i: number) => {
    const el = trackRef.current;
    if (scrollMode && el) {
      const total = el.offsetHeight - window.innerHeight;
      const top = el.getBoundingClientRect().top + window.scrollY + (total * (i + 0.5)) / count;
      window.scrollTo({ top, behavior: 'smooth' });
    } else {
      setActive(i);
    }
  }, [scrollMode, count]);

  if (!courses || courses.length === 0) return null;

  const course = courses[Math.min(active, courses.length - 1)];
  const courseImage = course.image || course.bannerImage;
  const highlightsList: string[] =
    course.highlights || course.learningOutcomes || ['100% Practical Training', 'AI Tools Integration', 'Live Client Projects', '100% Placement Support'];

  return (
    <section className="qo-sec qo-programs" id="courses">
      <div className="qo-wrap">
        <div className="qo-head">
          <span className="qo-kicker">
            <Icon icon="mdi:book-open-page-variant" />
            Our Programs
          </span>
          <h2 className="qo-h2">Our Most In-Demand Training Programs</h2>
          <p className="qo-lead">
            Practical, AI-powered training programs designed to make you job-ready from day one.
            All programs are offline with live client projects and 100% placement support.
          </p>
        </div>

        <div
          ref={trackRef}
          className={`qo-prog-track${scrollMode ? " is-scroll" : ""}`}
          style={scrollMode ? { height: `calc(100vh + ${(count - 1) * 70}vh)` } : undefined}
        >
        <div className="qo-prog-sticky">
        <div className="qo-prog">
          {/* Program picker */}
          <div className="qo-prog-tabs" role="tablist" aria-label="Programs">
            {courses.map((c, i) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={i === active}
                onClick={() => selectProgram(i)}
                className={`qo-prog-tab${i === active ? " is-active" : ""}`}
              >
                <span className="qo-prog-num">{String(i + 1).padStart(2, "0")}</span>
                <span className="qo-prog-tab-text">
                  <span className="qo-prog-tab-title">{c.title}</span>
                  <span className="qo-prog-tab-meta">{c.duration} · {modeLabel(c.mode)}</span>
                </span>
                <Icon icon="mdi:arrow-right" className="qo-prog-tab-arrow" />
                {scrollMode && i === active && (
                  <span
                    className="qo-prog-tab-progress"
                    style={{ transform: `scaleX(${Math.min(1, Math.max(0, progress * count - i))})` }}
                    aria-hidden="true"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Selected program */}
          <article key={course.id} className="qo-prog-panel" role="tabpanel">
            <Link href={`/courses/${course.slug}`} className="qo-prog-media" aria-label={course.title}>
              {courseImage ? (
                <Image
                  src={courseImage}
                  alt={course.title}
                  fill
                  unoptimized
                  quality={100}
                  sizes="(max-width: 1024px) 100vw, 45vw"
                />
              ) : (
                <span className="qo-prog-fallback">
                  <Icon icon={course.icon || 'mdi:book-open-page-variant'} />
                </span>
              )}
              {course.featured && <span className="qo-prog-badge">Popular</span>}
            </Link>

            <div className="qo-prog-body">
              <div className="qo-prog-chips">
                <span>
                  <Icon icon="mdi:clock-outline" />
                  {course.duration}
                </span>
                <span>
                  <Icon icon="mdi:school" />
                  {modeLabel(course.mode)}
                </span>
              </div>
              <h3 className="qo-prog-title">
                <Link href={`/courses/${course.slug}`}>{course.title}</Link>
              </h3>
              <p className="qo-prog-desc">{course.description}</p>
              <ul className="qo-prog-points">
                {highlightsList.slice(0, 4).map((highlight, index) => (
                  <li key={index}>
                    <Icon icon="mdi:check-circle" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
              <div className="qo-prog-actions">
                <Link href={`/courses/${course.slug}`} className="qo-btn qo-btn-main">
                  View Program
                </Link>
              </div>
            </div>
          </article>
        </div>
        </div>
        </div>

        <div className="qo-center">
          <Link href="/courses" className="qo-btn qo-btn-dark">
            <span>View All Programs</span>
            <Icon icon="mdi:arrow-right" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;

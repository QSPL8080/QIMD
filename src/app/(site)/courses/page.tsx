import type { Metadata } from "next";
import CourseCard from "@/components/Common/CourseCard";
import { siteConfig } from "@/data";
import { getDynamicCourses } from "@/lib/getDynamicData";

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: `Courses – ${siteConfig.name}`,
  description: "Explore QIMD's AI-powered courses in Digital Marketing, Graphic Design, and Video Editing. 6-month offline training with live projects and 100% placement support.",
  alternates: { canonical: "https://www.qimd.in/courses" },
};

export default async function CoursesPage() {
  const courses = await getDynamicCourses();

  return (
    <>
      {/* <Breadcrumb
        title="Our Training Programs"
        items={[
          { label: "Home", href: "/" },
          { label: "Courses" },
        ]}
      /> */}

      <section className="section-py bg-grey dark:bg-dark">
        <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4">
          {/* Header */}
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-midnight_text dark:text-white mb-4">
              AI-Powered Training Programs
            </h2>
            <p className="text-muted dark:text-white/60 text-base max-w-2xl mx-auto">
              Industry-oriented, practical, and AI-powered. All courses are{" "}
              <strong className="text-primary">offline only</strong> with live client projects, internships, and 100% job assistance.
            </p>
          </div>

          {/* Course Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, index) => (
              <div key={course.id} data-aos="fade-up" data-aos-delay={index * 100}>
                <CourseCard course={course} showBrochure />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

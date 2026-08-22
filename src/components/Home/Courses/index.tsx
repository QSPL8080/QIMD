import Link from "next/link";
import { Icon } from "@iconify/react/dist/iconify.js";
import { coursesData } from "@/data";
import CourseCard from "@/components/Common/CourseCard";

interface CoursesSectionProps {
  courses?: any[];
}

const CoursesSection: React.FC<CoursesSectionProps> = ({ courses = [] }) => {
  if (!courses || courses.length === 0) return null;
  return (
    <section className="section-py bg-grey dark:bg-dark" id="courses">
      <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4">
        {/* Section Header */}
        <div className="text-center mb-12" data-aos="fade-up">
          <div className="badge-primary mb-3">
            <Icon icon="mdi:book-open-page-variant" />
            Our Programs
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-midnight_text dark:text-white mb-4">
            Our Most In-Demand Training Programs
          </h2>
          <p className="text-muted dark:text-white/60 text-base max-w-2xl mx-auto">
            Practical, AI-powered training programs designed to make you job-ready from day one.
            All courses are offline with live client projects and 100% placement support.
          </p>
        </div>

        {/* Course Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, index) => (
            <div key={course.id} data-aos="fade-up" data-aos-delay={index * 100}>
              <CourseCard course={course} showBrochure={true} />
            </div>
          ))}
        </div>

        {/* View All CTA */}
        <div className="text-center mt-12" data-aos="fade-up">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 bg-primary hover:bg-darkprimary text-white font-semibold px-8 py-4 rounded-xl text-base transition-all duration-200 hover:-translate-y-0.5 shadow-lg"
          >
            View All Programs
            <Icon icon="mdi:arrow-right" className="text-lg" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;

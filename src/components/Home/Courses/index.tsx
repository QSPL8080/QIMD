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
    <section
      className="py-16 lg:py-24 relative overflow-hidden text-midnight_text border-y border-slate-200/80 dark:border-dark_border"
      id="courses"
      style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #ffffff 40%, #e8dcff 75%, #c8e0fe 100%)',
      }}
    >
      {/* Subtle Ambient Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#764DFF]/10 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#38bdf8]/10 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12" data-aos="fade-up">
          <div className="inline-flex items-center gap-2 bg-[#764DFF]/15 text-[#5c38d6] border border-[#764DFF]/25 px-4 py-1.5 rounded-full text-xs font-bold backdrop-blur-md mb-3 shadow-xs">
            <Icon icon="mdi:book-open-page-variant" className="text-base text-[#764DFF]" />
            <span>Our Programs</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#111827] dark:text-white mb-4 tracking-tight">
            Our Most In-Demand Training Programs
          </h2>
          <p className="text-slate-700 dark:text-white/80 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-medium">
            Practical, AI-powered training programs designed to make you job-ready from day one.
            All programs are offline with live client projects and 100% placement support.
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
            className="inline-flex items-center gap-2 bg-[#764DFF] hover:bg-[#5c38d6] text-white font-extrabold px-8 py-4 rounded-xl text-sm sm:text-base transition-all duration-200 hover:scale-105 shadow-xl"
          >
            <span>View All Programs</span>
            <Icon icon="mdi:arrow-right" className="text-lg" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;

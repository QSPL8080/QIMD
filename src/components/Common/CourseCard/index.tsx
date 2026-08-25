import Image from 'next/image';
import Link from "next/link";
import { Icon } from "@iconify/react/dist/iconify.js";
import type { Course } from "@/types";

interface CourseCardProps {
  course: Course;
  showBrochure?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, showBrochure = true }) => {
  return (
    <div className="bg-white dark:bg-darklight rounded-3xl border-[1.5px] border-[#764DFF]/25 dark:border-dark_border hover:border-[#764DFF] shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_15px_35px_rgba(118,77,255,0.18)] transition-all duration-300 hover:-translate-y-2 overflow-hidden flex flex-col h-full">
      {/* Course Image Banner */}
      <div className="relative overflow-hidden bg-gray-100 dark:bg-dark" style={{ height: '220px' }}>
        {(() => {
          const courseImage = course.image || (course as any).bannerImage;
          return courseImage ? (
            <Image
              src={courseImage}
              alt={course.title}
              fill
              unoptimized
              quality={100}
              className="object-contain p-2 transition-transform duration-500 hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="bg-gradient-to-br from-[#764DFF] to-[#4999D4] h-full flex items-center justify-center">
              <Icon icon={course.icon || 'mdi:book-open-page-variant'} className="text-white text-7xl animate-float" />
            </div>
          );
        })()}
        {course.featured && (
          <span className="absolute top-3 right-3 bg-[#764DFF] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md z-10">
            Popular
          </span>
        )}
      </div>

      <div className="p-6 flex flex-col flex-1">
        {/* Meta */}
        <div className="flex items-center gap-3 mb-3">
          <span className="inline-flex items-center gap-1 text-xs font-medium bg-[#764DFF]/10 text-[#764DFF] px-2.5 py-1 rounded-full">
            <Icon icon="mdi:clock-outline" className="text-sm" />
            {course.duration}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium bg-[#4999D4]/10 text-[#4999D4] px-2.5 py-1 rounded-full">
            <Icon icon="mdi:school" className="text-sm" />
            {!course.mode || course.mode === 'Offline' || course.mode === 'Offline Only' ? 'Offline Course' : course.mode}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-midnight_text dark:text-white mb-2 line-clamp-2 leading-snug">
          {course.title}
        </h3>

        <p className="text-sm text-muted dark:text-white/60 mb-4 line-clamp-2">
          {course.description}
        </p>

        {/* Highlights */}
        {(() => {
          const highlightsList = course.highlights || course.learningOutcomes || ['100% Practical Training', 'AI Tools Integration', 'Live Client Projects', '100% Placement Support'];
          return (
            <ul className="space-y-2 mb-5 flex-1">
              {highlightsList.slice(0, 4).map((highlight, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-midnight_text dark:text-white/80">
                  <Icon icon="mdi:check-circle" className="text-[#764DFF] flex-shrink-0 text-base" />
                  {highlight}
                </li>
              ))}
            </ul>
          );
        })()}

        {/* Actions */}
        <div className="flex flex-col gap-2.5 mt-auto">
          <Link
            href={`/courses/${course.slug}`}
            className="w-full bg-primary hover:bg-darkprimary text-white text-sm font-semibold py-3 rounded-xl text-center shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
          >
            View Program
          </Link>
          {showBrochure && (
            <Link
              href={`/courses/${course.slug}#download-brochure`}
              className="w-full border-[1.5px] border-[#764DFF]/35 hover:border-[#764DFF] bg-[#764DFF]/5 hover:bg-[#764DFF]/12 text-[#764DFF] text-sm font-semibold py-3 rounded-xl text-center transition-all duration-200 flex items-center justify-center gap-2 shadow-xs"
            >
              <Icon icon="mdi:file-download" className="text-base" />
              Download Brochure
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;

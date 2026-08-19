import Link from "next/link";
import { Icon } from "@iconify/react/dist/iconify.js";

const GalleryPreviewSection: React.FC = () => {
  const placeholders = [
    { category: "Classroom", caption: "Interactive classroom sessions" },
    { category: "Training", caption: "Hands-on practical training" },
    { category: "Workshop", caption: "Live workshops & masterclasses" },
    { category: "Activities", caption: "Student activities & projects" },
    { category: "Facilities", caption: "Modern training facilities" },
    { category: "Placements", caption: "Placement drives & events" },
  ];

  return (
    <section className="section-py bg-white dark:bg-dark" id="gallery">
      <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4">
        {/* Section Header */}
        <div className="text-center mb-12" data-aos="fade-up">
          <div className="badge-primary mb-3">
            <Icon icon="mdi:image-multiple" />
            Gallery
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-midnight_text dark:text-white mb-4">
            Our Training Gallery
          </h2>
          <p suppressHydrationWarning className="text-muted dark:text-white/60 text-base max-w-2xl mx-auto">
            Take a glimpse into life at QIMD - from interactive classroom sessions and hands-on practical training to live workshops, student activities, and real learning experiences
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
          {placeholders.map((item, index) => (
            <div
              key={index}
              className="relative group rounded-2xl overflow-hidden bg-primary/5 dark:bg-darklight aspect-video flex items-center justify-center card-hover"
              data-aos="fade-up"
              data-aos-delay={index * 80}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-darkprimary/20" />
              <div className="relative z-10 text-center p-4">
                <Icon icon="mdi:image" className="text-primary/30 text-6xl mx-auto mb-2" />
                <span className="text-xs font-semibold text-primary/60 uppercase tracking-wider">{item.category}</span>
                <p className="text-xs text-muted/60 mt-1">{item.caption}</p>
              </div>
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Icon icon="mdi:magnify-plus" className="text-white text-3xl" />
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10" data-aos="fade-up">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 bg-primary hover:bg-darkprimary text-white font-semibold px-8 py-4 rounded-xl text-base transition-all duration-200 hover:-translate-y-0.5 shadow-lg"
          >
            View Full Gallery
            <Icon icon="mdi:arrow-right" className="text-lg" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default GalleryPreviewSection;

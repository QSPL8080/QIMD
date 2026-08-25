import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react/dist/iconify.js";
import { galleryData } from "@/data";

interface GalleryPreviewSectionProps {
  items?: any[];
}

const GalleryPreviewSection: React.FC<GalleryPreviewSectionProps> = ({ items }) => {
  const displayItems = items && items.length > 0 ? items.slice(0, 6) : galleryData.slice(0, 6);

  return (
    <section
      className="py-16 lg:py-24 relative overflow-hidden text-midnight_text border-y border-slate-200/80 dark:border-dark_border"
      id="gallery"
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
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#764DFF]/15 text-[#5c38d6] border border-[#764DFF]/25 text-xs font-bold mb-3 shadow-xs">
            <Icon icon="mdi:image-multiple" className="text-[#764DFF] text-base" />
            <span>Campus Gallery</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#111827] dark:text-white mb-4 tracking-tight">
            Our Training Gallery
          </h2>
          <p suppressHydrationWarning className="text-slate-700 dark:text-white/80 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-medium">
            Take a glimpse into life at QIMD - from interactive classroom sessions and hands-on practical training to live workshops, student activities, and real learning experiences
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayItems.map((item: any, index: number) => {
            const imgSrc = item.src || item.fileUrl || item.imageUrl || 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80';
            return (
              <Link
                key={item.id || index}
                href="/gallery"
                className="relative group rounded-2xl overflow-hidden bg-white aspect-video flex items-center justify-center card-hover border border-slate-200/80 shadow-md"
                data-aos="fade-up"
                data-aos-delay={index * 80}
              >
                <Image
                  src={imgSrc}
                  alt={item.alt || item.caption || 'QIMD Gallery Image'}
                  fill
                  unoptimized
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10">
                  <span className="inline-block text-[10px] font-bold bg-[#764DFF]/90 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1">
                    {item.category || 'Classroom'}
                  </span>
                  <p className="text-xs font-semibold text-white/90 line-clamp-1">
                    {item.caption || item.alt || 'QIMD Practical Training'}
                  </p>
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-[#764DFF]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                  <Icon icon="mdi:magnify-plus" className="text-white text-3xl drop-shadow-md" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-10" data-aos="fade-up">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 bg-[#764DFF] hover:bg-[#5c38d6] text-white font-extrabold px-8 py-4 rounded-xl text-sm sm:text-base transition-all duration-200 hover:scale-105 shadow-xl"
          >
            <span>View Full Gallery</span>
            <Icon icon="mdi:arrow-right" className="text-lg" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default GalleryPreviewSection;

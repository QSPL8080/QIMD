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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayItems.map((item: any, index: number) => {
            const imgSrc = item.src || item.fileUrl || item.imageUrl || 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80';
            return (
              <Link
                key={item.id || index}
                href="/gallery"
                className="relative group rounded-2xl overflow-hidden bg-primary/5 dark:bg-darklight aspect-video flex items-center justify-center card-hover border border-border dark:border-dark_border shadow-card"
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
                  <span className="inline-block text-[10px] font-bold bg-primary/90 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1">
                    {item.category || 'Classroom'}
                  </span>
                  <p className="text-xs font-semibold text-white/90 line-clamp-1">
                    {item.caption || item.alt || 'QIMD Practical Training'}
                  </p>
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
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

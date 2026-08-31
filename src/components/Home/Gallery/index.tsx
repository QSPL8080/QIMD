'use client'

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react/dist/iconify.js";
import { galleryData, galleryCategories } from "@/data";

interface GalleryPreviewSectionProps {
  items?: any[];
}

const GalleryPreviewSection: React.FC<GalleryPreviewSectionProps> = ({ items }) => {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const allGalleryItems = items && items.length > 0 ? items : galleryData;

  // Filter items according to activeCategory
  const filtered =
    activeCategory === "All"
      ? allGalleryItems
      : allGalleryItems.filter(
          (img: any) =>
            (img.category || "Classroom").toLowerCase() === activeCategory.toLowerCase()
        );

  // Exactly up to 6 images visible for the selected category (or All)
  const displayItems = filtered.slice(0, 6);

  return (
    <section
      className="py-16 lg:py-24 relative overflow-hidden text-midnight_text border-y border-slate-200/80 dark:border-dark_border"
      id="gallery"
      style={{
        background:
          "linear-gradient(180deg, #ffffff 0%, #ffffff 40%, #e8dcff 75%, #c8e0fe 100%)",
      }}
    >
      {/* Subtle Ambient Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#764DFF]/10 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#38bdf8]/10 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-10" data-aos="fade-up">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#764DFF]/15 text-[#5c38d6] border border-[#764DFF]/25 text-xs font-bold mb-3 shadow-xs">
            <Icon icon="mdi:image-multiple" className="text-[#764DFF] text-base" />
            <span>Campus Gallery</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#111827] dark:text-white mb-4 tracking-tight">
            Our Training Gallery
          </h2>
          <p
            suppressHydrationWarning
            className="text-slate-700 dark:text-white/80 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-medium"
          >
            Take a glimpse into life at QIMD - from interactive classroom sessions and hands-on practical training to live workshops, student activities, and real learning experiences
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10" data-aos="fade-up">
          {galleryCategories.map((cat) => {
            const isActive = activeCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 text-xs sm:text-sm font-bold rounded-full border transition-all duration-200 cursor-pointer shadow-xs ${
                  isActive
                    ? "bg-[#764DFF] text-white border-[#764DFF] shadow-md scale-105"
                    : "bg-white text-slate-700 border-slate-200 hover:border-[#764DFF] hover:text-[#764DFF] hover:bg-purple-50/50"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Gallery Grid (Up to 6 images) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[320px]">
          {displayItems.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500">
              <Icon icon="mdi:image-off-outline" className="text-4xl mx-auto mb-2 text-slate-400" />
              <p className="font-semibold text-sm">No photos available under {activeCategory} yet.</p>
            </div>
          ) : (
            displayItems.map((item: any, index: number) => {
              const imgSrc =
                item.src ||
                item.fileUrl ||
                item.imageUrl ||
                "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80";
              const targetCategory = item.category || "Classroom";

              return (
                <Link
                  key={item.id || index}
                  href={`/gallery?category=${encodeURIComponent(targetCategory)}`}
                  className="relative group rounded-2xl overflow-hidden bg-white aspect-video flex items-center justify-center card-hover border border-slate-200/80 shadow-md"
                  data-aos="fade-up"
                  data-aos-delay={index * 60}
                >
                  <Image
                    src={imgSrc}
                    alt={item.alt || item.caption || "QIMD Gallery Image"}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10">
                    <span className="inline-block text-[10px] font-bold bg-[#764DFF]/90 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1">
                      {targetCategory}
                    </span>
                    <p className="text-xs font-semibold text-white/95 line-clamp-1">
                      {item.caption || item.alt || "QIMD Practical Training"}
                    </p>
                  </div>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-[#764DFF]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                    <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-[#764DFF] font-bold text-xs shadow-lg">
                      <Icon icon="mdi:magnify-plus" className="text-base" />
                      <span>View Category</span>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* CTA Button */}
        <div className="text-center mt-10" data-aos="fade-up">
          <Link
            href={
              activeCategory === "All"
                ? "/gallery"
                : `/gallery?category=${encodeURIComponent(activeCategory)}`
            }
            className="inline-flex items-center gap-2 bg-[#764DFF] hover:bg-[#5c38d6] text-white font-extrabold px-8 py-4 rounded-xl text-sm sm:text-base transition-all duration-200 hover:scale-105 shadow-xl"
          >
            <span>
              {activeCategory === "All"
                ? "View Full Gallery"
                : `View Full "${activeCategory}" Gallery`}
            </span>
            <Icon icon="mdi:arrow-right" className="text-lg" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default GalleryPreviewSection;


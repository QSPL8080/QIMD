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
    <section className="qo-sec qo-gallery" id="gallery">
      <div className="qo-wrap">
        <div className="qo-gallery-head">
          <div className="qo-head is-left">
            <span className="qo-kicker">
              <Icon icon="mdi:image-multiple" />
              Campus Gallery
            </span>
            <h2 className="qo-h2">Our Training Gallery</h2>
            <p className="qo-lead" suppressHydrationWarning>
              Take a glimpse into life at QIMD - from interactive classroom sessions and hands-on practical training to live workshops, student activities, and real learning experiences
            </p>
          </div>

          <div className="qo-gallery-filters" role="tablist" aria-label="Gallery categories">
            {galleryCategories.map((cat) => {
              const isActive = activeCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`qo-gallery-filter${isActive ? " is-active" : ""}`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        <div className="qo-mosaic">
          {displayItems.length === 0 ? (
            <div className="qo-mosaic-empty">
              <Icon icon="mdi:image-off-outline" />
              <p>No photos available under {activeCategory} yet.</p>
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
                  className="qo-tile"
                >
                  <Image
                    src={imgSrc}
                    alt={item.alt || item.caption || "QIMD Gallery Image"}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <span className="qo-tile-caption">
                    <span className="qo-tile-cat">{targetCategory}</span>
                    <span className="qo-tile-text">{item.caption || item.alt || "QIMD Practical Training"}</span>
                  </span>
                  <span className="qo-tile-view">
                    <Icon icon="mdi:magnify-plus" />
                    <span>View Category</span>
                  </span>
                </Link>
              );
            })
          )}
        </div>

        <div className="qo-center">
          <Link
            href={activeCategory === "All" ? "/gallery" : `/gallery?category=${encodeURIComponent(activeCategory)}`}
            className="qo-btn qo-btn-dark"
          >
            <span>
              {activeCategory === "All" ? "View Full Gallery" : `View Full "${activeCategory}" Gallery`}
            </span>
            <Icon icon="mdi:arrow-right" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default GalleryPreviewSection;

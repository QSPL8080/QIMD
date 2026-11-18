'use client';

import React, { useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react/dist/iconify.js";
import { format } from "date-fns";


// ── Helpers for article display (same cleaning rules as the previous card) ──
const cleanExcerpt = (excerpt: string) =>
  (excerpt || "")
    .replace(/^##\s*Summary\s*/i, "")
    .replace(/^#+\s*/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .trim();

const formatDate = (blog: any) => {
  const raw = blog.date || blog.publishedAt;
  if (!raw) return "Recent";
  const d = new Date(raw);
  return isNaN(d.getTime()) ? String(raw) : format(d, "MMM dd, yyyy");
};

const coverOf = (blog: any) =>
  blog.coverImage || (blog.images && blog.images.length > 0 ? blog.images[0] : "") || "/images/blog/blog-1.jpg";

function ArticleMeta({ blog }: { blog: any }) {
  return (
    <div className="qb-meta">
      <span>{blog.author || "QIMD Team"}</span>
      <span className="qb-meta-dot" aria-hidden="true" />
      <span>{formatDate(blog)}</span>
      <span className="qb-meta-dot" aria-hidden="true" />
      <span>{blog.readTime || "5 min read"}</span>
    </div>
  );
}

export default function BlogContent({ blogs }: { blogs: any[] }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Active Categories
  const defaultCategories = [
    "Digital Marketing",
    "Graphic Design",
    "Video Editing",
    "Career Development",
  ];
  
  const dynamicCategories = Array.from(
    new Set([
      ...defaultCategories,
      ...(blogs || []).map((b: any) => b.category).filter(Boolean),
    ])
  );

  const categories = ["All", ...dynamicCategories];

  const filteredBlogs = blogs.filter((blog: any) => {
    const matchesCat =
      selectedCategory === "All" ||
      blog.category?.toLowerCase().trim() === selectedCategory.toLowerCase().trim();

    const matchesSearch =
      searchQuery.trim() === "" ||
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCat && matchesSearch;
  });

  const topics = [
    { title: "Digital Marketing", desc: "SEO, PPC & Growth Tactics", icon: "mdi:bullhorn-outline" },
    { title: "Graphic Design", desc: "Branding & Visual Arts", icon: "mdi:palette-outline" },
    { title: "Video Editing", desc: "Reels, Shorts & VFX", icon: "mdi:movie-open-play-outline" },
    { title: "AI Innovations", desc: "Prompt Engineering & Tools", icon: "mdi:robot-outline" },
  ];

  const [lead, ...rest] = filteredBlogs;

  return (
    <div className="qb">
      {/* 1. MASTHEAD */}
      <section className="qb-mast">
        <div className="qb-wrap">
          <div className="qb-mast-rule">
            <span>QIMD Knowledge Hub</span>
          </div>

          <h1 className="qb-mast-title">
            Insights That <em>Empower Careers</em>
          </h1>

          <div className="qb-mast-cols">
            <p className="qb-dropcap">
              Welcome to the <strong>QIMD Knowledge Hub</strong> - your trusted resource for industry insights, practical learning, career guidance, and emerging trends in Digital Marketing, Graphic Design, Video Editing, and Artificial Intelligence.
            </p>
            <p>
              Our blogs are written by industry professionals to help students, working professionals, entrepreneurs, and creative enthusiasts stay informed, build practical knowledge, and succeed in today&apos;s digital-first world.
            </p>
          </div>

          <div className="qb-index">
            {topics.map((t, i) => (
              <div key={i} className="qb-index-item">
                <span className="qb-index-num">{String(i + 1).padStart(2, "0")}</span>
                <Icon icon={t.icon} className="qb-index-ic" />
                <h3>{t.title}</h3>
                <p>{t.desc}</p>
              </div>
            ))}
          </div>

          <div className="qb-mast-cta">
            <a href="#articles" className="qb-link-btn">
              <Icon icon="mdi:newspaper-variant-outline" />
              <span>Explore Articles</span>
              <Icon icon="mdi:arrow-down" />
            </a>
          </div>
        </div>
      </section>

      {/* 2. ARTICLES */}
      <section id="articles" className="qb-articles">
        <div className="qb-wrap">
          <div className="qb-sec-head">
            <span className="qb-kicker">Curated Articles</span>
            <h2 className="qb-sec-title">Explore Our Latest Articles</h2>
            <p className="qb-sec-desc">
              Discover expert-written content covering the latest technologies, marketing strategies, creative trends, AI innovations, and career opportunities. Whether you&apos;re beginning your journey or looking to advance your skills, our articles provide practical insights that you can apply in real-world scenarios.
            </p>
          </div>

          {/* Filter bar */}
          <div className="qb-filter">
            <nav className="qb-cats" aria-label="Article categories">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`qb-cat ${selectedCategory === cat ? "is-active" : ""}`}
                  aria-pressed={selectedCategory === cat}
                >
                  {cat}
                </button>
              ))}
            </nav>
            <div className="qb-search">
              <Icon icon="mdi:magnify" className="qb-search-ic" />
              <input
                type="text"
                placeholder="Search articles by topic or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search articles"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery("")} className="qb-search-clear" aria-label="Clear search">
                  <Icon icon="mdi:close" />
                </button>
              )}
            </div>
          </div>

          {filteredBlogs.length === 0 ? (
            <div className="qb-empty">
              <Icon icon="mdi:file-search-outline" className="qb-empty-ic" />
              <h3>No Articles Found</h3>
              <p>No blog posts match your selected category or search keyword.</p>
              <button type="button" onClick={() => { setSelectedCategory("All"); setSearchQuery(""); }} className="qb-link-btn">
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              {/* Lead story */}
              <article className="qb-lead">
                <Link href={`/blog/${lead.slug}`} className="qb-lead-media">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coverOf(lead)} alt={lead.title} loading="lazy" />
                </Link>
                <div className="qb-lead-body">
                  <span className="qb-kicker">{lead.category || "Digital Marketing"}</span>
                  <h3 className="qb-lead-title">
                    <Link href={`/blog/${lead.slug}`}>{lead.title}</Link>
                  </h3>
                  <p className="qb-lead-excerpt">{cleanExcerpt(lead.excerpt)}</p>
                  <ArticleMeta blog={lead} />
                  <Link href={`/blog/${lead.slug}`} className="qb-read">
                    <span>Read Full Article</span>
                    <Icon icon="mdi:arrow-right" />
                  </Link>
                </div>
              </article>

              {/* Magazine grid */}
              {rest.length > 0 && (
                <div className="qb-grid">
                  {rest.map((blog: any) => (
                    <article key={blog.id} className="qb-card">
                      <Link href={`/blog/${blog.slug}`} className="qb-card-media">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={coverOf(blog)} alt={blog.title} loading="lazy" />
                      </Link>
                      <span className="qb-kicker">{blog.category || "Digital Marketing"}</span>
                      <h3 className="qb-card-title">
                        <Link href={`/blog/${blog.slug}`}>{blog.title}</Link>
                      </h3>
                      <p className="qb-card-excerpt">{cleanExcerpt(blog.excerpt)}</p>
                      <div className="qb-card-foot">
                        <ArticleMeta blog={blog} />
                        <Link href={`/blog/${blog.slug}`} className="qb-read is-small" aria-label={`Read Full Article: ${blog.title}`}>
                          <span>Read Full Article</span>
                          <Icon icon="mdi:arrow-right" />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* 3. LEARN. STAY UPDATED. STAY AHEAD. */}
      <section className="qb-close">
        <div className="qb-wrap">
          <div className="qb-close-grid">
            <div>
              <span className="qb-kicker">
                <Icon icon="mdi:rocket-launch-outline" /> Continuous Growth
              </span>
              <h2 className="qb-close-title">
                Learn. Stay Updated. <em>Stay Ahead.</em>
              </h2>
            </div>
            <div className="qb-close-body">
              <p>
                Continuous learning is essential in today&apos;s rapidly evolving digital landscape. The QIMD Blog is designed to help you expand your knowledge, sharpen your skills, and stay ahead of industry trends through valuable, experience-driven content.
              </p>
              <blockquote className="qb-quote">
                Whether you&apos;re preparing for your first job, advancing your career, or growing your business, our insights are created to support your professional journey every step of the way.
              </blockquote>
              <div className="qb-close-actions">
                <Link href="/courses" className="qb-btn qb-btn-ink">
                  <Icon icon="mdi:school-outline" />
                  <span>Explore Programs</span>
                </Link>
                <Link href="/contact" className="qb-btn qb-btn-outline">
                  <Icon icon="mdi:account-badge-outline" />
                  <span>Contact Admissions</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

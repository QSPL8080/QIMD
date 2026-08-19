'use client';

import React, { useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react/dist/iconify.js";
import BlogCard from "@/components/SharedComponent/Blog/blogCard";

export default function BlogContent({ blogs }: { blogs: any[] }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Dynamically extract all unique category names present in DB blogs
  const defaultCategories = [
    "Digital Marketing",
    "Graphic Design",
    "Video Editing",
    "Artificial Intelligence",
    "Career Development",
    "Industry Insights",
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
      blog.category?.toLowerCase() === selectedCategory.toLowerCase() ||
      blog.category?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      (selectedCategory === "Artificial Intelligence" && (blog.category?.toLowerCase().includes("ai") || blog.title?.toLowerCase().includes("ai"))) ||
      (selectedCategory === "Career Development" && (blog.category?.toLowerCase().includes("career") || blog.title?.toLowerCase().includes("career"))) ||
      (selectedCategory === "Industry Insights" && (blog.category?.toLowerCase().includes("insight") || blog.category?.toLowerCase().includes("general")));

    const matchesSearch =
      searchQuery.trim() === "" ||
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCat && matchesSearch;
  });

  return (
    <div className="bg-grey dark:bg-dark min-h-screen">
      {/* 1. HERO HEADER WITH LIGHT PASTEL GRADIENT */}
      <section
        className="py-16 lg:py-24 relative overflow-hidden text-midnight_text border-b border-slate-200/80 dark:border-dark_border"
        style={{
          background: 'linear-gradient(135deg, #f5f2ff 0%, #f9f5ff 28%, #ffffff 50%, #f0f7fc 72%, #eef5fc 100%)',
        }}
      >
        <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Heading & Detailed Description */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left" data-aos="fade-right">
              <div className="inline-flex items-center gap-2 bg-[#764DFF]/15 text-[#5c38d6] border border-[#764DFF]/25 text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full shadow-2xs backdrop-blur-md">
                <Icon icon="mdi:post-outline" className="text-[#764DFF] text-base" />
                <span>QIMD Knowledge Hub</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#111827] dark:text-white leading-tight tracking-tight">
                Insights That <span className="text-[#764DFF]">Empower Careers</span>
              </h1>

              <div className="space-y-4 text-slate-700 dark:text-white/80 text-xs sm:text-sm leading-relaxed font-medium">
                <p className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">
                  Welcome to the <strong>QIMD Knowledge Hub</strong> — your trusted resource for industry insights, practical learning, career guidance, and emerging trends in Digital Marketing, Graphic Design, Video Editing, and Artificial Intelligence.
                </p>
                <p>
                  Our blogs are written by industry professionals to help students, working professionals, entrepreneurs, and creative enthusiasts stay informed, build practical knowledge, and succeed in today&apos;s digital-first world.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap justify-center lg:justify-start gap-4">
                <a
                  href="#articles"
                  className="bg-[#764DFF] hover:bg-[#5c38d6] text-white font-bold text-xs sm:text-sm px-7 py-3.5 rounded-xl transition-all shadow-md flex items-center gap-2"
                >
                  <Icon icon="mdi:newspaper-variant-outline" className="text-base" />
                  <span>Explore Articles</span>
                </a>
              </div>
            </div>

            {/* Right Column: 4 Topic Highlight Cards */}
            <div className="lg:col-span-5" data-aos="fade-left">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { title: "Digital Marketing", desc: "SEO, PPC & Growth Tactics", icon: "mdi:bullhorn-outline", color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40" },
                  { title: "Graphic Design", desc: "Branding & Visual Arts", icon: "mdi:palette-outline", color: "text-purple-600 bg-purple-50 dark:bg-purple-950/40" },
                  { title: "Video Editing", desc: "Reels, Shorts & VFX", icon: "mdi:video-clapper", color: "text-pink-600 bg-pink-50 dark:bg-pink-950/40" },
                  { title: "AI Innovations", desc: "Prompt Engineering & Tools", icon: "mdi:robot-outline", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-darklight p-5 rounded-2xl border border-slate-200/80 dark:border-dark_border shadow-2xs hover:shadow-md hover:border-[#764DFF]/40 transition-all space-y-2.5 group"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${item.color}`}>
                      <Icon icon={item.icon} />
                    </div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-white group-hover:text-[#764DFF] transition-colors leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-white/60 leading-tight">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. EXPLORE OUR LATEST ARTICLES & CATEGORY FILTERS */}
      <section id="articles" className="section-py bg-white dark:bg-dark">
        <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4">
          
          {/* Section Sub-Header */}
          <div className="text-center max-w-3xl mx-auto mb-10" data-aos="fade-up">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-midnight_text dark:text-white mb-3">
              Explore Our Latest Articles
            </h2>
            <p className="text-muted dark:text-white/70 text-sm sm:text-base leading-relaxed">
              Discover expert-written content covering the latest technologies, marketing strategies, creative trends, AI innovations, and career opportunities. Whether you&apos;re beginning your journey or looking to advance your skills, our articles provide practical insights that you can apply in real-world scenarios.
            </p>
          </div>

          {/* Search & Category Pills */}
          <div className="mb-12 space-y-6" data-aos="fade-up">
            {/* Search Input */}
            <div className="max-w-md mx-auto relative">
              <input
                type="text"
                placeholder="Search articles by topic or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-grey dark:bg-darklight border border-border dark:border-dark_border rounded-2xl text-xs sm:text-sm text-midnight_text dark:text-white focus:outline-none focus:border-primary transition-all font-medium"
              />
              <Icon icon="mdi:search" className="text-muted text-lg absolute left-3.5 top-3.5" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-3.5 text-muted hover:text-midnight_text"
                >
                  <Icon icon="mdi:close" className="text-base" />
                </button>
              )}
            </div>

            {/* Categories Pills */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-primary text-white shadow-md scale-105"
                      : "bg-grey dark:bg-darklight text-midnight_text dark:text-white/80 border border-border dark:border-dark_border hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Articles Grid */}
          {filteredBlogs.length === 0 ? (
            <div className="text-center py-12 bg-grey dark:bg-darklight rounded-3xl border border-border dark:border-dark_border">
              <Icon icon="mdi:file-search-outline" className="text-primary text-5xl mx-auto mb-3" />
              <h3 className="text-lg font-bold text-midnight_text dark:text-white mb-1">No Articles Found</h3>
              <p className="text-xs text-muted dark:text-white/60 mb-4">
                No blog posts match your selected category or search keyword.
              </p>
              <button
                onClick={() => { setSelectedCategory("All"); setSearchQuery(""); }}
                className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBlogs.map((blog: any) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          )}

        </div>
      </section>

      {/* 3. LEARN. STAY UPDATED. STAY AHEAD. (CLEAN FULL-WIDTH SECTION) */}
      <section className="py-16 lg:py-24 bg-[#764DFF]/5 dark:bg-darklight border-t border-slate-200/80 dark:border-dark_border">
        <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4">
          <div className="text-center space-y-6 max-w-4xl mx-auto" data-aos="fade-up">
            <div className="inline-flex items-center gap-2 bg-[#764DFF]/10 text-[#764DFF] text-xs font-extrabold px-4 py-1.5 rounded-full">
              <Icon icon="mdi:rocket-launch-outline" className="text-base" />
              Continuous Growth
            </div>
            
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-midnight_text dark:text-white tracking-tight">
              Learn. Stay Updated. <span className="text-[#764DFF]">Stay Ahead.</span>
            </h2>

            <div className="space-y-3 text-slate-600 dark:text-white/80 text-xs sm:text-sm leading-relaxed font-medium max-w-3xl mx-auto">
              <p>
                Continuous learning is essential in today&apos;s rapidly evolving digital landscape. The QIMD Blog is designed to help you expand your knowledge, sharpen your skills, and stay ahead of industry trends through valuable, experience-driven content.
              </p>
              <p className="text-slate-800 dark:text-white font-bold text-xs sm:text-sm">
                Whether you&apos;re preparing for your first job, advancing your career, or growing your business, our insights are created to support your professional journey every step of the way.
              </p>
            </div>

            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <Link
                href="/courses"
                className="bg-[#764DFF] hover:bg-[#5c38d6] text-white font-bold px-8 py-3.5 rounded-xl text-xs sm:text-sm transition-all shadow-md flex items-center gap-2"
              >
                <Icon icon="mdi:school-outline" className="text-base" />
                <span>Explore Courses</span>
              </Link>
              <Link
                href="/contact"
                className="border border-[#764DFF] text-[#764DFF] hover:bg-[#764DFF]/5 font-bold px-8 py-3.5 rounded-xl text-xs sm:text-sm transition-all flex items-center gap-2"
              >
                <Icon icon="mdi:account-badge-outline" className="text-base" />
                <span>Contact Admissions</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

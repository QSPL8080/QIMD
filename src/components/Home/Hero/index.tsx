'use client'
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react/dist/iconify.js";
import { statsData, heroBadges, siteConfig, coursesData } from "@/data";
import EnquiryForm from "@/components/Common/EnquiryForm";
import HeroBannerCarousel from "./HeroBannerCarousel";

function CounterItem({ stat, index }: { stat: { value: string; label: string }, index: number }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const isPercentage = stat.value.includes('%');
  const isPlus = stat.value.includes('+');
  const numericValue = parseInt(stat.value.replace(/[^0-9]/g, '')) || 0;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            const duration = 3000; // 3 seconds for clear, smooth counting
            const startTime = performance.now();

            const animate = (currentTime: number) => {
              const elapsedTime = currentTime - startTime;
              const progress = Math.min(elapsedTime / duration, 1);
              // Smooth easeOutExpo curve
              const easeOutProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
              const currentCount = Math.floor(easeOutProgress * numericValue);

              setCount(currentCount);

              if (progress < 1) {
                requestAnimationFrame(animate);
              } else {
                setCount(numericValue);
              }
            };

            requestAnimationFrame(animate);
          }
        });
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasAnimated, numericValue]);

  return (
    <div ref={ref} className="text-center p-2 sm:p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-md transition-transform duration-300 hover:-translate-y-1">
      <div className="text-xl sm:text-2xl xl:text-3xl font-black text-white mb-0.5 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-purple-200" suppressHydrationWarning>
        {hasAnimated ? `${count.toLocaleString()}${isPlus ? '+' : ''}${isPercentage ? '%' : ''}` : '0'}
      </div>
      <div className="text-[11px] sm:text-xs text-slate-200 font-semibold leading-tight">{stat.label}</div>
    </div>
  );
}

const HeroSection: React.FC<{ section?: any }> = ({ section }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const searchResults = searchQuery.length > 1
    ? coursesData.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const title = section?.sectionTitle || "India's First Industry-Oriented & AI Powered Marketing & Design Institute";
  const subtitle = section?.subtitle || "Join QIMD's AI-Powered & Performance-Driven Practical Training Program in Digital Marketing, Graphic Design & Video Editing with 100% Job Assistance & Placement Opportunities.";
  const buttonText = section?.buttonText || "Explore Courses";
  const buttonUrl = section?.buttonUrl || "/courses";

  return (
    <section
      className="relative overflow-hidden text-white pt-2 sm:pt-3 lg:pt-4 pb-6 sm:pb-8 lg:pb-10 border-b border-white/10"
      style={{
        background: 'linear-gradient(135deg, #180e29 0%, #2b1654 35%, #3e1f7d 70%, #0284c7 100%)',
      }}
    >
      {/* Ambient background glow accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#764DFF]/25 blur-3xl" />
        <div className="absolute top-1/2 -left-24 w-[420px] h-[420px] rounded-full bg-[#0284c7]/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-[#BD69F2]/20 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1.5px, transparent 1.5px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4 relative z-10">
        
        {/* Main 2-Column Hero Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 lg:gap-6 items-stretch">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-7 flex flex-col justify-between h-full">
            <div>
              {/* Search Bar Card with Dark Glassmorphism */}
              <div className="mb-2 sm:mb-3 hero-card-slide-left">
                <div className="bg-white/10 dark:bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-xl p-3.5 sm:p-4 w-full max-w-2xl transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                      <Icon icon="mdi:magnify" className="text-cyan-300 text-base" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">Quick Course Search</span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search for courses (e.g. Graphic Design, Marketing)..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                      className="w-full pl-3.5 pr-9 py-2.5 rounded-xl border border-white/25 text-sm text-white placeholder:text-slate-300 bg-white/10 backdrop-blur-md focus:outline-none focus:border-cyan-300 focus:bg-white/20 transition-all font-medium"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white"
                      >
                        <Icon icon="mdi:close" className="text-sm" />
                      </button>
                    )}
                  </div>
                  
                  {/* Dropdown search results */}
                  {searchFocused && searchResults.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-white/15 space-y-1 max-h-48 overflow-y-auto bg-[#1e1338]/95 p-2 rounded-xl border border-white/20 shadow-2xl">
                      {searchResults.map(c => (
                        <Link
                          key={c.id}
                          href={`/courses/${c.slug}`}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/15 text-xs font-semibold text-white transition-colors"
                        >
                          <Icon icon="mdi:book-open-page-variant" className="text-cyan-300 text-sm flex-shrink-0" />
                          <span>{c.title}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                  {searchFocused && searchQuery.length > 1 && searchResults.length === 0 && (
                    <p className="text-xs text-slate-300 mt-2 px-1">No matching courses found</p>
                  )}
                </div>
              </div>

              {/* HERO CONTENT */}
              <div className="space-y-4 sm:space-y-5">
                {/* Institute Badge */}
                <div className="inline-flex items-center gap-2 bg-white/15 text-white border border-white/25 text-xs sm:text-sm font-bold px-3.5 py-1.5 rounded-full shadow-xs backdrop-blur-md">
                  <Icon icon="mdi:star-four-points" className="text-xs text-cyan-300 animate-pulse" />
                  <span>{siteConfig.fullName}</span>
                </div>

                {/* Main Headline */}
                <h1
                  className="font-libre-baskerville text-2xl sm:text-3xl lg:text-4xl xl:text-4xl font-bold text-white leading-snug tracking-tight drop-shadow-md"
                  style={{ fontFamily: "var(--font-libre-baskerville), 'Libre Baskerville', Georgia, serif" }}
                >
                  {title}
                </h1>

                {/* Subheadline */}
                <p className="text-slate-200/90 text-xs sm:text-[13.5px] md:text-[14.5px] leading-relaxed max-w-2xl font-normal">
                  {subtitle}
                </p>

                {/* Feature Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1 pb-1">
                  {heroBadges.map((badge, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-[11px] sm:text-xs font-medium px-2.5 py-1 rounded-full border border-white/20 transition-all shadow-xs cursor-default backdrop-blur-xs"
                    >
                      <Icon icon="mdi:check-circle" className="text-cyan-300 flex-shrink-0 text-xs sm:text-sm" />
                      <span>{badge}</span>
                    </span>
                  ))}
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap items-center gap-3 pt-1 pb-2">
                  <Link
                    href={buttonUrl}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-[#764DFF] via-[#8b5cf6] to-[#0284c7] hover:opacity-95 text-white font-extrabold px-6 py-3.5 rounded-xl text-sm sm:text-base transition-all duration-200 shadow-xl hover:shadow-cyan-500/25 hover:-translate-y-0.5"
                  >
                    <Icon icon="mdi:book-open-page-variant" className="text-lg" />
                    <span>{buttonText}</span>
                  </Link>
                  <Link
                    href={siteConfig.socialLinks.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#22c55e] text-white font-bold px-6 py-3.5 rounded-xl text-sm sm:text-base transition-all duration-200 shadow-xl hover:shadow-green-500/20 hover:-translate-y-0.5"
                  >
                    <Icon icon="mdi:whatsapp" className="text-xl" />
                    <span>WhatsApp Us</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* COUNTER STATS - Dark glassmorphic styling */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2.5 border-t border-white/20 mt-3">
              {statsData.map((stat, index) => (
                <CounterItem key={index} stat={stat} index={index} />
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-3.5">
            
            {/* Promotional Banner Carousel */}
            <HeroBannerCarousel />

            {/* ADMISSION FORM - Elevated white card */}
            <div className="bg-white dark:bg-dark text-midnight_text rounded-xl shadow-2xl p-5 sm:p-6 lg:p-7 border border-white/30 flex-1 flex items-center justify-center">
              <div className="w-full max-w-md">
                <EnquiryForm
                  title="Fill The Form & Download Brochure"
                  showTitle={true}
                />
              </div>
            </div>

          </div>

        </div>
      </div>

      <style jsx>{`
        .hero-card-slide-left {
          animation: slideInLeft 1s cubic-bezier(0.22, 1, 0.36, 1) both;
          will-change: transform, opacity;
        }

        .hero-card-slide-right {
          animation: slideInRight 1s cubic-bezier(0.22, 1, 0.36, 1) 0.15s both;
          will-change: transform, opacity;
        }

        @keyframes slideInLeft {
          0% {
            opacity: 0;
            transform: translateX(-100px) translateY(15px) scale(0.96);
            filter: blur(8px);
          }

          70% {
            opacity: 1;
            transform: translateX(8px) translateY(0) scale(1);
            filter: blur(0);
          }

          100% {
            opacity: 1;
            transform: translateX(0) translateY(0) scale(1);
            filter: blur(0);
          }
        }

        @keyframes slideInRight {
          0% {
            opacity: 0;
            transform: translateX(100px) translateY(15px) scale(0.96);
            filter: blur(8px);
          }

          70% {
            opacity: 1;
            transform: translateX(-8px) translateY(0) scale(1);
            filter: blur(0);
          }

          100% {
            opacity: 1;
            transform: translateX(0) translateY(0) scale(1);
            filter: blur(0);
          }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;

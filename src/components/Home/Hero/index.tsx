'use client'
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react/dist/iconify.js";
import { statsData, heroBadges, siteConfig } from "@/data";
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
            const duration = 6000; // slow, readable count-up
            const startTime = performance.now();

            const animate = (currentTime: number) => {
              const elapsedTime = currentTime - startTime;
              const progress = Math.min(elapsedTime / duration, 1);
              // Gentle ease-in-out so the numbers visibly tick up from start to finish
              const easeOutProgress = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
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
    <div ref={ref} className="qo-stat">
      <div className="qo-stat-value" suppressHydrationWarning>
        {hasAnimated ? `${count.toLocaleString()}${isPlus ? '+' : ''}${isPercentage ? '%' : ''}` : '0'}
      </div>
      <div className="qo-stat-label">{stat.label}</div>
    </div>
  );
}

const HeroSection: React.FC<{ section?: any }> = ({ section }) => {
  const title = section?.sectionTitle || "India's First Industry-Oriented & AI Powered Marketing & Design Institute";
  const subtitle = section?.subtitle || "Join QIMD's AI-Powered & Performance-Driven Practical Training Program in Digital Marketing, Graphic Design & Video Editing with 100% Job Assistance & Placement Opportunities.";
  const buttonText = section?.buttonText || "Explore Programs";
  const buttonUrl = section?.buttonUrl || "/courses";

  return (
    <section className="qo-hero" data-qx="off">
      <div className="qo-wrap qo-hero-grid">
        {/* LEFT: search, headline, highlights, actions */}
        <div className="qo-hero-copy">
          <span className="qo-badge">
            <span className="qo-badge-dot" aria-hidden="true" />
            {siteConfig.fullName}
          </span>

          <h1 className="font-heading hero-title qo-h1">{title}</h1>

          <p className="qo-hero-sub">{subtitle}</p>

          <ul className="qo-checks">
            {heroBadges.map((badge, index) => (
              <li key={index}>
                <Icon icon="mdi:check-circle" />
                <span>{badge}</span>
              </li>
            ))}
          </ul>

          <div className="qo-hero-ctas">
            <Link href={buttonUrl} className="qo-btn qo-btn-main">
              <Icon icon="mdi:book-open-page-variant" />
              <span>{buttonText}</span>
            </Link>
            <Link
              href={siteConfig.socialLinks.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="qo-btn qo-btn-wa"
            >
              <Icon icon="mdi:whatsapp" />
              <span>WhatsApp Us</span>
            </Link>
          </div>
        </div>

        {/* RIGHT: banner carousel + enquiry form on a navy stage */}
        <div className="qo-hero-stage">
          <div className="qo-hero-banner">
            <HeroBannerCarousel />
          </div>
          <div className="qo-hero-form">
            <EnquiryForm title="Fill The Form" showTitle={true} />
          </div>
        </div>
      </div>

      {/* Counter stats */}
      <div className="qo-stats-band">
        <div className="qo-wrap">
          <div className="qo-stats">
            {statsData.map((stat, index) => (
              <CounterItem key={index} stat={stat} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

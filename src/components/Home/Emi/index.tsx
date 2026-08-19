'use client';
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import { siteConfig, emiPartnersData } from "@/data";

const EmiSection: React.FC<{ emiPartners?: any[] }> = ({ emiPartners }) => {
  const partnersList = emiPartners && emiPartners.length > 0 ? emiPartners : emiPartnersData;
  const loopPartners = [...partnersList, ...partnersList, ...partnersList, ...partnersList];

  return (
    <section className="section-py bg-gradient-to-r from-primary/5 to-secondary/5 dark:bg-dark overflow-hidden">
      <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4">
        {/* Section Header */}
        <div className="text-center mb-10" data-aos="fade-up">
          <div className="badge-secondary mb-3">
            <Icon icon="mdi:credit-card" />
            Flexible Payments
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-midnight_text dark:text-white mb-4">
            Start Your Learning Journey with Flexible Payments
          </h2>
          <p suppressHydrationWarning className="text-muted dark:text-white/60 text-base max-w-2xl mx-auto">
            Choose your course and start your learning journey with easy EMI options.
          </p>
        </div>
      </div>

      {/* EMI Partners Infinite Marquee Floating RIGHT (No Background, Single Row) */}
      <div className="w-full overflow-hidden mb-12 select-none py-2" data-aos="fade-up" data-aos-delay="100">
        <div className="flex animate-marquee-right items-center gap-12 sm:gap-16">
          {loopPartners.map((item, i) => (
            <div
              key={`${item.id || i}-${i}`}
              className="flex items-center justify-center h-16 w-36 sm:w-44 flex-shrink-0"
            >
              {item.logo ? (
                <img
                  src={item.logo}
                  alt={item.name}
                  className="max-h-12 max-w-full object-contain filter drop-shadow-xs transition-transform duration-300 hover:scale-105"
                />
              ) : (
                <span className="text-sm font-bold text-midnight_text dark:text-white/80">{item.name}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EmiSection;

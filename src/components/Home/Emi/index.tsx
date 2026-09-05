'use client';
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import { siteConfig, emiPartnersData } from "@/data";

const EmiSection: React.FC<{ emiPartners?: any[] }> = ({ emiPartners }) => {
  const partnersList = emiPartners && emiPartners.length > 0 ? emiPartners : emiPartnersData;
  const loopPartners = [...partnersList, ...partnersList, ...partnersList, ...partnersList];

  return (
    <section
      className="py-16 lg:py-20 overflow-hidden relative border-y border-white/10 text-white"
      style={{
        background: 'linear-gradient(135deg, #180e29 0%, #2b1654 35%, #3e1f7d 70%, #0284c7 100%)',
      }}
    >
      <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4">
        {/* Section Header */}
        <div className="text-center mb-10" data-aos="fade-up">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 text-white border border-white/25 text-xs font-bold mb-3 backdrop-blur-md shadow-xs">
            <Icon icon="mdi:credit-card" className="text-base text-cyan-300" />
            <span>Flexible Payments</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-3 tracking-tight">
            Start Your Learning Journey with Flexible Payments
          </h2>
          <p suppressHydrationWarning className="text-slate-200 text-sm sm:text-base max-w-2xl mx-auto font-medium leading-relaxed">
            Choose your program and start your learning journey with easy EMI options.
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

'use client'
import { Icon } from "@iconify/react/dist/iconify.js";
import { whyQimdFeatures } from "@/data";

const WhyQimdSection: React.FC = () => {
  // Duplicate features to create a seamless 100% infinite loop
  const loopFeatures = [...whyQimdFeatures, ...whyQimdFeatures];

  return (
    <section className="py-10 sm:py-12 lg:py-14 bg-gray-50/50 dark:bg-dark overflow-hidden relative" id="why-qimd">
      {/* Background Glow Accents */}
      <div className="absolute top-1/2 left-10 -translate-y-1/2 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-10 -translate-y-1/2 w-64 h-64 rounded-full bg-purple-500/5 blur-3xl pointer-events-none" />

      <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4">
        {/* Section Header */}
        <div className="text-center mb-6 sm:mb-8" data-aos="fade-up">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full mb-2.5 shadow-xs">
            <Icon icon="mdi:star-four-points" className="text-xs text-primary animate-pulse" />
            <span>Why Choose Us</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-midnight_text dark:text-white mb-2 tracking-tight">
            Why Choose <span className="text-primary">QIMD?</span>
          </h2>
          <p suppressHydrationWarning className="text-xs sm:text-sm text-muted dark:text-white/60 max-w-xl mx-auto leading-relaxed font-medium">
            We are not just a training institute - we are your career transformation partner.
            Everything we do is focused on making you job-ready.
          </p>
        </div>
      </div>

      {/* Infinite Marquee Card Loop Container */}
      <div className="relative w-full overflow-hidden select-none py-2">
        {/* Gradient Side Masks for Smooth Edge Fade */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-28 bg-gradient-to-r from-gray-50/90 dark:from-dark to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-28 bg-gradient-to-l from-gray-50/90 dark:from-dark to-transparent z-10" />

        {/* Marquee Track - 45s Slow & Smooth -50% translateX loop */}
        <div className="flex animate-marquee-slow items-stretch gap-4 sm:gap-5 pr-4 sm:pr-5">
          {loopFeatures.map((feature, index) => (
            <div
              key={`${feature.title}-${index}`}
              className="group relative bg-white dark:bg-darklight border border-gray-100 dark:border-gray-800/80 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-md shadow-gray-200/40 dark:shadow-none hover:shadow-xl hover:shadow-primary/15 hover:border-primary/30 transition-all duration-300 w-64 sm:w-72 lg:w-80 flex-shrink-0 flex flex-col justify-between cursor-pointer hover:-translate-y-1"
            >
              {/* Top gradient highlight on hover */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-primary rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div>
                {/* Header: Icon */}
                <div className="mb-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300 shadow-xs">
                    <Icon icon={feature.icon} className="text-xl transition-transform duration-300 group-hover:scale-110" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-sm sm:text-base font-bold text-midnight_text dark:text-white mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-muted dark:text-white/60 leading-relaxed font-medium">
                  {feature.description}
                </p>
              </div>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyQimdSection;

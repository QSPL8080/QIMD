import { Icon } from "@iconify/react/dist/iconify.js";
import { faqsData } from "@/data";
import type { FAQ } from "@/types";

interface FaqItemProps {
  faq: FAQ;
  index: number;
}

const FaqItem: React.FC<FaqItemProps> = ({ faq, index }) => {
  return (
    <details
      className="group bg-white dark:bg-darklight rounded-2xl border border-slate-200/80 dark:border-dark_border overflow-hidden shadow-md transition-all duration-300"
      data-aos="fade-up"
      data-aos-delay={index * 40}
    >
      <summary className="flex items-center justify-between p-5 cursor-pointer font-bold text-[#111827] dark:text-white text-sm hover:text-[#764DFF] transition-colors list-none">
        <span className="flex items-start gap-3">
          <span className="text-[#764DFF] font-black text-base flex-shrink-0 mt-0.5">
            {String(index + 1).padStart(2, '0')}.
          </span>
          <span>{faq.question}</span>
        </span>
        <Icon
          icon="mdi:plus"
          className="flex-shrink-0 text-xl text-[#764DFF] transition-transform duration-300 group-open:rotate-45"
        />
      </summary>
      <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-white/70 leading-relaxed border-t border-slate-100 dark:border-dark_border pt-4 ml-9 font-medium">
        {faq.answer}
      </div>
    </details>
  );
};

interface FaqsSectionProps {
  limit?: number;
}

const FaqsSection: React.FC<FaqsSectionProps> = ({ limit }) => {
  const displayFaqs = limit ? faqsData.slice(0, limit) : faqsData;

  return (
    <section
      className="py-16 lg:py-24 relative overflow-hidden text-midnight_text border-t border-slate-200/80 dark:border-dark_border"
      id="faqs"
      style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #ffffff 40%, #e8dcff 75%, #c8e0fe 100%)',
      }}
    >
      {/* Subtle Ambient Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#764DFF]/10 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#38bdf8]/10 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12" data-aos="fade-up">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#764DFF]/15 text-[#5c38d6] border border-[#764DFF]/25 text-xs font-bold mb-3 shadow-xs">
            <Icon icon="mdi:help-circle" className="text-[#764DFF] text-base" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#111827] dark:text-white mb-4 tracking-tight">
            Questions We Hear Every Day
          </h2>
          <p suppressHydrationWarning className="text-slate-700 dark:text-white/80 text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-medium">
            Got questions before enrolling? Here are quick answers to the most common queries from students and parents.
          </p>
        </div>

        {/* FAQ Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-5xl mx-auto">
          {displayFaqs.map((faq, index) => (
            <FaqItem key={faq.id} faq={faq} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FaqsSection;

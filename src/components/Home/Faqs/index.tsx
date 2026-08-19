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
      className="group bg-white dark:bg-darklight rounded-xl border border-border dark:border-dark_border overflow-hidden"
      data-aos="fade-up"
      data-aos-delay={index * 40}
    >
      <summary className="flex items-center justify-between p-5 cursor-pointer font-semibold text-midnight_text dark:text-white text-sm hover:text-primary transition-colors list-none">
        <span className="flex items-start gap-3">
          <span className="text-primary font-bold text-base flex-shrink-0 mt-0.5">
            {String(index + 1).padStart(2, '0')}.
          </span>
          {faq.question}
        </span>
        <Icon
          icon="mdi:plus"
          className="flex-shrink-0 text-xl text-primary transition-transform duration-300 group-open:rotate-45"
        />
      </summary>
      <div className="px-5 pb-5 text-sm text-muted dark:text-white/60 leading-relaxed border-t border-border dark:border-dark_border pt-4 ml-9">
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
    <section className="section-py bg-grey dark:bg-darklight" id="faqs">
      <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4">
        {/* Section Header */}
        <div className="text-center mb-12" data-aos="fade-up">
          <div className="badge-primary mb-3">
            <Icon icon="mdi:help-circle" />
            FAQs
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-midnight_text dark:text-white mb-4">
            Questions We Hear Every Day
          </h2>
          <p suppressHydrationWarning className="text-muted dark:text-white/60 text-base max-w-xl mx-auto">
            Questions We Hear Every Day
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

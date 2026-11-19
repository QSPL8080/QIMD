import { Icon } from "@iconify/react/dist/iconify.js";
import { faqsData } from "@/data";
import type { FAQ } from "@/types";

interface FaqItemProps {
  faq: FAQ;
  index: number;
}

const FaqItem: React.FC<FaqItemProps> = ({ faq, index }) => {
  return (
    <details className="qo-faq">
      <summary>
        <span className="qo-faq-num">{String(index + 1).padStart(2, '0')}</span>
        <span className="qo-faq-q">{faq.question}</span>
        <span className="qo-faq-ic"><Icon icon="mdi:plus" /></span>
      </summary>
      <div className="qo-faq-a">{faq.answer}</div>
    </details>
  );
};

interface FaqsSectionProps {
  limit?: number;
}

/** Home: FAQs — sticky heading + single accordion column */
const FaqsSection: React.FC<FaqsSectionProps> = ({ limit }) => {
  const displayFaqs = limit ? faqsData.slice(0, limit) : faqsData;

  return (
    <section className="qo-sec qo-faqs" id="faqs">
      <div className="qo-wrap qo-faqs-grid">
        <div className="qo-faqs-head">
          <span className="qo-kicker">
            <Icon icon="mdi:help-circle" />
            Frequently Asked Questions
          </span>
          <h2 className="qo-h2">Questions We Hear Every Day</h2>
          <p className="qo-lead" suppressHydrationWarning>
            Got questions before enrolling? Here are quick answers to the most common queries from students and parents.
          </p>
        </div>
        <div className="qo-faq-list">
          {displayFaqs.map((faq, index) => (
            <FaqItem key={faq.id} faq={faq} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FaqsSection;

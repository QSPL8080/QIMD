'use client'
import { Icon } from "@iconify/react/dist/iconify.js";
import { whyQimdFeatures } from "@/data";

/** Home: why QIMD — heading tile + feature tiles in one grid */
const WhyQimdSection: React.FC = () => {
  return (
    <section className="qo-sec qo-why" id="why-qimd">
      <div className="qo-wrap">
        <div className="qo-why-grid">
          <div className="qo-why-intro">
            <span className="qo-kicker is-light">
              <Icon icon="mdi:star-four-points" />
              Why Choose Us
            </span>
            <h2 className="qo-h2 is-light">
              Why Choose <span className="qo-accent-light">QIMD?</span>
            </h2>
            <p suppressHydrationWarning>
              We are not just a training institute - we are your career transformation partner.
              Everything we do is focused on making you job-ready.
            </p>
          </div>

          {whyQimdFeatures.map((feature, index) => (
            <div key={feature.title} className="qo-why-card">
              <div className="qo-why-top">
                <span className="qo-why-ic">
                  <Icon icon={feature.icon} />
                </span>
                <span className="qo-why-num">{String(index + 1).padStart(2, "0")}</span>
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyQimdSection;

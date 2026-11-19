'use client';
import { Icon } from "@iconify/react/dist/iconify.js";
import { emiPartnersData } from "@/data";

/** Home: flexible payments — text + EMI partner logo belt */
const EmiSection: React.FC<{ emiPartners?: any[] }> = ({ emiPartners }) => {
  const partnersList = emiPartners && emiPartners.length > 0 ? emiPartners : emiPartnersData;
  const loopPartners = [...partnersList, ...partnersList, ...partnersList, ...partnersList];

  return (
    <section className="qo-sec qo-emi">
      <div className="qo-wrap">
        <div className="qo-emi-card">
          <div className="qo-emi-text">
            <span className="qo-emi-ic"><Icon icon="mdi:credit-card" /></span>
            <span className="qo-kicker">Flexible Payments</span>
            <h2 className="qo-h2">Start Your Learning Journey with Flexible Payments</h2>
            <p className="qo-lead" suppressHydrationWarning>
              Choose your program and start your learning journey with easy EMI options.
            </p>
          </div>
          <div className="qo-emi-belt">
            <div className="qo-marquee is-reverse">
              <div className="qo-marquee-track">
                {loopPartners.map((item, i) => (
                  <div key={`${item.id || i}-${i}`} className="qo-emi-logo">
                    {item.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.logo} alt={item.name} />
                    ) : (
                      <span>{item.name}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmiSection;

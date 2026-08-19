import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@iconify/react/dist/iconify.js";
// import Breadcrumb from "@/components/Common/Breadcrumb";
import { eventsData, siteConfig } from "@/data";
import type { Event } from "@/types";

export const metadata: Metadata = {
  title: `Events – ${siteConfig.name}`,
  description: "Stay updated with QIMD Institute's upcoming events — new batch announcements, workshops, career counselling sessions, and placement drives.",
  alternates: { canonical: "https://www.qimd.in/events" },
};

const EventCard: React.FC<{ event: Event; index: number }> = ({ event, index }) => (
  <article
    className="bg-white dark:bg-darklight rounded-2xl shadow-card border border-border dark:border-dark_border card-hover overflow-hidden"
    data-aos="fade-up"
    data-aos-delay={index * 100}
  >
    {/* Image Placeholder */}
    <div className="bg-gradient-to-br from-primary/20 to-secondary/10 h-44 flex items-center justify-center relative">
      <Icon icon="mdi:calendar-star" className="text-primary/30 text-7xl" />
      <span className={`absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-full ${event.isFree ? 'bg-accent text-white' : 'bg-secondary text-midnight_text'}`}>
        {event.isFree ? 'FREE' : event.type}
      </span>
    </div>

    <div className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon icon="mdi:calendar" className="text-primary text-sm" />
        <span className="text-xs font-medium text-muted dark:text-white/60">{event.date}</span>
      </div>
      <h3 className="font-bold text-midnight_text dark:text-white text-base mb-2 line-clamp-2">{event.title}</h3>
      <p className="text-sm text-muted dark:text-white/60 mb-3 line-clamp-2">{event.description}</p>
      <div className="flex items-center gap-2 mb-4">
        <Icon icon="mdi:map-marker" className="text-primary text-sm flex-shrink-0" />
        <span className="text-xs text-muted dark:text-white/50">{event.venue}</span>
      </div>
      <Link
        href="/contact"
        className="block w-full bg-primary hover:bg-darkprimary text-white text-sm font-semibold py-3 rounded-xl text-center transition-all duration-200"
      >
        {event.isFree ? 'Register Free' : 'Enquire Now'}
      </Link>
    </div>
  </article>
);

export default function EventsPage() {
  return (
    <>
      {/* <Breadcrumb
        title="Upcoming Events"
        items={[
          { label: "Home", href: "/" },
          { label: "Events" },
        ]}
      /> */}

      <section className="section-py bg-grey dark:bg-dark">
        <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4">
          {/* Header */}
          <div className="text-center mb-12" data-aos="fade-up">
            <div className="badge-primary mb-3">
              <Icon icon="mdi:calendar-star" />
              Upcoming Events
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-midnight_text dark:text-white mb-4">
              New Batches &amp; Events at QIMD
            </h2>
            <p className="text-muted dark:text-white/60 text-base max-w-2xl mx-auto">
              Stay updated with our latest batch announcements, workshops, and career counselling sessions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {eventsData.map((event, i) => (
              <EventCard key={event.id} event={event} index={i} />
            ))}
          </div>

          {/* Enquire CTA */}
          <div className="text-center mt-14" data-aos="fade-up">
            <div className="bg-gradient-to-br from-primary to-darkprimary rounded-2xl p-8 max-w-2xl mx-auto text-white">
              <h3 className="text-xl font-bold mb-3">Interested in Our Next Batch?</h3>
              <p className="text-white/80 text-sm mb-5">
                Fill in your details and our team will inform you about upcoming batches and availability.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary/90 text-midnight_text font-bold px-8 py-3.5 rounded-xl text-sm transition-all duration-200"
              >
                <Icon icon="mdi:send" className="text-base" />
                Register Your Interest
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
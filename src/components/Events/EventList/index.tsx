import React from "react";
import Link from "next/link";
import { Icon } from "@iconify/react/dist/iconify.js";
import { eventsData } from "@/data";

const EventList: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {eventsData.map((event) => (
        <article
          key={event.id}
          className="bg-white dark:bg-darklight rounded-2xl shadow-card border border-border dark:border-dark_border overflow-hidden"
        >
          <div className="bg-gradient-to-br from-primary/20 to-secondary/10 h-44 flex items-center justify-center relative">
            <Icon icon="mdi:calendar-star" className="text-primary/30 text-7xl" />
            <span
              className={`absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-full ${
                event.isFree ? "bg-accent text-white" : "bg-secondary text-midnight_text"
              }`}
            >
              {event.isFree ? "FREE" : event.type}
            </span>
          </div>

          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Icon icon="mdi:calendar" className="text-primary text-sm" />
              <span className="text-xs font-medium text-muted dark:text-white/60">
                {event.date}
              </span>
            </div>
            <h3 className="font-bold text-midnight_text dark:text-white text-base mb-2 line-clamp-2">
              {event.title}
            </h3>
            <p className="text-sm text-muted dark:text-white/60 mb-3 line-clamp-2">
              {event.description}
            </p>
            <div className="flex items-center gap-2 mb-4">
              <Icon icon="mdi:map-marker" className="text-primary text-sm flex-shrink-0" />
              <span className="text-xs text-muted dark:text-white/50">{event.venue}</span>
            </div>
            <Link
              href="/contact"
              className="block w-full bg-primary hover:bg-darkprimary text-white text-sm font-semibold py-3 rounded-xl text-center transition-all duration-200"
            >
              {event.isFree ? "Register Free" : "Enquire Now"}
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
};

export default EventList;
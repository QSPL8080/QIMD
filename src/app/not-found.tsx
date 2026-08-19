import Link from "next/link";
import { Icon } from "@iconify/react/dist/iconify.js";
import { siteConfig } from "@/data";

export default function NotFound() {
  return (
    <section className="min-h-[70vh] flex items-center justify-center bg-grey dark:bg-dark py-20">
      <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4">
        <div className="text-center max-w-2xl mx-auto">
          {/* 404 Graphic */}
          <div className="relative mb-8">
            <div className="text-[150px] lg:text-[200px] font-extrabold text-primary/10 dark:text-primary/5 leading-none select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon icon="mdi:map-marker-question" className="text-primary text-5xl" />
              </div>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-midnight_text dark:text-white mb-4">
            Page Not Found
          </h1>
          <p className="text-muted dark:text-white/60 text-base mb-8 leading-relaxed">
            Oops! The page you&apos;re looking for doesn&apos;t exist or may have been moved. Let us help you find the right direction.
          </p>

          {/* Quick Links */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
            {[
              { label: "Home", href: "/", icon: "mdi:home" },
              { label: "Courses", href: "/courses", icon: "mdi:book-open-page-variant" },
              { label: "Contact", href: "/contact", icon: "mdi:phone" },
              { label: "FAQs", href: "/faqs", icon: "mdi:help-circle" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex flex-col items-center gap-2 bg-white dark:bg-darklight rounded-xl p-4 border border-border dark:border-dark_border hover:border-primary hover:text-primary transition-all duration-200 text-muted dark:text-white/60 group"
              >
                <Icon icon={link.icon} className="text-2xl group-hover:text-primary transition-colors" />
                <span className="text-xs font-medium">{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Main CTAs */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-xl text-base transition-all duration-200 hover:opacity-90"
              style={{ background: '#764DFF' }}
            >
              <Icon icon="mdi:home" />
              Back to Home
            </Link>
            <Link
              href={siteConfig.socialLinks.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#22c55e] text-white font-semibold px-8 py-4 rounded-xl text-base transition-all duration-200"
            >
              <Icon icon="mdi:whatsapp" />
              WhatsApp Us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

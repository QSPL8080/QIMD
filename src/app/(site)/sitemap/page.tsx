import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@iconify/react/dist/iconify.js";
// import Breadcrumb from "@/components/Common/Breadcrumb";
import { siteConfig, coursesData } from "@/data";

export const metadata: Metadata = {
  title: `Sitemap – ${siteConfig.name}`,
  description: "Browse the complete sitemap of QIMD Institute website — all pages, courses, and resources.",
  alternates: { canonical: "https://www.qimd.in/sitemap" },
};

const SitemapSection: React.FC<{ title: string; icon: string; links: { label: string; href: string }[] }> = ({
  title, icon, links,
}) => (
  <div className="bg-white dark:bg-darklight rounded-2xl shadow-card border border-border dark:border-dark_border p-6">
    <h3 className="flex items-center gap-2 font-bold text-midnight_text dark:text-white mb-4 text-base">
      <Icon icon={icon} className="text-primary text-xl" />
      {title}
    </h3>
    <ul className="space-y-2">
      {links.map((link, i) => (
        <li key={i}>
          <Link
            href={link.href}
            className="flex items-center gap-2 text-sm text-muted dark:text-white/60 hover:text-primary transition-colors"
          >
            <Icon icon="mdi:chevron-right" className="text-primary flex-shrink-0 text-sm" />
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

export default function SitemapPage() {
  return (
    <>
      {/* <Breadcrumb
        title="Sitemap"
        items={[
          { label: "Home", href: "/" },
          { label: "Sitemap" },
        ]}
      /> */}

      <section className="section-py bg-grey dark:bg-dark">
        <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4">
          <div className="text-center mb-12" data-aos="fade-up">
            <h2 className="text-3xl font-extrabold text-midnight_text dark:text-white mb-3">Website Sitemap</h2>
            <p className="text-muted dark:text-white/60 text-base">Complete overview of all pages on QIMD Institute&apos;s website.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <SitemapSection
              title="Main Pages"
              icon="mdi:home"
              links={[
                { label: "Home", href: "/" },
                { label: "About QIMD", href: "/about/about-qimd" },
                { label: "Why QIMD?", href: "/why-qimd" },
                { label: "Contact Us", href: "/contact" },
                { label: "Admission Information", href: "/admission" },
              ]}
            />

            <SitemapSection
              title="Courses"
              icon="mdi:book-open-page-variant"
              links={[
                { label: "All Courses", href: "/courses" },
                ...coursesData.map((c) => ({ label: c.title, href: `/courses/${c.slug}` })),
              ]}
            />

            <SitemapSection
              title="About"
              icon="mdi:account-group"
              links={[
                { label: "About QIMD", href: "/about/about-qimd" },
                { label: "Our Team", href: "/about/our-team" },
                { label: "Our Trainers", href: "/trainers" },
                { label: "Gallery", href: "/gallery" },
              ]}
            />

            <SitemapSection
              title="Placements"
              icon="mdi:briefcase-check"
              links={[
                { label: "Placements", href: "/placements" },
                { label: "Success Stories", href: "/placements#success-stories" },
                { label: "Placement Partners", href: "/placements#partners" },
                { label: "Testimonials", href: "/placements#testimonials" },
              ]}
            />

            <SitemapSection
              title="Resources"
              icon="mdi:post"
              links={[
                { label: "Blog", href: "/blog" },
                { label: "Events", href: "/events" },
                { label: "FAQs", href: "/faqs" },
              ]}
            />

            <SitemapSection
              title="Career"
              icon="mdi:briefcase"
              links={[
                { label: "Current Openings", href: "/careers" },
                { label: "Hire From Us", href: "/hire-from-us" },
              ]}
            />

            <SitemapSection
              title="Legal"
              icon="mdi:file-document"
              links={[
                { label: "Privacy Policy", href: "/privacy-policy" },
                { label: "Terms & Conditions", href: "/terms-and-conditions" },
                { label: "Refund Policy", href: "/refund-policy" },
                { label: "Sitemap", href: "/sitemap" },
              ]}
            />
          </div>
        </div>
      </section>
    </>
  );
}

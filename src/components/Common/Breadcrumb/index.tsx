import Link from "next/link";
import { Icon } from "@iconify/react/dist/iconify.js";
import type { BreadcrumbItem } from "@/types";

interface BreadcrumbProps {
  title: string;
  items: BreadcrumbItem[];
  backgroundClass?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  title,
  items,
  backgroundClass = "bg-primary",
}) => {
  return (
    <section className={`${backgroundClass} py-14 lg:py-20 relative overflow-hidden`}>
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/20 blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-secondary/30 blur-2xl translate-y-1/2 -translate-x-1/4" />
      </div>

      <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4 relative z-10">
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4" data-aos="fade-up">
          {title}
        </h1>
        <nav aria-label="Breadcrumb" data-aos="fade-up" data-aos-delay="100">
          <ol className="flex flex-wrap items-center gap-2 text-sm">
            {items.map((item, index) => (
              <li key={index} className="flex items-center gap-2">
                {index > 0 && (
                  <Icon icon="mdi:chevron-right" className="text-white/60 text-base flex-shrink-0" />
                )}
                {item.href ? (
                  <Link
                    href={item.href}
                    className="text-white/80 hover:text-secondary transition-colors font-medium"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-secondary font-medium">{item.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </section>
  );
};

export default Breadcrumb;

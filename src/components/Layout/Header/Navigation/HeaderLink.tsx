'use client'
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react/dist/iconify.js";

const HeaderLink: React.FC<{ item: any }> = ({ item }) => {
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const path = usePathname();

  const hrefTarget = item?.href || item?.url || '/';

  const isActive =
    path === hrefTarget ||
    (hrefTarget !== '/' && path.startsWith(hrefTarget)) ||
    item.submenu?.some((sub: any) => path === (sub.href || sub.url) || path.startsWith(sub.href || sub.url));

  return (
    <div
      className="relative"
      suppressHydrationWarning
      onMouseEnter={() => item.submenu && setSubmenuOpen(true)}
      onMouseLeave={() => setSubmenuOpen(false)}
    >
      <Link
        href={hrefTarget}
        suppressHydrationWarning
        className={`flex items-center gap-0.5 text-[14px] font-medium px-4 py-5 transition-colors duration-200 cursor-pointer ${
          isActive || submenuOpen
            ? 'text-primary font-bold'
            : 'text-[#1E293B] dark:text-white hover:text-primary'
        }`}
      >
        {item.label}
        {item.submenu && (
          <Icon
            icon="mdi:chevron-down"
            className={`text-base transition-all duration-200 ${
              submenuOpen
                ? 'rotate-180 text-primary'
                : isActive
                ? 'text-primary'
                : 'text-slate-400 group-hover:text-primary'
            }`}
          />
        )}
      </Link>

      {submenuOpen && item.submenu && (
        <div
          className="absolute left-0 top-full min-w-[240px] bg-white dark:bg-dark shadow-lg dark:shadow-darkmd rounded-xl border border-slate-100 dark:border-dark_border z-50 py-1.5 overflow-hidden"
          data-aos="fade-up"
          data-aos-duration="200"
        >
          {item.submenu.map((subItem: any, index: number) => {
            const subHref = subItem.href || subItem.url || '/';
            const isSubActive = path === subHref;
            return (
              <Link
                key={index}
                href={subHref}
                className={`block px-4 py-2.5 text-[13px] font-medium transition-colors duration-150 !border-0 !border-none !shadow-none ${
                  isSubActive
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-[#334155] dark:text-slate-200 hover:bg-primary/5 hover:text-primary'
                }`}
              >
                {subItem.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HeaderLink;

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
      onMouseEnter={() => item.submenu && setSubmenuOpen(true)}
      onMouseLeave={() => setSubmenuOpen(false)}
    >
      <Link
        href={hrefTarget}
        className={`flex items-center gap-0.5 text-[14px] font-medium px-4 py-5 transition-colors duration-200 border-b-2 ${
          isActive
            ? 'text-primary border-primary'
            : 'text-midnight_text dark:text-white border-transparent hover:text-primary hover:border-primary/50'
        }`}
      >
        {item.label}
        {item.submenu && (
          <Icon
            icon="mdi:chevron-down"
            className={`text-base transition-transform duration-200 ${submenuOpen ? 'rotate-180' : ''}`}
          />
        )}
      </Link>

      {submenuOpen && item.submenu && (
        <div
          className="absolute left-0 top-full min-w-[220px] bg-white dark:bg-dark shadow-xl dark:shadow-darkmd rounded-xl border border-border dark:border-dark_border z-50 py-2 overflow-hidden"
          data-aos="fade-up"
          data-aos-duration="300"
        >
          {item.submenu.map((subItem: any, index: number) => {
            const subHref = subItem.href || subItem.url || '/';
            return (
              <Link
                key={index}
                href={subHref}
                className={`block px-4 py-2.5 text-[13px] font-medium transition-colors duration-150 ${
                  path === subHref || path.startsWith(subHref)
                    ? 'bg-primary/10 text-primary'
                    : 'text-midnight_text dark:text-white hover:bg-primary/5 hover:text-primary'
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

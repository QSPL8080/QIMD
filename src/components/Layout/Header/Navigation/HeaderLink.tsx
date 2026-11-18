'use client'
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react/dist/iconify.js";

const HeaderLink: React.FC<{ item: any }> = ({ item }) => {
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const path = usePathname();

  const hrefTarget = item?.href || item?.url || '/';

  useEffect(() => {
    const active =
      (hrefTarget === '/' && path === '/') ||
      (hrefTarget !== '/' && hrefTarget !== '#' && (path === hrefTarget || path.startsWith(hrefTarget))) ||
      item.submenu?.some((sub: any) => {
        const subHref = sub.href || sub.url;
        return subHref && (path === subHref || path.startsWith(subHref));
      });
    setIsActive(!!active);
  }, [path, hrefTarget, item.submenu]);

  // Close dropdown after navigating
  useEffect(() => {
    setSubmenuOpen(false);
  }, [path]);

  return (
    <div
      className="relative"
      suppressHydrationWarning
      onMouseEnter={() => item.submenu && setSubmenuOpen(true)}
      onMouseLeave={() => setSubmenuOpen(false)}
    >
      <Link
        href={hrefTarget}
        onClick={(e) => {
          if (hrefTarget === '#' || !hrefTarget) {
            e.preventDefault();
            setSubmenuOpen((prev) => !prev);
          }
        }}
        suppressHydrationWarning
        aria-haspopup={item.submenu ? 'true' : undefined}
        aria-expanded={item.submenu ? submenuOpen : undefined}
        className={`qh-link ${isActive ? 'is-active' : ''} ${submenuOpen ? 'is-open' : ''}`}
      >
        <span>{item.label}</span>
        {item.submenu && <Icon icon="solar:alt-arrow-down-linear" className="qh-caret" />}
      </Link>

      {submenuOpen && item.submenu && (
        <div className="qh-drop-wrap">
          <div className="qh-drop">
            <div className="qh-drop-title">{item.label}</div>
            {item.submenu.map((subItem: any, index: number) => {
              const subHref = subItem.href || subItem.url || '/';
              const isSubActive = path === subHref;
              return (
                <Link
                  key={index}
                  href={subHref}
                  className={`qh-drop-item ${isSubActive ? 'is-active' : ''}`}
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <span className="qh-drop-ic">
                    <Icon icon="solar:arrow-right-linear" />
                  </span>
                  <span className="qh-drop-label">{subItem.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderLink;

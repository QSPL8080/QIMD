'use client'
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react/dist/iconify.js";

interface MobileHeaderLinkProps {
  item: any;
  onClose?: () => void;
}

const MobileHeaderLink: React.FC<MobileHeaderLinkProps> = ({ item, onClose }) => {
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const path = usePathname();

  const hrefTarget = item?.href || item?.url || '/';

  const isActive =
    (hrefTarget !== '/' && hrefTarget !== '#' && path === hrefTarget) ||
    item.submenu?.some((sub: any) => {
      const subHref = sub.href || sub.url;
      return subHref && (path === subHref || path.startsWith(subHref));
    });

  return (
    <div className="w-full border-b border-border/50 dark:border-dark_border/50 last:border-0">
      {item.submenu ? (
        <div className="flex items-center justify-between w-full">
          {hrefTarget === '#' ? (
            <button
              type="button"
              onClick={() => setSubmenuOpen(!submenuOpen)}
              className={`flex-1 text-left py-3 px-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                isActive
                  ? 'text-primary bg-primary/5'
                  : 'text-midnight_text dark:text-white hover:text-primary hover:bg-primary/5'
              }`}
            >
              {item.label}
            </button>
          ) : (
            <Link
              href={hrefTarget}
              onClick={onClose}
              className={`flex-1 py-3 px-2 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'text-primary bg-primary/5'
                  : 'text-midnight_text dark:text-white hover:text-primary hover:bg-primary/5'
              }`}
            >
              {item.label}
            </Link>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSubmenuOpen(!submenuOpen);
            }}
            aria-label={`Toggle ${item.label} dropdown`}
            className="p-3 text-midnight_text dark:text-white hover:text-primary transition-colors cursor-pointer"
          >
            <Icon
              icon="mdi:chevron-down"
              className={`text-xl transition-transform duration-200 ${submenuOpen ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      ) : (
        <Link
          href={hrefTarget}
          onClick={onClose}
          className={`flex items-center w-full py-3 px-2 text-sm font-medium rounded-lg transition-colors ${
            path === hrefTarget
              ? 'text-primary bg-primary/5'
              : 'text-midnight_text dark:text-white hover:text-primary hover:bg-primary/5'
          }`}
        >
          {item.label}
        </Link>
      )}

      {submenuOpen && item.submenu && (
        <div className="pl-4 pb-2 space-y-1">
          {item.submenu.map((subItem: any, index: number) => {
            const subHref = subItem.href || subItem.url || '/';
            return (
              <Link
                key={index}
                href={subHref}
                onClick={onClose}
                className={`block py-2 px-3 text-sm rounded-lg transition-colors ${
                  path === subHref
                    ? 'text-primary bg-primary/10 font-medium'
                    : 'text-muted dark:text-white/60 hover:text-primary hover:bg-primary/5'
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

export default MobileHeaderLink;

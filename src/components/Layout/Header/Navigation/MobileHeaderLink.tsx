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
    path === hrefTarget ||
    (hrefTarget !== '/' && hrefTarget !== '#' && path === hrefTarget) ||
    item.submenu?.some((sub: any) => {
      const subHref = sub.href || sub.url;
      return subHref && (path === subHref || path.startsWith(subHref));
    });

  return (
    <div className={`qm-item ${submenuOpen ? 'is-open' : ''}`}>
      {item.submenu ? (
        <div className="flex items-center w-full">
          {hrefTarget === '#' ? (
            <button
              type="button"
              onClick={() => setSubmenuOpen(!submenuOpen)}
              className={`qm-link ${isActive ? 'is-active' : ''}`}
            >
              {item.label}
            </button>
          ) : (
            <Link href={hrefTarget} onClick={onClose} className={`qm-link ${isActive ? 'is-active' : ''}`}>
              {item.label}
            </Link>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSubmenuOpen(!submenuOpen);
            }}
            aria-label={`Toggle ${item.label} dropdown`}
            aria-expanded={submenuOpen}
            className="qm-toggle"
          >
            <Icon icon="solar:alt-arrow-down-linear" />
          </button>
        </div>
      ) : (
        <Link href={hrefTarget} onClick={onClose} className={`qm-link ${isActive ? 'is-active' : ''}`}>
          {item.label}
          <Icon icon="solar:arrow-right-linear" className="qm-link-arrow" />
        </Link>
      )}

      {submenuOpen && item.submenu && (
        <div className="qm-sub">
          {item.submenu.map((subItem: any, index: number) => {
            const subHref = subItem.href || subItem.url || '/';
            return (
              <Link
                key={index}
                href={subHref}
                onClick={onClose}
                className={`qm-sub-link ${path === subHref ? 'is-active' : ''}`}
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

'use client'
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react/dist/iconify.js";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const toggleVisibility = () => {
      const scrolled = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      if (scrolled > 150) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Check immediately on mount and on route change
    toggleVisibility();

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, [pathname]);

  return (
    <div
      className={`fixed bottom-[5.25rem] right-6 z-[9999] transition-all duration-300 ${
        isVisible ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-90 pointer-events-none"
      }`}
    >
      <button
        onClick={scrollToTop}
        type="button"
        aria-label="Scroll back to top"
        className="w-12 h-12 rounded-full bg-[#764DFF] hover:bg-[#5C38D6] text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 transition-all duration-300 hover:scale-110 cursor-pointer border border-white/30"
      >
        <Icon icon="mdi:chevron-up" className="text-2xl" />
      </button>
    </div>
  );
}

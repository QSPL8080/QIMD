'use client'
import { useEffect } from "react";
import AOS from "aos"
import 'aos/dist/aos.css';

interface AoscompoProps {
  children: React.ReactNode;
}

const Aoscompo: React.FC<AoscompoProps> = ({ children }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      AOS.init({
        duration: 800,
        once: true,
        mirror: false,
        easing: 'ease-out-cubic',
        offset: 60,
        disable: () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      })
      AOS.refresh()
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  return <>{children}</>
}

export default Aoscompo

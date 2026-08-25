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
        duration: 700,
        once: false,
        mirror: true,
        easing: 'ease-out-cubic',
        offset: 80,
      })
      AOS.refresh()
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  return <>{children}</>
}

export default Aoscompo

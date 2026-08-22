'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { siteConfig } from '@/data'

interface LogoProps {
  variant?: 'default' | 'white'
  width?: number
  height?: number
  className?: string
  customSrc?: string
}

const Logo: React.FC<LogoProps> = ({
  variant = 'default',
  width = 180,
  height = 54,
  className = '',
  customSrc,
}) => {
  const defaultLogo = variant === 'white' ? '/images/logo/qimd-logo-white.png' : '/images/logo/qimd-logo.png'
  const [imgSrc, setImgSrc] = useState<string>(customSrc || defaultLogo)

  useEffect(() => {
    setImgSrc(customSrc || defaultLogo)
  }, [customSrc, defaultLogo])

  return (
    <Link href="/" aria-label={`${siteConfig.name} – Home`} className={`inline-flex items-center flex-shrink-0 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imgSrc}
        alt={`${siteConfig.name} Logo`}
        width={width}
        height={height}
        onError={() => {
          if (imgSrc !== defaultLogo) {
            setImgSrc(defaultLogo)
          }
        }}
        className="h-12 sm:h-14 md:h-16 w-auto object-contain block transition-all"
      />
    </Link>
  )
}

export default Logo

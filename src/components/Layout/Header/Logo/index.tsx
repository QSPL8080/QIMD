'use client'

import React from 'react'
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
  const logoSrc = customSrc || defaultLogo

  return (
    <Link href="/" aria-label={`${siteConfig.name} – Home`} className={`inline-flex items-center flex-shrink-0 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoSrc}
        alt={`${siteConfig.name} Logo`}
        width={width}
        height={height}
        className="h-12 sm:h-14 md:h-16 w-auto object-contain block transition-all"
      />
    </Link>
  )
}

export default Logo

'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { Icon } from '@iconify/react/dist/iconify.js'
import type { Blog } from '@/types/blog'
import type { BlogPost } from '@/types'

interface BlogCardProps {
  blog: Blog | BlogPost
  featured?: boolean
}

const BlogCard: React.FC<BlogCardProps> = ({ blog, featured = false }) => {
  const {
    title = 'QIMD Blog Post',
    coverImage,
    images = [],
    excerpt = '',
    date,
    publishedAt,
    slug = '',
    category = 'Digital Marketing',
    author = 'QIMD Team',
    readTime = '5 min read',
  } = blog as any

  // Single primary image for blog showcase card
  const primaryImage = coverImage || (images && images.length > 0 ? images[0] : '') || '/images/blog/blog-1.jpg'

  const formattedDate = date || publishedAt
    ? format(new Date(date || publishedAt), 'MMM dd, yyyy')
    : 'Recent'

  return (
    <article
      className={`group bg-white dark:bg-darklight rounded-2xl border border-border dark:border-dark_border shadow-card hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 overflow-hidden flex flex-col h-full ${
        featured ? 'lg:col-span-2' : ''
      }`}
    >
      {/* Single Primary Image Banner */}
      <div className="relative w-full h-60 sm:h-64 bg-slate-900 overflow-hidden">
        <Link href={`/blog/${slug}`} className="block relative w-full h-full">
          <Image
            src={primaryImage}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        </Link>

        {/* Category Pill Overlay */}
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-primary/90 text-white text-xs font-bold px-3 py-1 rounded-full shadow backdrop-blur-md">
            {category}
          </span>
        </div>
      </div>

      {/* Blog Content Body */}
      <div className="p-6 flex flex-col flex-1 justify-between">
        <div>
          {/* Metadata Row: Author, Date, Reading Time */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted dark:text-white/60 mb-3">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon icon="mdi:account" className="text-primary text-xs" />
              </div>
              <span className="font-semibold text-midnight_text dark:text-white/80">{author}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Icon icon="mdi:calendar-outline" className="text-secondary" />
              <span>{formattedDate}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Icon icon="mdi:clock-outline" className="text-secondary" />
              <span>{readTime}</span>
            </div>
          </div>

          {/* Title */}
          <Link href={`/blog/${slug}`}>
            <h3
              className={`font-extrabold text-midnight_text dark:text-white mb-3 group-hover:text-primary dark:group-hover:text-amber-400 transition-colors leading-snug ${
                featured ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'
              }`}
            >
              {title}
            </h3>
          </Link>

          {/* Meaningful 1-Paragraph Preview */}
          <p className="text-sm text-muted dark:text-white/70 leading-relaxed mb-4 line-clamp-4">
            {(excerpt || '')
              .replace(/^##\s*Summary\s*/i, '')
              .replace(/^#+\s*/g, '')
              .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
              .replace(/\*\*(.*?)\*\*/g, '$1')
              .trim()}
          </p>
        </div>

        {/* Card Footer */}
        <div className="pt-4 border-t border-border/60 dark:border-dark_border/60 flex items-center justify-between">
          <span className="text-xs text-muted dark:text-white/50 font-medium">QIMD Insights</span>
          <Link
            href={`/blog/${slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary dark:text-amber-400 hover:text-darkprimary dark:hover:text-amber-300 group-hover:translate-x-1 transition-transform"
          >
            <span>Read Full Article</span>
            <Icon icon="mdi:arrow-right" className="text-sm" />
          </Link>
        </div>
      </div>
    </article>
  )
}

export default BlogCard
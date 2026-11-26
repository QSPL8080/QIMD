/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  reactStrictMode: false,

  // Build servers often cap threads/processes. Running page-data collection and
  // static generation in a single worker avoids "OS can't spawn worker thread
  // (os error 11)" / SIGABRT crashes during `next build`.
  experimental: {
    cpus: 1,
    workerThreads: false,
  },

  images: {
    unoptimized: true,
  },

  allowedDevOrigins: [
    'localhost:3000',
    '127.0.0.1:3000',
    '192.168.1.104:3000',
    '192.168.1.104',
    '192.168.1.116:3000',
    '192.168.1.116',
    '172.29.240.1:3000',
    '172.29.240.1',
  ],

  async redirects() {
    return [
      // Old program illustrations were replaced by the program posters (same artwork as the hero banners)
      { source: '/images/courses/:slug(video-editing|digital-marketing|graphic-design).jpg', destination: '/images/programs/:slug-poster.jpg', permanent: true },
      {
        source: '/reviews',
        destination: '/reviews-testimonials',
        permanent: true,
      },
      {
        source: '/testimonials',
        destination: '/reviews-testimonials',
        permanent: true,
      },
      {
        source: '/review',
        destination: '/reviews-testimonials',
        permanent: true,
      },
      {
        source: '/testimonial',
        destination: '/reviews-testimonials',
        permanent: true,
      },
      {
        source: '/placement',
        destination: '/placements',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      // Cache static bundles permanently for lightning-fast page transitions
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache static public images and fonts
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      // API routes should always be fresh
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
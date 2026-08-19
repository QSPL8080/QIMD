/** @type {import('next').NextConfig} */
const nextConfig = {
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

  // Prevent browsers from caching HTML pages and dev chunks — fixes 404 & ChunkLoadError
  // when server restarts or re-compiles chunk filenames
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
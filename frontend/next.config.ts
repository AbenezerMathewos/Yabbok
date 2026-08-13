import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/discussions/:path*',
        destination: 'http://localhost:5000/api/discussions/:path*',
      },
      {
        source: '/api/prayers/:path*',
        destination: 'http://localhost:5000/api/prayers/:path*',
      },
      {
        source: '/api/admin/:path*',
        destination: 'http://localhost:5000/api/admin/:path*',
      },
      {
        source: '/api/upload/:path*',
        destination: 'http://localhost:5000/api/upload/:path*',
      },
      {
        source: '/api/churches/:path*',
        destination: 'http://localhost:5000/api/churches/:path*',
      },
      {
        source: '/api/events/:path*',
        destination: 'http://localhost:5000/api/events/:path*',
      },
      {
        source: '/api/gallery/:path*',
        destination: 'http://localhost:5000/api/gallery/:path*',
      },
      {
        source: '/api/insights/:path*',
        destination: 'http://localhost:5000/api/insights/:path*',
      },
      {
        source: '/api/notifications/:path*',
        destination: 'http://localhost:5000/api/notifications/:path*',
      },
      {
        source: '/api/profile/:path*',
        destination: 'http://localhost:5000/api/profile/:path*',
      },
      {
        source: '/api/reports/:path*',
        destination: 'http://localhost:5000/api/reports/:path*',
      },
      {
        source: '/api/sermons/:path*',
        destination: 'http://localhost:5000/api/sermons/:path*',
      },
      {
        source: '/api/suggestions/:path*',
        destination: 'http://localhost:5000/api/suggestions/:path*',
      },
      {
        source: '/api/testimonies/:path*',
        destination: 'http://localhost:5000/api/testimonies/:path*',
      },
      {
        source: '/api/chat/:path*',
        destination: 'http://localhost:5000/api/chat/:path*',
      },
      {
        source: '/api/audio-messages/:path*',
        destination: 'http://localhost:5000/api/audio-messages/:path*',
      },
      {
        source: '/api/books/:path*',
        destination: 'http://localhost:5000/api/books/:path*',
      }
    ];
  }
};

export default nextConfig;

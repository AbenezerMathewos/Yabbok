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
        source: '/api/admin/moderation/:path*',
        destination: 'http://localhost:5000/api/admin/moderation/:path*',
      }
    ];
  }
};

export default nextConfig;

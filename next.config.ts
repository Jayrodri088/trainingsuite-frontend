import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  async rewrites() {
    // Use dedicated env var for backend URL, or derive from API URL
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
      || process.env.NEXT_PUBLIC_API_URL?.slice(0, process.env.NEXT_PUBLIC_API_URL.lastIndexOf('/api'))
      || 'http://localhost:3001';

    return [
      {
        source: '/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;

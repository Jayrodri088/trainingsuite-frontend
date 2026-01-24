import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Disable Turbopack for production builds to ensure standalone output is generated correctly
  // Turbopack is still used for development (next dev --turbopack)
  experimental: {
    // This ensures webpack is used for production builds
  },
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
  // Note: /uploads/* is handled by the API route at src/app/uploads/[...path]/route.ts
  // This provides more reliable proxying in standalone mode than rewrites
};

export default nextConfig;

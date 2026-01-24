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
  // Note: /uploads/* is handled by the API route at src/app/uploads/[...path]/route.ts
  // This provides more reliable proxying in standalone mode than rewrites
};

export default nextConfig;

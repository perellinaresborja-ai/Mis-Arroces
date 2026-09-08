import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    minimumCacheTTL: 604800, // 1 week
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'zvesoygqssyyojqyswwm.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'graph.facebook.com',
      }
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  }
};

export default nextConfig;
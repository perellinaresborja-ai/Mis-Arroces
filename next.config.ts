import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    minimumCacheTTL: 604800, // 1 week
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'zvesoygqssyyojqyswwm.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  }
};

export default nextConfig;

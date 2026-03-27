import type { NextConfig } from 'next';
const backend = process.env.BACKEND_URL ?? 'http://backend:4000';
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{
      protocol: 'https',
      hostname: 'images.unsplash.com'
    }]
  },
  async rewrites() {
    return [{
      source: '/backend/:path*',
      destination: `${backend}/api/:path*`
    }];
  }
};
export default nextConfig;

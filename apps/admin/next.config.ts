import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  transpilePackages: ['@agroconnect/ui', '@agroconnect/models', '@agroconnect/shared'],
};

export default nextConfig;

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,

  // External images configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        pathname: '/wikipedia/commons/**',
      },
      {
        protocol: 'https',
        hostname: 'commons.wikimedia.org',
        pathname: '/**',
      },
    ],
    // Disable optimization to avoid timeout issues with slow Wikimedia servers
    // Images are served directly from source (faster, more reliable)
    unoptimized: true,
  },
};

export default nextConfig;

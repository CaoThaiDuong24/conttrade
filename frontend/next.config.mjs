import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for production deployment
  output: 'standalone',
  
  // Expose JWT_SECRET to Edge Runtime at build time
  env: {
    JWT_SECRET: process.env.JWT_SECRET,
  },
  
  images: {
    domains: ['localhost', '192.168.5.52'],
  },
  
  // Re-enable rewrites to use real backend API
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006'}/api/v1/:path*`,
      },
    ];
  },
  
  // Disable static page generation errors to allow runtime context
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  
  // Skip prerendering errors - allow pages to render dynamically
  staticPageGenerationTimeout: 1000,
  
  // Skip static generation errors during build
  typescript: {
    ignoreBuildErrors: false,
  },
  
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default withNextIntl(nextConfig);
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker/production
  output: 'standalone',
  
  images: {
    domains: ['localhost'],
  },
  
  // Re-enable rewrites to use real backend API
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006/api/v1'}/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
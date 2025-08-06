/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'localhost',
      'freelance-marketplace-backend-tvch.onrender.com',
      'res.cloudinary.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'freelance-marketplace-backend-tvch.onrender.com',
        port: '',
        pathname: '/uploads/**',
      },
    ],
  },
  // Optimize for production
  swcMinify: true,
  // Enable compression
  compress: true,
  // Disable source maps in production
  productionBrowserSourceMaps: false,
  // Experimental features
  experimental: {
    // Enable app directory
    appDir: true,
  },
  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Add any webpack configurations here
    return config;
  },
};

module.exports = nextConfig;

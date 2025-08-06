/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'localhost',
      'freelance-marketplace-backend-tvch.onrender.com',
      'res.cloudinary.com', // If you use Cloudinary for images
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
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://freelance-marketplace-backend-tvch.onrender.com/api/:path*',
      },
    ];
  },
  // Enable static exports for Netlify
  output: 'standalone',
  // Optimize for production
  swcMinify: true,
  // Enable compression
  compress: true,
  // Enable source maps in development only
  productionBrowserSourceMaps: false,
};

module.exports = nextConfig;

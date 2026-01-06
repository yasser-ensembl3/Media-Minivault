/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is stable in Next.js 14

  // Performance optimizations for development
  swcMinify: true,

  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },

  experimental: {
    // Optimize package imports
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
}

module.exports = nextConfig
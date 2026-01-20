import nextra from 'nextra'

const withNextra = nextra({
  contentDirBasePath: '/docs'
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
}

export default withNextra(nextConfig)

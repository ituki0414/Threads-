/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Workaround for CSS build error
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}

module.exports = nextConfig

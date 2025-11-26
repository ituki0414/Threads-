/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // バンドル最適化
  experimental: {
    // 重いパッケージのツリーシェイキング最適化
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      'framer-motion',
      '@radix-ui/react-accordion',
      '@radix-ui/react-tabs',
      '@radix-ui/react-progress',
    ],
  },

  // 画像最適化
  images: {
    // 外部画像ドメインの許可（Threads CDN等）
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'scontent.cdninstagram.com',
      },
      {
        protocol: 'https',
        hostname: '*.cdninstagram.com',
      },
      {
        protocol: 'https',
        hostname: 'platform-lookaside.fbsbx.com',
      },
    ],
    // 画像フォーマット最適化
    formats: ['image/avif', 'image/webp'],
  },

  // モジュール解決の最適化
  modularizeImports: {
    'date-fns': {
      transform: 'date-fns/{{member}}',
    },
  },

  // コンパイラ最適化
  compiler: {
    // 本番環境でconsole.logを除去
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // 本番環境ではソースマップを無効化
  productionBrowserSourceMaps: false,
}

module.exports = nextConfig

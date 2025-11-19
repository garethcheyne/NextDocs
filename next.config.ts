import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Exclude server-only packages from client bundle
  serverExternalPackages: [
    'bcrypt',
    '@mapbox/node-pre-gyp',
    'ews-javascript-api',
    '@ewsjs/xhr',
    'http-cookie-agent',
    'deasync'
  ],
}

export default nextConfig

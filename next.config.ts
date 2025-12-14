import type { NextConfig } from 'next'

// Content Security Policy configuration
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: blob: https://graph.microsoft.com https://avatars.githubusercontent.com https://*.blob.core.windows.net;
  font-src 'self' https://fonts.gstatic.com data:;
  connect-src 'self' https://graph.microsoft.com https://api.github.com https://dev.azure.com https://*.visualstudio.com;
  frame-src 'self';
  frame-ancestors 'self';
  form-action 'self';
  base-uri 'self';
  object-src 'none';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim()

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'graph.microsoft.com', // Microsoft Graph for profile photos
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com', // GitHub avatars
      },
      {
        protocol: 'https',
        hostname: '*.blob.core.windows.net', // Azure Blob Storage
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
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Content-Security-Policy',
            value: ContentSecurityPolicy,
          },
        ],
      },
    ]
  },
}

export default nextConfig

import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/components/auth/auth-provider'
import { AnalyticsProvider } from '@/lib/analytics/client'
import ParticlesBackground from '@/components/particles-background'
import { Toaster } from '@/components/ui/sonner'
import { PWAUpdatePrompt } from '@/components/pwa/pwa-update-prompt'
import { PushNotificationPrompt } from '@/components/pwa/push-notification-prompt'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: `${process.env.NEXT_PUBLIC_SITE_NAME || 'NextDocs'} - Knowledge Hub`,
  description: '🐝 Knowledge Hub for Enterprise Solutions, Microsoft Technologies & Business Applications',
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon.ico', sizes: '32x32' },
    ],
    apple: [
      { url: '/icons/apple-icon-180x180.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <AnalyticsProvider>
              <ParticlesBackground />

              {/* Subtle radial gradient overlay */}
              <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent z-[2] pointer-events-none" />

              {/* Subtle grid pattern */}
              <div className="fixed inset-0 bg-[linear-gradient(rgba(255,107,53,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,107,53,0.02)_1px,transparent_1px)] bg-[size:50px_50px] z-[2] pointer-events-none" />

              {/* Main Content */}
              <div className="relative z-10">
                {children}
              </div>
              <Toaster />
              <PWAUpdatePrompt />
              <PushNotificationPrompt />
            </AnalyticsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/components/auth/auth-provider'
import { AnalyticsProvider } from '@/lib/analytics/client'
import ParticlesBackground from '@/components/particles-background'
import { SearchDialog } from '@/components/search/search-dialog'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Harvey Norman Commercial Apps Team',
  description: 'Enterprise Solutions Hub for Microsoft Technologies & Business Applications',
  icons: {
    icon: [
      { url: '/icon.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon.ico', sizes: '32x32' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
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
              {/* Global Search Dialog (⌘K) */}
              <SearchDialog />
              
              {/* Particles Background - Site-wide */}
              <ParticlesBackground />

              {/* Radial gradient overlay for depth - more subtle in light mode */}
              <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/5 dark:from-primary/10 via-transparent to-transparent z-[2] pointer-events-none" />

              {/* Subtle grid pattern - lighter in light mode */}
              <div className="fixed inset-0 bg-[linear-gradient(hsl(var(--primary)/0.015)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--primary)/0.015)_1px,transparent_1px)] dark:bg-[linear-gradient(hsl(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--primary)/0.03)_1px,transparent_1px)] bg-[size:50px_50px] z-[2] pointer-events-none" />

              {/* Main Content */}
              <div className="relative z-10">
                {children}
              </div>
            </AnalyticsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

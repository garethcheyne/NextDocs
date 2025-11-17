import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/components/auth/auth-provider'
import ParticlesBackground from '@/components/particles-background'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Harvey Norman Commercial Apps Team',
  description: 'Enterprise Solutions Hub for Microsoft Technologies & Business Applications',
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
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

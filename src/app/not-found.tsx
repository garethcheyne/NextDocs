import Link from 'next/link'
import { AnimatedLogo } from '@/components/ui/animated-logo'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <AnimatedLogo />
      </div>

      {/* Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm -z-5"></div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-8 max-w-2xl mx-auto">
          {/* Error Code */}
          <div className="space-y-4">
            <h1 className="text-8xl md:text-9xl font-black bg-gradient-to-r from-brand-orange to-orange-500 bg-clip-text text-transparent animate-pulse">
              404
            </h1>

            {/* Tiger Message */}
            <Card className="bg-card/95 backdrop-blur border-orange-200 dark:border-orange-800 shadow-2xl">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    🐅 Grrrr! Did you get lost?
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    It's a tiger's territory here!
                    <br className="hidden sm:block" />
                    Wandering around too much and you might get eaten...
                  </p>
                  <p className="text-base text-muted-foreground opacity-80">
                    The page you're looking for has been hunted down by our documentation tiger.
                    <br />
                    Better head back to safety before you become the next meal! 🍖
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="bg-brand-orange hover:bg-orange-600 text-white px-8 py-3">
              <Link href="/" className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                Back to Safety
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg" className="px-8 py-3 border-orange-200 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-950">
              <Link href="/docs" className="flex items-center gap-2">
                <ArrowLeft className="w-5 h-5" />
                Browse Documentation
              </Link>
            </Button>
          </div>

          {/* Fun Navigation Suggestions */}
          <div className="text-sm text-muted-foreground space-y-2 pt-8">
            <p className="font-medium">Looking for something specific? Try these tiger-approved paths:</p>
            <div className="flex flex-wrap justify-center gap-4 text-brand-orange">
              <Link href="/docs" className="hover:underline">📚 Documentation</Link>
              <Link href="/features" className="hover:underline">✨ Features</Link>
              <Link href="/guide" className="hover:underline">🗺️ Getting Started</Link>
              <Link href="/admin" className="hover:underline">⚙️ Admin Panel</Link>
            </div>
          </div>

          {/* Tiger Paw Prints */}
          <div className="opacity-20 text-2xl space-y-2 pt-8">
            <div className="animate-bounce" style={{ animationDelay: '0s' }}>🐾</div>
            <div className="animate-bounce" style={{ animationDelay: '0.5s' }}>🐾</div>
            <div className="animate-bounce" style={{ animationDelay: '1s' }}>🐾</div>
          </div>
        </div>
      </div>
    </div>
  )
}
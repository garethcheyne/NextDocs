import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChevronDown, BookOpen, Newspaper, Code2 } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-brand-gradient">
        <div className="container px-4 text-center max-w-6xl">
          {/* Logo and Brand */}
          <div className="mb-8 flex justify-center">
            <div className="flex items-center gap-4">
              <Image
                src="/hnc_cat_logo_blk.svg"
                alt="Harvey Norman Commercial Apps Team"
                width={200}
                height={80}
                className="dark:invert"
              />
              <div className="text-left">
                <div className="text-brand-orange font-bold text-sm uppercase tracking-wider">
                  Commercial Apps Team
                </div>
                <div className="text-white/80 text-xs">Enterprise Solutions Hub</div>
              </div>
            </div>
          </div>
          
          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Commercial Apps Team
            <br />
            <span className="text-white/90">Documentation</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-white/90 mb-4 max-w-4xl mx-auto">
            Enterprise Solutions Hub for Microsoft Technologies & Business Applications
          </p>
          
          <p className="text-lg text-brand-orange mb-12">
            Microsoft Technologies • Enterprise Solutions • Business Applications
          </p>
          
          {/* Sign-In Card */}
          <Card className="max-w-md mx-auto p-8 bg-white/10 backdrop-blur border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">Welcome Back</h2>
            <p className="text-white/80 mb-6">
              Sign in to access documentation, blog posts, and API references
            </p>
            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white"
                asChild
              >
                <Link href="/login">Sign In</Link>
              </Button>
              <p className="text-sm text-white/60 text-center">
                Protected content requires authentication
              </p>
            </div>
          </Card>
          
          {/* Scroll Indicator */}
          <div className="mt-16 text-brand-gray flex items-center justify-center gap-2">
            <span className="text-white/60">Scroll to learn more</span>
            <ChevronDown className="w-4 h-4 animate-bounce text-white/60" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container px-4 max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            What's Inside
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 hover:border-brand-orange transition-colors">
              <BookOpen className="w-12 h-12 text-brand-orange mb-4" />
              <h3 className="text-xl font-bold mb-2">Documentation</h3>
              <p className="text-muted-foreground">
                Comprehensive guides for Dynamics 365 BC, CE, TMS, eWay, and more
              </p>
            </Card>
            <Card className="p-6 hover:border-brand-orange transition-colors">
              <Newspaper className="w-12 h-12 text-brand-orange mb-4" />
              <h3 className="text-xl font-bold mb-2">Blog & Updates</h3>
              <p className="text-muted-foreground">
                Latest features, enhancements, and technical insights
              </p>
            </Card>
            <Card className="p-6 hover:border-brand-orange transition-colors">
              <Code2 className="w-12 h-12 text-brand-orange mb-4" />
              <h3 className="text-xl font-bold mb-2">API Documentation</h3>
              <p className="text-muted-foreground">
                Interactive API specs with Swagger UI and detailed examples
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Harvey Norman Commercial Apps Team. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

'use client'
import { useEffect, useState } from 'react'


export function AnimatedLogo() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="relative w-full max-w-[300px] sm:max-w-[400px] md:max-w-[500px] lg:max-w-[700px] aspect-square mx-auto flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-orange/20 border-t-brand-orange rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="relative w-full max-w-[300px] sm:max-w-[400px] md:max-w-[500px] lg:max-w-[700px] aspect-square mx-auto flex items-center justify-center">

      {/* Center logo - responsive sizing with orange glow and animations */}
      <div className="relative flex items-center justify-center z-30">
        <div className="relative animate-float">
          <img
            src="/icons/logo-512.png"
            alt="The Hive - Documentation Platform"
            className="w-[200px] h-[250px] sm:w-[280px] sm:h-[350px] md:w-[360px] md:h-[450px] lg:w-[500px] lg:h-[600px] object-contain hover:scale-105 transition-all duration-300 drop-shadow-2xl"
          />

          {/* Orange glow effect behind the logo */}
          <div className="glow-effect-primary"></div>
          <div className="glow-effect-secondary" style={{ '--glow-delay': '1s' } as React.CSSProperties}></div>
        </div>
      </div>
    </div>
  )
}


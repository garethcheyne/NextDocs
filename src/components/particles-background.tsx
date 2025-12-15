'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'

export default function ParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme, systemTheme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Enhanced Scary Particle class
    class Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      opacity: number
      pulseSpeed: number
      pulseOffset: number
      color: string
      glowIntensity: number
      isDrifting: boolean
      driftSpeed: number
      originalSpeedX: number
      originalSpeedY: number

      constructor() {
        this.x = Math.random() * canvas!.width
        this.y = Math.random() * canvas!.height
        this.size = Math.random() * 3 + 0.5
        this.speedX = (Math.random() - 0.5) * 0.8
        this.speedY = (Math.random() - 0.5) * 0.8
        this.originalSpeedX = this.speedX
        this.originalSpeedY = this.speedY
        this.opacity = Math.random() * 0.6 + 0.2
        this.pulseSpeed = Math.random() * 0.02 + 0.01
        this.pulseOffset = Math.random() * Math.PI * 2
        this.glowIntensity = Math.random() * 0.5 + 0.3
        this.isDrifting = Math.random() > 0.7 // 30% chance of being a drifting particle
        this.driftSpeed = Math.random() * 0.002 + 0.001

        // Mix of colors for scary effect
        const colors = ['255, 107, 53', '255, 69, 0', '255, 140, 0', '220, 20, 60', '138, 43, 226']
        this.color = colors[Math.floor(Math.random() * colors.length)]
      }

      update() {
        // Add spooky drifting behavior
        if (this.isDrifting) {
          this.speedX += (Math.random() - 0.5) * this.driftSpeed
          this.speedY += (Math.random() - 0.5) * this.driftSpeed

          // Limit max drift speed
          this.speedX = Math.max(-2, Math.min(2, this.speedX))
          this.speedY = Math.max(-2, Math.min(2, this.speedY))
        }

        this.x += this.speedX
        this.y += this.speedY

        // Wrap around screen edges
        if (this.x > canvas!.width) this.x = 0
        if (this.x < 0) this.x = canvas!.width
        if (this.y > canvas!.height) this.y = 0
        if (this.y < 0) this.y = canvas!.height

        // Update pulsing
        this.pulseOffset += this.pulseSpeed
      }

      draw() {
        if (!ctx) return
        const currentTheme = theme === 'system' ? systemTheme : theme
        const isDark = currentTheme === 'dark'

        // Pulsing opacity for spooky effect
        const pulse = Math.sin(this.pulseOffset) * 0.3 + 0.7
        const currentOpacity = this.opacity * pulse

        // Enhanced color with theme support
        const baseOpacity = isDark ? currentOpacity : currentOpacity * 0.4
        const glowOpacity = isDark ? this.glowIntensity * pulse : this.glowIntensity * pulse * 0.3

        // Draw glow effect
        ctx.shadowColor = `rgb(${this.color})`
        ctx.shadowBlur = 10 * pulse
        ctx.fillStyle = `rgba(${this.color}, ${baseOpacity})`

        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size * pulse, 0, Math.PI * 2)
        ctx.fill()

        // Add extra glow for scary effect
        ctx.shadowBlur = 20 * pulse
        ctx.fillStyle = `rgba(${this.color}, ${glowOpacity * 0.3})`
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size * 2 * pulse, 0, Math.PI * 2)
        ctx.fill()

        // Reset shadow
        ctx.shadowBlur = 0
      }
    }

    // Create enhanced particle system
    const particlesArray: Particle[] = []
    const numberOfParticles = 120 // More particles for scary effect

    for (let i = 0; i < numberOfParticles; i++) {
      particlesArray.push(new Particle())
    }

    // Animation loop
    function animate() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesArray.forEach((particle) => {
        particle.update()
        particle.draw()
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [theme, systemTheme])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  )
}

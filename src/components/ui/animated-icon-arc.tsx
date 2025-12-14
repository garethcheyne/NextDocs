'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

const icons = [
  { name: 'Microsoft 365 Copilot', src: '/icons/microsoft-365-copilot.png' },
  { name: 'Dynamics 365', src: '/icons/dynamics-365.png' },
  { name: 'Business Central', src: '/icons/business-central.png' },
  { name: 'Power Platform', src: '/icons/power-platform.png' },
  { name: 'Power BI', src: '/icons/power-bi.png' },
  { name: 'SharePoint', src: '/icons/sharepoint.png' },
  { name: 'Teams', src: '/icons/teams.png' },
  { name: 'Microsoft Graph', src: '/icons/microsoft-graph.png' },
  { name: 'Fabric', src: '/icons/fabric.png' },
  { name: 'DeliverEasy', src: '/icons/deliver-easy.png' },
]

export function AnimatedIconArc() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="relative w-[700px] h-[700px] mx-auto flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-orange/20 border-t-brand-orange rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="relative w-[700px] h-[700px] mx-auto flex items-center justify-center">
      {/* 
      // COMMENTED OUT - Arc icons temporarily disabled
      {icons.map((icon, index) => {
        // Create a large arc following the red line from the screenshot
        // Arc spans almost a full circle around the center, starting from top-right going clockwise
        const startAngle = -45 // Start from upper-right
        const endAngle = 225   // End at lower-left (270 degrees total arc)
        const angleRange = endAngle - startAngle
        const angle = startAngle + (index * angleRange) / (icons.length - 1)
        
        // Much larger radius to match the screenshot's red line
        const radius = 280
        const x = Math.cos(angle * Math.PI / 180) * radius
        const y = Math.sin(angle * Math.PI / 180) * radius
        
        return (
          <div
            key={icon.name}
            className="icon-arc-item"
            style={{
              '--icon-x': `${x}px`,
              '--icon-y': `${y}px`,
              '--icon-delay': `${index * 0.2}s`,
            } as React.CSSProperties}
          >
            <div className="animate-float">
              <Image
                src={icon.src}
                alt={icon.name}
                width={56}
                height={56}
                className="drop-shadow-2xl hover:drop-shadow-xl transition-all duration-300"
                title={icon.name}
              />
            </div>
          </div>
        )
      })}
      */}

      {/* Center logo - 600px prominent with orange glow and animations */}
      <div className="relative flex items-center justify-center z-30">
        <div className="relative animate-float">
          <img
            src="/img/cat_logo.png"
            alt="Documentation Platform"
            className="w-[600px] h-[600px] object-contain hover:scale-105 transition-all duration-300 drop-shadow-2xl"
          />

          {/* Orange glow effect behind the tiger */}
          <div className="glow-effect-primary"></div>
          <div className="glow-effect-secondary" style={{ '--glow-delay': '1s' } as React.CSSProperties}></div>
        </div>
      </div>

      {/* 
      // COMMENTED OUT - Arc guide path temporarily disabled
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20 z-10">
        <defs>
          <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#f97316" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <path
          d={`M ${300 + Math.cos(-45 * Math.PI / 180) * 280} ${300 + Math.sin(-45 * Math.PI / 180) * 280} 
              A 280 280 0 1 1 ${300 + Math.cos(225 * Math.PI / 180) * 280} ${300 + Math.sin(225 * Math.PI / 180) * 280}`}
          stroke="url(#arcGradient)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="15,8"
          className="animate-pulse"
        />
      </svg>
      */}
    </div>
  )
}


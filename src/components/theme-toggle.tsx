'use client'

import * as React from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [open, setOpen] = React.useState(false)

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    // Close dropdown immediately after theme change
    setOpen(false)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" onClick={(e) => e.stopPropagation()}>
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onClick={() => handleThemeChange('light')}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange('dark')}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange('system')}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Inline theme toggle for use inside dropdown menus (no nested dropdown)
export function InlineThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      <Button
        variant={theme === 'light' ? 'secondary' : 'ghost'}
        size="icon"
        className="h-7 w-7"
        onClick={(e) => {
          e.stopPropagation()
          setTheme('light')
        }}
      >
        <Sun className="h-3.5 w-3.5" />
        <span className="sr-only">Light mode</span>
      </Button>
      <Button
        variant={theme === 'dark' ? 'secondary' : 'ghost'}
        size="icon"
        className="h-7 w-7"
        onClick={(e) => {
          e.stopPropagation()
          setTheme('dark')
        }}
      >
        <Moon className="h-3.5 w-3.5" />
        <span className="sr-only">Dark mode</span>
      </Button>
      <Button
        variant={theme === 'system' ? 'secondary' : 'ghost'}
        size="icon"
        className="h-7 w-7"
        onClick={(e) => {
          e.stopPropagation()
          setTheme('system')
        }}
      >
        <Monitor className="h-3.5 w-3.5" />
        <span className="sr-only">System</span>
      </Button>
    </div>
  )
}

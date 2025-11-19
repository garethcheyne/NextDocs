'use client'

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/', redirect: true })}
      className="flex w-full items-center cursor-pointer"
    >
      <LogOut className="mr-2 h-4 w-4" />
      <span>Sign Out</span>
    </button>
  )
}

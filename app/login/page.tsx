import { redirect } from 'next/navigation'

export default function LoginPage() {
  // Temporary redirect until we build the login page
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-gradient">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">Login Page</h1>
        <p className="mb-4">Authentication coming soon...</p>
        <a href="/" className="text-brand-orange hover:underline">
          ← Back to Home
        </a>
      </div>
    </div>
  )
}

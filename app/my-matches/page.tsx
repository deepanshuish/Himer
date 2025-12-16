'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function MyMatchesPage() {
  const router = useRouter()

  useEffect(() => {
    // Inbox and Chat are the same section now
    router.replace('/chat')
  }, [])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-600 border-t-transparent mx-auto"></div>
        <p className="mt-4 text-gray-700 text-sm">Redirecting...</p>
      </div>
    </div>
  )
}

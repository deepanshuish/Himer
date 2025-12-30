'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import API_URL from '@/lib/api'

export default function MyProfileRedirect() {
  const router = useRouter()

  useEffect(() => {
    const redirectToProfile = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          router.push('/login')
          return
        }

        // Get current user
        const res = await axios.get(
          `${API_URL}/api/auth/me`,
          { headers: { Authorization: `Bearer ${token}` } }
        )

        const userId = res.data?._id || res.data?.id
        if (userId) {
          router.push(`/profile/${userId}`)
        } else {
          console.error('No user ID found in response:', res.data)
          router.push('/matches')
        }
      } catch (err) {
        console.error('Failed to get user ID:', err)
        router.push('/login')
      }
    }

    redirectToProfile()
  }, [router])

  return (
    <div className="min-h-screen bg-cyan-50/30 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-600 border-t-transparent mx-auto"></div>
        <p className="mt-4 text-gray-700 text-sm">Loading your profile...</p>
      </div>
    </div>
  )
}

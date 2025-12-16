'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

interface Profile {
	firstName?: string
	homepageUnlockAt?: string
}

export default function WaitingPage() {
	const router = useRouter()
	const [profile, setProfile] = useState<Profile | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	const getAuthHeaders = () => {
	  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
	  if (!token) {
	    router.push('/login')
	    return {}
	  }
	  return {
	    Authorization: `Bearer ${token}`,
	  }
	}

	useEffect(() => {
	  const loadProfile = async () => {
	    try {
	      const response = await axios.get(
	        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/profile`,
	        { headers: getAuthHeaders() }
	      )
	      setProfile(response.data)
	    } catch (err: any) {
	      if (err.response?.status === 401) {
	        router.push('/login')
	      } else {
	        setError('Failed to load your profile.')
	      }
	    } finally {
	      setLoading(false)
	    }
	  }

	  loadProfile()
	}, [])

	const formattedUnlockTime = () => {
	  if (!profile?.homepageUnlockAt) return null
	  const d = new Date(profile.homepageUnlockAt)
	  if (Number.isNaN(d.getTime())) return null
	  return d.toLocaleString()
	}

	if (loading) {
	  return (
	    <div className="min-h-screen bg-cyan-50 flex items-center justify-center">
	      <div className="text-center">
	        <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-600 border-t-transparent mx-auto"></div>
	        <p className="mt-6 text-gray-700 font-medium">Loading...</p>
	      </div>
	    </div>
	  )
	}

	return (
	  <div className="min-h-screen bg-white flex items-center justify-center px-6 relative overflow-hidden">
	    {/* Background Elements */}
	    <div className="fixed inset-0 -z-10 bg-cyan-50/30">
	      <div className="absolute inset-0" style={{
	        backgroundImage: `
linear-gradient(rgba(8, 145, 178, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(8, 145, 178, 0.03) 1px, transparent 1px)
	        `,
	        backgroundSize: '50px 50px'
	      }}></div>
	    </div>

	    <div className="max-w-lg w-full glass-effect rounded-xl p-10 text-center shadow-lg border border-cyan-100 animate-scale-in">
	      <div className="w-16 h-16 bg-cyan-100 rounded-xl flex items-center justify-center mx-auto mb-6">
	        <svg className="w-8 h-8 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
	          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
	        </svg>
	      </div>
	      <h1 className="text-2xl font-bold text-gray-900 mb-3">
	        Curating Your Matches
	      </h1>
	      {profile?.firstName && (
	        <p className="text-gray-600 mb-3 text-sm">Thanks, <span className="text-cyan-600 font-semibold">{profile.firstName}</span> ❤️</p>
	      )}
	      <p className="text-sm text-gray-600 mb-6 leading-relaxed">
	        Our system is curating 25 personalized matches just for you. Come back in <span className="font-semibold text-cyan-600">2 minutes</span> to see your dashboard.
	      </p>
	      {error && (
	        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 animate-fade-in">
	          <p className="font-medium">{error}</p>
	        </div>
	      )}
	      {formattedUnlockTime() && (
	        <div className="mb-6 p-4 glass-effect rounded-xl border border-cyan-200">
	          <p className="text-sm text-gray-600 font-medium">
	            Dashboard unlocks at:<br/>
	            <span className="gradient-text font-bold text-lg">{formattedUnlockTime()}</span>
	          </p>
	        </div>
	      )}
      <button
        onClick={() => router.push('/')}
        className="mt-4 inline-flex items-center justify-center px-8 py-3 bg-cyan-600 text-white font-semibold rounded-xl hover:bg-cyan-700 transition-all"
      >
        Back to Home
      </button>
	    </div>
	  </div>
	)
}


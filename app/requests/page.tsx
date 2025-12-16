'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Link from 'next/link'

interface RequestItem {
  id: string
  firstName: string
  lastName: string
  college?: string
  profile?: {
    bio?: string
    photos?: string[]
  }
  sentAt: string
}

export default function RequestsPage() {
  const router = useRouter()
  const [requests, setRequests] = useState<RequestItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      router.push('/login')
      return {}
    }
    return { Authorization: `Bearer ${token}` }
  }

  const loadRequests = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/matches/requests`,
        { headers: getAuthHeaders() }
      )
      setRequests(res.data)
    } catch (err: any) {
      if (err.response?.status === 401) router.push('/login')
      else setError('Failed to load requests.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [])

  const accept = async (userId: string) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/matches/accept/${userId}`,
        {},
        { headers: getAuthHeaders() }
      )
      setRequests((prev) => prev.filter((r) => r.id !== userId))
      setToast('Accepted. Moved to Inbox/Chat.')
      setTimeout(() => setToast(''), 2000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to accept request.')
    }
  }

  const reject = async (userId: string) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/matches/reject/${userId}`,
        {},
        { headers: getAuthHeaders() }
      )
      setRequests((prev) => prev.filter((r) => r.id !== userId))
      setToast('Rejected.')
      setTimeout(() => setToast(''), 1500)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject request.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-600 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-gray-700 font-medium">Loading requests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cyan-50/30">
      <nav className="glass-effect sticky top-0 z-50 backdrop-blur-lg border-b border-cyan-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link href="/matches" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">C</span>
              </div>
              <span className="text-xl font-bold text-cyan-600">CampusConnect</span>
            </Link>
            <div className="flex gap-2 flex-wrap">
              <Link href="/matches" className="px-4 py-2 rounded-xl font-medium text-gray-700 hover:bg-cyan-50 hover:text-cyan-600 transition-all">
                Dashboard
              </Link>
              <Link href="/chat" className="px-4 py-2 rounded-xl font-medium text-gray-700 hover:bg-cyan-50 hover:text-cyan-600 transition-all">
                Chat
              </Link>
              <Link href="/leaderboard" className="px-4 py-2 rounded-xl font-medium text-gray-700 hover:bg-cyan-50 hover:text-cyan-600 transition-all">
                Leaderboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {toast && (
        <div className="fixed top-6 right-6 z-50 glass-effect px-6 py-3 rounded-xl shadow-lg border border-cyan-200 animate-fade-in">
          <p className="font-semibold text-cyan-600">{toast}</p>
        </div>
      )}

      <main className="container mx-auto px-6 py-8 space-y-8">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="inline-block px-3 py-1 bg-cyan-100 text-cyan-600 rounded-full text-xs font-medium mb-3">
              Follow Requests
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Pending Requests</h1>
          </div>
          <div className="px-4 py-2 glass-effect rounded-full">
            <span className="text-sm text-gray-600 font-semibold">{requests.length} Pending</span>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 animate-fade-in">
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {requests.length === 0 ? (
          <div className="glass-effect rounded-2xl p-16 text-center space-y-6 animate-fade-in">
            <div className="w-20 h-20 bg-cyan-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 mb-2">No Requests</p>
              <p className="text-gray-600">When someone sends you a follow request, it will appear here</p>
            </div>
            <Link href="/matches" className="inline-block px-6 py-3 rounded-xl bg-cyan-600 text-white font-semibold hover:bg-cyan-700 transition-all hover:scale-105 shadow-lg shadow-cyan-200/50">
              Explore Matches
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((r, index) => {
              const photo = r.profile?.photos?.[0]
              return (
                <div 
                  key={r.id} 
                  className="glass-effect rounded-xl p-6 space-y-4 hover:shadow-lg transition-all duration-300 animate-fade-in-up border border-cyan-100"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center gap-4">
                    {photo ? (
                      <img
                        src={photo}
                        alt={`${r.firstName} ${r.lastName}`}
                        className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold bg-cyan-600 text-white shadow-md">
                        {r.firstName?.[0]}
                        {r.lastName?.[0]}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-lg font-bold truncate text-gray-900">{r.firstName} {r.lastName}</p>
                      <p className="text-xs text-gray-600 truncate">{r.college || ''}</p>
                    </div>
                  </div>
                  {r.profile?.bio && <p className="text-xs text-gray-600 line-clamp-3">{r.profile.bio}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={() => reject(r.id)}
                      className="flex-1 py-2 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all text-sm"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => accept(r.id)}
                      className="flex-1 py-2 bg-cyan-600 text-white font-medium rounded-xl hover:bg-cyan-700 transition-all text-sm"
                    >
                      Accept
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}



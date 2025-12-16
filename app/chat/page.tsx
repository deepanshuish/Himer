'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Link from 'next/link'

interface Match {
  id: string
  firstName: string
  lastName: string
  college?: string
  profile?: {
    bio?: string
    photos?: string[]
  }
  matchedAt: string
}

export default function ChatInboxPage() {
  const router = useRouter()
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      router.push('/login')
      return {}
    }
    return { Authorization: `Bearer ${token}` }
  }

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/matches`,
          { headers: getAuthHeaders() }
        )
        setMatches(res.data)
      } catch (err: any) {
        if (err.response?.status === 401) router.push('/login')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-600 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-gray-700 font-medium">Loading inbox...</p>
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
              <Link href="/requests" className="px-4 py-2 rounded-xl font-medium text-gray-700 hover:bg-cyan-50 hover:text-cyan-600 transition-all">
                Requests
              </Link>
              <Link href="/leaderboard" className="px-4 py-2 rounded-xl font-medium text-gray-700 hover:bg-cyan-50 hover:text-cyan-600 transition-all">
                Leaderboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-12 space-y-8">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="inline-block px-3 py-1 bg-cyan-100 text-cyan-600 rounded-full text-xs font-medium mb-3">
              Messages
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Your Inbox</h1>
          </div>
          <div className="px-4 py-2 glass-effect rounded-full">
            <span className="text-sm text-gray-600 font-semibold">{matches.length} Connection{matches.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {matches.length === 0 ? (
          <div className="glass-effect rounded-2xl p-16 text-center space-y-6 animate-fade-in">
            <div className="w-20 h-20 bg-cyan-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 mb-2">No Messages Yet</p>
              <p className="text-gray-600">Accept follow requests to start chatting</p>
            </div>
            <Link href="/requests" className="inline-block px-6 py-3 rounded-xl bg-cyan-600 text-white font-semibold hover:bg-cyan-700 transition-all hover:scale-105 shadow-lg shadow-cyan-200/50">
              View Requests
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((m, index) => {
              const photo = m.profile?.photos?.[0]
              return (
                <Link
                  key={m.id}
                  href={`/chat/${m.id}`}
                  className="glass-effect rounded-2xl p-6 space-y-4 hover:shadow-xl hover:shadow-cyan-100/50 transition-all duration-300 hover:-translate-y-1 group animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center gap-4">
                    {photo ? (
                      <img
                        src={photo}
                        alt={`${m.firstName} ${m.lastName}`}
                        className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold bg-cyan-600 text-white shadow-lg">
                        {m.firstName?.[0]}
                        {m.lastName?.[0]}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xl font-black truncate text-gray-900 group-hover:text-cyan-600 transition-colors">{m.firstName} {m.lastName}</p>
                      <p className="text-sm text-gray-600 truncate">{m.college || ''}</p>
                    </div>
                  </div>
                  {m.profile?.bio && <p className="text-sm text-gray-600 line-clamp-2">{m.profile.bio}</p>}
                  <p className="text-xs text-gray-500">Connected {new Date(m.matchedAt).toLocaleDateString()}</p>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}



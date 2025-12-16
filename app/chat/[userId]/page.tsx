'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'

interface Message {
	_id: string
	from: string
	to: string
	text: string
	createdAt: string
}

export default function ChatPage() {
	const params = useParams<{ userId: string }>()
	const router = useRouter()
	const userId = params.userId
	const [messages, setMessages] = useState<Message[]>([])
	const [input, setInput] = useState('')
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [currentUserId, setCurrentUserId] = useState<string | null>(null)

	const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

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
	  const load = async () => {
	    try {
	      // Get current user id
	      const me = await axios.get(`${apiBase}/api/auth/me`, { headers: getAuthHeaders() })
	      setCurrentUserId(me.data?._id)

	      // Load messages
	      const res = await axios.get(`${apiBase}/api/chat/${userId}`, {
	        headers: getAuthHeaders(),
	      })
	      setMessages(res.data)
	    } catch (err: any) {
	      if (err.response?.status === 401) {
	        router.push('/login')
	      } else {
	        setError('Failed to load chat.')
	      }
	    } finally {
	      setLoading(false)
	    }
	  }

	  if (userId) {
	    load()
	  }
	}, [userId])

	const handleSend = async (e: React.FormEvent) => {
	  e.preventDefault()
	  if (!input.trim()) return

	  try {
	    const res = await axios.post(
	      `${apiBase}/api/chat/${userId}`,
	      { text: input },
	      { headers: getAuthHeaders() }
	    )
	    setMessages((prev) => [...prev, res.data])
	    setInput('')
	  } catch (err: any) {
	    if (err.response?.status === 401) {
	      router.push('/login')
	    } else {
	      setError('Failed to send message.')
	    }
	  }
	}

	if (loading) {
	  return (
	    <div className="min-h-screen bg-cyan-50 flex items-center justify-center">
	      <div className="text-center">
	        <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-600 border-t-transparent mx-auto"></div>
	        <p className="mt-6 text-gray-700 font-medium">Loading chat...</p>
	      </div>
	    </div>
	  )
	}

	return (
	  <div className="min-h-screen bg-cyan-50/30 flex flex-col">
	    <nav className="glass-effect sticky top-0 z-50 backdrop-blur-lg border-b border-cyan-100">
	      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
	        <Link href="/chat" className="flex items-center gap-2 px-3 py-2 rounded-xl font-medium text-gray-700 hover:bg-cyan-50 hover:text-cyan-600 transition-all text-sm">
	          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
	            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
	          </svg>
	          Back
	        </Link>
	        <Link href="/matches" className="flex items-center gap-2">
	          <div className="w-8 h-8 bg-cyan-600 rounded-xl flex items-center justify-center">
	            <span className="text-white font-bold text-sm">C</span>
	          </div>
	          <span className="text-lg font-bold text-cyan-600 hidden sm:inline">CampusConnect</span>
	        </Link>
	      </div>
	    </nav>

	    <main className="flex-1 container mx-auto px-6 py-6 flex flex-col max-w-4xl">
	      <div className="flex-1 glass-effect rounded-xl p-6 overflow-y-auto mb-4 shadow-lg border border-cyan-100" style={{ minHeight: '500px' }}>
	        {error && (
	          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl border border-red-200 text-sm animate-fade-in">
	            {error}
	          </div>
	        )}
	        {messages.length === 0 ? (
	          <div className="flex flex-col items-center justify-center h-full text-center">
	            <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mb-4">
	              <svg className="w-8 h-8 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
	                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
	              </svg>
	            </div>
	            <p className="text-gray-500 font-medium">No messages yet. Start the conversation!</p>
	          </div>
	        ) : (
	          <div className="space-y-3">
	            {messages.map((msg, index) => {
	              const isMe = currentUserId && msg.from === currentUserId
	              return (
	                <div
	                  key={msg._id}
	                  className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}
	                  style={{ animationDelay: `${index * 0.05}s` }}
	                >
	                  <div
	                    className={`max-w-sm px-4 py-3 rounded-xl shadow-sm ${
	                      isMe
	                        ? 'bg-cyan-600 text-white'
	                        : 'bg-white text-gray-900 border border-gray-200'
	                    }`}
	                  >
	                    <p className="text-sm leading-relaxed">{msg.text}</p>
	                    <p className={`mt-1 text-[10px] ${isMe ? 'text-white/70' : 'text-gray-500'}`}>
	                      {new Date(msg.createdAt).toLocaleTimeString()}
	                    </p>
	                  </div>
	                </div>
	              )
	            })}
	          </div>
	        )}
	      </div>

	      <form onSubmit={handleSend} className="flex gap-2">
	        <input
	          type="text"
	          value={input}
	          onChange={(e) => setInput(e.target.value)}
	          placeholder="Type a message..."
	          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all font-medium"
	        />
	        <button
	          type="submit"
	          className="px-6 py-3 bg-cyan-600 text-white rounded-xl font-semibold hover:bg-cyan-700 transition-all disabled:opacity-50"
	        >
	          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
	            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
	          </svg>
	        </button>
	      </form>
	    </main>
	  </div>
	)
}


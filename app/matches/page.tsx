'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Link from 'next/link'

interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  college?: {
    name: string
  }
  profile?: {
    age?: number
    bio?: string
    major?: string
    year?: string
    interests?: string[]
    photos?: string[]
  }
}

interface Tweet {
  _id: string
  text: string
  likes: string[]
  replies: Reply[]
  createdAt: string
  user: {
    _id: string
    firstName: string
    lastName: string
    photo?: string
  }
}

interface Reply {
  _id: string
  user: {
    _id: string
    firstName: string
    lastName: string
    photo?: string
  }
  text: string
  createdAt: string
}

export default function MatchesPage() {
  const router = useRouter()
  const [potentialMatches, setPotentialMatches] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusMessage, setStatusMessage] = useState('')
  const [error, setError] = useState('')
  const [tweetText, setTweetText] = useState('')
  const [posting, setPosting] = useState(false)
  const [feed, setFeed] = useState<Tweet[]>([])
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [showFeed, setShowFeed] = useState(true)

  useEffect(() => {
    loadPotentialMatches()
    loadFeed()
    loadCurrentUser()
  }, [])

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return {}
    }
    return {
      Authorization: `Bearer ${token}`,
    }
  }

  const loadPotentialMatches = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/potential-matches`,
        { headers: getAuthHeaders() }
      )
      setPotentialMatches(response.data)
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push('/login')
      } else {
        setError('Failed to load your choices. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleLike = async (userId: string) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/matches/like/${userId}`,
        {},
        { headers: getAuthHeaders() }
      )
      setStatusMessage('Follow request sent.')
      setTimeout(() => setStatusMessage(''), 2500)
      setPotentialMatches(potentialMatches.filter((user) => user._id !== userId))
    } catch (err: any) {
      console.error('Follow request error:', err)
      setError('Failed to send request. Please try again.')
    }
  }

  const handlePass = async (userId: string) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/matches/pass/${userId}`,
        {},
        { headers: getAuthHeaders() }
      )
      setPotentialMatches(potentialMatches.filter((user) => user._id !== userId))
    } catch (err: any) {
      console.error('Skip error:', err)
      setError('Failed to skip profile. Please try again.')
    }
  }

  const loadCurrentUser = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/me`,
        { headers: getAuthHeaders() }
      )
      setCurrentUserId(res.data?._id || '')
    } catch (err) {
      console.error('Failed to load current user:', err)
    }
  }

  const loadFeed = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/feed`,
        { headers: getAuthHeaders() }
      )
      setFeed(res.data)
    } catch (err: any) {
      console.error('Failed to load feed:', err)
    }
  }

  const handlePostTweet = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tweetText.trim() || posting) return

    setPosting(true)
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/tweet`,
        { text: tweetText },
        { headers: getAuthHeaders() }
      )
      setTweetText('')
      setStatusMessage('Posted successfully!')
      setTimeout(() => setStatusMessage(''), 2000)
      loadFeed()
    } catch (err: any) {
      setError('Failed to post update.')
    } finally {
      setPosting(false)
    }
  }

  const handleLikeTweet = async (tweetId: string) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/tweet/${tweetId}/like`,
        {},
        { headers: getAuthHeaders() }
      )
      loadFeed()
    } catch (err: any) {
      setError('Failed to like tweet.')
    }
  }

  const handleReplyToTweet = async (tweetId: string) => {
    if (!replyText.trim()) return

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/tweet/${tweetId}/reply`,
        { text: replyText },
        { headers: getAuthHeaders() }
      )
      setReplyText('')
      setReplyingTo(null)
      setStatusMessage('Reply posted!')
      setTimeout(() => setStatusMessage(''), 2000)
      loadFeed()
    } catch (err: any) {
      setError('Failed to post reply.')
    }
  }

  const hasMatches = potentialMatches.length > 0

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-700 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cyan-50">
      <nav className="glass-effect sticky top-0 z-50 backdrop-blur-lg border-b border-cyan-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">C</span>
              </div>
              <span className="text-xl font-bold text-cyan-600">CampusConnect</span>
            </Link>
            <div className="flex gap-2 flex-wrap">
              <Link
                href="/leaderboard"
                className="px-4 py-2 rounded-xl font-medium text-gray-700 hover:bg-cyan-50 hover:text-cyan-600 transition-all"
              >
                Leaderboard
              </Link>
              <Link
                href="/requests"
                className="px-4 py-2 rounded-xl font-medium text-gray-700 hover:bg-cyan-50 hover:text-cyan-600 transition-all"
              >
                Requests
              </Link>
              <Link
                href="/chat"
                className="px-4 py-2 rounded-xl font-medium text-gray-700 hover:bg-cyan-50 hover:text-cyan-600 transition-all"
              >
                Chat
              </Link>
              <Link
                href="/my-profile"
                className="px-4 py-2 rounded-xl font-medium text-gray-700 hover:bg-cyan-50 hover:text-cyan-600 transition-all"
              >
                My Profile
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem('token')
                  router.push('/login')
                }}
                className="px-4 py-2 rounded-xl font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {statusMessage && (
        <div className="fixed top-6 right-6 z-50 glass-effect px-6 py-3 rounded-xl shadow-lg border border-cyan-200 animate-fade-in">
          <p className="font-semibold text-cyan-600">{statusMessage}</p>
        </div>
      )}

      <main className="container mx-auto px-6 py-8 space-y-8">
        <section className="glass-effect rounded-xl p-8 shadow-lg border border-cyan-100 animate-fade-in-up">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="inline-block px-3 py-1 bg-cyan-100 text-cyan-600 rounded-full text-xs font-medium mb-3">
                Dashboard
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Matches</h1>
              <p className="text-sm text-gray-600">
                25 curated profiles from your cluster
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Link
                href="/leaderboard"
                className="px-5 py-2 bg-cyan-600 text-white font-medium rounded-xl hover:bg-cyan-700 transition-all text-sm"
              >
                Leaderboard
              </Link>
              <Link
                href="/requests"
                className="px-5 py-2 bg-white text-gray-700 font-medium rounded-xl border border-gray-200 hover:border-cyan-300 transition-all text-sm"
              >
                Requests
              </Link>
            </div>
          </div>
        </section>

        {/* Tweet Posting Section */}
        <section className="glass-effect rounded-xl p-6 shadow-lg border border-cyan-100 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <svg className="w-5 h-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            <h2 className="text-lg font-bold text-gray-900">Share an Update</h2>
          </div>
          <form onSubmit={handlePostTweet}>
            <textarea
              value={tweetText}
              onChange={(e) => setTweetText(e.target.value)}
              placeholder="What's on your mind?"
              maxLength={280}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all font-medium text-sm resize-none"
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-gray-500">{tweetText.length}/280</span>
              <button
                type="submit"
                disabled={!tweetText.trim() || posting}
                className="flex items-center gap-2 px-6 py-2 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                {posting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </form>
        </section>

        {/* Feed Toggle and Feed Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFeed(true)}
                className={`px-4 py-2 rounded-xl font-medium transition-all text-sm ${
                  showFeed
                    ? 'bg-cyan-600 text-white'
                    : 'text-gray-700 hover:bg-cyan-50 hover:text-cyan-600'
                }`}
              >
                Updates Feed
              </button>
              <button
                onClick={() => setShowFeed(false)}
                className={`px-4 py-2 rounded-xl font-medium transition-all text-sm ${
                  !showFeed
                    ? 'bg-cyan-600 text-white'
                    : 'text-gray-700 hover:bg-cyan-50 hover:text-cyan-600'
                }`}
              >
                Discover People
              </button>
            </div>
          </div>

          {showFeed ? (
            /* Feed Display */
            <div className="space-y-4">
              {feed.length === 0 ? (
                <div className="glass-effect rounded-xl p-12 text-center border border-cyan-100">
                  <p className="text-gray-600 text-sm">No updates yet. Be the first to post!</p>
                </div>
              ) : (
                feed.map((tweet) => (
                  <div
                    key={tweet._id}
                    className="glass-effect rounded-xl p-6 shadow-lg border border-cyan-100 hover:shadow-xl transition-all space-y-4"
                  >
                    {/* Tweet Header */}
                    <div className="flex items-center gap-3">
                      {tweet.user.photo ? (
                        <img
                          src={tweet.user.photo}
                          alt={`${tweet.user.firstName} ${tweet.user.lastName}`}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold bg-cyan-600 text-white shadow-md">
                          {tweet.user.firstName[0]}
                          {tweet.user.lastName[0]}
                        </div>
                      )}
                      <div className="flex-1">
                        <Link
                          href={`/profile/${tweet.user._id}`}
                          className="text-base font-bold text-gray-900 hover:text-cyan-600 transition-colors"
                        >
                          {tweet.user.firstName} {tweet.user.lastName}
                        </Link>
                        <p className="text-xs text-gray-500">
                          {new Date(tweet.createdAt).toLocaleDateString()} at{' '}
                          {new Date(tweet.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    {/* Tweet Content */}
                    <p className="text-gray-900 text-sm whitespace-pre-wrap">{tweet.text}</p>

                    {/* Tweet Actions */}
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleLikeTweet(tweet._id)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          tweet.likes.includes(currentUserId)
                            ? 'bg-red-100 text-red-600'
                            : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                        }`}
                      >
                        <svg className="w-4 h-4" fill={tweet.likes.includes(currentUserId) ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span>{tweet.likes.length}</span>
                      </button>
                      <button
                        onClick={() => setReplyingTo(replyingTo === tweet._id ? null : tweet._id)}
                        className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-cyan-50 hover:text-cyan-600 transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>{tweet.replies.length}</span>
                      </button>
                    </div>

                    {/* Reply Form */}
                    {replyingTo === tweet._id && (
                      <div className="pl-6 border-l-2 border-cyan-200">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write a reply..."
                          maxLength={280}
                          rows={2}
                          className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all font-medium text-sm resize-none"
                        />
                        <div className="flex items-center justify-end gap-2 mt-2">
                          <button
                            onClick={() => {
                              setReplyingTo(null)
                              setReplyText('')
                            }}
                            className="px-4 py-1 text-gray-600 hover:text-gray-800 transition-all text-xs font-medium"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleReplyToTweet(tweet._id)}
                            disabled={!replyText.trim()}
                            className="px-4 py-1 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Display Replies */}
                    {tweet.replies.length > 0 && (
                      <div className="space-y-3 pl-6 border-l-2 border-cyan-100">
                        {tweet.replies.map((reply) => (
                          <div key={reply._id} className="bg-cyan-50/50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              {reply.user.photo ? (
                                <img
                                  src={reply.user.photo}
                                  alt={`${reply.user.firstName} ${reply.user.lastName}`}
                                  className="w-8 h-8 rounded-full object-cover border border-white"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-cyan-600 text-white">
                                  {reply.user.firstName[0]}
                                  {reply.user.lastName[0]}
                                </div>
                              )}
                              <div>
                                <Link
                                  href={`/profile/${reply.user._id}`}
                                  className="text-sm font-bold text-gray-900 hover:text-cyan-600"
                                >
                                  {reply.user.firstName} {reply.user.lastName}
                                </Link>
                                <p className="text-xs text-gray-500">
                                  {new Date(reply.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-gray-800">{reply.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Discover People Section */
            <div>
              {hasMatches ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {potentialMatches.slice(0, 25).map((profile, index) => (
                <div 
                  key={profile._id} 
                  className="glass-effect rounded-xl p-6 space-y-4 hover:shadow-lg transition-all duration-300 animate-fade-in-up border border-cyan-100"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="text-center">
                    {profile.profile?.photos?.[0] ? (
                      <img
                        src={profile.profile.photos[0]}
                        alt={`${profile.firstName} ${profile.lastName}`}
                        className="w-16 h-16 rounded-full mx-auto object-cover border-2 border-white shadow-md"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-lg font-bold bg-cyan-600 text-white shadow-md">
                        {profile.firstName[0]}
                        {profile.lastName[0]}
                      </div>
                    )}
                    <h3 className="text-lg font-bold text-gray-900 mt-3">
                      {profile.firstName} {profile.lastName}
                    </h3>
                    {profile.college && (
                      <p className="text-gray-600 text-xs">{profile.college.name}</p>
                    )}
                  </div>
                  {profile.profile && (
                    <p className="text-xs text-gray-600 line-clamp-3">{profile.profile.bio}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePass(profile._id)}
                      className="flex-1 py-2 border border-gray-200 text-gray-700 font-medium text-sm rounded-xl hover:bg-gray-50 transition-all"
                    >
                      Skip
                    </button>
                    <button
                      onClick={() => handleLike(profile._id)}
                      className="flex-1 py-2 bg-cyan-600 text-white font-medium text-sm rounded-xl hover:bg-cyan-700 transition-all"
                    >
                      Follow
                    </button>
                  </div>
                  <Link
                    href={`/profile/${profile._id}`}
                    className="block text-center py-2 text-cyan-600 font-medium text-sm hover:text-cyan-700 transition-all"
                  >
                    View Profile
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-effect rounded-xl p-12 text-center space-y-4 animate-fade-in border border-cyan-100">
              <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900 mb-1">Profiles Coming Soon</p>
                <p className="text-sm text-gray-600">New matches appear regularly</p>
              </div>
              <div className="flex justify-center gap-3 flex-wrap">
                <Link href="/leaderboard" className="px-5 py-2 rounded-xl border border-gray-200 font-medium text-gray-700 hover:border-cyan-300 transition-all text-sm">
                  Leaderboard
                </Link>
                <Link href="/requests" className="px-5 py-2 rounded-xl bg-cyan-600 text-white font-medium hover:bg-cyan-700 transition-all text-sm">
                  Requests
                </Link>
              </div>
            </div>
          )}
            </div>
          )}
        </section>
      </main>

      {error && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
          <div className="bg-red-50 text-red-600 px-6 py-3 rounded-xl border border-red-200 shadow-xl font-medium">{error}</div>
        </div>
      )}
    </div>
  )
}


'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import Link from 'next/link'
import API_URL from '@/lib/api'

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

interface Tweet {
  _id: string
  text: string
  createdAt: string
  likes: string[]
  replies: Reply[]
}

interface UserProfile {
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
    photos?: string[]
  }
  tweets?: Tweet[]
}

export default function ProfilePage() {
  const params = useParams<{ userId: string }>()
  const router = useRouter()
  const userId = params.userId
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tweetText, setTweetText] = useState('')
  const [posting, setPosting] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

  const apiBase = API_URL

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      router.push('/login')
      return {}
    }
    return { Authorization: `Bearer ${token}` }
  }

  const loadProfile = async () => {
    try {
      const headers = getAuthHeaders()
      if (!headers.Authorization) return

      // Get current user
      const me = await axios.get(`${apiBase}/api/auth/me`, { headers })
      const myId = me.data?._id || me.data?.id
      setCurrentUserId(myId)

      // Load user profile
      const res = await axios.get(`${apiBase}/api/users/profile/${userId}`, { headers })
      setUserProfile(res.data)
    } catch (err: any) {
      console.error('Load profile error:', err)
      if (err.response?.status === 401) {
        router.push('/login')
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view this profile. You need to be matched with this user.')
      } else if (err.response?.status === 404) {
        setError('Profile not found.')
      } else {
        setError(err.response?.data?.message || 'Failed to load profile.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      loadProfile()
    }
  }, [userId])

  const handlePostTweet = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tweetText.trim() || posting) return

    setPosting(true)
    try {
      await axios.post(
        `${apiBase}/api/users/tweet`,
        { text: tweetText },
        { headers: getAuthHeaders() }
      )
      setTweetText('')
      loadProfile() // Reload to show new tweet
    } catch (err: any) {
      setError('Failed to post tweet.')
    } finally {
      setPosting(false)
    }
  }

  const handleLikeTweet = async (tweetId: string) => {
    try {
      await axios.post(
        `${apiBase}/api/users/tweet/${tweetId}/like`,
        {},
        { headers: getAuthHeaders() }
      )
      loadProfile() // Reload to update likes
    } catch (err: any) {
      setError('Failed to like tweet.')
    }
  }

  const handleDeleteTweet = async (tweetId: string) => {
    if (!confirm('Delete this tweet?')) return

    try {
      await axios.delete(
        `${apiBase}/api/users/tweet/${tweetId}`,
        { headers: getAuthHeaders() }
      )
      loadProfile() // Reload to remove deleted tweet
    } catch (err: any) {
      setError('Failed to delete tweet.')
    }
  }

  const handleReplyToTweet = async (tweetId: string) => {
    if (!replyText.trim()) return

    try {
      await axios.post(
        `${apiBase}/api/users/tweet/${tweetId}/reply`,
        { text: replyText },
        { headers: getAuthHeaders() }
      )
      setReplyText('')
      setReplyingTo(null)
      loadProfile() // Reload to show new reply
    } catch (err: any) {
      setError('Failed to post reply.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-700 text-sm">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error && !userProfile) {
    return (
      <div className="min-h-screen bg-cyan-50/30 flex items-center justify-center p-6">
        <div className="glass-effect rounded-xl p-8 max-w-md w-full text-center space-y-4 border border-red-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 mb-2">Unable to Load Profile</p>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
          <Link
            href="/matches"
            className="inline-block px-6 py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-all font-medium text-sm"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const isOwnProfile = currentUserId === userId

  return (
    <div className="min-h-screen bg-cyan-50/30">
      <nav className="glass-effect sticky top-0 z-50 backdrop-blur-lg border-b border-cyan-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/matches" className="flex items-center gap-2 px-3 py-2 rounded-xl font-medium text-gray-700 hover:bg-cyan-50 hover:text-cyan-600 transition-all text-sm">
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
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8 max-w-3xl">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 animate-fade-in">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Profile Header */}
        <div className="glass-effect rounded-xl p-8 mb-6 shadow-lg border border-cyan-100">
          <div className="flex items-start gap-6">
            {userProfile.profile?.photos?.[0] ? (
              <img
                src={userProfile.profile.photos[0]}
                alt={`${userProfile.firstName} ${userProfile.lastName}`}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold bg-cyan-600 text-white shadow-lg">
                {userProfile.firstName[0]}
                {userProfile.lastName[0]}
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {userProfile.firstName} {userProfile.lastName}
              </h1>
              {userProfile.college && (
                <p className="text-sm text-gray-600 mb-2">{userProfile.college.name}</p>
              )}
              {userProfile.profile?.age && (
                <p className="text-sm text-gray-600 mb-2">{userProfile.profile.age} years old</p>
              )}
              {userProfile.profile?.bio && (
                <p className="text-sm text-gray-700 mt-3">{userProfile.profile.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Tweet Form (only for own profile) */}
        {isOwnProfile && (
          <div className="glass-effect rounded-xl p-6 mb-6 shadow-lg border border-cyan-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Share an update</h2>
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
                  className="px-6 py-2 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                >
                  {posting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tweets Feed */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">
            {isOwnProfile ? 'Your Updates' : 'Updates'}
          </h2>

          {(!userProfile.tweets || userProfile.tweets.length === 0) ? (
            <div className="glass-effect rounded-xl p-12 text-center border border-cyan-100">
              <p className="text-gray-600 text-sm">No updates yet</p>
            </div>
          ) : (
            userProfile.tweets.map((tweet) => (
              <div
                key={tweet._id}
                className="glass-effect rounded-xl p-6 shadow-lg border border-cyan-100 hover:shadow-xl transition-all"
              >
                <p className="text-gray-900 text-sm mb-3 whitespace-pre-wrap">{tweet.text}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {new Date(tweet.createdAt).toLocaleDateString()} at{' '}
                    {new Date(tweet.createdAt).toLocaleTimeString()}
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleLikeTweet(tweet._id)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all ${tweet.likes.includes(currentUserId || '')
                        ? 'bg-red-100 text-red-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                        }`}
                    >
                      <svg className="w-4 h-4" fill={tweet.likes.includes(currentUserId || '') ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
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
                      <span>{tweet.replies?.length || 0}</span>
                    </button>
                    {isOwnProfile && (
                      <button
                        onClick={() => handleDeleteTweet(tweet._id)}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                {/* Reply Form */}
                {replyingTo === tweet._id && (
                  <div className="pl-6 border-l-2 border-cyan-200 mt-3">
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
                {tweet.replies && tweet.replies.length > 0 && (
                  <div className="space-y-3 pl-6 border-l-2 border-cyan-100 mt-3">
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
      </main>
    </div>
  )
}

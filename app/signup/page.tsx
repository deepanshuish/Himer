'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'

interface College {
  _id: string
  name: string
  category?: 'engineering' | 'medical'
  genderType?: 'coed' | 'girls' | 'boys'
  location?: {
    city?: string
    state?: string
  }
}

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    collegeStatus: 'studying',
    gender: '',
    collegeId: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [colleges, setColleges] = useState<College[]>([])
  const [collegesLoading, setCollegesLoading] = useState(true)

  useEffect(() => {
    const loadColleges = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/colleges`
        )
        setColleges(res.data)
      } catch (e) {
        setError('Failed to load colleges. Please refresh.')
      } finally {
        setCollegesLoading(false)
      }
    }
    loadColleges()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/register`,
        formData
      )
      
      localStorage.setItem('token', response.data.token)
      router.push('/onboarding')
    } catch (err: any) {
      console.error('Registration error:', err)
      if (err.response) {
        setError(err.response.data?.message || 'Registration failed. Please try again.')
      } else if (err.request) {
        setError('Cannot connect to server. Please make sure the backend server is running on port 5000.')
      } else {
        setError('Registration failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cyan-50 flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 neural-pattern"></div>
      <div className="absolute top-20 left-20 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-md w-full glass-effect rounded-3xl p-8 shadow-2xl relative z-10 animate-scale-in">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-cyan-600 rounded-2xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-black gradient-text text-left">CampusConnect</h1>
              <p className="text-xs text-gray-500 text-left">AI-Powered Campus Dating</p>
            </div>
          </Link>
          <h2 className="text-3xl font-black text-gray-900 mb-2">
            Join Today
          </h2>
          <p className="text-gray-600">Create your account to start connecting</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl animate-fade-in">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-semibold">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-900 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 transition-all font-medium"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
              College Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="you@college.edu"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">College</label>
            <select
              required
              value={formData.collegeId}
              onChange={(e) => setFormData({ ...formData, collegeId: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-900 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 transition-all font-medium"
              disabled={collegesLoading}
            >
              <option value="" disabled>
                {collegesLoading ? 'Loading colleges...' : 'Select your college'}
              </option>
              {colleges.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                  {c.location?.city ? ` — ${c.location.city}` : ''}
                  {c.location?.state ? `, ${c.location.state}` : ''}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-cyan-600 font-bold flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              You will be automatically placed into your college cluster
            </p>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-900 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 transition-all font-medium"
              placeholder="Min. 6 characters"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.collegeStatus}
                onChange={(e) => setFormData({ ...formData, collegeStatus: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-900 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 transition-all font-medium"
              >
                <option value="studying">Studying</option>
                <option value="alumni">Alumni</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Gender
              </label>
              <select
                required
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-900 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 transition-all font-medium"
              >
                <option value="" disabled>Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-700 hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Sign Up</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-cyan-600 hover:text-cyan-700 transition-colors">
              Login
            </Link>
          </p>
        </div>
      </div>

      <p className="text-center text-gray-500 text-sm mt-6 relative z-10">
        Protected by advanced encryption • Your data is safe
      </p>
    </div>
  )
}

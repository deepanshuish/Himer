'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

export default function OnboardingPage() {
	const router = useRouter()
	const [formData, setFormData] = useState({
	  typeDescription: '',
	  bio: '',
	  age: '',
	  datingIntentions: '',
	  photos: [] as string[],
	})
	const [error, setError] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [submitted, setSubmitted] = useState(false)

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

	const handlePhotosChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
	  const files = e.target.files
	  if (!files) return

	  const selectedFiles = Array.from(files)

	  const toBase64 = (file: File) =>
	    new Promise<string>((resolve, reject) => {
	      const reader = new FileReader()
	      reader.onload = () => resolve(reader.result as string)
	      reader.onerror = reject
	      reader.readAsDataURL(file)
	    })

	  try {
	    const photosBase64 = await Promise.all(selectedFiles.map(toBase64))
	    setFormData((prev) => ({ ...prev, photos: photosBase64 }))
	  } catch (err) {
	    console.error('Photo upload error:', err)
	    setError('Failed to process photos. Please try smaller images.')
	  }
	}

	const handleSubmit = async (e: React.FormEvent) => {
	  e.preventDefault()
	  setError('')
	  setIsLoading(true)

	  try {
	    if (!formData.age) {
	      setError('Age is required')
	      setIsLoading(false)
	      return
	    }
	    if (!formData.datingIntentions) {
	      setError('Dating intentions are required')
	      setIsLoading(false)
	      return
	    }
	    if (!formData.photos || formData.photos.length < 1) {
	      setError('Please upload at least 1 photo')
	      setIsLoading(false)
	      return
	    }

	    const payload = {
	      typeDescription: formData.typeDescription,
	      bio: formData.bio,
	      age: Number(formData.age),
	      datingIntentions: formData.datingIntentions,
	      photos: formData.photos,
	    }

	    await axios.post(
	      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/onboarding`,
	      payload,
	      { headers: getAuthHeaders() }
	    )

	    setSubmitted(true)
	    // Redirect to matches immediately
	    router.push('/matches')
	  } catch (err: any) {
	    console.error('Onboarding error:', err)
	    if (err.response?.status === 401) {
	      router.push('/login')
	    } else {
	      setError(err.response?.data?.message || 'Failed to save your info. Please try again.')
	    }
	  } finally {
	    setIsLoading(false)
	  }
	}

	return (
	  <div className="min-h-screen bg-white flex items-center justify-center px-6 py-12 relative overflow-hidden">
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

	    <div className="max-w-2xl w-full glass-effect rounded-xl p-8 shadow-lg border border-cyan-100 animate-scale-in">
	      <div className="text-center mb-6">
	        <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
	        <p className="text-sm text-gray-600">
	          Help us find your perfect matches. Your answers are private.
	        </p>
	      </div>

	      {submitted && (
	        <div className="mb-6 p-4 glass-effect rounded-xl text-center font-semibold text-cyan-600 animate-fade-in border border-cyan-200">
	          Saved! Taking you to your dashboard...
	        </div>
	      )}

	      {error && !submitted && (
	        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 animate-fade-in">
	          <p className="font-medium">{error}</p>
	        </div>
	      )}

	      <form onSubmit={handleSubmit} className="space-y-6">
	        <div>
	          <label className="block text-sm font-semibold text-gray-700 mb-2">
	            Describe your type of people
	          </label>
	          <p className="text-xs text-cyan-600 mb-2 font-medium">Private - Not shown to anyone</p>
	          <textarea
	            rows={3}
	            value={formData.typeDescription}
	            onChange={(e) => setFormData({ ...formData, typeDescription: e.target.value })}
	            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
	            placeholder="What kind of person are you looking for?"
	          />
	        </div>

	        <div>
	          <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
	          <p className="text-xs text-red-500 mb-2 font-medium">
	            ⚠️ No social media handles allowed
	          </p>
	          <textarea
	            rows={3}
	            value={formData.bio}
	            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
	            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
	            placeholder="Tell others about yourself..."
	          />
	        </div>

	        <div className="grid md:grid-cols-2 gap-4">
	          <div>
	            <label className="block text-sm font-semibold text-gray-700 mb-2">
	              Your Age <span className="text-red-500">*</span>
	            </label>
	            <input
	              type="number"
	              min={18}
	              value={formData.age}
	              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
	              required
	              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
	              placeholder="18+"
	            />
	          </div>

	          <div>
	            <label className="block text-sm font-semibold text-gray-700 mb-2">
	              Dating Intentions <span className="text-red-500">*</span>
	            </label>
	            <input
	              type="text"
	              value={formData.datingIntentions}
	              onChange={(e) => setFormData({ ...formData, datingIntentions: e.target.value })}
	              required
	              placeholder="e.g. casual, serious, friendship"
	              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
	            />
	          </div>
	        </div>

	        <div>
	          <label className="block text-sm font-semibold text-gray-700 mb-2">
	            Upload Photos <span className="text-red-500">*</span>
	          </label>
	          <div className="relative">
	            <input
	              type="file"
	              accept="image/*"
	              multiple
	              onChange={handlePhotosChange}
	              className="w-full px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyan-50 file:text-cyan-600 file:font-semibold hover:file:bg-cyan-100 transition-all cursor-pointer"
	            />
	          </div>
	          <p className="text-xs text-gray-600 mt-2">At least 1 photo required (multiple allowed)</p>
	          {formData.photos.length > 0 && (
	            <div className="mt-4 grid grid-cols-4 gap-3">
	              {formData.photos.map((src, idx) => (
	                <div key={idx} className="relative group">
	                  <img
	                    src={src}
	                    alt={`Photo ${idx + 1}`}
	                    className="w-full h-24 object-cover rounded-xl border-2 border-white shadow-lg"
	                  />
	                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
	                    <span className="text-white text-xs font-semibold">Photo {idx + 1}</span>
	                  </div>
	                </div>
	              ))}
	            </div>
	          )}
	        </div>

	        <button
	          type="submit"
	          disabled={isLoading}
	          className="w-full py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-all disabled:opacity-50 font-semibold"
	        >
	          {isLoading ? 'Saving...' : 'Continue to Dashboard'}
	        </button>
	      </form>
	    </div>
	  </div>
	)
}


'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Link from 'next/link'
import API_URL from '@/lib/api'

interface LeaderboardEntry {
	id: string
	firstName: string
	lastName: string
	college?: string
	profilePhoto?: string | null
	requestCount: number
}

export default function LeaderboardPage() {
	const router = useRouter()
	const [entries, setEntries] = useState<LeaderboardEntry[]>([])
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
		const load = async () => {
			try {
				const res = await axios.get(
					`${API_URL}/api/users/leaderboard`,
					{ headers: getAuthHeaders() }
				)
				setEntries(res.data)
			} catch (err: any) {
				if (err.response?.status === 401) {
					router.push('/login')
				} else {
					setError('Failed to load leaderboard.')
				}
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
					<p className="mt-6 text-gray-700 font-medium">Loading leaderboard...</p>
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
							<Link href="/chat" className="px-4 py-2 rounded-xl font-medium text-gray-700 hover:bg-cyan-50 hover:text-cyan-600 transition-all">
								Chat
							</Link>
						</div>
					</div>
				</div>
			</nav>

			<main className="container mx-auto px-6 py-8">
				<div className="text-center mb-8 animate-fade-in-up">
					<div className="inline-block px-3 py-1 bg-cyan-100 text-cyan-600 rounded-full text-xs font-medium mb-3">
						Top Profiles
					</div>
					<h1 className="text-2xl font-bold text-gray-900 mb-2">Leaderboard</h1>
					<p className="text-sm text-gray-600">
						Ranked by most follow requests received
					</p>
				</div>

				{error && (
					<div className="max-w-3xl mx-auto mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 text-center animate-fade-in">
						<p className="font-medium">{error}</p>
					</div>
				)}

				{entries.length === 0 ? (
					<div className="max-w-3xl mx-auto glass-effect rounded-2xl p-16 text-center animate-fade-in">
						<p className="text-xl font-bold text-gray-900">No data yet</p>
					</div>
				) : (
					<div className="max-w-3xl mx-auto glass-effect rounded-xl overflow-hidden shadow-lg border border-cyan-100 animate-fade-in-up">
						<div className="overflow-x-auto">
							<table className="min-w-full">
								<thead className="bg-cyan-600 text-white">
									<tr>
										<th className="px-4 py-3 text-left text-xs font-semibold">Rank</th>
										<th className="px-4 py-3 text-left text-xs font-semibold">Person</th>
										<th className="px-4 py-3 text-left text-xs font-semibold">College</th>
										<th className="px-4 py-3 text-right text-xs font-semibold">Requests</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-100">
									{entries.map((entry, index) => (
										<tr key={entry.id} className="bg-white/50 hover:bg-cyan-50/50 transition-colors">
											<td className="px-4 py-3">
												<div className="flex items-center gap-2">
													{index < 3 ? (
														<span className="text-lg">
															{index === 0 && '🥇'}
															{index === 1 && '🥈'}
															{index === 2 && '🥉'}
														</span>
													) : (
														<span className="text-xs font-medium text-gray-700">#{index + 1}</span>
													)}
												</div>
											</td>
											<td className="px-4 py-3">
												<div className="flex items-center gap-2">
													{entry.profilePhoto ? (
														<img
															src={entry.profilePhoto}
															alt={`${entry.firstName} ${entry.lastName}`}
															className="w-10 h-10 rounded-full border-2 border-white shadow-md object-cover"
														/>
													) : (
														<div className="w-10 h-10 rounded-full flex items-center justify-center font-bold bg-cyan-600 text-white shadow-md text-xs">
															{entry.firstName?.[0]}{entry.lastName?.[0]}
														</div>
													)}
													<span className="text-xs font-semibold text-gray-900">
														{entry.firstName} {entry.lastName}
													</span>
												</div>
											</td>
											<td className="px-4 py-3 text-xs text-gray-600">{entry.college || '-'}</td>
											<td className="px-4 py-3 text-right">
												<span className="inline-block px-2 py-1 bg-cyan-600 text-white text-xs font-semibold rounded-full">
													{entry.requestCount}
												</span>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				)}
			</main>
		</div>
	)
}


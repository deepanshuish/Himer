import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cyan-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-effect border-b border-cyan-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-cyan-600 rounded-2xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-black gradient-text">CampusConnect</h1>
                <p className="text-xs text-gray-500">AI-Powered Campus Dating</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href="/login"
                className="px-6 py-2.5 text-cyan-700 font-semibold hover:bg-cyan-100 rounded-xl transition-all"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-6 py-2.5 bg-cyan-600 text-white font-semibold rounded-xl hover:bg-cyan-700 hover:shadow-lg transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 neural-pattern"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-cyan-200 shadow-lg">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-cyan-500 border-2 border-white"></div>
                <div className="w-6 h-6 rounded-full bg-cyan-600 border-2 border-white"></div>
                <div className="w-6 h-6 rounded-full bg-cyan-700 border-2 border-white"></div>
              </div>
              <span className="text-sm font-semibold text-gray-700">10,000+ Students Connected</span>
            </div>

            <h1 className="text-6xl md:text-7xl font-black text-gray-900 leading-tight">
              Find Your Perfect
              <br />
              <span className="gradient-text">Campus Match</span>
            </h1>

            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              AI-powered matching algorithm that connects you with compatible students from your campus.
              Real connections, verified profiles, and meaningful relationships.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="px-8 py-4 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-700 hover:shadow-2xl transition-all text-lg flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Start Matching Now
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 bg-white text-gray-700 font-bold rounded-xl hover:shadow-lg transition-all text-lg border-2 border-gray-200"
              >
                Sign In
              </Link>
            </div>

            <div className="flex items-center justify-center gap-8 text-center pt-8">
              <div>
                <div className="text-3xl font-black gradient-text">50K+</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
              <div className="w-px h-12 bg-gray-300"></div>
              <div>
                <div className="text-3xl font-black gradient-text">98%</div>
                <div className="text-sm text-gray-600">Match Rate</div>
              </div>
              <div className="w-px h-12 bg-gray-300"></div>
              <div>
                <div className="text-3xl font-black gradient-text">200+</div>
                <div className="text-sm text-gray-600">Universities</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-cyan-100 text-cyan-700 rounded-full text-sm font-bold mb-4">
              HOW IT WORKS
            </div>
            <h2 className="text-5xl font-black text-gray-900 mb-4">
              Your Journey to <span className="gradient-text">Connection</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform makes finding your perfect match simple, safe, and exciting
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                ),
                title: 'Create Profile',
                desc: 'Sign up with your campus email. Add photos, interests, and what you\'re looking for.',
                color: 'cyan'
              },
              {
                step: '02',
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                ),
                title: 'AI Matching',
                desc: 'Our algorithm analyzes compatibility based on interests, values, and personality traits.',
                color: 'cyan'
              },
              {
                step: '03',
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                ),
                title: 'Start Connecting',
                desc: 'Discover curated matches. Like profiles you\'re interested in and get matched instantly.',
                color: 'pink'
              },
              {
                step: '04',
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                ),
                title: 'Chat & Meet',
                desc: 'Message your matches, share updates, and plan real meetups on campus.',
                color: 'cyan'
              }
            ].map((item, i) => (
              <div
                key={i}
                className="glass-effect rounded-2xl p-8 hover:scale-105 transition-all group"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-16 h-16 bg-cyan-600 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <div className="text-sm font-black text-cyan-700 mb-2">STEP {item.step}</div>
                <h3 className="text-xl font-black text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-cyan-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-cyan-100 text-cyan-700 rounded-full text-sm font-bold mb-4">
              FEATURES
            </div>
            <h2 className="text-5xl font-black text-gray-900 mb-4">
              Why <span className="gradient-text">CampusConnect</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Advanced features designed to help you find meaningful connections
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: 'AI-Powered Matching',
                desc: 'Advanced machine learning algorithms analyze your preferences, interests, and behavior to find the most compatible matches.',
                features: ['Smart compatibility scoring', 'Personality analysis', 'Interest-based matching']
              },
              {
                icon: (
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: 'Verified Profiles',
                desc: 'Campus email verification ensures you only connect with real students from your university community.',
                features: ['Email verification', 'Photo verification', 'Safe & secure']
              },
              {
                icon: (
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                ),
                title: 'Social Feed',
                desc: 'Share updates, post thoughts, and engage with your matches through a Twitter-like social feed with likes and replies.',
                features: ['Post updates', 'Like & reply', 'See what matches share']
              },
              {
                icon: (
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                title: 'Leaderboard & Gamification',
                desc: 'Earn points for activity, climb the leaderboard, and showcase your popularity within your campus community.',
                features: ['Activity points', 'Campus rankings', 'Achievement badges']
              },
              {
                icon: (
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: 'Real-Time Chat',
                desc: 'Instant messaging with your matches. Send messages, share photos, and plan meetups in real-time.',
                features: ['Instant messaging', 'Read receipts', 'Online status']
              },
              {
                icon: (
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                ),
                title: 'Campus-Based Matching',
                desc: 'Connect with students from your specific college or university for convenient, local connections.',
                features: ['Same campus matching', 'College clusters', 'Local events']
              }
            ].map((item, i) => (
              <div
                key={i}
                className="glass-effect rounded-2xl p-8 hover:scale-105 transition-all"
              >
                <div className="w-16 h-16 bg-cyan-600 rounded-2xl flex items-center justify-center text-white mb-6">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-4">{item.desc}</p>
                <ul className="space-y-2">
                  {item.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-700">
                      <svg className="w-5 h-5 text-cyan-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6 bg-cyan-600 text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: '50,000+', label: 'Active Students', icon: '👥' },
              { number: '1M+', label: 'Matches Made', icon: '💝' },
              { number: '200+', label: 'Universities', icon: '🎓' },
              { number: '4.9/5', label: 'User Rating', icon: '⭐' }
            ].map((stat, i) => (
              <div key={i} className="space-y-2">
                <div className="text-5xl">{stat.icon}</div>
                <div className="text-4xl font-black">{stat.number}</div>
                <div className="text-lg text-cyan-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 bg-white relative overflow-hidden">
        <div className="absolute inset-0 neural-pattern"></div>
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <h2 className="text-6xl font-black text-gray-900 mb-6">
            Ready to Find Your <span className="gradient-text">Perfect Match</span>?
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Join thousands of students who have found meaningful connections through CampusConnect
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-3 px-10 py-5 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-700 hover:shadow-2xl transition-all text-xl"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Get Started Free
          </Link>
          <p className="text-sm text-gray-500 mt-4">No credit card required • Takes 2 minutes</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-cyan-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-xl font-black">CampusConnect</span>
              </div>
              <p className="text-gray-400 text-sm">AI-powered campus dating for students</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/features" className="hover:text-cyan-400">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-cyan-400">Pricing</Link></li>
                <li><Link href="/how-it-works" className="hover:text-cyan-400">How It Works</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/about" className="hover:text-cyan-400">About Us</Link></li>
                <li><Link href="/careers" className="hover:text-cyan-400">Careers</Link></li>
                <li><Link href="/blog" className="hover:text-cyan-400">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/privacy" className="hover:text-cyan-400">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-cyan-400">Terms of Service</Link></li>
                <li><Link href="/safety" className="hover:text-cyan-400">Safety</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>© 2024 CampusConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

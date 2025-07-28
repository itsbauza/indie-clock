'use client';

import { useSession } from 'next-auth/react';
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-white">
        {/* Decorative ring */}
        <div className="absolute -top-56 -left-56 h-[32rem] w-[32rem] rounded-full bg-indigo-200 opacity-30 blur-3xl"></div>
        <div className="absolute -bottom-56 -right-56 h-[32rem] w-[32rem] rounded-full bg-amber-100 opacity-30 blur-3xl"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Text content */}
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
                Light up your desk&nbsp;
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-emerald-500">with your code</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-700 mb-10">
                Indie Grid turns your GitHub contributions into a vibrant pixel display on your Awtrix clock. Stay motivated, showcase your progress and celebrate every commit — right on your desk.
              </p>

              {!session ? (
                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                  <Link
                    href="/auth/signin"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg text-xl font-semibold shadow-lg shadow-indigo-500/20 transition-colors inline-flex items-center justify-center"
                  >
                    <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                    </svg>
                    Get Started Free
                  </Link>
                  <Link
                    href="#how-it-works"
                    className="border-2 border-gray-300 hover:border-indigo-500 hover:text-indigo-600 text-gray-700 px-8 py-4 rounded-lg text-xl font-semibold transition-colors inline-flex items-center justify-center"
                  >
                    How it works
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Link>
                </div>
              ) : (
                <div className="mb-12">
                  <Link
                    href="/dashboard"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg text-xl font-semibold shadow-lg shadow-indigo-500/20 transition-colors inline-flex items-center justify-center"
                  >
                    Go to Dashboard
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              )}

              {/* Testimonial */}
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
                <div className="flex items-start space-x-4">
                  <img
                    src="https://avatars.githubusercontent.com/u/8019099?v=4"
                    alt="Marc Lou"
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="text-gray-700 mb-2 italic">
                      "This is exactly what I needed to stay motivated with my daily coding habit. Seeing my contributions light up on my desk is incredibly satisfying!"
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900">Marc Lou</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-500 text-sm">@marc_louvion</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Image/Visual */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                {/* Hero Image */}
                <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                  <img
                    src="/hero.png"
                    alt="Awtrix clock displaying GitHub contributions on developer's desk"
                    className="w-full max-w-lg h-auto"
                  />
                  
                  {/* Gradient overlay for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                </div>
                
                {/* Floating developer-focused badges */}
                <div className="absolute -top-6 -left-10 group">
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-400 rounded-lg blur-lg opacity-40 animate-pulse"></div>
                    <div className="relative bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-4 rounded-lg text-base font-bold shadow-2xl ring-2 ring-white/30 backdrop-blur-lg transform group-hover:scale-110 group-hover:rotate-2 transition-all duration-300">
                      <div className="flex items-center space-x-3">
                        <svg className="w-6 h-6 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                        </svg>
                        <div className="text-left">
                          <div className="text-lg font-black">🔥 DAILY COMMITS</div>
                          <div className="text-xs opacity-90 font-semibold">Build unstoppable habits</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -bottom-10 -right-16 group">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-lg blur-lg opacity-40 animate-pulse delay-300"></div>
                    <div className="relative bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-4 rounded-lg text-base font-bold shadow-2xl ring-2 ring-white/30 backdrop-blur-lg transform group-hover:scale-110 group-hover:-rotate-2 transition-all duration-300">
                      <div className="flex items-center space-x-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <div className="text-left">
                          <div className="text-lg font-black">⚡ 365 DAY STREAK</div>
                          <div className="text-xs opacity-90 font-semibold">Never break the chain</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Particles */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-ping delay-300"></div>
                  <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-purple-400 rounded-full animate-ping delay-700"></div>
                  <div className="absolute top-1/2 left-3/4 w-3 h-3 bg-green-400 rounded-full animate-ping delay-1000"></div>
                </div>

                {/* Terminal overlay */}
                <div className="absolute -bottom-4 -left-14 bg-gray-900/90 text-green-400 px-6 py-4 rounded-xl text-sm font-mono shadow-2xl ring-1 ring-green-500/30 backdrop-blur-md border border-gray-700">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-400 ml-3 font-semibold">~/indie-life</span>
                  </div>
                  <div className="text-green-400 leading-relaxed">
                    <div className="flex items-center">
                      <span className="text-purple-400">❯</span> 
                      <span className="ml-2">git commit -m</span>
                      <span className="text-yellow-300 ml-2 font-semibold">"Ship daily 🚢"</span>
                    </div>
                    <div className="text-gray-500 text-xs mt-2 italic">
                      # Building habits that build products 💪
                    </div>
                    <div className="flex items-center mt-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                      <span className="text-green-300 text-xs">Syncing to Awtrix...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-14">
          Why developers love&nbsp;
          <span className="text-indigo-600">Indie Grid</span>
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="bg-white shadow-sm rounded-xl p-8 text-center hover:shadow-md transition-shadow">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
              <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Visual Motivation</h3>
            <p className="text-gray-600">See your daily streak build up as a colourful LED grid. Missing a day? The empty pixel keeps you honest.</p>
          </div>

          <div className="bg-white shadow-sm rounded-xl p-8 text-center hover:shadow-md transition-shadow">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
              <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Sync</h3>
            <p className="text-gray-600">Every push triggers an instant update via RabbitMQ to keep your clock perfectly in-sync.</p>
          </div>

          <div className="bg-white shadow-sm rounded-xl p-8 text-center hover:shadow-md transition-shadow">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
              <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure by Design</h3>
            <p className="text-gray-600">OAuth login and encrypted storage mean your GitHub data stays yours — and yours only.</p>
          </div>
        </div>
        
        {/* CTA for Features Section */}
        <div className="text-center mt-12">
          <Link
            href="/auth/signin"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg text-lg font-medium shadow-lg shadow-indigo-500/20 transition-colors inline-flex items-center"
          >
            Start tracking your progress
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-14">How it works</h2>
          <div className="grid gap-12 md:grid-cols-3 text-center">
            <div className="flex flex-col items-center">
              <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white text-2xl font-bold shadow-lg">1</span>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Connect GitHub</h4>
              <p className="text-gray-600 max-w-xs">Sign in with your GitHub account — no tokens or manual setup required.</p>
            </div>
            <div className="flex flex-col items-center">
              <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white text-2xl font-bold shadow-lg">2</span>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Pair your Awtrix</h4>
              <p className="text-gray-600 max-w-xs">Add your device credentials and we'll start sending contribution data wirelessly.</p>
            </div>
            <div className="flex flex-col items-center">
              <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white text-2xl font-bold shadow-lg">3</span>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Code → Glow</h4>
              <p className="text-gray-600 max-w-xs">Watch your daily commits shine bright and build a habit you can <em>see</em>.</p>
            </div>
          </div>
          
          {/* CTA for How it works Section */}
          <div className="text-center mt-12">
            <Link
              href="/auth/signin"
              className="bg-white hover:bg-gray-50 text-indigo-600 border-2 border-indigo-600 px-8 py-3 rounded-lg text-lg font-medium shadow-lg transition-colors inline-flex items-center"
            >
              Get started in 2 minutes
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to light up your contribution streak?
          </h2>
          <p className="text-indigo-100 mb-10 text-lg md:text-xl max-w-2xl mx-auto">
            Join hundreds of developers who've transformed their coding habits. Connect your GitHub account and start seeing your progress glow on your desk today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link
              href="/auth/signin"
              className="bg-white text-indigo-600 hover:bg-gray-50 px-10 py-4 rounded-lg text-lg font-semibold shadow-lg transition-colors inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
              Sign in with GitHub
            </Link>
            <div className="text-indigo-200 text-sm">
              Free forever • No credit card required
            </div>
          </div>
          
          <div className="flex justify-center items-center space-x-8 text-indigo-200 text-sm">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Setup in 2 minutes
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Works with any Awtrix
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Real-time updates
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

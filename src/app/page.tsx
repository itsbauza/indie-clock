import { getServerSession } from "next-auth/next";
import NextAuth from "@/lib/auth";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(NextAuth);

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-emerald-50">
        {/* Enhanced decorative elements */}
        <div className="absolute -top-56 -left-56 h-[16rem] md:h-[32rem] w-[16rem] md:w-[32rem] rounded-full bg-indigo-200 opacity-30 blur-3xl"></div>
        <div className="absolute -bottom-56 -right-56 h-[16rem] md:h-[32rem] w-[16rem] md:w-[32rem] rounded-full bg-amber-100 opacity-30 blur-3xl"></div>
        <div className="absolute top-1/4 right-1/4 h-[8rem] md:h-[16rem] w-[8rem] md:w-[16rem] rounded-full bg-emerald-200 opacity-20 blur-2xl"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Text content */}
            <div className="lg:order-1">
              <div className="inline-flex items-center bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 border border-indigo-200/50 mb-6">
                <div className="w-2 h-2 bg-green-500 rounded-full  mr-2"></div>
                <span className="text-sm font-semibold text-gray-700">Live from your desk</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-6 font-space-grotesk">
                Light up your desk&nbsp;
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500">with your code</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-700 mb-10">
                Indie Grid turns your GitHub contributions into a vibrant pixel display on your Awtrix clock. Stay motivated, showcase your progress and celebrate every commit — right on your desk.
              </p>

              {!session ? (
                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                  <Link
                    href="/auth/signin"
                    className="group bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl text-xl font-semibold shadow-lg shadow-indigo-500/20 transition-all transform hover:scale-105 inline-flex items-center justify-center"
                  >
                    <svg className="w-6 h-6 mr-2 group-hover:rotate-12 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                    </svg>
                    Get Started Free
                  </Link>
                  <Link
                    href="#how-it-works"
                    className="group border-2 border-gray-300 hover:border-indigo-500 hover:text-indigo-600 text-gray-700 px-8 py-4 rounded-xl text-xl font-semibold transition-all inline-flex items-center justify-center"
                  >
                    How it works
                    <svg className="w-5 h-5 ml-2 group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Link>
                </div>
              ) : (
                <div className="mb-12">
                  <Link
                    href="/dashboard"
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl text-xl font-semibold shadow-lg shadow-indigo-500/20 transition-colors inline-flex items-center justify-center"
                  >
                    Go to Dashboard
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              )}

              {/* Mobile Hero Image - shown only on mobile, positioned after CTA */}
              <div className="lg:hidden flex justify-center mb-12">
                <div className="relative max-w-sm">
                  {/* Terminal overlay - centered at bottom */}
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 z-10 bg-gray-900/95 text-green-400 px-4 py-3 rounded-xl text-xs font-mono shadow-2xl ring-1 ring-green-500/30 backdrop-blur-md border border-gray-700 w-72 max-w-[calc(100vw-2rem)]">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-400 ml-2 font-semibold text-xs">~/indie-life</span>
                    </div>
                    <div className="text-green-400 leading-relaxed">
                      <div className="flex items-center">
                        <span className="text-purple-400">❯</span> 
                        <span className="ml-1 text-xs">git commit -m</span>
                        <span className="text-yellow-300 ml-1 font-semibold text-xs">"Ship daily 🚢"</span>
                      </div>
                      <div className="text-gray-500 text-xs mt-1 italic">
                        # Building habits that build products 💪
                      </div>
                      <div className="flex items-center mt-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                        <span className="text-green-300 text-xs">Syncing to Awtrix...</span>
                      </div>
                    </div>
                  </div>

                  {/* Hero Image */}
                  <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                    <img
                      src="/hero.png"
                      alt="Awtrix clock displaying GitHub contributions on developer's desk"
                      className="w-full h-auto"
                    />
                    
                    {/* Gradient overlay for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                  </div>
                </div>
              </div>

              {/* Testimonial - hidden on mobile, shown on lg+ */}
              <div className="hidden lg:block bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 hover:shadow-lg transition-shadow">
                <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
                  <img
                    src="https://pbs.twimg.com/profile_images/1899738748155232256/Hc38ZOYn_400x400.jpg"
                    alt="Llorenç Bauza"
                    className="w-12 h-12 rounded-full ring-2 ring-indigo-200 mx-auto sm:mx-0"
                  />
                  <div className="text-center sm:text-left sm:ml-2">
                    <p className="text-gray-700 mb-2 italic text-sm sm:text-base">
                      "It's cool because it helps keeping consistent at shipping and motivated. Seeing your commits light up on your desk is pretty neat!"
                    </p>
                    <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2">
                      <span className="font-semibold text-gray-900">Llorenç Bauza</span>
                      <span className="hidden sm:inline text-gray-500">•</span>
                      <span className="text-gray-500 text-sm">@itsbauza</span>
                      <div className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-semibold">Creator</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Image/Visual - hidden on mobile */}
            <div className="hidden lg:flex justify-center lg:justify-end lg:order-2">
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
                <div className="absolute -top-6 -left-10 group hidden md:block">
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-400 rounded-lg blur-lg opacity-40"></div>
                    <div className="relative bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-4 rounded-lg text-base font-bold shadow-2xl ring-2 ring-white/30 backdrop-blur-lg transform group-hover:scale-110 group-hover:rotate-2 transition-all duration-300">
                      <div className="flex items-center space-x-3">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                        </svg>
                        <div className="text-left">
                          <div className="text-lg font-black">🔥 DAILY COMMITS</div>
                          <div className="text-xs opacity-90 font-semibold">Build unstoppable habits</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -bottom-10 -right-16 group hidden md:block">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-lg blur-lg opacity-40"></div>
                    <div className="relative bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-4 rounded-lg text-base font-bold shadow-2xl ring-2 ring-white/30 backdrop-blur-lg transform group-hover:scale-110 group-hover:-rotate-2 transition-all duration-300">
                      <div className="flex items-center space-x-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <div className="text-left">
                          <div className="text-lg font-black">⚡ 30 DAY STREAK</div>
                          <div className="text-xs opacity-90 font-semibold">Never break the chain</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Particles */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full  "></div>
                  <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-purple-400 rounded-full  "></div>
                  <div className="absolute top-1/2 left-3/4 w-3 h-3 bg-green-400 rounded-full  "></div>
                </div>

                {/* Terminal overlay */}
                <div className="absolute -bottom-4 -left-14 bg-gray-900/90 text-green-400 px-6 py-4 rounded-xl text-sm font-mono shadow-2xl ring-1 ring-green-500/30 backdrop-blur-md border border-gray-700 hidden md:block">
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
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-green-300 text-xs">Syncing to Awtrix...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Testimonial - shown only on mobile */}
          <div className="lg:hidden mt-16 max-w-2xl mx-auto">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 hover:shadow-lg transition-shadow">
              <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
                <img
                  src="https://pbs.twimg.com/profile_images/1899738748155232256/Hc38ZOYn_400x400.jpg"
                  alt="Llorenç Bauza"
                  className="w-12 h-12 rounded-full ring-2 ring-indigo-200 mx-auto sm:mx-0"
                />
                <div className="text-center sm:text-left sm:ml-2">
                  <p className="text-gray-700 mb-2 italic text-sm sm:text-base">
                    "It's cool because it helps keeping consistent at shipping and motivated. Seeing your commits light up on your desk is pretty neat!"
                  </p>
                  <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2">
                    <span className="font-semibold text-gray-900">Llorenç Bauza</span>
                    <span className="hidden sm:inline text-gray-500">•</span>
                    <span className="text-gray-500 text-sm">@itsbauza</span>
                    <div className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-semibold">Creator</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem → Solution Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-space-grotesk">
              From ghost-commits → glowing victories
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">Turn "I'll code tomorrow" into "Wow, 47-day streak!"</p>
          </div>

          <div className="space-y-12">
            {/* Row 1 */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-8 lg:space-y-0">
              <div className="flex-1 bg-gray-100 rounded-2xl p-6 lg:p-8 text-center">
                <div className="text-4xl lg:text-6xl mb-4">👻</div>
                <h3 className="text-lg lg:text-xl font-bold text-gray-700 mb-2">Invisible progress</h3>
                <p className="text-gray-600">Your commits disappear into the void</p>
              </div>
              
              <div className="hidden lg:flex mx-8 items-center">
                <div className="w-16 h-0.5 bg-gradient-to-r from-gray-300 to-indigo-500"></div>
                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center ml-2 ">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
              
              <div className="flex-1 bg-gradient-to-br from-indigo-50 to-emerald-50 border-2 border-indigo-200 rounded-2xl p-6 lg:p-8 text-center">
                <div className="text-4xl lg:text-6xl mb-4">💡</div>
                <h3 className="text-lg lg:text-xl font-bold text-indigo-700 mb-2">Your code lights up your desk</h3>
                <p className="text-indigo-600">Real-time glow for every commit</p>
              </div>
            </div>

            {/* Row 2 */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-8 lg:space-y-0">
              <div className="flex-1 bg-gray-100 rounded-2xl p-6 lg:p-8 text-center">
                <div className="text-4xl lg:text-6xl mb-4">💀</div>
                <h3 className="text-lg lg:text-xl font-bold text-gray-700 mb-2">Streaks die on weekends</h3>
                <p className="text-gray-600">No reminder, no accountability</p>
              </div>
              
              <div className="hidden lg:flex mx-8 items-center">
                <div className="w-16 h-0.5 bg-gradient-to-r from-gray-300 to-green-500"></div>
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center ml-2 ">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
              
              <div className="flex-1 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 lg:p-8 text-center">
                <div className="text-4xl lg:text-6xl mb-4">🔥</div>
                <h3 className="text-lg lg:text-xl font-bold text-green-700 mb-2">Friendly pixel nudge</h3>
                <p className="text-green-600">Keeps you on track every day</p>
              </div>
            </div>

            {/* Row 3 */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-8 lg:space-y-0">
              <div className="flex-1 bg-gray-100 rounded-2xl p-6 lg:p-8 text-center">
                <div className="text-4xl lg:text-6xl mb-4">📁</div>
                <h3 className="text-lg lg:text-xl font-bold text-gray-700 mb-2">Side projects stall</h3>
                <p className="text-gray-600">Ideas collect dust in folders</p>
              </div>
              
              <div className="hidden lg:flex mx-8 items-center">
                <div className="w-16 h-0.5 bg-gradient-to-r from-gray-300 to-purple-500"></div>
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center ml-2 ">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
              
              <div className="flex-1 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6 lg:p-8 text-center">
                <div className="text-4xl lg:text-6xl mb-4">🚀</div>
                <h3 className="text-lg lg:text-xl font-bold text-purple-700 mb-2">Daily glow = momentum</h3>
                <p className="text-purple-600">Tiny dopamine hits keep you shipping</p>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-16">
            <p className="text-lg text-gray-600 mb-6">Dead repos? Not on our watch.</p>
            <Link
              href="/auth/signin"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg text-lg font-medium shadow-lg transition-colors inline-flex items-center"
            >
              Light up your streak
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-space-grotesk">
            Why developers choose&nbsp;
            <span className="text-indigo-600 font-bold">Indie Grid</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Because seeing progress beats hiding it
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-3">
          <div className="group bg-white shadow-sm rounded-xl p-8 text-center hover:shadow-xl transition-all transform hover:-translate-y-2 border border-gray-100">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:scale-110 transition-transform">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Visible Progress</h3>
            <p className="text-gray-600 leading-relaxed">Your contributions become art—pixel-perfect graphs that keep progress front and center on your desk.</p>
            <div className="mt-4 inline-flex items-center text-sm text-indigo-600 font-semibold">
              <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2 "></div>
              Live updates
            </div>
          </div>

          <div className="group bg-white shadow-sm rounded-xl p-8 text-center hover:shadow-xl transition-all transform hover:-translate-y-2 border border-gray-100">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 group-hover:scale-110 transition-transform">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Real-time Sync</h3>
            <p className="text-gray-600 leading-relaxed">Every push triggers an instant update via RabbitMQ to keep your clock perfectly in-sync with your coding flow.</p>
            <div className="mt-4 inline-flex items-center text-sm text-emerald-600 font-semibold">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 "></div>
              Instant feedback
            </div>
          </div>

          <div className="group bg-white shadow-sm rounded-xl p-8 text-center hover:shadow-xl transition-all transform hover:-translate-y-2 border border-gray-100">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 group-hover:scale-110 transition-transform">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Stay Motivated</h3>
            <p className="text-gray-600 leading-relaxed">Turn coding into a game. Watch your streak grow and feel the satisfaction of consistent progress every single day.</p>
            <div className="mt-4 inline-flex items-center text-sm text-pink-600 font-semibold">
              <div className="w-2 h-2 bg-pink-500 rounded-full mr-2 "></div>
              Dopamine hits
            </div>
          </div>
        </div>
        
        {/* CTA for Features Section */}
        <div className="text-center mt-16 flex flex-col items-center justify-center">
          <div className="inline-flex items-center bg-gray-100 rounded-full px-4 py-2 mb-6">
            <span className="text-sm text-gray-600">Ready to see your code glow?</span>
          </div>
          <Link
            href="/auth/signin"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg text-lg font-medium shadow-lg shadow-indigo-500/20 transition-colors inline-flex items-center"
          >
            Start tracking your progress
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-gradient-to-br from-gray-100 via-gray-50 to-indigo-50 py-20 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 md:w-64 h-32 md:h-64 bg-indigo-200 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-24 md:w-48 h-24 md:h-48 bg-emerald-200 rounded-full blur-3xl opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-space-grotesk">
              From zero to glowing in <span className="text-indigo-600">2 minutes</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">No complex setup, no API keys, no headaches</p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3 text-center relative">
            {/* Connection lines between steps */}
            <div className="hidden md:block absolute top-20 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-indigo-300 via-emerald-300 to-purple-300"></div>
            
            {/* Step 1 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-indigo-100">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 text-white text-2xl font-bold shadow-lg mx-auto">
                  1
                </div>
                <div className="mb-4">
                  <div className="w-20 h-12 bg-gray-900 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </div>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Link your GitHub</h4>
                <p className="text-gray-600 mb-4">One click OAuth - no passwords, no API keys, no drama</p>
                <div className="inline-flex items-center text-sm text-indigo-600 font-semibold">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ~30 seconds
                </div>
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-purple-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-emerald-100">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-purple-500 text-white text-2xl font-bold shadow-lg mx-auto">
                  2
                </div>
                <div className="mb-4">
                  <div className="w-20 h-12 bg-gray-800 rounded-lg mx-auto mb-4 flex items-center justify-center relative">
                    <div className="w-16 h-8 bg-black rounded-md flex items-center justify-center">
                      <div className="grid grid-cols-8 gap-0.5">
                        {Array.from({ length: 24 }, (_, i) => (
                          <div key={i} className={`w-1 h-1 rounded-sm ${Math.random() > 0.7 ? 'bg-green-400' : 'bg-gray-700'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Connect your clock</h4>
                <p className="text-gray-600 mb-4">Just paste your Awtrix IP address - we handle the rest</p>
                <div className="inline-flex items-center text-sm text-emerald-600 font-semibold">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ~1 minute
                </div>
              </div>
            </div>
            
            {/* Step 3 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-purple-100">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-2xl font-bold shadow-lg mx-auto">
                  3
                </div>
                <div className="mb-4">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="text-2xl">💻</div>
                    <div className="flex items-center">
                      <div className="w-6 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 "></div>
                      <svg className="w-4 h-4 text-purple-500  mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <div className="w-6 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 "></div>
                    </div>
                    <div className="text-2xl">✨</div>
                  </div>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Start shipping</h4>
                <p className="text-gray-600 mb-4">Every commit lights up your desk - instant dopamine hit!</p>
                <div className="inline-flex items-center text-sm text-purple-600 font-semibold">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Instant magic
                </div>
              </div>
            </div>
          </div>
          
          {/* CTA for How it works Section */}
          <div className="text-center mt-16">
            <Link
              href="/auth/signin"
              className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white px-10 py-4 rounded-xl text-lg font-bold shadow-xl transition-all transform hover:scale-105 inline-flex items-center"
            >
              Start your 2-minute setup
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-36 md:w-72 h-36 md:h-72 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 right-0 w-48 md:w-96 h-48 md:h-96 bg-purple-500 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 md:w-64 h-32 md:h-64 bg-pink-500 rounded-full blur-3xl opacity-10"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6 leading-tight font-space-grotesk">
            Ready to turn your desk into a
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400">
              productivity powerhouse?
            </span>
          </h2>
          
          <p className="text-lg sm:text-xl text-indigo-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Start building the coding habit you've always wanted. Your future self will thank you when you're celebrating your first 100-day streak.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
            <Link
              href="/auth/signin"
              className="group bg-white text-gray-900 hover:bg-gray-100 px-12 py-5 rounded-2xl text-xl font-bold shadow-2xl transition-all transform hover:scale-105 inline-flex items-center"
            >
              <svg className="w-6 h-6 mr-3 group-hover:animate-spin" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.30 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
              Start Your Streak
              <svg className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            
            <div className="text-white/80 text-sm">
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Free forever
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  No credit card
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Setup in 2 minutes
                </div>
              </div>
            </div>
          </div>

          {/* Honest urgency element */}
          <div className="inline-flex items-center bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-md rounded-full px-6 py-3 border border-orange-400/30">
            <svg className="w-5 h-5 text-orange-400 mr-2 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-orange-200 text-sm font-semibold">
              Every day without progress is a day lost
            </span>
          </div>
        </div>
      </section>
    </>
  );
}

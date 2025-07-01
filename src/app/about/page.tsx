export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About Indie Clock</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          A modern platform for tracking GitHub contributions and syncing data to your Awtrix clock display.
        </p>
      </div>

      {/* Mission */}
      <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
        <p className="text-gray-600 leading-relaxed">
          Indie Clock was created to help developers visualize their coding activity and bring their GitHub contribution data to life through physical displays. We believe that seeing your progress in a tangible way can be incredibly motivating and help you maintain consistent coding habits.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">GitHub Integration</h3>
          <p className="text-gray-600">
            Seamlessly connect your GitHub account to automatically fetch and display your contribution data in beautiful visualizations.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Sync</h3>
          <p className="text-gray-600">
            Your contribution data is automatically synchronized with your Awtrix clock display via secure RabbitMQ messaging.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure & Private</h3>
          <p className="text-gray-600">
            Your data is encrypted and stored securely. We use OAuth authentication to ensure your GitHub credentials are never stored.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Open Source</h3>
          <p className="text-gray-600">
            Built with modern technologies and designed to be extensible. The platform is open source and welcomes contributions.
          </p>
        </div>
      </div>

      {/* Technology Stack */}
      <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Technology Stack</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Frontend</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Next.js 15 with App Router</li>
              <li>• TypeScript</li>
              <li>• Tailwind CSS</li>
              <li>• Auth.js v5</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Backend</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Next.js API Routes</li>
              <li>• PostgreSQL Database</li>
              <li>• Prisma ORM</li>
              <li>• RabbitMQ Messaging</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Infrastructure</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Docker & Docker Compose</li>
              <li>• GitHub OAuth</li>
              <li>• Google OAuth</li>
              <li>• MQTT Protocol</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Ready to Get Started?</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Join thousands of developers who are already tracking their GitHub contributions and syncing data to their Awtrix clocks.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/auth/signin"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
          >
            Sign Up Now
          </a>
          <a
            href="https://github.com/your-repo"
            className="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-3 rounded-lg text-lg font-medium transition-colors"
          >
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  )
} 
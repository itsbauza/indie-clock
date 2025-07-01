'use client';

import { useSession } from 'next-auth/react';
import Image from "next/image";
import Link from "next/link";
import GitHubContributions from '@/components/GitHubContributions';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Track Your
          <span className="text-indigo-600"> GitHub</span>
          <br />
          Contributions
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Connect your GitHub account to visualize your coding activity and sync your contribution data to your Awtrix clock display.
        </p>
        
        {!session && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signin"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/about"
              className="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-3 rounded-lg text-lg font-medium transition-colors"
            >
              Learn More
            </Link>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="text-center p-6 bg-white rounded-lg shadow-sm">
          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Visual Analytics</h3>
          <p className="text-gray-600">Beautiful contribution graphs showing your coding activity over time.</p>
        </div>
        
        <div className="text-center p-6 bg-white rounded-lg shadow-sm">
          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Sync</h3>
          <p className="text-gray-600">Automatic synchronization with your Awtrix clock display via RabbitMQ.</p>
        </div>
        
        <div className="text-center p-6 bg-white rounded-lg shadow-sm">
          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure & Private</h3>
          <p className="text-gray-600">Your data is encrypted and stored securely with OAuth authentication.</p>
        </div>
      </div>

      {/* User Dashboard Section */}
      {session ? (
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center mb-8">
            <div className="mb-4">
              {session.user?.image && (
                <Image
                  src={session.user.image}
                  alt={`${session.user.name || session.user.email}'s avatar`}
                  width={80}
                  height={80}
                  className="rounded-full mx-auto mb-4"
                />
              )}
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Welcome back, {session.user?.name || session.user?.email}!
              </h2>
              <p className="text-gray-600">Here's your GitHub contribution overview</p>
            </div>
          </div>
          
          {/* Show GitHub contributions if user authenticated with GitHub */}
          {session?.user?.email && (
            <GitHubContributions 
              username={session.user.email.split('@')[0]} // Fallback username
            />
          )}
          
          <div className="mt-8 text-center">
            <Link
              href="/dashboard"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      ) : (
        <div className="text-center bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Ready to get started?
          </h2>
          <p className="text-gray-600 mb-6">
            Sign in with your GitHub or Google account to start tracking your contributions.
          </p>
          <Link
            href="/auth/signin"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
          >
            Sign In Now
          </Link>
        </div>
      )}
    </div>
  );
}

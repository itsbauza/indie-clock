"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Image from "next/image"
import GitHubContributions from "@/components/GitHubContributions"
import DeviceRegistrationCard from "@/components/DeviceRegistrationCard"
import NotificationButton from "@/components/NotificationButton"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your account and view your data</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* User Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center mb-6">
              {session.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  width={80}
                  height={80}
                  className="rounded-full mx-auto mb-4"
                />
              ) : (
                <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-medium">
                    {session.user?.name?.[0] || session.user?.email?.[0] || "U"}
                  </span>
                </div>
              )}
              <h2 className="text-xl font-semibold text-gray-900">
                {session.user?.name || "User"}
              </h2>
              <p className="text-gray-600">{session.user?.email}</p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Account Type</span>
                <span className="text-sm font-medium text-gray-900">
                  {session.user?.email?.includes("@gmail.com") ? "Google" : "GitHub"}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Member Since</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date().toLocaleDateString()}
                </span>
              </div>

              <div className="pt-4">
                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors">
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <NotificationButton />
              
              <button className="w-full text-left p-3 rounded-md border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-indigo-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-700">Settings</span>
                </div>
              </button>
              
              <button className="w-full text-left p-3 rounded-md border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-indigo-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-700">Help & Support</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* GitHub Contributions */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">GitHub Contributions</h3>
              <div className="flex gap-2">
                <button 
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/awtrix3/sync', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                          username: (session.user as any)?.githubUsername || session.user?.email?.split('@')[0] 
                        })
                      });
                      if (response.ok) {
                        alert('Data synced to Awtrix3 custom app!');
                      } else {
                        alert('Failed to sync data');
                      }
                    } catch (error) {
                      console.error('Error syncing to Awtrix3:', error);
                      alert('Error syncing data');
                    }
                  }}
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  Sync to Devices
                </button>
              </div>
            </div>
            
            {session.user?.email && (
              <GitHubContributions 
                username={session.user.email.split('@')[0]}
              />
            )}
          </div>

          {/* Device Registration */}
          <DeviceRegistrationCard />

        </div>
      </div>
    </div>
  )
} 
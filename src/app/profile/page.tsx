'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  email: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
      } else {
        setError(data.error)
      }
    } catch {
      setError('Failed to fetch user info')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  useEffect(() => {
    fetchUserInfo()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Navigation */}
        <nav className="mb-8">
          <div className="flex justify-between items-center bg-white shadow rounded-lg px-6 py-4">
            <div className="flex space-x-4">
              <Link 
                href="/dashboard" 
                className="text-indigo-600 hover:text-indigo-900 font-medium"
              >
                Dashboard
              </Link>
              <span className="text-gray-500">Profile</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Logout
            </button>
          </div>
        </nav>

        {/* Profile Content */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              User Profile
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              This is another protected page to test middleware functionality
            </p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">User ID</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {user?.id}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Email Address</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {user?.email}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Account Status</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Middleware Test Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-blue-900 mb-4">
            Middleware Test
          </h4>
          <div className="text-sm text-blue-800 space-y-2">
            <p>
              <strong>✓ Route Protection:</strong> This page is protected by middleware. If you weren&apos;t authenticated, you would be redirected to login.
            </p>
            <p>
              <strong>✓ Token Validation:</strong> Your access token was verified before allowing access to this page.
            </p>
            <p>
              <strong>✓ Auto-Refresh:</strong> If your token was about to expire (&lt; 5 minutes), it was automatically refreshed.
            </p>
            <p>
              <strong>Navigation Test:</strong> Try navigating between Dashboard and Profile to see middleware in action.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  const fetchUserInfo = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        setError('') // Clear any previous errors
      } else if (response.status === 401) {
        // Token expired, redirect to login
        console.log('Token expired, redirecting to login')
        router.push('/login')
      } else {
        setError(data.error)
      }
    } catch (err) {
      console.error('Error fetching user info:', err)
      setError('Failed to fetch user info')
    } finally {
      setLoading(false)
    }
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  useEffect(() => {
    fetchUserInfo()
    
    // Poll every 30 seconds to check authentication status
    const interval = setInterval(fetchUserInfo, 30000)
    
    return () => clearInterval(interval)
  }, [fetchUserInfo])

  // Auto-redirect to login after 3 seconds when there's an error
  useEffect(() => {
    if (error) {
      const redirectTimer = setTimeout(() => {
        router.push('/login')
      }, 3000)
      
      return () => clearTimeout(redirectTimer)
    }
  }, [error, router])

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
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="text-red-800 text-lg font-medium mb-2">
              Authentication Error
            </div>
            <div className="text-red-600 mb-4">
              {error}
            </div>
            <div className="text-red-600 text-sm mb-4">
              You will be redirected to login in 3 seconds...
            </div>
            <button
              onClick={() => router.push('/login')}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Go to Login Now
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <nav className="mb-8">
          <div className="flex justify-between items-center bg-white shadow rounded-lg px-6 py-4">
            <div className="flex space-x-4">
              <span className="text-gray-500">Dashboard</span>
              <Link 
                href="/profile" 
                className="text-indigo-600 hover:text-indigo-900 font-medium"
              >
                Profile
              </Link>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Logout
            </button>
          </div>
        </nav>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Dashboard
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Welcome to your authenticated dashboard (powered by Spring Boot)
              </p>
            </div>
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
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {user?.email}
                </dd>
              </div>
              {user?.firstName && (
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">First Name</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {user.firstName}
                  </dd>
                </div>
              )}
              {user?.lastName && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Last Name</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {user.lastName}
                  </dd>
                </div>
              )}
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Authentication Status</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <div className="space-y-2">
                    <div className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Authenticated via Spring Boot
                    </div>
                    <div className="text-sm text-gray-600">
                      Your session is managed by the Spring Boot backend
                    </div>
                  </div>
                </dd>
              </div>
            </dl>
          </div>
          
          <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900">User Management</h4>
              <div className="space-x-4">
                <button
                  onClick={fetchUserInfo}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Refresh User Info
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Spring Boot Authentication Information
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              How the Spring Boot authentication works
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div className="prose prose-sm max-w-none">
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• <strong>Backend API:</strong> https://auth-spring-api.onrender.com</li>
                <li>• <strong>JWT Tokens:</strong> Access tokens with 30-minute expiration</li>
                <li>• <strong>Refresh Tokens:</strong> 7-day refresh tokens for automatic renewal</li>
                <li>• <strong>Middleware:</strong> Validates tokens using /verify endpoint on every protected route</li>
                <li>• <strong>Auto-refresh:</strong> Expired access tokens are automatically refreshed</li>
                <li>• <strong>Secure Cookies:</strong> HTTP-only cookies for token storage</li>
                <li>• <strong>Logout:</strong> Invalidates tokens on the server</li>
                <li>• Try navigating to different pages to see authentication in action</li>
                <li>• Dashboard polls the backend every 30 seconds for user info</li>
                <li>• Test credentials: user@example.com / password</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  email: string
}

interface TokenInfo {
  expiresAt: number
  expiresIn: number
  isExpiringSoon: boolean
}

interface SessionInfo {
  sessionStart: number
  sessionTimeElapsed: number
  sessionTimeRemaining: number
  maxSessionDuration: number
  isSessionExpiringSoon: boolean
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null)
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  const fetchUserInfo = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        setTokenInfo(data.tokenInfo)
        setSessionInfo(data.sessionInfo)
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
    
    // Poll every 5 seconds to see token status and refresh actions
    const interval = setInterval(fetchUserInfo, 5000)
    
    return () => clearInterval(interval)
  }, [fetchUserInfo])

  const formatTimeRemaining = (seconds: number) => {
    // Ensure non-negative values
    const safeSeconds = Math.max(0, seconds)
    const minutes = Math.floor(safeSeconds / 60)
    const remainingSeconds = safeSeconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

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
                Welcome to your authenticated dashboard
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
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Token Status</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <div className="space-y-2">
                    <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      tokenInfo?.isExpiringSoon 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : tokenInfo && tokenInfo.expiresIn < 10
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {tokenInfo?.isExpiringSoon 
                        ? 'Token Expiring Soon' 
                        : tokenInfo && tokenInfo.expiresIn < 10
                        ? 'Token Expiring Now!'
                        : 'Token Valid'}
                    </div>
                    <div className="text-sm text-gray-600">
                      Token expires in: {tokenInfo ? formatTimeRemaining(Math.max(0, tokenInfo.expiresIn)) : 'Unknown'}
                    </div>
                    <div className="text-xs text-gray-500">
                      Token expires at: {tokenInfo ? new Date(tokenInfo.expiresAt * 1000).toLocaleString() : 'Unknown'}
                    </div>
                  </div>
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Session Status</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <div className="space-y-2">
                    <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      sessionInfo?.isSessionExpiringSoon 
                        ? 'bg-red-100 text-red-800' 
                        : sessionInfo && sessionInfo.sessionTimeRemaining < 60
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {sessionInfo?.isSessionExpiringSoon 
                        ? 'Session Ending Soon!' 
                        : sessionInfo && sessionInfo.sessionTimeRemaining < 60
                        ? 'Session Expiring'
                        : 'Session Active'}
                    </div>
                    <div className="text-sm text-gray-600">
                      Session time remaining: {sessionInfo ? formatTimeRemaining(Math.max(0, sessionInfo.sessionTimeRemaining)) : 'Unknown'}
                    </div>
                    <div className="text-xs text-gray-500">
                      Session started: {sessionInfo ? new Date(sessionInfo.sessionStart * 1000).toLocaleString() : 'Unknown'}
                    </div>
                    <div className="text-xs text-gray-500">
                      Total session duration: {sessionInfo ? formatTimeRemaining(sessionInfo.maxSessionDuration) : 'Unknown'}
                    </div>
                  </div>
                </dd>
              </div>
            </dl>
          </div>
          
          <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900">Token Management</h4>
              <div className="space-x-4">
                <button
                  onClick={fetchUserInfo}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Check Token Status
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Authentication Flow Information
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              How the authentication middleware works
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div className="prose prose-sm max-w-none">
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• <strong>SESSION LIFETIME:</strong> Fixed 2-minute total session duration</li>
                <li>• <strong>TOKEN REFRESH:</strong> Tokens refresh every 30 seconds during the session</li>
                <li>• <strong>FORCED RE-LOGIN:</strong> After 2 minutes, user must login again regardless of token refreshes</li>
                <li>• <strong>MIDDLEWARE REFRESH:</strong> Token refresh happens transparently in middleware</li>
                <li>• Dashboard updates every 5 seconds to show real-time status</li>
                <li>• Middleware validates and refreshes tokens on every protected route</li>
                <li>• Tokens are stored in secure, HTTP-only cookies</li>
                <li>• Try navigating to different pages to see middleware refresh in action</li>
                <li>• <strong>Watch both timers!</strong> Token refreshes but session countdown continues</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

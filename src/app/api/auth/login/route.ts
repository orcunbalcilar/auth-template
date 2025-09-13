import { NextRequest, NextResponse } from 'next/server'
import { callSpringBootApi, springBootApiEndpoints, LoginResponse } from '@/lib/api'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Call Spring Boot login endpoint
    const result = await callSpringBootApi<LoginResponse>(springBootApiEndpoints.login, {
      method: 'POST',
      body: { email, password }
    })

    if (result.error || !result.data) {
      return NextResponse.json(
        { error: result.error || 'Login failed' },
        { status: result.status }
      )
    }

    // Extract tokens from Spring Boot response
    const { accessToken, refreshToken, user } = result.data

    if (!accessToken) {
      return NextResponse.json(
        { error: 'No access token received from server' },
        { status: 500 }
      )
    }

    // Set access token cookie
    const response = NextResponse.json({ 
      message: 'Login successful',
      user: user
    })
    
    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 60, // 30 minutes
      path: '/'
    })

    // Set refresh token cookie if provided
    if (refreshToken) {
      response.cookies.set('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/'
      })
    }

    console.log('Login successful for user:', user?.email)

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

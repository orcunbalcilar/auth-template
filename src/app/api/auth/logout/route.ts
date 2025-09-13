import { NextRequest, NextResponse } from 'next/server'
import { callSpringBootApi, springBootApiEndpoints } from '@/lib/api'

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('access_token')?.value

    // Call Spring Boot logout endpoint if we have a token
    if (accessToken) {
      await callSpringBootApi(springBootApiEndpoints.logout, {
        method: 'POST',
        token: accessToken
      })
    }

    // Create response
    const response = NextResponse.json(
      { message: 'Logout successful' },
      { status: 200 }
    )

    // Clear access token cookie
    response.cookies.set('access_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    })

    // Clear refresh token cookie
    response.cookies.set('refresh_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

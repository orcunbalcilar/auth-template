import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify, JWTPayload } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')

// Environment variables for session configuration
const SESSION_LIFETIME = parseInt(process.env.SESSION_LIFETIME || '120') // Default: 2 minutes

interface TokenPayload extends JWTPayload {
  userId: string
  email: string
  sessionStart: number
}

export async function GET(request: NextRequest) {
  try {
    console.log('Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      JWT_SECRET_EXISTS: !!process.env.JWT_SECRET,
      JWT_SECRET_LENGTH: process.env.JWT_SECRET?.length || 0
    })

    const accessToken = request.cookies.get('access_token')?.value

    if (!accessToken) {
      console.log('No access token found in cookies')
      return NextResponse.json(
        { error: 'Access token not found' },
        { status: 401 }
      )
    }

    console.log('Access token found, verifying...')

    // Verify access token
    const { payload } = await jwtVerify(accessToken, JWT_SECRET)
    const decoded = payload as TokenPayload

    console.log('Token verified successfully:', {
      userId: decoded.userId,
      email: decoded.email,
      sessionStart: decoded.sessionStart,
      iat: decoded.iat,
      exp: decoded.exp
    })

    // Check session lifetime
    const currentTime = Math.floor(Date.now() / 1000)
    const sessionStart = decoded.sessionStart
    const sessionExpiry = sessionStart + SESSION_LIFETIME

    // If session lifetime has ended, return 401
    if (currentTime >= sessionExpiry) {
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      )
    }

    // Calculate remaining time for response
    const timeRemaining = sessionExpiry - currentTime

    // Session lifetime hasn't ended, return OK with user info
    return NextResponse.json({
      status: 'ok',
      user: { 
        id: decoded.userId, 
        email: decoded.email 
      },
      session: {
        timeRemaining: timeRemaining,
        expiresAt: sessionExpiry
      }
    })

  } catch (error) {
    console.error('Token verification error details:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : 'No stack trace',
      JWT_SECRET_EXISTS: !!process.env.JWT_SECRET,
      NODE_ENV: process.env.NODE_ENV
    })
    return NextResponse.json(
      { error: 'Invalid access token' },
      { status: 401 }
    )
  }
}

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
    const accessToken = request.cookies.get('access_token')?.value

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token not found' },
        { status: 401 }
      )
    }

    // Verify access token
    const { payload } = await jwtVerify(accessToken, JWT_SECRET)
    const decoded = payload as TokenPayload

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
    console.error('Token verification error:', error)
    return NextResponse.json(
      { error: 'Invalid access token' },
      { status: 401 }
    )
  }
}

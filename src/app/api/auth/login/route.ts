import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')

// Environment variables for session configuration
const SESSION_LIFETIME = parseInt(process.env.SESSION_LIFETIME || '120') // Default: 2 minutes

// Mock user database - replace with your actual user authentication
const mockUsers = [
  { id: '1', email: 'user@example.com', password: 'password123' },
  { id: '2', email: 'admin@example.com', password: 'admin123' }
]

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

    // Find user (replace with your actual authentication logic)
    const user = mockUsers.find(u => u.email === email && u.password === password)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate access token with session start time and constant lifetime
    const sessionStart = Math.floor(Date.now() / 1000)
    const sessionExpiry = sessionStart + SESSION_LIFETIME
    const accessToken = await new SignJWT({ 
      userId: user.id, 
      email: user.email,
      sessionStart: sessionStart // Track when the session originally started
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(sessionExpiry) // Token expires at session end
      .sign(JWT_SECRET)

    // Set access token cookie
    const response = NextResponse.json({ 
      message: 'Login successful',
      user: { id: user.id, email: user.email }
    })
    
    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_LIFETIME, // Cookie expires with session
      domain: 'auth-template-phi.vercel.app',
      path: '/'
    })

    // log response cookies
    console.log('Set-Cookie:', response.cookies.get('access_token'))

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify, JWTPayload, SignJWT } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')

// Environment variables for session configuration
const SESSION_LIFETIME = parseInt(process.env.SESSION_LIFETIME || '120') // Default: 2 minutes
const TOKEN_REFRESH_INTERVAL = parseInt(process.env.TOKEN_REFRESH_INTERVAL || '30') // Default: 30 seconds

interface TokenPayload extends JWTPayload {
  userId: string
  email: string
  sessionStart: number // When the session originally started
}

export async function middleware(request: NextRequest) {
  // Skip middleware for auth routes and public assets
  const publicPaths = ['/login', '/api/auth', '/_next', '/favicon.ico']
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path))
  
  if (isPublicPath) {
    return NextResponse.next()
  }

  console.log(`Middleware processing request for: ${request.nextUrl.pathname}`)
  // log cookies
  console.log('Cookies:', request.cookies)

  const accessToken = request.cookies.get('access_token')?.value

  // If no access token, redirect to login
  if (!accessToken) {
    console.log('No access token, redirecting to login...')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    // Verify access token
    const { payload } = await jwtVerify(accessToken, JWT_SECRET)
    const tokenPayload = payload as TokenPayload
    
    const now = Math.floor(Date.now() / 1000)
    const sessionStart = tokenPayload.sessionStart
    const sessionExpiry = sessionStart + SESSION_LIFETIME
    
    // Check if session lifetime has been exceeded
    if (now >= sessionExpiry) {
      console.log(`Session lifetime exceeded! Current: ${now} >= Expiry: ${sessionExpiry}`)
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // Always refresh token every configured interval (no conditions)
    const tokenAge = now - payload.iat!
    if (tokenAge >= TOKEN_REFRESH_INTERVAL) {
      console.log(`Refreshing token (${TOKEN_REFRESH_INTERVAL}s interval)...`)
      
      try {
        // Generate new access token with same constant lifetime
        const newAccessToken = await new SignJWT({
          userId: tokenPayload.userId,
          email: tokenPayload.email,
          sessionStart: sessionStart // Keep original session start time
        })
          .setProtectedHeader({ alg: 'HS256' })
          .setIssuedAt()
          .setExpirationTime(sessionExpiry) // Use constant expiry time
          .sign(JWT_SECRET)

        // Set new token in cookie
        const response = NextResponse.next()
        const timeLeft = sessionExpiry - now
        response.cookies.set('access_token', newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: timeLeft, // Cookie expires with session
          domain: '.auth-template-phi.vercel.app',
          path: '/'
        })
        
        console.log(`Token refreshed. Session time left: ${timeLeft}s`)
        return response
        
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError)
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }
    
    // Token is valid, continue
    return NextResponse.next()
    
  } catch (error) {
    // Access token is invalid, redirect to login
    console.error('Access token validation failed:', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|login).*)',
  ],
}

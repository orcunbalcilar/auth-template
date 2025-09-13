import { NextRequest, NextResponse } from 'next/server'
import { callSpringBootApi, springBootApiEndpoints, VerifyResponse, RefreshTokenResponse } from '@/lib/api'

export async function middleware(request: NextRequest) {
  // Skip middleware for auth routes and public assets
  const publicPaths = ['/login', '/api/auth', '/_next', '/favicon.ico']
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path))
  
  if (isPublicPath) {
    return NextResponse.next()
  }

  console.log(`Middleware processing request for: ${request.nextUrl.pathname}`)
  console.log('Cookies:', Object.fromEntries(request.cookies.getAll().map(c => [c.name, c.value])))

  const accessToken = request.cookies.get('access_token')?.value
  const refreshToken = request.cookies.get('refresh_token')?.value

  // If no access token, redirect to login
  if (!accessToken) {
    console.log('No access token, redirecting to login...')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    // Validate access token with Spring Boot backend
    const result = await callSpringBootApi<VerifyResponse>(springBootApiEndpoints.verify, {
      method: 'GET',
      token: accessToken
    })

    if (!result.error && result.data) {
      // Token is valid, continue
      console.log('Access token valid, continuing...')
      return NextResponse.next()
    }

    // Token is invalid or expired, try to refresh
    if (result.status === 401 && refreshToken) {
      console.log('Access token expired, attempting refresh...')
      
      const refreshResult = await callSpringBootApi<RefreshTokenResponse>(springBootApiEndpoints.refreshToken, {
        method: 'POST',
        body: { refreshToken }
      })

      if (!refreshResult.error && refreshResult.data) {
        const { accessToken: newAccessToken } = refreshResult.data
        console.log('Token refreshed successfully')

        // Set new access token in response and continue
        const response = NextResponse.next()
        response.cookies.set('access_token', newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 30 * 60, // 30 minutes
          path: '/'
        })

        return response
      }
    }

    // Both access token and refresh failed, redirect to login
    console.log('Token validation and refresh failed, redirecting to login...')
    const response = NextResponse.redirect(new URL('/login', request.url))
    
    // Clear invalid tokens
    response.cookies.set('access_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    })
    
    response.cookies.set('refresh_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    })

    return response
    
  } catch (error) {
    // Network error or other issues, redirect to login
    console.error('Middleware error:', error)
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

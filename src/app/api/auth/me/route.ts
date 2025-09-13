import { NextRequest, NextResponse } from 'next/server'
import { callSpringBootApi, springBootApiEndpoints, VerifyResponse, RefreshTokenResponse } from '@/lib/api'

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('access_token')?.value

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token not found' },
        { status: 401 }
      )
    }

    // Call Spring Boot /verify endpoint
    const result = await callSpringBootApi<VerifyResponse>(springBootApiEndpoints.verify, {
      method: 'GET',
      token: accessToken
    })

    if (result.error) {
      // If unauthorized, try to refresh the token
      if (result.status === 401) {
        const refreshToken = request.cookies.get('refresh_token')?.value
        
        if (refreshToken) {
          const refreshResult = await callSpringBootApi<RefreshTokenResponse>(springBootApiEndpoints.refreshToken, {
            method: 'POST',
            body: { refreshToken }
          })

          if (!refreshResult.error && refreshResult.data) {
            const { accessToken: newAccessToken } = refreshResult.data
            
            // Retry the /verify endpoint with new token
            const retryResult = await callSpringBootApi<VerifyResponse>(springBootApiEndpoints.verify, {
              method: 'GET',
              token: newAccessToken
            })

            if (!retryResult.error && retryResult.data) {
              // Update access token cookie
              const response = NextResponse.json({
                status: 'ok',
                user: retryResult.data.user || retryResult.data,
              })

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
        }
      }

      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      )
    }

    // Success - return user data
    return NextResponse.json({
      status: 'ok',
      user: result.data?.user || result.data,
    })

  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

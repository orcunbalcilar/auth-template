#!/bin/bash

# Quick deployment verification script
# Run this to verify your Vercel setup is correct

echo "🔍 Vercel Deployment Check"
echo "=========================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Install with: npm i -g vercel"
    exit 1
fi

echo "✅ Vercel CLI found"

# Check if project is linked
if [ ! -d ".vercel" ]; then
    echo "⚠️  Project not linked to Vercel. Run: vercel link"
    exit 1
fi

echo "✅ Project linked to Vercel"

# Check environment variables
echo ""
echo "🔧 Checking environment variables..."

ENV_VARS=("JWT_SECRET" "NODE_ENV" "TOKEN_REFRESH_INTERVAL" "SESSION_LIFETIME")

for var in "${ENV_VARS[@]}"; do
    if vercel env ls | grep -q "$var.*production"; then
        echo "✅ $var is set for production"
    else
        echo "❌ $var is missing for production"
    fi
done

echo ""
echo "📝 To set missing environment variables, run:"
echo "   ./setup-vercel-env.sh"
echo ""
echo "🚀 To deploy manually: vercel --prod"
echo "🔄 Auto-deploy triggers on push to main/master branch"

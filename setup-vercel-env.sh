#!/bin/bash

# Script to set up Vercel production environment variables
# Run this script after linking your project to Vercel

echo "Setting up Vercel production environment variables..."

# Generate a secure JWT secret (you can replace this with your own)
JWT_SECRET=$(openssl rand -base64 32)

# Set environment variables in Vercel
echo "Setting JWT_SECRET..."
vercel env add JWT_SECRET production <<< "$JWT_SECRET"

echo "Setting NODE_ENV..."
vercel env add NODE_ENV production <<< "production"

echo "Setting TOKEN_REFRESH_INTERVAL..."
vercel env add TOKEN_REFRESH_INTERVAL production <<< "5"

echo "Setting SESSION_LIFETIME..."
vercel env add SESSION_LIFETIME production <<< "40"

echo "Setting SECURE_COOKIES..."
vercel env add SECURE_COOKIES production <<< "true"

echo ""
echo "✅ Environment variables set successfully!"
echo ""
echo "🔐 Your generated JWT_SECRET: $JWT_SECRET"
echo "⚠️  Save this secret securely - you'll need it if you want to manually configure other environments"
echo ""
echo "Next steps:"
echo "1. Commit and push your changes to trigger deployment"
echo "2. Your app will be automatically deployed to Vercel on every push to main/master"

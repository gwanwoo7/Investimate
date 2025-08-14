#!/bin/bash

# Rental Cash Flow Calculator - Netlify Deployment Script
echo "🏠 Deploying Rental Cash Flow Calculator to Netlify..."

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "📦 Installing Netlify CLI..."
    npm install -g netlify-cli
fi

# Build the project
echo "🔨 Building project..."
npm run build

# Deploy to Netlify
echo "🚀 Deploying to Netlify..."
netlify deploy --prod --dir=dist

echo "✅ Deployment complete!"
echo "Your Rental Cash Flow Calculator is now live!"

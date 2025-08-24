#!/bin/bash

# Quick fix script for Stripe Price ID error
# This script helps you get the correct price ID from your Stripe account

echo "🔧 Stripe Price ID Fix Script"
echo "============================"
echo ""

# Check if stripe CLI is installed
if ! command -v stripe &> /dev/null; then
    echo "❌ Stripe CLI not found. Installing..."
    echo "📥 Download from: https://stripe.com/docs/stripe-cli"
    echo ""
    echo "Or install via:"
    echo "  Mac: brew install stripe/stripe-cli/stripe"
    echo "  Windows: Download from GitHub releases"
    echo "  Linux: wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_X.X.X_linux_x86_64.tar.gz"
    echo ""
    exit 1
fi

echo "✅ Stripe CLI found"
echo ""

# Login to Stripe (if not already)
echo "🔐 Checking Stripe authentication..."
stripe --version

# List existing products
echo ""
echo "📋 Your existing Stripe products:"
echo "================================="
stripe products list --limit 10

echo ""
echo "💡 MANUAL STEPS TO FIX:"
echo "======================="
echo "1. Go to Stripe Dashboard: https://dashboard.stripe.com"
echo "2. Navigate to: Products → Product catalog"
echo "3. Create 'Investimate Pro' product with $4.99/month pricing"
echo "4. Copy the Price ID (starts with price_)"
echo "5. Update SubscriptionPage.tsx with the new Price ID"
echo ""
echo "🔍 Look for this line in src/pages/SubscriptionPage.tsx:"
echo "   priceId: 'price_1QVKJfGFYvLxqOWTEqgbDtD8',"
echo ""
echo "✏️ Replace with your new Price ID:"
echo "   priceId: 'price_YOUR_NEW_PRICE_ID',"
echo ""

# Offer to search for the current price ID in code
echo "🔎 Current price ID in your code:"
grep -r "price_1QVKJfGFYvLxqOWTEqgbDtD8" src/ 2>/dev/null || echo "   Price ID not found in src/ directory"

echo ""
echo "✅ Once you update the Price ID, your upgrade flow should work!"
echo "🧪 Test with card number: 4242 4242 4242 4242"

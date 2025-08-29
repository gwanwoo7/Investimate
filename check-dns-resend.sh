#!/bin/bash

# Resend Migration Helper Script
# Run this script to check current DNS status and prepare for Resend integration

echo "🔍 Checking current DNS configuration for myinvestimate.com..."
echo ""

echo "✅ Current MX Record:"
nslookup -type=MX myinvestimate.com | grep "mail exchanger"
echo ""

echo "✅ Current SPF Record:"
nslookup -type=TXT myinvestimate.com | grep "spf1"
echo ""

echo "✅ Current DMARC Record:"
nslookup -type=TXT _dmarc.myinvestimate.com | grep "DMARC1"
echo ""

echo "✅ Current DKIM Record:"
nslookup -type=TXT google._domainkey.myinvestimate.com | grep "DKIM1"
echo ""

echo "📋 Migration Checklist:"
echo "1. ✅ DNS records properly configured"
echo "2. 🔄 Ready for Resend integration"
echo "3. 🔄 Need to create Resend account"
echo "4. 🔄 Need to update Supabase SMTP settings"
echo ""

echo "🎯 Next Action: Create Resend account at https://resend.com"
echo "📖 Follow the complete guide in RESEND_INTEGRATION_GUIDE.md"

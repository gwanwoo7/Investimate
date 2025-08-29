#!/bin/bash

# DNS Migration Verification Script - Google Workspace to Resend
# Run this script during migration to check DNS record updates

echo "🔄 DNS Migration Status Check for myinvestimate.com"
echo "=================================================="
echo ""

echo "📧 Current Email DNS Records:"
echo "-----------------------------"

echo "✅ Current SPF Record:"
SPF_RECORD=$(nslookup -type=TXT myinvestimate.com 2>/dev/null | grep "spf1" | head -1)
if [[ $SPF_RECORD == *"resend"* ]]; then
    echo "   ✅ RESEND: $SPF_RECORD"
elif [[ $SPF_RECORD == *"google"* ]]; then
    echo "   🔄 GOOGLE: $SPF_RECORD"
    echo "   ⏳ Need to update to include Resend"
else
    echo "   ❌ No SPF record found"
fi
echo ""

echo "🔍 Resend Domain Verification:"
RESEND_VERIFY=$(nslookup -type=TXT _resend.myinvestimate.com 2>/dev/null | grep "text =")
if [ -n "$RESEND_VERIFY" ]; then
    echo "   ✅ FOUND: $RESEND_VERIFY"
else
    echo "   ❌ Not found - add verification record from Resend dashboard"
fi
echo ""

echo "🔐 DMARC Record (should remain):"
DMARC_RECORD=$(nslookup -type=TXT _dmarc.myinvestimate.com 2>/dev/null | grep "DMARC1")
if [ -n "$DMARC_RECORD" ]; then
    echo "   ✅ PRESENT: $DMARC_RECORD"
else
    echo "   ❌ Missing DMARC record"
fi
echo ""

echo "📬 MX Record:"
MX_RECORD=$(nslookup -type=MX myinvestimate.com 2>/dev/null | grep "mail exchanger")
echo "   📮 CURRENT: $MX_RECORD"
echo ""

echo "🎯 Migration Status:"
echo "-------------------"
if [[ $SPF_RECORD == *"resend"* ]] && [ -n "$RESEND_VERIFY" ]; then
    echo "   🎉 MIGRATION COMPLETE - Resend is configured!"
elif [[ $SPF_RECORD == *"google"* ]] && [ -z "$RESEND_VERIFY" ]; then
    echo "   🔄 MIGRATION PENDING - Still using Google Workspace"
    echo "   📋 Next: Add Resend verification record and update SPF"
elif [ -n "$RESEND_VERIFY" ] && [[ $SPF_RECORD == *"google"* ]]; then
    echo "   ⚡ MIGRATION IN PROGRESS - Update SPF record to include Resend"
else
    echo "   ❓ MIGRATION STATUS UNCLEAR - Check DNS configuration"
fi

echo ""
echo "🔧 Quick Actions:"
echo "----------------"
echo "1. Create Resend account: https://resend.com"
echo "2. Add domain: myinvestimate.com"
echo "3. Get verification record and API key"
echo "4. Update DNS with Resend records"
echo "5. Configure Supabase SMTP"
echo ""
echo "📖 Full guide: GOOGLE_TO_RESEND_MIGRATION.md"

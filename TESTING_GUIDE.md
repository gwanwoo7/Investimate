# 🧪 Investimate Manual Testing Guide

## Quick Test Checklist

### 1. Font Standardization ✅
**Expected:** Headers should be 1.5rem, body text 0.8-0.9rem throughout
**Test:** Navigate to tab "Investment Property Calculator" and verify text sizes are consistent

### 2. Email Verification System �
**Expected:** Users must verify email before accessing features
**Test:**
1. Click "Sign Up" and create new account
2. EmailVerificationModal should appear with user's email
3. Check email inbox for verification message
4. Click verification link in email
5. Should redirect to success page, then auto-login

### 3. Property Search with Membership Limits 🔍
**Expected:** Free users get 5 searches, shows remaining count
**Test:**
1. Sign up as new user (after email verification)
2. Search properties - counter should show "4 searches remaining"
3. After 5 searches, UpgradeModal should appear
4. Pro members get unlimited searches

### 4. Map Functionality 🗺️
**Expected:** Interactive Leaflet map with drawing tools and property markers
**Test:**
1. Map should be visible in center panel
2. Drawing tools should be present in top-left of map
3. After search, property markers should appear on map
4. Click and drag to draw boundaries should trigger search

### 5. Property Analysis Modal 📊
**Expected:** Click property card or "Analyze" button opens detailed analysis
**Test:**
1. After properties load, click on any property card
2. OR click "Full Analysis" button on property
3. Should open comprehensive modal with charts, tables, projections

### 6. Stripe Payment Integration 💳
**Expected:** Pro upgrade flow with Stripe checkout
**Test:**
1. Trigger UpgradeModal (by exceeding search limit)
2. Click "Upgrade to Pro" button
3. Should redirect to Stripe checkout page
4. Use test card: 4242 4242 4242 4242
5. Complete payment and return to app
6. Should have Pro features unlocked

### 7. Navigation 🧭
**Expected:** Tabs should work, proper routing between pages
**Test:**
1. Click different tabs (Home, Investment Calculator, Community)
2. Each should load different content
3. URLs should change appropriately

## Debug Commands (in Browser Console)

```javascript
// Run all tests
window.investimateDebug.runAllTests()

// Test specific functionality  
window.investimateDebug.testMapFunctionality()
window.investimateDebug.testPropertyAnalysis()
window.investimateDebug.simulatePropertySearch()

// Test membership features
window.investimateDebug.checkMembershipStatus()
window.investimateDebug.simulateFeatureUsage()
```

## Expected Console Output

The debug script should automatically run and show:
- ✅ Font sizes and consistency check
- ✅ Component rendering status
- ✅ Map elements detection
- ✅ Property interaction capabilities
- ✅ Navigation functionality
- ✅ Email verification system status
- ✅ Membership service connectivity
- ✅ Stripe integration readiness

## New Features Testing

### Email Verification Flow
1. **Signup**: Creates unverified user
2. **Email Modal**: Shows verification instructions
3. **Resend**: Test resend verification email
4. **Verification**: Click email link to verify
5. **Success Page**: Shows verification success
6. **Feature Access**: Verified users can use app

### Membership System
1. **Free Tier**: 5 searches maximum
2. **Search Counting**: Real-time remaining display
3. **Upgrade Prompts**: Modal appears at limit
4. **Pro Benefits**: Unlimited searches after payment
5. **Trial System**: 7-day trial with 20 searches

## Troubleshooting

If issues persist:
1. **Hard refresh:** Ctrl+Shift+R (Chrome) or Cmd+Shift+R (Mac)
2. **Clear cache:** DevTools > Application > Storage > Clear site data
3. **Check console:** Look for React/JavaScript errors
4. **Verify dev server:** Should be running on localhost:5173
5. **Email issues:** Check spam folder, verify SMTP settings
6. **Payment issues:** Ensure Stripe keys are configured
7. **Database issues:** Check Supabase connection and RLS policies

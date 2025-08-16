# 🔧 OAuth and Payment Troubleshooting Guide

## 🚨 Current Issues and Solutions

### Issue 1: Stripe Payment Error - "Invalid API Key provided"

**Problem**: `Invalid API Key provided: pk_test_*********here`

**Root Cause**: Stripe publishable key not loading correctly due to wrong environment variable name

**✅ Solution Applied**: 
- Fixed environment variable from `REACT_APP_STRIPE_PUBLISHABLE_KEY` to `VITE_STRIPE_PUBLISHABLE_KEY`
- Updated SubscriptionPage.tsx to use `import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY`

**Next Steps**:
1. Restart your development server: `npm run dev`
2. Test payment flow again

---

### Issue 2: Google OAuth Error - "missing OAuth secret"

**Problem**: `{"code":400,"error_code":"validation_failed","msg":"Unsupported provider: missing OAuth secret"}`

**Root Cause**: Google OAuth provider not properly configured in Supabase dashboard

**✅ Step-by-Step Fix**:

#### 1. Configure Google OAuth in Supabase Dashboard

1. **Go to Supabase Dashboard**: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. **Select your project**: `jrfnerjluqcrzfbhtvza` 
3. **Navigate to Authentication**:
   - Settings → Authentication → Providers
4. **Configure Google Provider**:
   - Find "Google" in the provider list
   - Click "Configure" or toggle to enable
   - **Client ID**: `1051118537480-7k5qggkrdrv0gkevgersoeibohn3oo5r.apps.googleusercontent.com`
   - **Client Secret**: You need to get this from Google Cloud Console

#### 2. Get Google Client Secret (Required!)

**Why you need this**: Supabase requires both Client ID AND Client Secret for server-side OAuth

**Steps to get Client Secret**:

1. **Go to Google Cloud Console**: [https://console.cloud.google.com/](https://console.cloud.google.com/)
2. **Select your project** (or create one if needed)
3. **Navigate to**: APIs & Services → Credentials
4. **Find your OAuth 2.0 Client ID**: 
   - Look for ID: `1051118537480-7k5qggkrdrv0gkevgersoeibohn3oo5r.apps.googleusercontent.com`
5. **Click on the Client ID** to view details
6. **Copy the Client Secret** (looks like: `GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx`)

#### 3. Update Supabase Google Provider

Back in Supabase Dashboard:
1. **Authentication** → **Providers** → **Google**
2. **Enable the provider**
3. **Add credentials**:
   - **Client ID**: `1051118537480-7k5qggkrdrv0gkevgersoeibohn3oo5r.apps.googleusercontent.com`
   - **Client Secret**: `GOCSPX-your-secret-from-step-2`
4. **Save changes**

#### 4. Update Google Cloud Console Redirect URIs

1. **Google Cloud Console** → APIs & Services → Credentials
2. **Edit your OAuth 2.0 Client ID**
3. **Add Authorized Redirect URIs**:
   ```
   https://jrfnerjluqcrzfbhtvza.supabase.co/auth/v1/callback
   http://localhost:5173  (for local development)
   ```
4. **Add Authorized JavaScript Origins**:
   ```
   http://localhost:5173  (for local development)
   https://your-netlify-site.netlify.app  (for production)
   ```

---

## 🧪 Testing Instructions

### Test Stripe Payment ($0.01)

1. **Restart dev server**: `npm run dev`
2. **Go to subscription page**
3. **Click "Start Pro Subscription"**
4. **Use test credit card**:
   - **Card**: 4242424242424242
   - **Expiry**: 12/25 (any future date)
   - **CVC**: 123 (any 3 digits)
   - **ZIP**: 12345 (any 5 digits)

### Test Google OAuth

1. **Ensure Google provider is enabled** in Supabase
2. **Go to signup page**
3. **Click "Continue with Google"**
4. **Should redirect to Google sign-in**

---

## 🔍 Debug Commands

### Check Environment Variables

Open browser console and run:
```javascript
// Check Stripe key
console.log('Stripe Key:', import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Check Supabase config
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...');
```

### Check Network Requests

1. **Open browser DevTools** → Network tab
2. **Try Google OAuth** 
3. **Look for failed requests** to Supabase auth endpoints
4. **Check response errors** for specific issues

---

## 🔧 Environment Variables Checklist

### Local Development (.env.local)

Ensure you have:
```bash
# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Supabase
VITE_SUPABASE_URL=https://jrfnerjluqcrzfbhtvza.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyZm5lcmpsdXFjcnpmYmh0dnphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMzY2MDIsImV4cCI6MjA3MDgxMjYwMn0.OEbhZHwHxRhxEkz_WReBtzCa-MyMUA7siv7so8yL_0c

# Google OAuth
VITE_GOOGLE_CLIENT_ID=1051118537480-7k5qggkrdrv0gkevgersoeibohn3oo5r.apps.googleusercontent.com
```

### Production (Netlify)

Add the same variables in Netlify dashboard under Site Settings → Environment Variables

---

## ⚠️ Important Security Notes

1. **Never commit `.env.local`** to git (already in .gitignore)
2. **Client Secret is sensitive** - only add to Supabase dashboard, not environment variables
3. **Rotate keys regularly** in production
4. **Use test keys** for development

---

## 🎯 Success Indicators

After following this guide, you should see:

- ✅ **Stripe Payment**: Test card processes successfully with $0.01 charge
- ✅ **Google OAuth**: Redirects to Google sign-in without errors
- ✅ **Environment Debug**: Shows "Supabase Auth: ✅ Configured"
- ✅ **No Console Errors**: Clean browser console during authentication

---

## 📞 Need Help?

If issues persist:
1. **Check Supabase Dashboard Logs**: Authentication → Logs
2. **Check Google Cloud Console Logs**: APIs & Services → Logs
3. **Check Browser DevTools**: Console and Network tabs
4. **Restart development server** after any environment variable changes

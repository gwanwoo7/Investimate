# 🔧 Google OAuth Fix Guide

## 🚨 **Current Issue**: Error 400: redirect_uri_mismatch

Your Google OAuth is configured but the redirect URIs don't match between your Google Cloud Console and your application.

## 🔍 **Root Cause Analysis**

The error occurs because:
1. **Local Development**: Your app runs on `http://localhost:5173`
2. **Production**: Your app runs on your Netlify URL (e.g., `https://your-site.netlify.app`)
3. **Supabase OAuth**: Uses Supabase's callback URL `https://jrfnerjluqcrzfbhtvza.supabase.co/auth/v1/callback`

## ✅ **Complete Fix Instructions**

### **Step 1: Access Google Cloud Console**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. **Select your project** or create a new one
3. **Navigate to**: APIs & Services → Credentials
4. **Find your OAuth 2.0 Client ID**: `1062932170879-k3r44h3g5n8m7aj7vh8vfohq9ckbk4lk.apps.googleusercontent.com`

### **Step 2: Update Authorized JavaScript Origins**

Add these **exact URLs** to Authorized JavaScript origins:

```
http://localhost:5173
https://localhost:5173
https://jrfnerjluqcrzfbhtvza.supabase.co
https://your-netlify-site-name.netlify.app
```

**⚠️ Replace `your-netlify-site-name` with your actual Netlify site name**

### **Step 3: Update Authorized Redirect URIs**

Add these **exact URLs** to Authorized redirect URIs:

```
http://localhost:5173/auth/callback
https://localhost:5173/auth/callback
https://jrfnerjluqcrzfbhtvza.supabase.co/auth/v1/callback
https://your-netlify-site-name.netlify.app/auth/callback
```

### **Step 4: Configure Supabase Authentication**

1. **Go to your Supabase Dashboard**: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. **Select your project**: `jrfnerjluqcrzfbhtvza`
3. **Navigate to**: Authentication → Providers → Google
4. **Enable Google provider** and add:
   - **Client ID**: `1062932170879-k3r44h3g5n8m7aj7vh8vfohq9ckbk4lk.apps.googleusercontent.com`
   - **Client Secret**: [Get from Google Cloud Console → Credentials]

### **Step 5: Update Site URL in Supabase**

1. In Supabase Dashboard → Settings → API → URL Configuration
2. **Site URL**: `https://your-netlify-site-name.netlify.app` (for production)
3. **Additional Redirect URLs**:
   ```
   http://localhost:5173/auth/callback
   https://your-netlify-site-name.netlify.app/auth/callback
   ```

## 🧪 **Testing Instructions**

### **Local Testing**:
1. **Start dev server**: `npm run dev`
2. **Open**: `http://localhost:5173`
3. **Try Google Sign In** - should work without redirect errors

### **Production Testing**:
1. **Deploy to Netlify** (automatic via GitHub)
2. **Open your live site**: `https://your-netlify-site-name.netlify.app`
3. **Try Google Sign In** - should work in production

## ❌ **Common Mistakes to Avoid**

1. **Missing http:// or https://** - Always include the protocol
2. **Trailing slashes** - Don't add `/` at the end of origins
3. **Wrong callback paths** - Use `/auth/v1/callback` for Supabase, `/auth/callback` for your app
4. **Case sensitivity** - URLs are case-sensitive
5. **Forgetting to save** - Click "Save" in Google Cloud Console

## 🔍 **How to Find Your Netlify Site Name**

1. **Go to**: [app.netlify.com](https://app.netlify.com)
2. **Find your site** in the dashboard
3. **Site name** appears as: `https://SITENAME.netlify.app`
4. **Use this exact URL** in the configurations above

## 🚀 **Expected Result**

After following these steps:
- ✅ **Local development**: Google OAuth works on `localhost:5173`
- ✅ **Production**: Google OAuth works on your live Netlify site  
- ✅ **No redirect errors**: Users can sign in smoothly
- ✅ **Supabase integration**: User data syncs properly

## 🆘 **If Still Not Working**

1. **Check browser console** for specific error messages
2. **Verify all URLs** match exactly (no typos)
3. **Wait 5-10 minutes** after saving Google Cloud Console changes
4. **Clear browser cache** and try again
5. **Test in incognito mode** to avoid cached credentials

---

**Need Help?** Check the browser developer tools Network tab to see the exact redirect URL being sent, then make sure it matches your Google Cloud Console configuration exactly.

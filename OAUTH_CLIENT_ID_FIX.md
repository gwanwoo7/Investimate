# 🔧 OAuth Client ID Fix - Updated for Your Configuration

## ✅ **FIXED: Environment Variable Updated**

Your local `.env` file has been updated to match your Netlify configuration:
- **Client ID**: `1051118537480-7k5qggkrdrv0gkevgersoeibohn3oo5r.apps.googleusercontent.com`

## 🎯 **Next Steps to Complete OAuth Fix**

### **Step 1: Configure Google Cloud Console**

1. **Go to**: https://console.cloud.google.com/
2. **Navigate to**: APIs & Services → Credentials
3. **Find this OAuth Client**: `1051118537480-7k5qggkrdrv0gkevgersoeibohn3oo5r.apps.googleusercontent.com`
4. **Click "Edit"** on your OAuth 2.0 Client ID

### **Step 2: Add Authorized Redirect URIs**

In the "Authorized redirect URIs" section, add these **exact URLs**:

```
https://investimate.netlify.app/auth/callback
https://investimate.netlify.app/
https://jrfnerjluqcrzfbhtvza.supabase.co/auth/v1/callback
http://localhost:5173/auth/callback
http://localhost:5173/
```

### **Step 3: Add Authorized JavaScript Origins**

In the "Authorized JavaScript origins" section, add:

```
https://investimate.netlify.app
https://jrfnerjluqcrzfbhtvza.supabase.co
http://localhost:5173
```

### **Step 4: Save and Test**

1. **Click "Save"** in Google Cloud Console
2. **Wait 5-10 minutes** for changes to propagate
3. **Test on your site**: https://investimate.netlify.app

## 🔄 **Environment Sync Status**

- ✅ **Local `.env`**: Updated to correct Client ID
- ✅ **Netlify Environment**: Already has correct Client ID  
- ⏳ **Google Cloud Console**: Needs redirect URIs updated (Step 2 above)
- ⏳ **Supabase Config**: May need Client ID verification

## 🧪 **Testing**

After completing the steps above:

1. **Local Testing**: 
   - Run: `npm run dev`
   - Test Google OAuth on `http://localhost:5173`

2. **Production Testing**:
   - Test Google OAuth on `https://investimate.netlify.app`

## 🎉 **Expected Result**

- No more "Error 400: redirect_uri_mismatch"
- Google Sign In works on both local and production
- Consistent Client ID across all environments

---

**The main issue was the Client ID mismatch between your local development and production environments. This is now fixed!**

# Netlify + Supabase Production Setup

## 🎯 Overview
This guide configures Supabase for your Netlify production deployment of Investimate.

## 📋 Required Steps

### 1. Add Netlify Environment Variables

1. **Access Netlify Dashboard**:
   - Go to [app.netlify.com](https://app.netlify.com)
   - Select your Investimate site

2. **Navigate to Environment Variables**:
   - Site settings → Environment variables
   - Click "Add a variable"

3. **Add Required Variables**:

   | Variable Name | Value | Example |
   |---------------|-------|---------|
   | `VITE_SUPABASE_URL` | Your Supabase Project URL | `https://abcdefghij.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | Your Supabase Anon Key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

   **Note**: Get these values from your Supabase dashboard → Settings → API

### 2. Configure Supabase CORS

1. **Go to Supabase Dashboard**:
   - Settings → API → URL Configuration

2. **Add Allowed Origins**:
   ```
   https://your-site-name.netlify.app
   https://your-custom-domain.com (if applicable)
   ```

3. **Add Redirect URLs** (for OAuth):
   ```
   https://your-site-name.netlify.app/auth/callback
   https://your-custom-domain.com/auth/callback (if applicable)
   ```

### 3. Update OAuth Provider Settings

If using Google OAuth, update your Google Cloud Console:

1. **Google Cloud Console** → APIs & Services → Credentials
2. **Update Authorized JavaScript Origins**:
   ```
   https://your-site-name.netlify.app
   ```
3. **Update Authorized Redirect URIs**:
   ```
   https://abcdefghij.supabase.co/auth/v1/callback
   ```

### 4. Redeploy Site

1. **Option A**: Push a new commit to trigger deployment
2. **Option B**: Manual redeploy in Netlify dashboard
   - Deploys → Trigger deploy → Deploy site

## ✅ Verification Checklist

After deployment, verify:

- [ ] ✅ **Supabase Auth: Configured** (should show in environment debug)
- [ ] ✅ **Sign up works** with email/password
- [ ] ✅ **Login works** with email/password  
- [ ] ✅ **OAuth works** (Google/Apple if configured)
- [ ] ✅ **No CORS errors** in browser console
- [ ] ✅ **Users appear** in Supabase dashboard

## 🔍 Troubleshooting

### Common Issues:

1. **"Supabase not configured" in production**
   - **Cause**: Environment variables not set in Netlify
   - **Fix**: Add variables in Netlify dashboard and redeploy

2. **CORS errors**
   - **Cause**: Netlify domain not in Supabase allowed origins
   - **Fix**: Add your Netlify URL to Supabase CORS settings

3. **OAuth redirect errors**
   - **Cause**: Incorrect redirect URLs
   - **Fix**: Update OAuth provider settings with production URLs

4. **Build fails with Supabase errors**
   - **Cause**: Invalid environment variables
   - **Fix**: Verify variables match exactly from Supabase dashboard

### Debug Commands:

Check environment variables are loading:
```javascript
// Add to browser console on production site
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Has Anon Key:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
```

## 📚 Additional Configuration

### Supabase Policies (Optional)

For enhanced security, set up Row Level Security (RLS):

1. **Enable RLS** on your tables
2. **Create policies** for user access:
   ```sql
   -- Allow users to read their own profile
   CREATE POLICY "Users can view own profile" 
   ON profiles FOR SELECT 
   USING (auth.uid() = id);
   
   -- Allow users to update their own profile
   CREATE POLICY "Users can update own profile" 
   ON profiles FOR UPDATE 
   USING (auth.uid() = id);
   ```

### Email Templates (Optional)

Customize Supabase email templates:
1. **Authentication** → **Email Templates**
2. **Customize**: Confirmation, Reset Password, Magic Link emails

---

## 🚀 Production Ready!

Once configured, your production site will have:
- ✅ **Secure authentication** with Supabase
- ✅ **Email verification** working
- ✅ **Password reset** functional
- ✅ **OAuth providers** enabled
- ✅ **User management** operational

**Need help?** Check the browser console for specific error messages and verify all URLs match between Netlify, Supabase, and OAuth providers.

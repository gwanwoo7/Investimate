# Complete Supabase Setup Guide

## 🎯 Current Status
- **Supabase Auth**: ⚠️ Not configured (missing environment variables)
- **Service**: ✅ Code is ready and implemented
- **Integration**: ✅ Properly integrated with components

## 📋 Quick Setup Steps

### 1. Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" → "Sign up" (if needed)
3. Click "New Project"
4. Choose your organization
5. Fill in project details:
   - **Name**: `Investimate` (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Choose closest to your users
6. Click "Create new project"
7. Wait 2-3 minutes for setup to complete

### 2. Get Your Credentials
Once your project is ready:
1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy these values:
   - **Project URL** (starts with `https://`)
   - **Project API Key** → **anon** **public** key

### 3. Configure Environment Variables

#### Option A: Update .env.local (Recommended for development)
Open `/Users/ping/ping/Rental_Cash_Flow/.env.local` and update:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

#### Option B: Update .env (Alternative)
Open `/Users/ping/ping/Rental_Cash_Flow/.env` and add:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Restart Development Server
After updating environment variables:
```bash
npm run dev
```

### 5. Set Up Authentication Tables (Optional)
Supabase automatically creates auth tables, but you can add custom user profile tables:

1. Go to **Table Editor** in Supabase dashboard
2. Click "Create a new table"
3. Create `profiles` table with these columns:
   - `id` (uuid, primary key, references auth.users)
   - `email` (text)
   - `name` (text)
   - `avatar_url` (text, nullable)
   - `subscription_status` (text, default: 'free')
   - `created_at` (timestamp with time zone)
   - `updated_at` (timestamp with time zone)

### 6. Configure OAuth Providers (Optional)

#### Google OAuth:
1. In Supabase dashboard → **Authentication** → **Providers**
2. Enable Google provider
3. Add your Google Client ID: `1051118537480-7k5qggkrdrv0gkevgersoeibohn3oo5r.apps.googleusercontent.com`
4. Set redirect URL: `https://your-project-id.supabase.co/auth/v1/callback`

#### Apple OAuth:
1. Enable Apple provider in Supabase
2. Configure Apple developer settings (more complex setup required)

## 🔧 Netlify Environment Variables

For production deployment, add these to your Netlify environment variables:

1. Go to Netlify dashboard → Site settings → Environment variables
2. Add:
   - `VITE_SUPABASE_URL` = `https://your-project-id.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-anon-key-here`

## ✅ Verification

After setup, you should see:
- ✅ Supabase Auth: Configured
- Login/Signup forms working with real authentication
- User profiles stored in Supabase
- OAuth providers working (if configured)

## 🔍 Troubleshooting

### Common Issues:
1. **"Supabase not configured"**: Environment variables not set or incorrect
2. **"Invalid API key"**: Double-check the anon key from Supabase dashboard
3. **"CORS error"**: Make sure domain is added to Supabase allowed origins

### Debug Steps:
1. Check browser console for specific error messages
2. Verify environment variables are loading: `console.log(import.meta.env.VITE_SUPABASE_URL)`
3. Check Supabase dashboard logs for authentication attempts

## 📚 Additional Resources
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [React Integration](https://supabase.com/docs/guides/getting-started/tutorials/with-react)

---

**Need help?** The authentication system is fully implemented and ready to work once you add your Supabase credentials!

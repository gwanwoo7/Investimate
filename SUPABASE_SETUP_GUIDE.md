# Supabase Authentication Setup Guide

This guide will help you set up Supabase Authentication for secure email verification and OAuth in your Rental Cash Flow Calculator.

## Why Supabase?

✅ **Enterprise-grade security** - Built on PostgreSQL with Row Level Security  
✅ **Email verification** - Automatic email verification out of the box  
✅ **OAuth providers** - Google, Apple, GitHub, and 25+ other providers  
✅ **Free tier** - 50,000 monthly active users included  
✅ **Real-time database** - Bonus: Get a real-time database for future features  
✅ **Easy integration** - Simple React hooks and TypeScript support  

## Quick Setup (5 minutes)

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click **"New Project"**
3. Choose your organization and fill in:
   - **Project name**: `rental-cash-flow`
   - **Database password**: Create a strong password
   - **Region**: Choose closest to your users
4. Click **"Create new project"** (takes ~2 minutes)

### 2. Get Your API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (something like `https://xyz.supabase.co`)
   - **Project API Key** (anon, public key)

### 3. Configure Environment Variables

Add to your `.env.local` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Configure Authentication

1. In Supabase dashboard, go to **Authentication** → **Settings**
2. Under **Site URL**, add:
   - `http://localhost:5173` (for development)
   - `https://your-netlify-domain.netlify.app` (for production)
3. Under **Redirect URLs**, add:
   - `http://localhost:5173/auth/callback`
   - `https://your-netlify-domain.netlify.app/auth/callback`

## OAuth Setup (Google)

### 1. Enable Google Provider

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Find **Google** and toggle it on
3. You'll need to add your Google OAuth credentials:

### 2. Use Existing Google OAuth Setup

If you already have Google OAuth configured:
- **Client ID**: `1051118537480-7k5qggkrdrv0gkevgersoeibohn3oo5r.apps.googleusercontent.com`
- **Client Secret**: Get this from Google Cloud Console

### 3. Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services** → **Credentials**
3. Edit your OAuth 2.0 Client
4. Add Supabase callback URL:
   - `https://your-project-ref.supabase.co/auth/v1/callback`

## Email Templates (Optional)

Customize your email verification and password reset emails:

1. Go to **Authentication** → **Email Templates**
2. Edit templates for:
   - **Confirm signup** - Email verification
   - **Reset password** - Password reset
   - **Magic link** - Passwordless login

## Testing

### 1. Start Development Server

```bash
npm run dev
```

### 2. Test Email Signup

1. Go to your signup page
2. Create account with real email
3. Check email for verification link
4. Click link to verify account

### 3. Test OAuth

1. Click "Continue with Google"
2. Complete OAuth flow
3. Should redirect back to your app

## Production Deployment

### 1. Update Netlify Environment Variables

Add to Netlify dashboard → Site Settings → Environment Variables:

```
VITE_SUPABASE_URL = https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY = your-anon-key-here
```

### 2. Update Supabase Settings

1. Add your production domain to **Site URL**
2. Add production callback URL to **Redirect URLs**
3. Update Google OAuth settings with production domain

## Database Schema (Automatic)

Supabase automatically creates these tables:
- `auth.users` - User accounts with email verification
- `auth.sessions` - User sessions
- `auth.refresh_tokens` - JWT refresh tokens

You can extend this with custom user profiles if needed.

## Security Features

- **Email verification** - Users must verify email before access
- **Password strength** - Configurable password requirements
- **Rate limiting** - Built-in protection against abuse
- **JWT tokens** - Secure session management
- **Row Level Security** - Database-level security policies

## Migration from Current System

The app includes backward compatibility:
- Existing demo login still works
- Legacy OAuth falls back gracefully
- Current user sessions preserved

## Troubleshooting

### Common Issues

1. **"Invalid login credentials"**
   - Check if email is verified
   - Verify environment variables are set

2. **OAuth redirect errors**
   - Check Site URL and Redirect URLs in Supabase
   - Verify Google OAuth settings

3. **CORS errors**
   - Ensure domains are added to Supabase settings
   - Check Site URL configuration

### Debug Mode

The app includes debug components to verify configuration:
- Environment variables status
- Supabase connection status
- OAuth provider availability

## Cost

- **Free tier**: 50,000 monthly active users
- **Pro tier**: $25/month for 100,000 users
- **Enterprise**: Custom pricing

Perfect for most applications!

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

## Next Steps

After setup:
1. Test email verification flow
2. Test OAuth providers
3. Deploy to production
4. Monitor authentication metrics in Supabase dashboard

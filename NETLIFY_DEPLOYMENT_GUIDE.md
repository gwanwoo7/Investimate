# Netlify Deployment Guide

## Environment Variables Setup

After deploying to Netlify, you need to configure environment variables for OAuth and API access.

### 1. Configure Netlify Environment Variables

Go to your Netlify dashboard → Site Settings → Environment Variables and add:

**Required:**
```
VITE_GOOGLE_CLIENT_ID = 1051118537480-7k5qggkrdrv0gkevgersoeibohn3oo5r.apps.googleusercontent.com
VITE_RAPID_API_KEY = b88f193366msh54685e5876b1873p1d27b6jsnb71f9fd28d7c
```

**Recommended (Supabase Authentication - Production Ready):**
```
VITE_SUPABASE_URL = https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY = your-supabase-anon-key
```

> **Important**: Use the actual values from your `.env.local` file (not committed to Git for security).

> **Supabase Setup**: See `SUPABASE_SETUP_COMPLETE.md` for complete Supabase configuration instructions.
> **Netlify + Supabase**: See `NETLIFY_SUPABASE_SETUP.md` for production deployment specifics.

### 2. Update Google OAuth Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services → Credentials
3. Edit your OAuth 2.0 Client ID
4. Add your Netlify domain to **Authorized JavaScript origins**:
   - `https://your-site-name.netlify.app`
   - Keep `http://localhost:5173` for development

### 3. Redeploy

After adding environment variables:
- Trigger a new deployment via Git push
- Or use "Trigger deploy" in Netlify dashboard

## Build Settings

Ensure your Netlify build settings are:
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: 18 or higher

### Secrets Scanning Configuration

The `netlify.toml` file includes configuration to prevent build failures from secrets scanning:

```toml
[build.environment]
  SECRETS_SCAN_OMIT_KEYS = "VITE_GOOGLE_CLIENT_ID,VITE_RAPID_API_KEY,VITE_SUPABASE_URL,VITE_SUPABASE_ANON_KEY,NETLIFY_DATABASE_URL,NETLIFY_DATABASE_URL_UNPOOLED,NODE_VERSION"
```

This tells Netlify that these environment variables are expected and should not trigger build failures.

## Troubleshooting

### OAuth Not Working
- Verify environment variables are set in Netlify
- Check Google OAuth authorized domains include your Netlify URL
- Ensure HTTPS is used in production

### API Issues
- Verify `VITE_RAPID_API_KEY` is set correctly
- Check API quotas and limits
- The app falls back to mock data if APIs fail

### Build Failures
- Check Node.js version compatibility
- Verify all dependencies are in package.json
- Review build logs for specific errors

### Secrets Scanning Issues
If you get "Secrets scanning detected secrets in files during build":
- Verify `SECRETS_SCAN_OMIT_KEYS` is configured in `netlify.toml`
- Ensure environment variables are properly set in Netlify dashboard
- Check that no actual secret values are hardcoded in source files

## Security Notes

- Never commit `.env` files to Git
- Use Netlify's environment variables for production
- Regularly rotate API keys
- Monitor OAuth usage and quotas

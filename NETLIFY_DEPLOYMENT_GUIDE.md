# Netlify Deployment Guide

## Environment Variables Setup

After deploying to Netlify, you need to configure environment variables for OAuth and API access.

### 1. Configure Netlify Environment Variables

Go to your Netlify dashboard → Site Settings → Environment Variables and add:

```
VITE_GOOGLE_CLIENT_ID = 1051118537480-7k5qggkrdrv0gkevgersoeibohn3oo5r.apps.googleusercontent.com
VITE_RAPID_API_KEY = b88f193366msh54685e5876b1873p1d27b6jsnb71f9fd28d7c
```

> **Important**: Use the actual values from your `.env.local` file (not committed to Git for security).

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

## Security Notes

- Never commit `.env` files to Git
- Use Netlify's environment variables for production
- Regularly rotate API keys
- Monitor OAuth usage and quotas

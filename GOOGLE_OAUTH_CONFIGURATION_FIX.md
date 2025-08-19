# Google OAuth Configuration Fix Guide

## The Issue
Google OAuth is failing with "Cannot continue with Google.com - Something went wrong" error.

## Root Cause
The Google Client ID `1051118537480-7k5qggkrdrv0gkevgersoeibohn3oo5r.apps.googleusercontent.com` needs proper configuration in Google Cloud Console.

## Fix Steps

### 1. Access Google Cloud Console
1. Go to: https://console.developers.google.com/apis/credentials
2. Select the project containing your OAuth 2.0 Client ID

### 2. Configure OAuth 2.0 Client ID
1. Find the client ID: `1051118537480-7k5qggkrdrv0gkevgersoeibohn3oo5r.apps.googleusercontent.com`
2. Click the pencil/edit icon to edit it

### 3. Update Authorized JavaScript Origins
Add these origins:
```
http://localhost:5173
http://localhost:3000
https://your-production-domain.com
https://your-netlify-app.netlify.app
```

### 4. Update Authorized Redirect URIs
Add these redirect URIs:
```
http://localhost:5173
http://localhost:5173/auth/callback
http://localhost:3000
http://localhost:3000/auth/callback
https://your-production-domain.com
https://your-production-domain.com/auth/callback
https://your-netlify-app.netlify.app
https://your-netlify-app.netlify.app/auth/callback
```

### 5. Configure OAuth Consent Screen
1. Go to OAuth consent screen in the left sidebar
2. Make sure the app is configured with:
   - App name: "Investimate"
   - User support email: your email
   - Developer contact information: your email
3. Add these scopes:
   - `email`
   - `profile` 
   - `openid`

### 6. Enable Required APIs
Make sure these APIs are enabled:
1. Google+ API (legacy) or Google People API
2. Google Identity and Access Management (IAM) API

### 7. Test Domains
If testing on localhost, make sure you're accessing exactly:
- `http://localhost:5173` (not 127.0.0.1 or other variations)

## Environment Variables Check
Make sure your `.env.local` has:
```
VITE_GOOGLE_CLIENT_ID=1051118537480-7k5qggkrdrv0gkevgersoeibohn3oo5r.apps.googleusercontent.com
```

## Common Issues
1. **Mixed origins**: Using localhost vs 127.0.0.1 inconsistently
2. **Missing redirect URIs**: Not including the base domain
3. **Consent screen**: Not configured or in testing mode with no test users
4. **API not enabled**: Google Identity APIs not activated

## Quick Test
After making changes:
1. Wait 5-10 minutes for Google's changes to propagate
2. Clear browser cache/cookies for accounts.google.com
3. Test the OAuth flow again

## Production Deployment
When deploying to production:
1. Add your production domain to authorized origins
2. Add production redirect URIs
3. Update OAuth consent screen with production domain
4. Consider moving from testing to production mode (if you have >100 users)

# OAuth Setup Guide

This guide will help you configure Google OAuth and Apple Sign In for your Rental Cash Flow Calculator application.

## Environment Variables

Create a `.env` file in your project root and add the following variables:

```env
# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here

# Apple Sign In Configuration  
VITE_APPLE_CLIENT_ID=your_apple_service_id_here
VITE_APPLE_REDIRECT_URI=http://localhost:5173/auth/apple/callback
```

## Google OAuth Setup

1. **Go to Google Cloud Console**
   - Visit https://console.cloud.google.com/
   - Create a new project or select an existing one

2. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Add authorized origins:
     - `http://localhost:5173` (for development)
     - `https://yourdomain.com` (for production)
   - Copy the Client ID to your `.env` file

4. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" > "OAuth consent screen"
   - Fill in required information
   - Add scopes: `email`, `profile`

## Apple Sign In Setup

1. **Apple Developer Account Required**
   - You need an Apple Developer account ($99/year)
   - Visit https://developer.apple.com/

2. **Create App ID**
   - Go to "Certificates, Identifiers & Profiles"
   - Create a new App ID
   - Enable "Sign In with Apple" capability

3. **Create Service ID**
   - Create a new Services ID
   - This will be your `VITE_APPLE_CLIENT_ID`
   - Configure domains and redirect URLs:
     - Domain: `localhost` (for development) or your domain
     - Redirect URL: `http://localhost:5173/auth/apple/callback`

4. **Create Private Key**
   - Create a new key with "Sign In with Apple" enabled
   - Download the private key file (you'll need this for backend integration)

## Testing OAuth Integration

1. **Development Testing**
   ```bash
   # Start the development server
   npm run dev
   
   # Navigate to login/signup pages
   # Click "Continue with Google" or "Continue with Apple"
   ```

2. **Verify Configuration**
   - Check browser console for any OAuth errors
   - Ensure all redirect URLs match exactly
   - Test both login and signup flows

## Production Deployment

1. **Update Environment Variables**
   - Set production domain in OAuth configurations
   - Update redirect URLs to production URLs

2. **Security Considerations**
   - Use HTTPS in production
   - Validate OAuth tokens on your backend
   - Implement proper session management

## Troubleshooting

### Common Issues

1. **"OAuth client not found" error**
   - Check that `VITE_GOOGLE_CLIENT_ID` is correctly set
   - Verify the client ID in Google Cloud Console

2. **"Redirect URI mismatch" error**
   - Ensure redirect URLs match exactly in OAuth configuration
   - Check for trailing slashes and protocol (http vs https)

3. **Apple Sign In popup blocked**
   - Ensure popup blockers are disabled
   - Check that Apple Service ID is configured correctly

### Debug Mode

Add this to enable detailed OAuth logging:

```javascript
// In your component
console.log('Google configured:', oauthService.isGoogleConfigured());
console.log('Apple configured:', oauthService.isAppleConfigured());
```

## Backend Integration (Optional)

For production applications, consider implementing:

1. **Token Validation**
   - Verify OAuth tokens on your backend
   - Exchange tokens for session cookies

2. **User Data Synchronization**
   - Store OAuth user data in your database
   - Handle profile updates and account linking

3. **Security Headers**
   - Implement CSRF protection
   - Add proper CORS configuration

## Support

If you encounter issues:

1. Check the browser console for detailed error messages
2. Verify all configuration steps were completed
3. Test with a fresh incognito/private browser window
4. Ensure all environment variables are properly set

For production deployment, consider using a more robust authentication solution like Firebase Auth, Auth0, or Supabase Auth which handle OAuth complexity for you.

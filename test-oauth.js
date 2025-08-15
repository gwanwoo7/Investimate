/**
 * Quick OAuth Test Script
 * Run this in browser console to test OAuth configuration
 */

// Test Google OAuth Configuration
console.log('🧪 Testing Google OAuth Configuration...');

// Check environment variables
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
console.log('Google Client ID:', googleClientId ? '✅ Configured' : '❌ Missing');
console.log('Client ID Value:', googleClientId);

// Test OAuth Service
import('../services/oauthService.js').then((module) => {
  const OAuthService = module.default;
  const oauthService = OAuthService.getInstance();
  
  console.log('OAuth Service Tests:');
  console.log('- Google Configured:', oauthService.isGoogleConfigured() ? '✅ Yes' : '❌ No');
  console.log('- Apple Configured:', oauthService.isAppleConfigured() ? '✅ Yes' : '❌ No');
  
  if (oauthService.isGoogleConfigured()) {
    console.log('🎉 Google OAuth is ready to test!');
    console.log('💡 Go to login/signup page and click "Continue with Google"');
  } else {
    console.log('❌ Google OAuth not configured properly');
  }
}).catch(err => {
  console.error('Error loading OAuth service:', err);
});

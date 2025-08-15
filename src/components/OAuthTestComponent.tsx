/**
 * OAuth Integration Test Component
 * This component helps test OAuth functionality
 */

import { useState } from 'react';
import { Box, Button, Typography, Alert, Card, CardContent } from '@mui/material';
import OAuthService from '../services/oauthService';

export default function OAuthTestComponent() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const oauthService = OAuthService.getInstance();

  const testGoogleOAuth = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      if (!oauthService.isGoogleConfigured()) {
        setMessage('❌ Google OAuth not configured. Add VITE_GOOGLE_CLIENT_ID to your .env file.');
        return;
      }
      
      setMessage('🔄 Testing Google OAuth...');
      const user = await oauthService.signInWithGoogle();
      setMessage(`✅ Google OAuth Success! User: ${user.name} (${user.email})`);
    } catch (error) {
      setMessage(`❌ Google OAuth Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testAppleOAuth = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      if (!oauthService.isAppleConfigured()) {
        setMessage('❌ Apple Sign In not configured. Add VITE_APPLE_CLIENT_ID to your .env file.');
        return;
      }
      
      setMessage('🔄 Testing Apple Sign In...');
      const user = await oauthService.signInWithApple();
      setMessage(`✅ Apple Sign In Success! User: ${user.name} (${user.email})`);
    } catch (error) {
      setMessage(`❌ Apple Sign In Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          🧪 OAuth Integration Test
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Use this component to test OAuth integration. Make sure you have configured your environment variables.
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Configuration Status:
          </Typography>
          <Typography color={oauthService.isGoogleConfigured() ? 'success.main' : 'error.main'}>
            Google OAuth: {oauthService.isGoogleConfigured() ? '✅ Configured' : '❌ Not Configured'}
          </Typography>
          <Typography color={oauthService.isAppleConfigured() ? 'success.main' : 'error.main'}>
            Apple Sign In: {oauthService.isAppleConfigured() ? '✅ Configured' : '❌ Not Configured'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant="outlined"
            onClick={testGoogleOAuth}
            disabled={loading}
            startIcon={<span>🔍</span>}
          >
            Test Google OAuth
          </Button>
          
          <Button
            variant="outlined"
            onClick={testAppleOAuth}
            disabled={loading}
            startIcon={<span>🍎</span>}
          >
            Test Apple Sign In
          </Button>
        </Box>

        {message && (
          <Alert 
            severity={message.includes('✅') ? 'success' : message.includes('❌') ? 'error' : 'info'}
            sx={{ mt: 2 }}
          >
            {message}
          </Alert>
        )}

        <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.secondary' }}>
          💡 Need help? Check the OAUTH_SETUP_GUIDE.md file for detailed setup instructions.
        </Typography>
      </CardContent>
    </Card>
  );
}

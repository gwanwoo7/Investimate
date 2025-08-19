import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Alert, Button } from '@mui/material';
import OAuthService from '../services/oauthService';

const OAuthDebug: React.FC = () => {
  const [envVars, setEnvVars] = useState({
    googleClientId: '',
    supabaseUrl: '',
    supabaseKey: '',
  });
  const [oauthStatus, setOauthStatus] = useState({
    googleConfigured: false,
    appleConfigured: false,
  });
  const [testResult, setTestResult] = useState<string>('');

  useEffect(() => {
    // Check environment variables
    setEnvVars({
      googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'Not set',
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'Not set',
      supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'Not set',
    });

    // Check OAuth service configuration
    const oauthService = OAuthService.getInstance();
    setOauthStatus({
      googleConfigured: oauthService.isGoogleConfigured(),
      appleConfigured: oauthService.isAppleConfigured(),
    });
  }, []);

  const testGoogleAuth = async () => {
    setTestResult('Testing Google OAuth...');
    try {
      const oauthService = OAuthService.getInstance();
      if (!oauthService.isGoogleConfigured()) {
        setTestResult('❌ Google OAuth not configured - missing VITE_GOOGLE_CLIENT_ID');
        return;
      }
      
      const user = await oauthService.signInWithGoogle();
      setTestResult(`✅ Google OAuth test successful: ${user.email}`);
    } catch (error) {
      setTestResult(`❌ Google OAuth test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        OAuth Debug Console
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Environment Variables
        </Typography>
        <Typography variant="body2">
          VITE_GOOGLE_CLIENT_ID: {envVars.googleClientId}
        </Typography>
        <Typography variant="body2">
          VITE_SUPABASE_URL: {envVars.supabaseUrl}
        </Typography>
        <Typography variant="body2">
          VITE_SUPABASE_ANON_KEY: {envVars.supabaseKey ? `${envVars.supabaseKey.substring(0, 20)}...` : 'Not set'}
        </Typography>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          OAuth Service Status
        </Typography>
        <Alert severity={oauthStatus.googleConfigured ? 'success' : 'error'} sx={{ mb: 1 }}>
          Google OAuth: {oauthStatus.googleConfigured ? 'Configured' : 'Not Configured'}
        </Alert>
        <Alert severity={oauthStatus.appleConfigured ? 'success' : 'warning'} sx={{ mb: 1 }}>
          Apple OAuth: {oauthStatus.appleConfigured ? 'Configured' : 'Not Configured'}
        </Alert>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          OAuth Test
        </Typography>
        <Button 
          variant="contained" 
          onClick={testGoogleAuth}
          disabled={!oauthStatus.googleConfigured}
          sx={{ mb: 2 }}
        >
          Test Google OAuth
        </Button>
        {testResult && (
          <Alert 
            severity={testResult.includes('✅') ? 'success' : 'error'} 
            sx={{ mt: 2 }}
          >
            {testResult}
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default OAuthDebug;

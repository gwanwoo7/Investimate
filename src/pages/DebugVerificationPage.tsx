import React from 'react';
import { Box, Typography, Paper, Alert } from '@mui/material';

const DebugVerificationPage: React.FC = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const email = urlParams.get('email');
  const autoSignin = urlParams.get('auto_signin');

  console.log('🔍 Debug - URL Parameters:', {
    token: token ? 'present' : 'missing',
    email,
    autoSignin,
    fullUrl: window.location.href
  });

  // Try to decode the token
  let tokenData = null;
  let tokenError = null;
  
  if (token) {
    try {
      tokenData = JSON.parse(atob(token));
      console.log('🔓 Debug - Decoded token:', tokenData);
    } catch (error) {
      tokenError = error;
      console.error('❌ Debug - Token decode error:', error);
    }
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f5f5f5'
      }}
    >
      <Paper sx={{ p: 4, maxWidth: 600, width: '100%' }}>
        <Typography variant="h4" gutterBottom color="primary">
          🔍 Debug Email Verification
        </Typography>
        
        <Typography variant="h6" gutterBottom>
          URL Parameters:
        </Typography>
        
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Current URL:</strong><br />
            {window.location.href}
          </Typography>
        </Alert>

        <Alert severity={token ? 'success' : 'error'} sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Token:</strong> {token ? 'Present ✅' : 'Missing ❌'}<br />
            {token && <span>Length: {token.length} characters</span>}
          </Typography>
        </Alert>

        <Alert severity={email ? 'success' : 'error'} sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Email:</strong> {email || 'Missing ❌'}
          </Typography>
        </Alert>

        <Alert severity={autoSignin ? 'success' : 'error'} sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Auto Signin:</strong> {autoSignin || 'Missing ❌'}
          </Typography>
        </Alert>

        {tokenData && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Decoded Token Data:</strong><br />
              <pre style={{ margin: 0, fontSize: '12px' }}>
                {JSON.stringify(tokenData, null, 2)}
              </pre>
            </Typography>
          </Alert>
        )}

        {tokenError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Token Decode Error:</strong><br />
              {tokenError.toString()}
            </Typography>
          </Alert>
        )}

        <Alert severity="warning">
          <Typography variant="body2">
            <strong>Expected Behavior:</strong><br />
            If all parameters are present and token is valid, auto-signin should work.
            Check browser console for detailed logs.
          </Typography>
        </Alert>
      </Paper>
    </Box>
  );
};

export default DebugVerificationPage;

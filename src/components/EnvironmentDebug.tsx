import React from 'react';
import { Box, Typography, Paper, Alert } from '@mui/material';

/**
 * Environment Debug Component
 * Shows the status of environment variables in production
 * Remove this component after confirming OAuth works
 */
export default function EnvironmentDebug() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const rapidApiKey = import.meta.env.VITE_RAPID_API_KEY;
  
  return (
    <Paper sx={{ p: 2, m: 2, bgcolor: 'background.paper' }}>
      <Typography variant="h6" gutterBottom>
        🔧 Environment Debug (Remove in Production)
      </Typography>
      
      <Alert severity={googleClientId ? "success" : "error"} sx={{ mb: 1 }}>
        <Typography variant="body2">
          <strong>Google OAuth:</strong> {googleClientId ? "✅ Configured" : "❌ Not configured"}
          {googleClientId && (
            <Box component="span" sx={{ fontSize: '0.8em', opacity: 0.7, ml: 1 }}>
              (ID: {googleClientId.substring(0, 20)}...)
            </Box>
          )}
        </Typography>
      </Alert>
      
      <Alert severity={rapidApiKey ? "success" : "warning"} sx={{ mb: 1 }}>
        <Typography variant="body2">
          <strong>Rapid API Key:</strong> {rapidApiKey ? "✅ Configured" : "⚠️ Not configured (will use mock data)"}
        </Typography>
      </Alert>
      
      <Typography variant="caption" color="text.secondary">
        Environment: {import.meta.env.MODE} | 
        URL: {window.location.origin}
      </Typography>
    </Paper>
  );
}

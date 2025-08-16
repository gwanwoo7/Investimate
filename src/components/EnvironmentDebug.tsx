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
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  
  return (
    <Paper sx={{ p: 2, m: 2, bgcolor: 'background.paper' }}>
      <Typography variant="h6" gutterBottom>
        🔧 Environment Debug (Remove in Production)
      </Typography>
      
      <Alert severity={supabaseUrl && supabaseAnonKey ? "success" : "warning"} sx={{ mb: 1 }}>
        <Typography variant="body2">
          <strong>Supabase Auth:</strong> {supabaseUrl && supabaseAnonKey ? "✅ Configured (Recommended)" : "⚠️ Not configured"}
          {supabaseUrl && (
            <Box component="span" sx={{ fontSize: '0.8em', opacity: 0.7, ml: 1 }}>
              (URL: {supabaseUrl.substring(0, 30)}...)
            </Box>
          )}
        </Typography>
      </Alert>
      
      <Alert severity={googleClientId ? "success" : "warning"} sx={{ mb: 1 }}>
        <Typography variant="body2">
          <strong>Google OAuth (Legacy):</strong> {googleClientId ? "✅ Configured" : "⚠️ Not configured"}
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
      
      <Alert severity={stripeKey ? "success" : "warning"} sx={{ mb: 1 }}>
        <Typography variant="body2">
          <strong>Stripe Payment:</strong> {stripeKey ? "✅ Configured" : "⚠️ Not configured"}
          {stripeKey && (
            <Box component="span" sx={{ fontSize: '0.8em', opacity: 0.7, ml: 1 }}>
              ({stripeKey.substring(0, 12)}...)
            </Box>
          )}
        </Typography>
      </Alert>
      
      <Typography variant="caption" color="text.secondary">
        Environment: {import.meta.env.MODE} | 
        URL: {window.location.origin}
      </Typography>
      
      {!supabaseUrl && (
        <Box sx={{ mt: 2, p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant="caption" color="info.main">
            💡 <strong>Quick Setup:</strong> Create a free Supabase account at supabase.com, get your Project URL and API key, 
            then add them to your .env.local file. See SUPABASE_SETUP_COMPLETE.md for step-by-step instructions.
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

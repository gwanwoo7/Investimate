import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const EnvDebug: React.FC = () => {
  const envVars = {
    VITE_RESEND_API_KEY: import.meta.env.VITE_RESEND_API_KEY,
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    VITE_GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    VITE_GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    VITE_STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Environment Variables Debug
      </Typography>
      <Paper sx={{ p: 2 }}>
        {Object.entries(envVars).map(([key, value]) => (
          <Typography key={key} variant="body2" sx={{ mb: 1 }}>
            <strong>{key}:</strong> {value ? '✅ Set' : '❌ Missing'} 
            {key === 'VITE_RESEND_API_KEY' && value && (
              <span> (starts with: {value.substring(0, 5)}...)</span>
            )}
          </Typography>
        ))}
      </Paper>
    </Box>
  );
};

export default EnvDebug;

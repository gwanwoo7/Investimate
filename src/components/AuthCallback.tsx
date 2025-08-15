import { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import SupabaseAuthService from '../services/supabaseAuthService';

interface AuthCallbackProps {
  onAuthComplete: (email: string) => void;
}

export default function AuthCallback({ onAuthComplete }: AuthCallbackProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const supabaseAuth = SupabaseAuthService.getInstance();
        
        if (!supabaseAuth.isConfigured()) {
          setStatus('error');
          setMessage('Authentication service not configured');
          return;
        }

        // Get the current user after OAuth redirect
        const { user, error } = await supabaseAuth.getCurrentUser();
        
        if (error) {
          setStatus('error');
          setMessage(error);
          return;
        }

        if (user) {
          setStatus('success');
          setMessage('Authentication successful! Redirecting...');
          
          // Wait a moment then complete auth
          setTimeout(() => {
            onAuthComplete(user.email);
          }, 1500);
        } else {
          setStatus('error');
          setMessage('No user data received from authentication');
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setStatus('error');
        setMessage('Authentication failed. Please try again.');
      }
    };

    handleAuthCallback();
  }, [onAuthComplete]);

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: '#f8fafc',
      p: 3
    }}>
      <Box sx={{
        textAlign: 'center',
        bgcolor: 'white',
        p: 4,
        borderRadius: 3,
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        maxWidth: 400
      }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          🏡 Investimate
        </Typography>
        
        {status === 'loading' && (
          <>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              {message}
            </Typography>
          </>
        )}

        {status === 'success' && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        {status === 'error' && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}
      </Box>
    </Box>
  );
}

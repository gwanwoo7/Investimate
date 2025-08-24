import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  Button,
  CircularProgress,
  Container,
  Paper
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import SupabaseAuthService from '../services/supabaseAuthService';

const EmailVerificationPage: React.FC = () => {
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const authService = SupabaseAuthService.getInstance();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get the current user to check verification status
        const { user, error } = await authService.getCurrentUser();
        
        if (error) {
          setError(error);
          setVerificationStatus('error');
          return;
        }

        if (user && user.emailVerified) {
          setVerificationStatus('success');
          
          // Redirect to home after 3 seconds
          setTimeout(() => {
            window.location.href = '/';
          }, 3000);
        } else {
          setError('Email verification incomplete. Please check your email and click the verification link.');
          setVerificationStatus('error');
        }
      } catch (err) {
        setError('An unexpected error occurred during verification.');
        setVerificationStatus('error');
      }
    };

    // Check verification status when component mounts
    verifyEmail();
  }, [authService]);

  const handleGoHome = () => {
    window.location.href = '/';
  };

  if (verificationStatus === 'loading') {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
          <CircularProgress size={60} sx={{ mb: 3, color: 'primary.main' }} />
          <Typography variant="h5" sx={{ mb: 2 }}>
            Verifying your email...
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Please wait while we confirm your email verification.
          </Typography>
        </Paper>
      </Container>
    );
  }

  if (verificationStatus === 'success') {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: 3 
          }}>
            <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main' }} />
            
            <Typography variant="h4" fontWeight="bold" color="success.main">
              Email Verified!
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
              Your email has been successfully verified. You now have full access to Investimate.
            </Typography>

            <Alert severity="success" sx={{ width: '100%' }}>
              Welcome to Investimate! You can now access all features including property analysis, 
              investment calculations, and membership benefits.
            </Alert>

            <Typography variant="body2" color="text.secondary">
              Redirecting you to the home page in a few seconds...
            </Typography>

            <Button
              variant="contained"
              onClick={handleGoHome}
              startIcon={<HomeIcon />}
              sx={{ mt: 2, minWidth: 200 }}
            >
              Go to Dashboard
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: 3 
        }}>
          <ErrorIcon sx={{ fontSize: 80, color: 'error.main' }} />
          
          <Typography variant="h4" fontWeight="bold" color="error.main">
            Verification Failed
          </Typography>
          
          <Alert severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>

          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            If you continue to have issues, please contact our support team.
          </Typography>

          <Button
            variant="contained"
            onClick={handleGoHome}
            startIcon={<HomeIcon />}
            sx={{ mt: 2, minWidth: 200 }}
          >
            Return to Home
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default EmailVerificationPage;

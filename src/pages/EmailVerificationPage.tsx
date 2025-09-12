import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  Container
} from '@mui/material';
import {
  CheckCircle,
  Error as ErrorIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import supabaseAuthService from '../services/supabaseAuthService';
import { membershipService } from '../services/SecureMembershipService';
import DatabaseService from '../services/databaseService';

const EmailVerificationPage: React.FC = () => {
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        setIsVerifying(true);
        
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token');
        const type = urlParams.get('type');
        
        console.log('🔍 Email verification started:', { type, hasAccessToken: !!accessToken });
        
        if (type === 'email_confirmation' && accessToken && refreshToken) {
          // Use Supabase token-based verification
          const authService = supabaseAuthService.getInstance();
          const result = await authService.verifyEmailWithTokens(accessToken, refreshToken);
          
          if (result.user) {
            setUserEmail(result.user.email || 'Unknown');
            setVerificationStatus('success');
            setMessage('Email verified successfully! You are now signed in.');
            
            // Sync with local database - check if user exists, if not create
            const dbService = DatabaseService.getInstance();
            const existingUser = await dbService.getUserByEmail(result.user.email || '');
            
            if (!existingUser && result.user.email) {
              await dbService.createUser(
                result.user.email,
                '', // No password for OAuth/email verified users
                result.user.name || result.user.email.split('@')[0],
                false, // Not subscribed by default
                true   // Email is verified
              );
            }
            
            // Check membership status
            await membershipService.checkSubscriptionStatus();
            
            console.log('✅ Email verification completed successfully');
            
            // Redirect to home after 3 seconds
            setTimeout(() => {
              window.location.href = '/';
            }, 3000);
            
          } else {
            throw new Error(result.error || 'Verification failed');
          }
        } else {
          // Fallback for other verification types or missing tokens
          console.warn('⚠️ Missing verification parameters or unsupported type');
          setVerificationStatus('error');
          setMessage('Invalid verification link. Please check your email for a new verification link.');
        }
        
      } catch (error) {
        console.error('❌ Email verification failed:', error);
        setVerificationStatus('error');
        setMessage(error instanceof Error ? error.message : 'Email verification failed. Please try again.');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, []);

  const handleReturnHome = () => {
    window.location.href = '/';
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Card elevation={3}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Box sx={{ mb: 3 }}>
            {verificationStatus === 'loading' && (
              <>
                <CircularProgress size={60} sx={{ mb: 2 }} />
                <EmailIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              </>
            )}
            {verificationStatus === 'success' && (
              <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            )}
            {verificationStatus === 'error' && (
              <ErrorIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
            )}
          </Box>

          <Typography variant="h4" gutterBottom>
            {verificationStatus === 'loading' && 'Verifying Email...'}
            {verificationStatus === 'success' && 'Email Verified!'}
            {verificationStatus === 'error' && 'Verification Failed'}
          </Typography>

          {verificationStatus === 'loading' && (
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Please wait while we verify your email address...
            </Typography>
          )}

          {verificationStatus === 'success' && (
            <>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Welcome to Investimate! Your email {userEmail} has been successfully verified.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                You will be redirected to the home page in a few seconds...
              </Typography>
            </>
          )}

          {message && (
            <Alert 
              severity={verificationStatus === 'success' ? 'success' : 'error'} 
              sx={{ mb: 3, textAlign: 'left' }}
            >
              {message}
            </Alert>
          )}

          {!isVerifying && (
            <Button
              variant="contained"
              onClick={handleReturnHome}
              sx={{ mt: 2 }}
            >
              {verificationStatus === 'success' ? 'Continue to Investimate' : 'Return to Home'}
            </Button>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default EmailVerificationPage;

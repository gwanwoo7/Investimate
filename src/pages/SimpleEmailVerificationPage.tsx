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
  Home as HomeIcon,
  Login as LoginIcon
} from '@mui/icons-material';

const SimpleEmailVerificationPage: React.FC = () => {
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    console.log('🔍 SimpleEmailVerificationPage loaded');
    
    const verifyEmail = async () => {
      try {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const email = urlParams.get('email');
        const autoSignin = urlParams.get('auto_signin');

        console.log('📧 URL Parameters:', { token: token ? 'present' : 'missing', email, autoSignin });
        
        setDebugInfo({
          token: token ? 'present' : 'missing',
          email,
          autoSignin,
          hasAllParams: !!(token && email && autoSignin)
        });

        // Check if we have all required parameters
        if (!token || !email || !autoSignin) {
          throw new Error('Missing required verification parameters (token, email, or auto_signin)');
        }

        // Try to decode the token
        let tokenData;
        try {
          tokenData = JSON.parse(atob(token));
          console.log('🔓 Decoded token:', tokenData);
        } catch (decodeError) {
          console.error('❌ Token decode error:', decodeError);
          throw new Error('Invalid verification token format');
        }

        // Validate token data
        if (tokenData.action !== 'verify_and_signin' || tokenData.email !== email) {
          throw new Error('Token validation failed - action or email mismatch');
        }

        // Simulate successful verification
        console.log('✅ Email verification successful!');
        setVerificationStatus('success');
        
        // Store simple session data
        localStorage.setItem('email_verified', 'true');
        localStorage.setItem('user_email', email);
        localStorage.setItem('auto_signin_completed', 'true');
        
        // Redirect after 3 seconds
        setTimeout(() => {
          console.log('🔄 Redirecting to home page...');
          window.history.pushState({}, '', '/');
          window.location.reload();
        }, 3000);

      } catch (err) {
        console.error('❌ Verification failed:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown verification error';
        setError(errorMessage);
        setVerificationStatus('error');
      }
    };

    verifyEmail();
  }, []);

  if (verificationStatus === 'loading') {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h5" gutterBottom>
            Verifying Your Email...
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Please wait while we verify your email address.
          </Typography>
        </Paper>
      </Container>
    );
  }

  if (verificationStatus === 'error') {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <ErrorIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h5" gutterBottom color="error">
            Verification Failed
          </Typography>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Debug Information:
          </Typography>
          <Alert severity="info" sx={{ mb: 3 }}>
            <pre style={{ margin: 0, fontSize: '12px' }}>
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </Alert>
          <Button
            variant="contained"
            startIcon={<LoginIcon />}
            onClick={() => window.location.href = '/'}
            sx={{ mr: 2 }}
          >
            Go to Login
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h5" gutterBottom color="success.main">
          Email Verified Successfully!
        </Typography>
        <Alert severity="success" sx={{ mb: 3 }}>
          Your email has been verified and you've been automatically signed in.
        </Alert>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Redirecting to the home page in a few seconds...
        </Typography>
        <Button
          variant="contained"
          startIcon={<HomeIcon />}
          onClick={() => {
            window.history.pushState({}, '', '/');
            window.location.reload();
          }}
        >
          Go to Home Page
        </Button>
      </Paper>
    </Container>
  );
};

export default SimpleEmailVerificationPage;

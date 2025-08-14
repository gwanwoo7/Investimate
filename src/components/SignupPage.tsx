import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Container,
  Alert,
  Divider
} from '@mui/material';

interface SignupPageProps {
  onSignup: (email: string) => void;
  onClose: () => void;
  onLogin: () => void;
}

export default function SignupPage({ onSignup, onClose: _onClose, onLogin }: SignupPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Simple validation - in real app, this would connect to authentication service
    if (email.includes('@')) {
      onSignup(email);
    } else {
      setError('Please enter a valid email address');
    }
  };

  const handleGoogleSignup = async () => {
    try {
      // In production, use Google OAuth 2.0 with secure token handling
      // Example: Google Identity Services (GIS) with proper CSRF protection
      // const credential = await google.accounts.oauth2.requestAccessToken({
      //   client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      //   scope: 'email profile',
      //   state: generateCSRFToken() // CSRF protection
      // });
      
      // Secure token verification on backend required
      console.log('🔐 Google OAuth signup initiated (secure API integration required)');
      onSignup('user@gmail.com');
    } catch (error) {
      setError('Google signup failed. Please try again.');
      console.error('Google signup error:', error);
    }
  };

  const handleAppleSignup = async () => {
    try {
      // In production, use Apple Sign In with secure server-side verification
      // Example: Sign In with Apple with backend JWT verification
      // const response = await AppleID.auth.signIn({
      //   clientId: process.env.REACT_APP_APPLE_CLIENT_ID,
      //   redirectURI: process.env.REACT_APP_APPLE_REDIRECT_URI,
      //   scope: 'name email',
      //   responseType: 'code id_token',
      //   responseMode: 'fragment',
      //   nonce: generateSecureNonce() // Security nonce
      // });
      
      // Server-side JWT verification required for security
      console.log('🍎 Apple Sign In signup initiated (secure API integration required)');
      onSignup('user@icloud.com');
    } catch (error) {
      setError('Apple signup failed. Please try again.');
      console.error('Apple signup error:', error);
    }
  };

  return (
    <Box sx={{ 
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      py: { xs: 4, md: 8 }
    }}>
      <Container maxWidth="sm">
        <Card sx={{ maxWidth: 400, mx: 'auto' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Join Investimate
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
            Create your account to start analyzing properties
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Social Sign Up */}
          <Box sx={{ mb: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={handleGoogleSignup}
              sx={{ 
                mb: 1, 
                textTransform: 'none',
                bgcolor: 'white',
                color: 'text.primary',
                borderColor: 'grey.300',
                '&:hover': {
                  bgcolor: 'grey.50',
                  borderColor: 'grey.400'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ fontSize: '20px' }}>🔵</Box>
                Sign up with Google
              </Box>
            </Button>
            
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={handleAppleSignup}
              sx={{ 
                textTransform: 'none',
                bgcolor: 'black',
                color: 'white',
                borderColor: 'black',
                '&:hover': {
                  bgcolor: 'grey.800',
                  borderColor: 'grey.800'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ fontSize: '20px' }}>🍎</Box>
                Sign up with Apple
              </Box>
            </Button>
          </Box>

          <Divider sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Or sign up with email
            </Typography>
          </Divider>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={{ mb: 3 }}
              required
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mb: 2 }}
            >
              Create Account
            </Button>
            
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Button onClick={onLogin} sx={{ textTransform: 'none', p: 0, minWidth: 0 }}>
                  Sign in here
                </Button>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
      </Container>
    </Box>
  );
}

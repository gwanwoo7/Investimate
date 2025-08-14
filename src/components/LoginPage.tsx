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

interface LoginPageProps {
  onLogin: (email: string) => void;
  onClose: () => void;
  onSignup: () => void;
}

export default function LoginPage({ onLogin, onClose: _onClose, onSignup }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    // Simple validation - in real app, this would connect to authentication service
    if (email.includes('@')) {
      onLogin(email);
    } else {
      setError('Please enter a valid email address');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // In production, use Google OAuth 2.0 with secure token handling
      // Example: Google Identity Services (GIS) or Firebase Auth
      // const credential = await google.accounts.oauth2.requestAccessToken({
      //   client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      //   scope: 'email profile'
      // });
      
      // For demo purposes, simulate successful authentication
      console.log('🔐 Google OAuth authentication initiated (secure API integration required)');
      onLogin('user@gmail.com');
    } catch (error) {
      setError('Google authentication failed. Please try again.');
      console.error('Google auth error:', error);
    }
  };

  const handleAppleLogin = async () => {
    try {
      // In production, use Apple Sign In with secure token verification
      // Example: Sign In with Apple JS SDK
      // const response = await AppleID.auth.signIn({
      //   clientId: process.env.REACT_APP_APPLE_CLIENT_ID,
      //   redirectURI: process.env.REACT_APP_APPLE_REDIRECT_URI,
      //   scope: 'name email',
      //   responseType: 'code id_token',
      //   responseMode: 'fragment'
      // });
      
      // For demo purposes, simulate successful authentication
      console.log('🍎 Apple Sign In authentication initiated (secure API integration required)');
      onLogin('user@icloud.com');
    } catch (error) {
      setError('Apple authentication failed. Please try again.');
      console.error('Apple auth error:', error);
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
            Welcome Back
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
            Sign in to your Investimate account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Social Login */}
          <Box sx={{ mb: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={handleGoogleLogin}
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
                Continue with Google
              </Box>
            </Button>
            
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={handleAppleLogin}
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
                Continue with Apple
              </Box>
            </Button>
          </Box>

          <Divider sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Or sign in with email
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
              Sign In
            </Button>
            
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Button onClick={onSignup} sx={{ textTransform: 'none', p: 0, minWidth: 0 }}>
                  Sign up here
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

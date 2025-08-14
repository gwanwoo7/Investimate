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
  Divider,
  CircularProgress
} from '@mui/material';
import DatabaseService from '../services/databaseService';

interface SignupPageProps {
  onSignup: (email: string) => void;
  onClose: () => void;
  onLogin: () => void;
}

export default function SignupPage({ onSignup, onClose: _onClose, onLogin }: SignupPageProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const db = DatabaseService.getInstance();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !name || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
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

    setLoading(true);
    setError('');

    try {
      const user = await db.createUser(email, password, name);
      db.setCurrentUser(user);
      onSignup(email);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Account creation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError('Google OAuth integration coming soon! Use the form below to create an account.');
  };

  const handleAppleSignup = async () => {
    setError('Apple Sign In integration coming soon! Use the form below to create an account.');
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
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ mb: 2 }}
              required
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
              required
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
              required
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={{ mb: 3 }}
              required
              disabled={loading}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Create Account'}
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

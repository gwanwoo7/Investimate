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

interface LoginPageProps {
  onLogin: (email: string) => void;
  onClose: () => void;
  onSignup: () => void;
}

export default function LoginPage({ onLogin, onClose: _onClose, onSignup }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const db = DatabaseService.getInstance();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await db.authenticateUser(email, password);
      db.setCurrentUser(user);
      onLogin(email);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      // Create a demo user if it doesn't exist
      try {
        await db.createUser('demo@investimate.com', 'demo123', 'Demo User');
      } catch {
        // User already exists, that's fine
      }
      
      const user = await db.authenticateUser('demo@investimate.com', 'demo123');
      db.setCurrentUser(user);
      onLogin('demo@investimate.com');
    } catch (err) {
      setError('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('Google OAuth integration coming soon! Use demo login below.');
  };

  const handleAppleLogin = async () => {
    setError('Apple Sign In integration coming soon! Use demo login below.');
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

            {/* Demo Login Button */}
            <Button
              fullWidth
              variant="contained"
              color="success"
              size="large"
              onClick={handleDemoLogin}
              disabled={loading}
              sx={{ mb: 3, textTransform: 'none' }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : '🚀 Demo Login'}
            </Button>

            <Divider sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Or create your own account
              </Typography>
            </Divider>

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
                disabled={loading}
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Sign In'}
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

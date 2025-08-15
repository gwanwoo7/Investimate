import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Divider,
  CircularProgress,
  Link,
  Paper,
  AppBar,
  Toolbar,
  Container
} from '@mui/material';
import DatabaseService from '../services/databaseService';
import OAuthService, { type OAuthUser } from '../services/oauthService';
import SupabaseAuthService, { type SignInData } from '../services/supabaseAuthService';
import EnvironmentDebug from './EnvironmentDebug';

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
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const db = DatabaseService.getInstance();
  const oauthService = OAuthService.getInstance();
  const supabaseAuth = SupabaseAuthService.getInstance();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Try Supabase Auth first (if configured)
      if (supabaseAuth.isConfigured()) {
        const { user, error: authError } = await supabaseAuth.signIn({ email, password });
        
        if (authError) {
          setError(authError);
          setLoading(false);
          return;
        }

        if (user) {
          onLogin(user.email);
          setLoading(false);
          return;
        }
      }

      // Fallback to legacy authentication
      const user = await db.authenticateUser(email, password);
      if (user) {
        db.setCurrentUser(user);
        onLogin(email);
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');

    try {
      // Create or get demo user
      const demoEmail = 'demo@investimate.com';
      let user;
      
      try {
        user = await db.authenticateUser(demoEmail, 'demo123');
      } catch {
        // User doesn't exist, create demo user
        user = await db.createUser(demoEmail, 'Demo User', 'demo123');
      }
      
      if (user) {
        db.setCurrentUser(user);
        onLogin(demoEmail);
      }
    } catch (err) {
      console.error('Demo login error:', err);
      setError('Demo login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      // Try Supabase OAuth first
      if (supabaseAuth.isConfigured()) {
        const { error: authError } = await supabaseAuth.signInWithGoogle();
        if (authError) {
          setError(authError);
          setLoading(false);
          return;
        }
        // OAuth will redirect, no need to continue
        return;
      }

      // Fallback to legacy OAuth
      if (!oauthService.isGoogleConfigured()) {
        setError('Google OAuth is not configured. Please contact support or use the demo login below.');
        setLoading(false);
        return;
      }

      const oauthUser: OAuthUser = await oauthService.signInWithGoogle();
      
      // Try to find existing user or create new one
      let user;
      try {
        user = await db.authenticateOAuthUser(oauthUser.provider, oauthUser.id, oauthUser.email);
      } catch {
        // User doesn't exist, create new one
        user = await db.createOAuthUser(oauthUser.email, oauthUser.name, oauthUser.provider, oauthUser.id, oauthUser.avatar);
      }
      
      db.setCurrentUser(user);
      onLogin(user.email);
    } catch (err) {
      console.error('Google login error:', err);
      setError(err instanceof Error ? err.message : 'Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      // Try Supabase OAuth first
      if (supabaseAuth.isConfigured()) {
        const { error: authError } = await supabaseAuth.signInWithApple();
        if (authError) {
          setError(authError);
          setLoading(false);
          return;
        }
        return;
      }

      // Fallback to legacy OAuth
      if (!oauthService.isAppleConfigured()) {
        setError('Apple Sign In is not configured. Please contact support or use the demo login below.');
        setLoading(false);
        return;
      }

      const oauthUser: OAuthUser = await oauthService.signInWithApple();
      
      let user;
      try {
        user = await db.authenticateOAuthUser(oauthUser.provider, oauthUser.id, oauthUser.email);
      } catch {
        user = await db.createOAuthUser(oauthUser.email, oauthUser.name, oauthUser.provider, oauthUser.id, oauthUser.avatar);
      }
      
      db.setCurrentUser(user);
      onLogin(user.email);
    } catch (err) {
      console.error('Apple login error:', err);
      setError(err instanceof Error ? err.message : 'Apple Sign In failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }

    if (supabaseAuth.isConfigured()) {
      setLoading(true);
      const { error } = await supabaseAuth.resetPassword(email);
      if (error) {
        setError(error);
      } else {
        setError('');
        setShowForgotPassword(true);
      }
      setLoading(false);
    } else {
      setError('Password reset is not available with demo authentication');
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#f8fafc'
    }}>
      {/* Environment Debug - Remove after OAuth is working */}
      <EnvironmentDebug />
      
      {/* Navigation Bar */}
      <AppBar 
        position="static" 
        elevation={1} 
        sx={{ 
          bgcolor: 'white', 
          color: 'text.primary', 
          height: 64,
          minHeight: 64,
          maxHeight: 64
        }}
      >
        <Container maxWidth={false} disableGutters>
          <Toolbar 
            sx={{ 
              justifyContent: 'space-between', 
              height: 64, 
              minHeight: '64px !important',
              maxHeight: '64px !important',
              paddingLeft: '24px !important',
              paddingRight: '24px !important',
              width: '100%'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography 
                variant="h5" 
                component="div" 
                sx={{ 
                  fontWeight: 'bold', 
                  color: 'primary.main',
                  cursor: 'pointer',
                  '&:hover': { color: 'primary.dark' },
                  lineHeight: 1,
                  height: 'auto'
                }}
                onClick={() => window.location.reload()}
              >
                🏡 Investimate
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: 64 }}>
              <Button 
                variant="outlined" 
                onClick={onSignup}
                sx={{ borderRadius: 2 }}
              >
                Sign Up
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Main content */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        p: 2
      }}>
        <Paper sx={{ 
          p: 4, 
          maxWidth: 400, 
          width: '100%',
          borderRadius: 3,
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
        }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ 
            textAlign: 'center', 
            fontWeight: 'bold',
            color: 'text.primary',
            mb: 3
          }}>
            Welcome Back
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {showForgotPassword && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Password reset email sent! Check your inbox.
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              autoComplete="email"
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              autoComplete="current-password"
              disabled={loading}
            />

            <Box sx={{ textAlign: 'right', mt: 1, mb: 2 }}>
              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={handleForgotPassword}
                disabled={loading}
                sx={{ textDecoration: 'none' }}
              >
                Forgot password?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ 
                mb: 2,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem'
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
          </form>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Or continue with
            </Typography>
          </Divider>

          {/* OAuth Buttons */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleGoogleLogin}
              disabled={loading}
              sx={{ 
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                color: '#db4437',
                borderColor: '#db4437',
                '&:hover': {
                  borderColor: '#c23321',
                  bgcolor: 'rgba(219, 68, 55, 0.04)'
                }
              }}
            >
              Google
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleAppleLogin}
              disabled={loading}
              sx={{ 
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                color: '#000',
                borderColor: '#000',
                '&:hover': {
                  borderColor: '#333',
                  bgcolor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              Apple
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Demo Login */}
          <Button
            fullWidth
            variant="text"
            onClick={handleDemoLogin}
            disabled={loading}
            sx={{ 
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              color: 'text.secondary',
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }}
          >
            🎭 Try Demo Account
          </Button>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={onSignup}
                sx={{ 
                  color: 'primary.main',
                  textDecoration: 'none',
                  fontWeight: 'medium'
                }}
              >
                Sign up
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

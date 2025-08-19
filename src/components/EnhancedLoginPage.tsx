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
  Container,
  InputAdornment,
  IconButton,
  Card,
  CardContent,
  useTheme,
  alpha
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Google,
  LoginOutlined
} from '@mui/icons-material';
import NavigationBar from './NavigationBar';
import DatabaseService from '../services/databaseService';
import OAuthService, { type OAuthUser } from '../services/oauthService';
import SupabaseAuthService, { type SignInData } from '../services/supabaseAuthService';

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
  const [showPassword, setShowPassword] = useState(false);

  const db = DatabaseService.getInstance();
  const oauthService = OAuthService.getInstance();
  const supabaseAuth = SupabaseAuthService.getInstance();
  const theme = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🔐 Attempting to login user:', email);
      
      // Direct authentication
      const user = await db.authenticateUser(email, password);
      console.log('✅ User authenticated:', user);
      
      // Set current user
      db.setCurrentUser(user);
      console.log('✅ Current user set');
      
      // Redirect to main app
      onLogin(user.email);
      
    } catch (err) {
      console.error('❌ Login error:', err);
      if (err instanceof Error) {
        if (err.message.includes('not found')) {
          setError('No account found with this email. Please sign up first.');
        } else if (err.message.includes('Invalid password')) {
          setError('Incorrect password. Please try again.');
        } else {
          setError(`Login failed: ${err.message}`);
        }
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

    const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      // Simplified Google OAuth
      if (!oauthService.isGoogleConfigured()) {
        setError('Google OAuth is not configured. Please use email login instead.');
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
      
      if (user) {
        db.setCurrentUser(user);
        onLogin(user.email);
      }
    } catch (err) {
      console.error('Google login error:', err);
      setError('Google login failed. Please use email login instead.');
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
      bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      
      {/* Navigation Bar */}
      <NavigationBar
        onSignupClick={onSignup}
        showNavButtons={false}
      />

      {/* Main content */}
      <Container maxWidth="sm" sx={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        py: 4
      }}>
        <Card sx={{ 
          width: '100%',
          maxWidth: 450,
          borderRadius: 4,
          boxShadow: theme.shadows[24],
          overflow: 'hidden'
        }}>
          {/* Header Section */}
          <Box sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            p: 4,
            textAlign: 'center'
          }}>
            <LoginOutlined sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
            <Typography variant="h4" component="h1" sx={{ 
              fontWeight: 'bold',
              mb: 1
            }}>
              Welcome Back
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Sign in to your Investimate account
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {showForgotPassword && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                Password reset email sent! Check your inbox.
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                autoComplete="email"
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
              
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                autoComplete="current-password"
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />

              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                mb: 3 
              }}>
                <Link
                  component="button"
                  type="button"
                  variant="body2"
                  onClick={handleForgotPassword}
                  disabled={loading}
                  sx={{ 
                    textDecoration: 'none',
                    color: 'primary.main',
                    fontWeight: 'medium',
                    '&:hover': { textDecoration: 'underline' }
                  }}
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
                  mb: 3,
                  py: 1.8,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  boxShadow: theme.shadows[8],
                  '&:hover': {
                    boxShadow: theme.shadows[12],
                  }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
              </Button>
            </form>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
                Or continue with
              </Typography>
            </Divider>

            {/* OAuth Buttons */}
            <Button
              fullWidth
              variant="outlined"
              onClick={handleGoogleLogin}
              disabled={loading}
              startIcon={<Google />}
              sx={{ 
                mb: 3,
                py: 1.5,
                borderRadius: 3,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 'medium',
                color: '#db4437',
                borderColor: '#db4437',
                '&:hover': {
                  borderColor: '#c23321',
                  bgcolor: alpha('#db4437', 0.04)
                }
              }}
            >
              Continue with Google
            </Button>

            <Box sx={{ textAlign: 'center', mt: 4 }}>
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
                    fontWeight: 'bold',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  Sign up here
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

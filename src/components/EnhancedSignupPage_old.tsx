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
  FormControlLabel,
  Checkbox,
  useTheme,
  alpha,
  LinearProgress
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Google,
  PersonAddOutlined,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import NavigationBar from './NavigationBar';
import DatabaseService from '../services/databaseService';
import OAuthService, { type OAuthUser } from '../services/oauthService';
import SupabaseAuthService, { type SignUpData } from '../services/supabaseAuthService';

interface SignupPageProps {
  onSignup: (email: string) => void;
  onClose: () => void;
  onLogin: () => void;
}

export default function SignupPage({ onSignup, onClose: _onClose, onLogin }: SignupPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const db = DatabaseService.getInstance();
  const oauthService = OAuthService.getInstance();
  const supabaseAuth = SupabaseAuthService.getInstance();
  const theme = useTheme();

  const checkPasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const handlePasswordChange = (newPassword: string) => {
    setPassword(newPassword);
    setPasswordStrength(checkPasswordStrength(newPassword));
  };

  const validateForm = () => {
      setError('Please fill in all fields');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (!agreeToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Check for duplicate email first (both Supabase and local)
      const existingUser = await db.getUserByEmail(email);
      if (existingUser) {
        setError('An account with this email already exists. Please use a different email or sign in.');
        setLoading(false);
        return;
      }

      // Try Supabase Auth first (if configured)
      if (supabaseAuth.isConfigured()) {
        const signUpData: SignUpData = { email, password, name };
        const { user, error: authError } = await supabaseAuth.signUp(signUpData);
        
        if (authError) {
          // Handle specific Supabase duplicate email errors
          if (authError.includes('already registered') || authError.includes('already exists')) {
            setError('An account with this email already exists. Please use a different email or sign in.');
          } else {
            setError(authError);
          }
          setLoading(false);
          return;
        }

        if (user) {
          if (!user.emailVerified) {
            setSuccess('Account created successfully! Please check your email and click the verification link to activate your account.');
          } else {
            onSignup(user.email);
          }
          setLoading(false);
          return;
        }
      }

      // Fallback to legacy authentication
      const user = await db.createUser(email, name, password);
      if (user) {
        db.setCurrentUser(user);
        setSuccess('Account created successfully! You can now sign in.');
        // Don't auto-login for better security - require email verification
        setTimeout(() => onLogin(), 2000);
      }
    } catch (err) {
      console.error('Signup error:', err);
      if (err instanceof Error && err.message.includes('already exists')) {
        setError('An account with this email already exists. Please use a different email or sign in.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError('');

    try {
      // Try Supabase OAuth first
      if (supabaseAuth.isConfigured()) {
        const { error: authError } = await supabaseAuth.signInWithGoogle();
        if (authError) {
          setError(`Google Sign-up failed: ${authError}`);
          setLoading(false);
          return;
        }
        // OAuth will redirect, no need to continue
        return;
      }

      // Fallback to legacy OAuth
      if (!oauthService.isGoogleConfigured()) {
        setError('Google OAuth is not configured. Please use the form below to create an account.');
        setLoading(false);
        return;
      }

      const oauthUser: OAuthUser = await oauthService.signInWithGoogle();
      
      // Check for existing user first
      const existingUser = await db.getUserByEmail(oauthUser.email);
      if (existingUser) {
        setError('An account with this email already exists. Please sign in instead.');
        setLoading(false);
        return;
      }
      
      // Create new user with OAuth info
      const user = await db.createOAuthUser(oauthUser.email, oauthUser.name, oauthUser.provider, oauthUser.id, oauthUser.avatar);
      
      db.setCurrentUser(user);
      onSignup(user.email);
    } catch (err) {
      console.error('Google signup error:', err);
      setError(err instanceof Error ? err.message : 'Google signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (supabaseAuth.isConfigured()) {
      setLoading(true);
      const { error } = await supabaseAuth.resendVerification(email);
      if (error) {
        setError(error);
      } else {
        setSuccess('Verification email sent! Check your inbox.');
      }
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#f8fafc'
    }}>
      
      {/* Navigation Bar */}
      <NavigationBar
        onLoginClick={onLogin}
        showNavButtons={false}
      />

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
            Create Account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert 
              severity="success" 
              sx={{ mb: 2 }}
              action={
                supabaseAuth.isConfigured() ? (
                  <Button 
                    color="inherit" 
                    size="small"
                    onClick={handleResendVerification}
                    disabled={loading}
                  >
                    Resend
                  </Button>
                ) : undefined
              }
            >
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              margin="normal"
              required
              autoComplete="name"
              disabled={loading}
            />
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
              autoComplete="new-password"
              disabled={loading}
              helperText="Must be at least 6 characters"
            />
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              margin="normal"
              required
              autoComplete="new-password"
              disabled={loading}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  disabled={loading}
                />
              }
              label={
                <Typography variant="body2" color="text.secondary">
                  I agree to the{' '}
                  <Link href="#" color="primary">Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="#" color="primary">Privacy Policy</Link>
                </Typography>
              }
              sx={{ mt: 2, mb: 2 }}
            />

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
              {loading ? <CircularProgress size={24} /> : 'Create Account'}
            </Button>
          </form>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Or sign up with
            </Typography>
          </Divider>

          {/* OAuth Buttons */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleGoogleSignup}
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
              Continue with Google
            </Button>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={onLogin}
                sx={{ 
                  color: 'primary.main',
                  textDecoration: 'none',
                  fontWeight: 'medium'
                }}
              >
                Sign in
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

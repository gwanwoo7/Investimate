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
  Container,
  InputAdornment,
  IconButton,
  Card,
  CardContent,
  FormControlLabel,
  Checkbox,
  useTheme,
  alpha,
  LinearProgress,
  Chip
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
  const [wantsPro, setWantsPro] = useState(false);

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

  const getPasswordStrengthColor = (strength: number) => {
    if (strength <= 2) return 'error';
    if (strength <= 3) return 'warning';
    return 'success';
  };

  const getPasswordStrengthText = (strength: number) => {
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Medium';
    return 'Strong';
  };

  const validateForm = () => {
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (passwordStrength < 3) {
      setError('Please choose a stronger password with uppercase, lowercase, numbers and special characters');
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
    
    // Basic validation
    if (!email || !password || !name) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('📝 Attempting to create user with Supabase:', { email, name });
      
      // Use Supabase for authentication with email verification
      const supabaseAuth = SupabaseAuthService.getInstance();
      
      if (supabaseAuth.isConfigured()) {
        console.log('🔐 Using Supabase authentication...');
        
        const { user: supabaseUser, error } = await supabaseAuth.signUp({
          email,
          password,
          name
        });

        if (error) {
          throw new Error(error);
        }

        if (supabaseUser) {
          console.log('✅ Supabase user created successfully:', supabaseUser.email);
          
          // Also create in local database for compatibility
          try {
            await db.createUser(email, password, name);
          } catch (localError) {
            console.log('ℹ️ Local user creation skipped (may already exist)');
          }

          if (!supabaseUser.emailVerified) {
            setSuccess('Account created! Please check your email for verification link before signing in.');
            setError('');
            // Don't auto-login until email is verified
          } else {
            setSuccess('Account created and verified successfully! Redirecting...');
            setTimeout(() => {
              onSignup(supabaseUser.email);
            }, 1500);
          }
        }
      } else {
        console.log('ℹ️ Supabase not configured, falling back to local database...');
        
        // Fallback to local database
        const user = await db.createUser(email, password, name, wantsPro);
        console.log('✅ Local user created successfully:', user.email);
        
        db.setCurrentUser(user);
        console.log('✅ Current user set for signup:', user.email);
        
        setSuccess(`Account created successfully! ${wantsPro ? 'Pro membership activated!' : ''} Redirecting...`);
        
        setTimeout(() => {
          onSignup(user.email);
        }, 1500);
      }
      
    } catch (err) {
      console.error('❌ Signup error:', err);
      if (err instanceof Error) {
        if (err.message.includes('already exists') || err.message.includes('already registered')) {
          setError('An account with this email already exists.');
          // Show a button to redirect to login
          setTimeout(() => {
            const shouldRedirect = window.confirm('This email is already registered. Would you like to go to the login page instead?');
            if (shouldRedirect) {
              onLogin();
            }
          }, 1000);
        } else if (err.message.includes('Password should be at least 6 characters')) {
          setError('Password must be at least 6 characters long.');
        } else {
          setError(`Signup failed: ${err.message}`);
        }
      } else {
        setError('Signup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('🔐 Attempting Google OAuth signup...');
      
      // Simplified Google OAuth
      if (!oauthService.isGoogleConfigured()) {
        console.error('❌ Google OAuth not configured');
        setError('Google OAuth is not configured. Please sign up with email instead.');
        setLoading(false);
        return;
      }

      console.log('📧 Google OAuth configured, proceeding...');
      const oauthUser: OAuthUser = await oauthService.signInWithGoogle();
      console.log('✅ Google OAuth successful:', oauthUser.email);
      
      // Create or get user
      let user;
      try {
        user = await db.authenticateOAuthUser(oauthUser.provider, oauthUser.id, oauthUser.email);
      } catch {
        // User doesn't exist, create new one
        user = await db.createOAuthUser(oauthUser.email, oauthUser.name, oauthUser.provider, oauthUser.id, oauthUser.avatar);
      }
      
      if (user) {
        db.setCurrentUser(user);
        onSignup(user.email);
      }
    } catch (err) {
      console.error('Google signup error:', err);
      setError('Google sign up failed. Please try signing up with email instead.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      
      {/* Navigation Bar */}
      <NavigationBar
        onLoginClick={onLogin}
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
          maxWidth: 500,
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
            <PersonAddOutlined sx={{ fontSize: 14, mb: 2, opacity: 0.9 }} />
            <Typography variant="h4" component="h1" sx={{ 
              fontWeight: 'bold',
              mb: 1
            }}>
              Join Investimate
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Start analyzing rental properties today
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            {error && (
              <Alert 
                severity="error" 
                sx={{ mb: 3, borderRadius: 2 }}
                icon={<Cancel />}
              >
                {error}
              </Alert>
            )}

            {success && (
              <Alert 
                severity="success" 
                sx={{ mb: 3, borderRadius: 2 }}
                icon={<CheckCircle />}
              >
                {success}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Full Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                margin="normal"
                required
                autoComplete="name"
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
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
                onChange={(e) => handlePasswordChange(e.target.value)}
                margin="normal"
                required
                autoComplete="new-password"
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
                  mb: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />

              {/* Password Strength Indicator */}
              {password && (
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Password strength:
                    </Typography>
                    <Chip 
                      size="small" 
                      label={getPasswordStrengthText(passwordStrength)}
                      color={getPasswordStrengthColor(passwordStrength)}
                    />
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(passwordStrength / 5) * 100}
                    color={getPasswordStrengthColor(passwordStrength)}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              )}

              <TextField
                fullWidth
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                margin="normal"
                required
                autoComplete="new-password"
                disabled={loading}
                error={confirmPassword !== '' && password !== confirmPassword}
                helperText={
                  confirmPassword !== '' && password !== confirmPassword 
                    ? 'Passwords do not match' 
                    : ''
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    color="primary"
                    disabled={loading}
                  />
                }
                label={
                  <Typography variant="body2" color="text.secondary">
                    I agree to the{' '}
                    <Link href="/terms" target="_blank" color="primary">
                      Terms of Service
                    </Link>
                    {' '}and{' '}
                    <Link href="/privacy" target="_blank" color="primary">
                      Privacy Policy
                    </Link>
                  </Typography>
                }
                sx={{ mb: 2 }}
              />

              <Box sx={{ 
                border: '1px solid', 
                borderColor: 'primary.main', 
                borderRadius: 2, 
                p: 2, 
                mb: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.05)
              }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={wantsPro}
                      onChange={(e) => setWantsPro(e.target.checked)}
                      color="success"
                      disabled={loading}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        🌟 Upgrade to Pro Membership
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Unlimited property searches, advanced analytics, and priority support
                      </Typography>
                    </Box>
                  }
                />
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading || !agreeToTerms}
                sx={{ 
                  mb: 3,
                  py: 1.8,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                  boxShadow: theme.shadows[8],
                  '&:hover': {
                    boxShadow: theme.shadows[12],
                  }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
              </Button>
            </form>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
                Or sign up with
              </Typography>
            </Divider>

            {/* OAuth Buttons */}
            <Button
              fullWidth
              variant="outlined"
              onClick={handleGoogleSignup}
              disabled={loading}
              startIcon={<Google />}
              sx={{ 
                mb: 3,
                py: 1.5,
                borderRadius: 3,
                textTransform: 'none',
                fontSize: '0.875rem',
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

            <Box sx={{ textAlign: 'center' }}>
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
                    fontWeight: 'bold',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  Sign in here
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

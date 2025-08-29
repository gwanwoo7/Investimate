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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
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
  Cancel,
  LocalOffer
} from '@mui/icons-material';
import NavigationBar from './NavigationBar';
import DatabaseService from '../services/databaseService';
import OAuthService, { type OAuthUser } from '../services/oauthService';
import SupabaseAuthService, { type SignUpData } from '../services/supabaseAuthService';
import ResendEmailService from '../services/resendEmailService';
import EmailVerificationModal from './EmailVerificationModal';
import TermsOfService from './TermsOfService';
import PrivacyPolicy from './PrivacyPolicy';

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
  const [promoCode, setPromoCode] = useState('');
  const [promoCodeValid, setPromoCodeValid] = useState<boolean | null>(null);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);

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

  const validatePromoCode = (code: string): boolean => {
    // Beta test promo codes for Pro membership
    const validPromoCodes = [
      'BETA2025',
      'INVESTIMATE_BETA',
      'PRO_BETA_TEST',
      'EARLYACCESS2025'
    ];
    return validPromoCodes.includes(code.toUpperCase());
  };

  const handlePromoCodeChange = (code: string) => {
    setPromoCode(code);
    if (code.length > 0) {
      const isValid = validatePromoCode(code);
      setPromoCodeValid(isValid);
      if (isValid) {
        setWantsPro(true);
      }
    } else {
      setPromoCodeValid(null);
    }
  };

  const validateForm = () => {
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }

    if (!agreeToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
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
        
        const { user: supabaseUser, error, needsVerification } = await supabaseAuth.signUp({
          email,
          password,
          name
        });

        if (error) {
          throw new Error(error);
        }

        if (supabaseUser) {
          console.log('✅ Supabase user created successfully:', supabaseUser.email);
          
          // Send welcome email AND verification email via Resend
          try {
            const emailService = ResendEmailService.getInstance();
            if (emailService.isConfigured()) {
              console.log('📧 Sending welcome email via Resend...');
              const welcomeResult = await emailService.sendWelcomeEmail(supabaseUser.email, supabaseUser.name);
              if (welcomeResult.success) {
                console.log('✅ Welcome email sent via Resend');
              } else {
                console.log('⚠️ Welcome email failed (non-critical):', welcomeResult.error);
              }

              // CRITICAL FIX: Send verification email via Resend since Supabase SMTP not configured
              if (needsVerification) {
                console.log('📧 Sending verification email via Resend...');
                const verificationUrl = `${window.location.origin}/auth/verify-email?token=${supabaseUser.id}&email=${encodeURIComponent(email)}`;
                const verificationResult = await emailService.sendEmailVerification({
                  email: email,
                  verificationUrl: verificationUrl,
                  userName: name
                });
                
                if (verificationResult.success) {
                  console.log('✅ Verification email sent via Resend');
                } else {
                  console.error('❌ Verification email failed:', verificationResult.error);
                  throw new Error('Failed to send verification email');
                }
              }
            }
          } catch (emailError) {
            console.error('❌ Email sending failed:', emailError);
            throw new Error('Failed to send verification email. Please try again.');
          }
          
          // Also create in local database for compatibility with promo code handling
          const finalProStatus = wantsPro || (promoCodeValid === true);
          try {
            await db.createUser(email, password, name, finalProStatus);
          } catch (localError) {
            console.log('ℹ️ Local user creation skipped (may already exist)');
          }

          if (needsVerification) {
            // Show email verification modal
            setShowEmailVerification(true);
            const proMessage = finalProStatus ? ' Pro membership will be activated after verification!' : '';
            setSuccess(`Account created successfully!${proMessage} Please check your email and click the verification link.`);
            
            // Add helpful debugging info
            console.log('📧 Email verification required. Check:');
            console.log('1. Email inbox (including spam folder)');
            console.log('2. Supabase Dashboard → Authentication → Settings → Enable email confirmations');
            console.log('3. Email Templates in Supabase Dashboard');
            
            // Optional: Add resend functionality immediately visible
            setTimeout(() => {
              setSuccess(`${success} 
              
              📧 Not seeing the email? 
              • Check your spam/junk folder
              • The email may take a few minutes to arrive
              • Use the "Resend Email" button in the modal if needed
              
              ⚠️ If emails consistently fail, there may be a Supabase configuration issue.`);
            }, 3000);
            
          } else {
            // User is already verified (shouldn't happen with email signup, but handle gracefully)
            const proMessage = finalProStatus ? ' Pro membership activated with promo code!' : '';
            setSuccess(`Account created and verified!${proMessage} You can now sign in.`);
            setError('');
            // Auto-login if user is already verified
            setTimeout(() => {
              onSignup(supabaseUser.email);
            }, 1500);
          }
        }
      } else {
        console.log('ℹ️ Supabase not configured, falling back to local database...');
        
        // Fallback to local database with promo code handling
        const finalProStatus = wantsPro || (promoCodeValid === true);
        const user = await db.createUser(email, password, name, finalProStatus);
        console.log('✅ Local user created successfully:', user.email);
        
        db.setCurrentUser(user);
        console.log('✅ Current user set for signup:', user.email);
        
        const proMessage = finalProStatus ? 
          (promoCodeValid ? ' Pro membership activated with beta promo code!' : ' Pro membership activated!') : '';
        setSuccess(`Account created successfully!${proMessage} Redirecting...`);
        
        setTimeout(() => {
          onSignup(user.email);
        }, 1500);
      }
      
    } catch (err) {
      console.error('❌ Signup error:', err);
      if (err instanceof Error) {
        // Handle specific error types
        if (err.message.includes('email rate limit exceeded') || err.message.includes('over_email_send_rate_limit')) {
          setSuccess('🎉 Great news! Your account was created successfully. Email verification is working but temporarily rate-limited. Please check your email in a few minutes, or try again in an hour.');
          setError('');
        } else if (err.message.includes('already exists') || err.message.includes('already registered')) {
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
};  const handleGoogleSignup = async () => {
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
                  action={
                  process.env.NODE_ENV === 'development' && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button 
                        color="inherit" 
                        size="small"
                        onClick={async () => {
                          console.log('🔧 Running email debug...');
                          await supabaseAuth.debugEmailSettings();
                        }}
                      >
                        Debug Email
                      </Button>
                      <Button 
                        color="inherit" 
                        size="small"
                        onClick={async () => {
                          console.log('📧 Testing Resend SMTP...');
                          const result = await supabaseAuth.testResendSMTP();
                          if (result.success) {
                            console.log('✅ SMTP Test Success:', result.message);
                            setSuccess(`${success}\n\n✅ SMTP Test: ${result.message}`);
                          } else {
                            console.error('❌ SMTP Test Failed:', result.message);
                            setError(`SMTP Test Failed: ${result.message}`);
                          }
                        }}
                      >
                        Test Resend
                      </Button>
                    </Box>
                  )
                }
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
                    <Link 
                      component="button" 
                      variant="body2" 
                      color="primary" 
                      onClick={(e) => {
                        e.preventDefault();
                        setShowTerms(true);
                      }}
                      sx={{ textDecoration: 'underline' }}
                    >
                      Terms of Service
                    </Link>
                    {' '}and{' '}
                    <Link 
                      component="button" 
                      variant="body2" 
                      color="primary" 
                      onClick={(e) => {
                        e.preventDefault();
                        setShowPrivacy(true);
                      }}
                      sx={{ textDecoration: 'underline' }}
                    >
                      Privacy Policy
                    </Link>
                  </Typography>
                }
                sx={{ mb: 2 }}
              />

              {/* Promo Code Section */}
              <Box sx={{ 
                border: '1px dashed', 
                borderColor: 'secondary.main', 
                borderRadius: 2, 
                p: 2, 
                mb: 2,
                bgcolor: alpha(theme.palette.secondary.main, 0.05)
              }}>
                <Typography variant="body2" fontWeight="bold" color="secondary.main" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocalOffer fontSize="small" />
                  Beta Test Promo Code (Optional)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  label="Enter promo code"
                  value={promoCode}
                  onChange={(e) => handlePromoCodeChange(e.target.value)}
                  disabled={loading}
                  placeholder="BETA2025"
                  InputProps={{
                    endAdornment: promoCodeValid !== null && (
                      <InputAdornment position="end">
                        {promoCodeValid ? (
                          <CheckCircle color="success" fontSize="small" />
                        ) : (
                          <Cancel color="error" fontSize="small" />
                        )}
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                    }
                  }}
                />
                {promoCodeValid === true && (
                  <Alert severity="success" sx={{ mt: 1 }}>
                    <Typography variant="caption">
                      🎉 Valid promo code! Pro membership will be activated for free!
                    </Typography>
                  </Alert>
                )}
                {promoCodeValid === false && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    <Typography variant="caption">
                      Invalid promo code. Please check and try again.
                    </Typography>
                  </Alert>
                )}
              </Box>

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
                      checked={wantsPro || promoCodeValid === true}
                      onChange={(e) => setWantsPro(e.target.checked)}
                      color="success"
                      disabled={loading || promoCodeValid === true}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        🌟 {promoCodeValid ? 'Pro Membership (Beta Access)' : 'Upgrade to Pro Membership'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {promoCodeValid ? 
                          'Free Pro access with your beta promo code!' :
                          'Unlimited property searches, advanced analytics, and priority support'
                        }
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

      {/* Terms of Service Dialog */}
      <Dialog 
        open={showTerms} 
        onClose={() => setShowTerms(false)}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          Terms of Service
        </DialogTitle>
        <DialogContent dividers>
          <TermsOfService onBack={() => setShowTerms(false)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTerms(false)}>
            Close
          </Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setShowTerms(false);
              setAgreeToTerms(true);
            }}
          >
            I Agree
          </Button>
        </DialogActions>
      </Dialog>

      {/* Privacy Policy Dialog */}
      <Dialog 
        open={showPrivacy} 
        onClose={() => setShowPrivacy(false)}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          Privacy Policy
        </DialogTitle>
        <DialogContent dividers>
          <PrivacyPolicy onBack={() => setShowPrivacy(false)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPrivacy(false)}>
            Close
          </Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setShowPrivacy(false);
              setAgreeToTerms(true);
            }}
          >
            I Agree
          </Button>
        </DialogActions>
      </Dialog>

      {/* Email Verification Modal */}
      <EmailVerificationModal
        open={showEmailVerification}
        onClose={() => setShowEmailVerification(false)}
        email={email}
        onVerificationComplete={() => {
          setShowEmailVerification(false);
          onSignup(email);
        }}
      />
    </Box>
  );
}

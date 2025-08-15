import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Divider,
  CircularProgress
} from '@mui/material';
import DatabaseService from '../services/databaseService';
import OAuthService, { type OAuthUser } from '../services/oauthService';

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
  const oauthService = OAuthService.getInstance();

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
    if (!oauthService.isGoogleConfigured()) {
      setError('Google OAuth is not configured. Please use the form below to create an account.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const oauthUser: OAuthUser = await oauthService.signInWithGoogle();
      
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

  const handleAppleSignup = async () => {
    if (!oauthService.isAppleConfigured()) {
      setError('Apple Sign In is not configured. Please use the form below to create an account.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const oauthUser: OAuthUser = await oauthService.signInWithApple();
      
      // Create new user with OAuth info
      const user = await db.createOAuthUser(oauthUser.email, oauthUser.name, oauthUser.provider, oauthUser.id, oauthUser.avatar);
      
      db.setCurrentUser(user);
      onSignup(user.email);
    } catch (err) {
      console.error('Apple signup error:', err);
      setError(err instanceof Error ? err.message : 'Apple Sign In failed. Please try again.');
    } finally {
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
      {/* Header with logo */}
      <Box sx={{ 
        p: 3,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 'bold', 
            color: 'primary.main',
            cursor: 'pointer',
            '&:hover': { color: 'primary.dark' }
          }}
          onClick={() => window.location.reload()}
        >
          🏡 Investimate
        </Typography>
        <Button 
          variant="outlined" 
          size="small"
          onClick={onLogin}
          sx={{ textTransform: 'none' }}
        >
          Sign In
        </Button>
      </Box>

      {/* Main Content */}
      <Box sx={{ 
        flex: 1,
        display: 'flex'
      }}>
      {/* Left side - Benefits */}
      <Box sx={{ 
        flex: 1,
        bgcolor: 'primary.main',
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        justifyContent: 'center',
        p: 6,
        color: 'white'
      }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Unlock your real estate investing potential
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9, mb: 4, fontWeight: 400 }}>
          with a FREE Investimate account
        </Typography>
        
        <Box sx={{ mt: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              🧮 Property Analysis Tools
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, lineHeight: 1.6 }}>
              Determine a property's cash flow potential in minutes with interactive calculators and tools.
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              🎯 Avoid Costly Mistakes
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, lineHeight: 1.6 }}>
              Tap into the knowledge of thousands of experienced investors and learn from their experiences.
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              🤝 Find Your Team
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, lineHeight: 1.6 }}>
              Find investor-friendly agents, financing options, and other professionals to build your team.
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              📚 Free Resources
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, lineHeight: 1.6 }}>
              Get FREE access to articles, guides, webinars, and calculators to accelerate your investing journey.
            </Typography>
          </Box>
        </Box>

        <Box sx={{ 
          mt: 4, 
          p: 3, 
          bgcolor: 'rgba(255,255,255,0.1)', 
          borderRadius: 2,
          textAlign: 'center'
        }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
            It's free!
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Join thousands of investors already using Investimate
          </Typography>
        </Box>
      </Box>

      {/* Right side - Sign Up Form */}
      <Box sx={{ 
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4
      }}>
        <Box sx={{ maxWidth: 400, width: '100%' }}>
          <Typography variant="h3" align="center" gutterBottom sx={{ 
            fontWeight: 'bold',
            color: 'text.primary',
            mb: 1
          }}>
            Create Your Account
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
            Join Investimate and start analyzing properties like a pro
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
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
                mb: 2, 
                textTransform: 'none',
                py: 1.5,
                fontSize: '1rem',
                bgcolor: 'white',
                color: 'text.primary',
                borderColor: 'grey.300',
                fontWeight: 500,
                '&:hover': {
                  bgcolor: 'grey.50',
                  borderColor: 'grey.400'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ 
                  width: 20, 
                  height: 20, 
                  borderRadius: '50%',
                  bgcolor: '#4285f4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  G
                </Box>
                Continue with Google
              </Box>
            </Button>
            
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={handleAppleSignup}
              sx={{ 
                textTransform: 'none',
                py: 1.5,
                fontSize: '1rem',
                bgcolor: '#000',
                color: 'white',
                borderColor: '#000',
                fontWeight: 500,
                '&:hover': {
                  bgcolor: '#333',
                  borderColor: '#333'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ fontSize: '18px' }}>🍎</Box>
                Continue with Apple
              </Box>
            </Button>
          </Box>

          <Divider sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
              Or
            </Typography>
          </Divider>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Full Name"
              placeholder="Use your real name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  fontSize: '1rem'
                }
              }}
              required
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  fontSize: '1rem'
                }
              }}
              required
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  fontSize: '1rem'
                }
              }}
              required
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  fontSize: '1rem'
                }
              }}
              required
              disabled={loading}
            />

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.5 }}>
              By signing up, you indicate that you agree to the{' '}
              <Box component="span" sx={{ color: 'primary.main', textDecoration: 'underline', cursor: 'pointer' }}>
                Investimate Terms & Conditions
              </Box>
              .
            </Typography>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ 
                mb: 3,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none'
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : "Let's go!"}
            </Button>
            
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Button 
                  onClick={onLogin} 
                  sx={{ 
                    textTransform: 'none', 
                    p: 0, 
                    minWidth: 0,
                    color: 'primary.main',
                    fontWeight: 600,
                    textDecoration: 'underline',
                    '&:hover': {
                      textDecoration: 'underline',
                      bgcolor: 'transparent'
                    }
                  }}
                >
                  Sign in here
                </Button>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
      </Box>
    </Box>
  );
}

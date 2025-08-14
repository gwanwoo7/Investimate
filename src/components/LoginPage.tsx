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
          onClick={onSignup}
          sx={{ textTransform: 'none' }}
        >
          Need an account?
        </Button>
      </Box>

      {/* Main Content */}
      <Box sx={{ 
        flex: 1,
        display: 'flex'
      }}>
      {/* Left side - Sign In Form */}
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
            Welcome back to Investimate
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
            Sign in to access your property analysis tools and connect with the investor community.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
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
            sx={{ 
              mb: 3, 
              textTransform: 'none',
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600
            }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : '🚀 Try Demo Login'}
          </Button>

          {/* Social Login */}
          <Box sx={{ mb: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={handleGoogleLogin}
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
              onClick={handleAppleLogin}
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
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  fontSize: '1rem'
                }
              }}
              required
              disabled={loading}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ 
                mb: 3,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none'
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Sign In'}
            </Button>
            
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Button 
                  onClick={onSignup} 
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
                  Create one here
                </Button>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Right side - Benefits */}
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
          Why join Investimate?
        </Typography>
        
        <Box sx={{ mt: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              📊 Advanced Property Analysis
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, lineHeight: 1.6 }}>
              Get instant cash flow analysis, ROI calculations, and investment recommendations for any property.
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              🏘️ Investor Community
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, lineHeight: 1.6 }}>
              Connect with experienced investors, share deals, and learn from real market experiences.
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              📈 Market Insights
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, lineHeight: 1.6 }}>
              Access real-time market data and trends to make informed investment decisions.
            </Typography>
          </Box>
        </Box>

        <Typography variant="body2" sx={{ mt: 4, opacity: 0.8, fontStyle: 'italic' }}>
          Join thousands of investors building wealth through real estate
        </Typography>
      </Box>
      </Box>
    </Box>
  );
}

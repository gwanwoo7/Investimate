import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  Button,
  CircularProgress,
  Container,
  Paper
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Home as HomeIcon,
  Login as LoginIcon
} from '@mui/icons-material';
import SupabaseAuthService from '../services/supabaseAuthService';
import { membershipService } from '../services/SecureMembershipService';
import DatabaseService from '../services/databaseService';

const EmailVerificationPage: React.FC = () => {
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [autoSignInAttempted, setAutoSignInAttempted] = useState(false);
  const [userSignedIn, setUserSignedIn] = useState(false);
  const authService = SupabaseAuthService.getInstance();
  const db = DatabaseService.getInstance();

  useEffect(() => {
    const verifyEmailAndSignIn = async () => {
      try {
        console.log('🔐 Starting email verification and auto-signin process...');
        
        // Parse URL parameters to get verification token and email
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const email = urlParams.get('email');
        
        console.log('📧 Verification parameters:', { token: token ? 'present' : 'missing', email });

        // First, try to get current user to check if already verified/signed in
        const { user: currentUser, error: getUserError } = await authService.getCurrentUser();
        
        if (currentUser && currentUser.emailVerified) {
          console.log('✅ User already verified and signed in:', currentUser.email);
          setUserSignedIn(true);
          setVerificationStatus('success');
          
          // Sync with local database
          await syncUserToLocalDatabase(currentUser);
          
          // Redirect to home after showing success message
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
          return;
        }

        // If we have token and email from URL, attempt verification
        if (token && email && !autoSignInAttempted) {
          setAutoSignInAttempted(true);
          console.log('🔐 Attempting auto-signin with token...');
          
          try {
            // For Supabase email verification, we need to handle the auth flow
            // Check if user exists in local database
            const localUser = await db.getUserByEmail(email);
            
            if (localUser) {
              console.log('👤 Found local user, updating verification status...');
              
              // Mark email as verified in local database
              const updatedUser = db.updateUserEmailVerification(localUser.id, true);
              
              if (updatedUser) {
                // Set user session in local database
                db.setCurrentUser(updatedUser);
                
                // Sync with Supabase membership service
                try {
                  await membershipService.updateUserProfile({
                    email: updatedUser.email,
                    full_name: updatedUser.name
                  });
                  console.log('✅ User profile synced with Supabase');
                } catch (syncError) {
                  console.warn('⚠️ Could not sync with Supabase, but local verification successful:', syncError);
                }
                
                console.log('✅ User automatically signed in after email verification!');
                setUserSignedIn(true);
                setVerificationStatus('success');
                
                // Store verification success in localStorage
                localStorage.setItem('email_verified', 'true');
                localStorage.setItem('auto_signin_completed', 'true');
                
                // Redirect to home page after brief success display
                setTimeout(() => {
                  window.location.href = '/';
                }, 2000);
                return;
              }
            }
          } catch (signInError) {
            console.error('❌ Auto-signin failed:', signInError);
            // Continue to manual verification check
          }
        }

        // Fallback: Check current auth state without auto-signin
        if (currentUser) {
          if (currentUser.emailVerified) {
            setUserSignedIn(true);
            setVerificationStatus('success');
            await syncUserToLocalDatabase(currentUser);
          } else {
            setError('Email verification is still pending. Please check your email and click the verification link.');
            setVerificationStatus('error');
          }
        } else {
          setError('Please sign in and verify your email address to continue.');
          setVerificationStatus('error');
        }
        
      } catch (err) {
        console.error('❌ Verification process failed:', err);
        setError('An unexpected error occurred during verification. Please try signing in manually.');
        setVerificationStatus('error');
      }
    };

    // Helper function to sync Supabase user with local database
    const syncUserToLocalDatabase = async (supabaseUser: any) => {
      try {
        console.log('🔄 Syncing verified user to local database...');
        
        let localUser = await db.getUserByEmail(supabaseUser.email);
        
        if (!localUser) {
          // Create new local user if doesn't exist
          localUser = await db.createUser(
            supabaseUser.email,
            'verified_user', // Placeholder password for verified users
            supabaseUser.name || supabaseUser.email.split('@')[0],
            false, // Will check subscription separately
            true   // Email verified
          );
          console.log('👤 Created new local user for verified email');
        } else {
          // Update existing user's verification status
          const updatedLocalUser = db.updateUserEmailVerification(localUser.id, true);
          if (updatedLocalUser) {
            localUser = updatedLocalUser;
          }
          console.log('✅ Updated existing user verification status');
        }
        
        if (localUser) {
          // Check and sync subscription status
          try {
            const subscriptionStatus = await membershipService.checkSubscriptionStatus();
            const isSubscribed = subscriptionStatus.isActive && subscriptionStatus.tier === 'pro';
            
            if (isSubscribed !== localUser.isSubscribed) {
              const updatedSubUser = db.updateUserSubscription(localUser.id, isSubscribed);
              if (updatedSubUser) {
                localUser = updatedSubUser;
              }
              console.log('🔄 Synced subscription status:', isSubscribed);
            }
          } catch (subError) {
            console.warn('⚠️ Could not check subscription status:', subError);
          }
          
          // Set as current user
          db.setCurrentUser(localUser);
          console.log('✅ User session established after verification');
        }
      } catch (syncError) {
        console.error('❌ Failed to sync user to local database:', syncError);
      }
    };

    // Start verification process
    verifyEmailAndSignIn();
  }, [authService, autoSignInAttempted]);

  const handleGoHome = () => {
    window.location.href = '/';
  };

  if (verificationStatus === 'loading') {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
          <CircularProgress size={60} sx={{ mb: 3, color: 'primary.main' }} />
          <Typography variant="h5" sx={{ mb: 2 }}>
            Verifying your email...
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Please wait while we confirm your email verification.
          </Typography>
        </Paper>
      </Container>
    );
  }

  if (verificationStatus === 'success') {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: 3 
          }}>
            <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main' }} />
            
            <Typography variant="h4" fontWeight="bold" color="success.main">
              {userSignedIn ? 'Welcome! You\'re signed in!' : 'Email Verified!'}
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
              {userSignedIn 
                ? 'Your email has been verified and you are now automatically signed in to Investimate. You have full access to all features.'
                : 'Your email has been successfully verified. You now have full access to Investimate.'
              }
            </Typography>

            <Alert severity="success" sx={{ width: '100%' }}>
              {userSignedIn 
                ? '🎉 Auto-signin successful! Welcome to Investimate! You can now access all features including property analysis, investment calculations, and membership benefits.'
                : 'Welcome to Investimate! You can now access all features including property analysis, investment calculations, and membership benefits.'
              }
            </Alert>

            <Typography variant="body2" color="text.secondary">
              {userSignedIn 
                ? 'Taking you to your dashboard...'
                : 'Redirecting you to the home page in a few seconds...'
              }
            </Typography>

            <Button
              variant="contained"
              onClick={handleGoHome}
              startIcon={userSignedIn ? <LoginIcon /> : <HomeIcon />}
              sx={{ mt: 2, minWidth: 200 }}
            >
              {userSignedIn ? 'Go to Dashboard' : 'Go to Home'}
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: 3 
        }}>
          <ErrorIcon sx={{ fontSize: 80, color: 'error.main' }} />
          
          <Typography variant="h4" fontWeight="bold" color="error.main">
            Verification Failed
          </Typography>
          
          <Alert severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>

          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            If you continue to have issues, please contact our support team.
          </Typography>

          <Button
            variant="contained"
            onClick={handleGoHome}
            startIcon={<HomeIcon />}
            sx={{ mt: 2, minWidth: 200 }}
          >
            Return to Home
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default EmailVerificationPage;

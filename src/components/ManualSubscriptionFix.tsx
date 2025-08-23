import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Alert,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { CheckCircle, AdminPanelSettings, CreditCard } from '@mui/icons-material';
import DatabaseService from '../services/databaseService';

/**
 * TEMPORARY MANUAL SUBSCRIPTION FIX COMPONENT
 * This component allows users to manually upgrade their account to Pro
 * if they've purchased through Stripe but the system didn't recognize it
 */
export default function ManualSubscriptionFix() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const db = DatabaseService.getInstance();
  const currentUser = db.getCurrentUser();

  const handleManualUpgrade = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // If user is logged in, upgrade their account
      if (currentUser && currentUser.email === email) {
        console.log('🔄 Manually upgrading current user to Pro...');
        const updatedUser = db.updateUserSubscription(currentUser.id, true);
        if (updatedUser) {
          db.setCurrentUser({ ...updatedUser, isSubscribed: true });
          setSuccess(true);
          console.log('✅ Current user upgraded to Pro successfully!');
        } else {
          throw new Error('Failed to update subscription status');
        }
      } else {
        // Find user by email and upgrade
        const user = await db.getUserByEmail(email);
        if (user) {
          console.log('🔄 Manually upgrading user to Pro:', email);
          const updatedUser = db.updateUserSubscription(user.id, true);
          if (updatedUser) {
            // If this is the current user, update session
            if (currentUser && currentUser.email === email) {
              db.setCurrentUser({ ...updatedUser, isSubscribed: true });
            }
            setSuccess(true);
            console.log('✅ User upgraded to Pro successfully!');
          } else {
            throw new Error('Failed to update subscription status');
          }
        } else {
          throw new Error('No account found with this email address. Please make sure you\'re using the same email you used to purchase the subscription.');
        }
      }
    } catch (err) {
      console.error('❌ Manual upgrade error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upgrade subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshPage = () => {
    window.location.reload();
  };

  if (success) {
    return (
      <Paper sx={{ p: 4, maxWidth: 500, mx: 'auto', mt: 4, textAlign: 'center' }}>
        <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom color="success.main">
          Pro Membership Activated! 🎉
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Your account has been successfully upgraded to Pro. You now have unlimited property searches and access to all premium features.
        </Typography>
        <Button 
          variant="contained" 
          onClick={handleRefreshPage}
          size="large"
        >
          Refresh Page to See Changes
        </Button>
      </Paper>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <AdminPanelSettings sx={{ mr: 2, color: 'warning.main' }} />
          <Typography variant="h5" color="warning.main">
            Subscription Issue Fix
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body1" gutterBottom>
            <strong>Having trouble with your Pro membership?</strong>
          </Typography>
          <Typography variant="body2">
            If you've successfully purchased a Pro subscription through Stripe but the website 
            isn't recognizing your membership, use this tool to manually activate your Pro features.
          </Typography>
        </Alert>

        <Card sx={{ mb: 3, bgcolor: 'grey.50' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CreditCard />
              Pro Membership Benefits
            </Typography>
            <Box component="ul" sx={{ mt: 2, pl: 2 }}>
              <li>✅ Unlimited property searches</li>
              <li>✅ Advanced ROI calculations</li>
              <li>✅ Market trend analysis</li>
              <li>✅ Investment recommendations</li>
              <li>✅ Portfolio tracking</li>
              <li>✅ Priority support</li>
            </Box>
          </CardContent>
        </Card>

        <Divider sx={{ my: 3 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Typography variant="h6" gutterBottom>
          Manual Pro Upgrade
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Enter the email address you used to purchase your Pro subscription:
        </Typography>

        <TextField
          fullWidth
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          sx={{ mb: 3 }}
          helperText={currentUser ? `Current account: ${currentUser.email}` : 'Not logged in'}
        />

        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={handleManualUpgrade}
          disabled={loading || !email}
          sx={{ mb: 2 }}
        >
          {loading ? 'Upgrading Account...' : 'Activate Pro Membership'}
        </Button>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
          This fix updates your account locally. For permanent resolution, contact support.
        </Typography>
      </Paper>
    </Box>
  );
}

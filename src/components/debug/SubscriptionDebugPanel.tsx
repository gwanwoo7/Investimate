import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Chip
} from '@mui/material';
import { Refresh, BugReport } from '@mui/icons-material';
import { useSubscription, useAuth } from '../../hooks/useMembership';
import { membershipService } from '../../services/SecureMembershipService';

export const SubscriptionDebugPanel: React.FC = () => {
  const { subscription, loading, forceRefreshSubscription } = useSubscription();
  const { user, profile } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isDebugging, setIsDebugging] = useState(false);

  const handleDebugCheck = async () => {
    setIsDebugging(true);
    try {
      console.log('🐛 Starting subscription debug check...');
      
      // Get fresh profile data
      const freshProfile = await membershipService.refreshUserProfile();
      
      // Force refresh subscription
      await forceRefreshSubscription();
      
      // Get current subscription status
      const currentStatus = await membershipService.checkSubscriptionStatus();
      
      setDebugInfo({
        timestamp: new Date().toISOString(),
        user: user ? { id: user.id, email: user.email } : null,
        profile: freshProfile,
        subscription: currentStatus,
        cacheCleared: true
      });
      
      console.log('🐛 Debug info collected:', {
        profile: freshProfile,
        subscription: currentStatus
      });
    } catch (error) {
      console.error('Debug check failed:', error);
      setDebugInfo({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsDebugging(false);
    }
  };

  const getStatusColor = (tier: string, isActive: boolean) => {
    if (!isActive) return 'default';
    switch (tier) {
      case 'pro': return 'success';
      case 'trial': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Card sx={{ mb: 3, border: '2px solid #ff9800' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <BugReport color="warning" sx={{ mr: 1 }} />
          <Typography variant="h6" color="warning.main">
            Subscription Debug Panel
          </Typography>
        </Box>
        
        <Alert severity="info" sx={{ mb: 2 }}>
          This panel shows real-time subscription status. Remove this component in production.
        </Alert>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            onClick={handleDebugCheck}
            disabled={isDebugging}
            startIcon={<BugReport />}
          >
            {isDebugging ? 'Debugging...' : 'Debug Check'}
          </Button>
          
          <Button
            variant="outlined"
            onClick={forceRefreshSubscription}
            disabled={loading}
            startIcon={<Refresh />}
          >
            {loading ? 'Refreshing...' : 'Force Refresh'}
          </Button>
        </Box>

        {subscription && (
          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell><strong>Current Status</strong></TableCell>
                  <TableCell>
                    <Chip 
                      label={`${subscription.tier.toUpperCase()} - ${subscription.isActive ? 'ACTIVE' : 'INACTIVE'}`}
                      color={getStatusColor(subscription.tier, subscription.isActive)}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Tier</strong></TableCell>
                  <TableCell>{subscription.tier}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell>{subscription.status}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Is Active</strong></TableCell>
                  <TableCell>{subscription.isActive ? '✅' : '❌'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Period End</strong></TableCell>
                  <TableCell>{subscription.currentPeriodEnd || 'N/A'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Trial End</strong></TableCell>
                  <TableCell>{subscription.trialEnd || 'N/A'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {debugInfo && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Debug Information:
            </Typography>
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="caption" component="pre" sx={{ fontSize: '12px', overflow: 'auto' }}>
                {JSON.stringify(debugInfo, null, 2)}
              </Typography>
            </Paper>
          </Box>
        )}

        <Alert severity="warning" sx={{ mt: 2 }}>
          <strong>Troubleshooting Steps:</strong>
          <ol>
            <li>Click "Debug Check" to see raw database values</li>
            <li>Check if subscription_status and subscription_tier are correctly set in Supabase</li>
            <li>Verify subscription_ends_at is in the future (or null for unlimited)</li>
            <li>Check browser console for detailed logs</li>
          </ol>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default SubscriptionDebugPanel;

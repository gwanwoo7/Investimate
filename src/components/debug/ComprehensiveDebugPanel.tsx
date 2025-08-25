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
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { ExpandMore, BugReport, Refresh, Storage, Person } from '@mui/icons-material';
import { useSubscription, useAuth } from '../../hooks/useMembership';
import { membershipService } from '../../services/SecureMembershipService';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export const ComprehensiveDebugPanel: React.FC = () => {
  const { subscription, loading, forceRefreshSubscription } = useSubscription();
  const { user, profile } = useAuth();
  const [debugData, setDebugData] = useState<any>(null);
  const [isDebugging, setIsDebugging] = useState(false);

  const runComprehensiveDebug = async () => {
    setIsDebugging(true);
    const debugResults: any = {
      timestamp: new Date().toISOString(),
      step1_auth: null,
      step2_rawProfile: null,
      step3_serviceProfile: null,
      step4_subscriptionCheck: null,
      step5_cacheState: null,
      errors: []
    };

    try {
      // Step 1: Check auth state
      console.log('🔍 STEP 1: Checking auth state...');
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      debugResults.step1_auth = {
        user: authUser ? { id: authUser.id, email: authUser.email } : null,
        error: authError?.message || null
      };

      if (authError) {
        debugResults.errors.push(`Auth Error: ${authError.message}`);
      }

      // Step 2: Query profile directly from database
      console.log('🔍 STEP 2: Querying profile directly from database...');
      if (authUser) {
        const { data: rawProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();

        debugResults.step2_rawProfile = {
          data: rawProfile,
          error: profileError?.message || null
        };

        if (profileError) {
          debugResults.errors.push(`Profile Query Error: ${profileError.message}`);
        }
      }

      // Step 3: Check service profile
      console.log('🔍 STEP 3: Getting profile through service...');
      const serviceProfile = await membershipService.refreshUserProfile();
      debugResults.step3_serviceProfile = serviceProfile;

      // Step 4: Check subscription through service
      console.log('🔍 STEP 4: Checking subscription through service...');
      await membershipService.refreshSubscriptionStatus();
      const subscriptionStatus = await membershipService.checkSubscriptionStatus();
      debugResults.step4_subscriptionCheck = subscriptionStatus;

      // Step 5: Check cache state
      console.log('🔍 STEP 5: Checking cache state...');
      debugResults.step5_cacheState = {
        hasCachedSubscription: 'subscriptionCache' in membershipService,
        note: 'Cache is private, cannot inspect directly'
      };

      setDebugData(debugResults);
      console.log('🔍 COMPREHENSIVE DEBUG COMPLETE:', debugResults);

    } catch (error) {
      debugResults.errors.push(`Debug Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setDebugData(debugResults);
    } finally {
      setIsDebugging(false);
    }
  };

  const testDirectDatabaseAccess = async () => {
    if (!user?.id) {
      alert('No authenticated user found');
      return;
    }

    try {
      console.log('🔍 Testing direct database access...');
      
      // Test users table access
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, subscription_status, subscription_tier, subscription_ends_at, trial_ends_at')
        .eq('id', user.id);

      console.log('📊 Direct database result:', { userData, userError });
      
      if (userError) {
        alert(`Database Error: ${userError.message}`);
      } else {
        alert(`Database Access Success!\nFound ${userData?.length || 0} records\nData: ${JSON.stringify(userData[0] || {}, null, 2)}`);
      }
    } catch (error) {
      console.error('Database test failed:', error);
      alert(`Database test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    <Card sx={{ mb: 3, border: '3px solid #f44336' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <BugReport color="error" sx={{ mr: 1 }} />
          <Typography variant="h6" color="error.main">
            Comprehensive Debug Panel - Issue Investigation
          </Typography>
        </Box>
        
        <Alert severity="error" sx={{ mb: 2 }}>
          <strong>Issue:</strong> Pro subscription status not persisting across page refreshes.
          This panel will help identify the root cause.
        </Alert>

        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="error"
            onClick={runComprehensiveDebug}
            disabled={isDebugging}
            startIcon={<BugReport />}
          >
            {isDebugging ? 'Running Debug...' : 'Run Full Debug'}
          </Button>
          
          <Button
            variant="outlined"
            onClick={forceRefreshSubscription}
            disabled={loading}
            startIcon={<Refresh />}
          >
            {loading ? 'Refreshing...' : 'Force Refresh'}
          </Button>

          <Button
            variant="outlined"
            color="warning"
            onClick={testDirectDatabaseAccess}
            startIcon={<Storage />}
          >
            Test Database Access
          </Button>
        </Box>

        {/* Current Status Summary */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">Current Status Summary</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {subscription ? (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell>
                        <Chip 
                          label={`${subscription.tier.toUpperCase()} - ${subscription.isActive ? 'ACTIVE' : 'INACTIVE'}`}
                          color={getStatusColor(subscription.tier, subscription.isActive)}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>User ID</strong></TableCell>
                      <TableCell>{user?.id || 'Not found'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Profile Loaded</strong></TableCell>
                      <TableCell>{profile ? '✅ Yes' : '❌ No'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="warning">No subscription data available</Alert>
            )}
          </AccordionDetails>
        </Accordion>

        {/* Debug Results */}
        {debugData && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Debug Results</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {debugData.errors.length > 0 && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  <strong>Errors Found:</strong>
                  <ul>
                    {debugData.errors.map((error: string, index: number) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </Alert>
              )}

              <Paper sx={{ p: 2, bgcolor: 'grey.50', maxHeight: 400, overflow: 'auto' }}>
                <Typography variant="caption" component="pre" sx={{ fontSize: '11px', whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(debugData, null, 2)}
                </Typography>
              </Paper>
            </AccordionDetails>
          </Accordion>
        )}

        <Alert severity="info" sx={{ mt: 2 }}>
          <strong>Troubleshooting Checklist:</strong>
          <ol>
            <li><strong>Run Full Debug</strong> - Check all steps in the subscription flow</li>
            <li><strong>Test Database Access</strong> - Verify you can read user data directly</li>
            <li><strong>Check Console Logs</strong> - Look for detailed error messages</li>
            <li><strong>Verify Database Values</strong> - Ensure subscription_status='pro' and subscription_tier='pro'</li>
            <li><strong>Check RLS Policies</strong> - Make sure user can read their own data</li>
          </ol>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default ComprehensiveDebugPanel;

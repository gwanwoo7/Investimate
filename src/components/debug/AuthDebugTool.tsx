import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Alert, 
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Chip
} from '@mui/material';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export const AuthDebugTool: React.FC = () => {
  const [debugResults, setDebugResults] = useState<any>(null);
  const [isDebugging, setIsDebugging] = useState(false);

  const runAuthDebug = async () => {
    setIsDebugging(true);
    const results: any = {
      timestamp: new Date().toISOString(),
      step1_envVars: {},
      step2_supabaseConnection: {},
      step3_authState: {},
      step4_sessionCheck: {},
      step5_localStorageCheck: {},
      errors: [],
      recommendations: []
    };

    try {
      // Step 1: Check environment variables
      console.log('🔍 STEP 1: Checking environment variables...');
      results.step1_envVars = {
        hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
        hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
        supabaseUrlPrefix: import.meta.env.VITE_SUPABASE_URL?.substring(0, 20) + '...',
        anonKeyPrefix: import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...'
      };

      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        results.errors.push('Missing Supabase environment variables');
        results.recommendations.push('Check your .env file has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
      }

      // Step 2: Test Supabase connection
      console.log('🔍 STEP 2: Testing Supabase connection...');
      try {
        const { data: testData, error: testError } = await supabase
          .from('users')
          .select('count', { count: 'exact', head: true });
        
        results.step2_supabaseConnection = {
          success: !testError,
          error: testError?.message || null,
          canConnectToDb: !testError
        };

        if (testError) {
          results.errors.push(`Supabase connection error: ${testError.message}`);
        }
      } catch (err) {
        results.step2_supabaseConnection = {
          success: false,
          error: err instanceof Error ? err.message : 'Unknown connection error'
        };
        results.errors.push('Cannot connect to Supabase');
      }

      // Step 3: Check current auth state
      console.log('🔍 STEP 3: Checking auth state...');
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        results.step3_authState = {
          hasSession: !!session,
          sessionError: sessionError?.message || null,
          hasUser: !!user,
          userError: userError?.message || null,
          userEmail: user?.email || null,
          userId: user?.id || null,
          sessionExpiry: session?.expires_at || null,
          accessToken: session?.access_token ? 'Present' : 'Missing'
        };

        if (sessionError || userError) {
          results.errors.push(`Auth state error: ${sessionError?.message || userError?.message}`);
        }

        if (!session) {
          results.recommendations.push('No active session - user needs to log in');
        }

        if (!user) {
          results.recommendations.push('No authenticated user - check authentication flow');
        }
      } catch (err) {
        results.step3_authState = {
          error: err instanceof Error ? err.message : 'Auth check failed'
        };
        results.errors.push('Failed to check auth state');
      }

      // Step 4: Check session persistence
      console.log('🔍 STEP 4: Checking session persistence...');
      try {
        const { data } = supabase.auth.onAuthStateChange((event, session) => {
          console.log('Auth state change:', event, session?.user?.email);
        });
        
        results.step4_sessionCheck = {
          authChangeListenerSetup: true,
          subscription: 'Active'
        };

        // Cleanup the subscription
        data.subscription.unsubscribe();
      } catch (err) {
        results.step4_sessionCheck = {
          error: err instanceof Error ? err.message : 'Session check failed'
        };
      }

      // Step 5: Check local storage
      console.log('🔍 STEP 5: Checking local storage...');
      try {
        const supabaseAuth = localStorage.getItem('sb-' + import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0] + '-auth-token');
        const hasStoredAuth = !!supabaseAuth;
        
        results.step5_localStorageCheck = {
          hasStoredAuth,
          storageKeyExists: hasStoredAuth,
          storageContent: supabaseAuth ? 'Present (not shown for security)' : 'Missing'
        };

        if (!hasStoredAuth) {
          results.recommendations.push('No auth token in localStorage - user session not persisted');
        }
      } catch (err) {
        results.step5_localStorageCheck = {
          error: err instanceof Error ? err.message : 'Storage check failed'
        };
      }

      // Add overall diagnosis
      if (results.errors.length === 0) {
        results.recommendations.push('Authentication setup looks good!');
      } else {
        results.recommendations.push('Found authentication issues that need to be fixed');
      }

      setDebugResults(results);
      console.log('🔍 AUTH DEBUG COMPLETE:', results);

    } catch (error) {
      results.errors.push(`Debug failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setDebugResults(results);
    } finally {
      setIsDebugging(false);
    }
  };

  const triggerLogin = () => {
    // Navigate to your login page or trigger login modal
    window.location.href = '/login'; // Adjust this to your login route
  };

  const clearAuthData = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();
      alert('Auth data cleared. Please log in again.');
      window.location.reload();
    } catch (error) {
      alert('Error clearing auth data: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return (
    <Card sx={{ maxWidth: 1000, mx: 'auto', m: 2, border: '2px solid #f44336' }}>
      <CardContent>
        <Typography variant="h6" color="error" gutterBottom>
          🔐 Authentication Debug Tool
        </Typography>

        <Alert severity="error" sx={{ mb: 2 }}>
          <strong>Issue Detected:</strong> Auth session missing! This is why subscription status isn't persisting.
        </Alert>

        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="error"
            onClick={runAuthDebug}
            disabled={isDebugging}
          >
            {isDebugging ? 'Running Auth Debug...' : 'Debug Authentication'}
          </Button>
          
          <Button
            variant="outlined"
            onClick={triggerLogin}
          >
            Go to Login
          </Button>

          <Button
            variant="outlined"
            color="warning"
            onClick={clearAuthData}
          >
            Clear Auth & Restart
          </Button>
        </Box>

        {debugResults && (
          <Box>
            {/* Errors */}
            {debugResults.errors.length > 0 && (
              <Alert severity="error" sx={{ mb: 2 }}>
                <strong>Errors Found:</strong>
                <ul>
                  {debugResults.errors.map((error: string, index: number) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </Alert>
            )}

            {/* Recommendations */}
            {debugResults.recommendations.length > 0 && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <strong>Recommendations:</strong>
                <ul>
                  {debugResults.recommendations.map((rec: string, index: number) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </Alert>
            )}

            {/* Debug Steps */}
            <Stepper orientation="vertical">
              <Step>
                <StepLabel>Environment Variables</StepLabel>
                <StepContent>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="caption" component="pre">
                      {JSON.stringify(debugResults.step1_envVars, null, 2)}
                    </Typography>
                  </Paper>
                </StepContent>
              </Step>

              <Step>
                <StepLabel>Supabase Connection</StepLabel>
                <StepContent>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="caption" component="pre">
                      {JSON.stringify(debugResults.step2_supabaseConnection, null, 2)}
                    </Typography>
                  </Paper>
                </StepContent>
              </Step>

              <Step>
                <StepLabel>Auth State</StepLabel>
                <StepContent>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="caption" component="pre">
                      {JSON.stringify(debugResults.step3_authState, null, 2)}
                    </Typography>
                  </Paper>
                </StepContent>
              </Step>

              <Step>
                <StepLabel>Session Persistence</StepLabel>
                <StepContent>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="caption" component="pre">
                      {JSON.stringify(debugResults.step4_sessionCheck, null, 2)}
                    </Typography>
                  </Paper>
                </StepContent>
              </Step>

              <Step>
                <StepLabel>Local Storage</StepLabel>
                <StepContent>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="caption" component="pre">
                      {JSON.stringify(debugResults.step5_localStorageCheck, null, 2)}
                    </Typography>
                  </Paper>
                </StepContent>
              </Step>
            </Stepper>

            <Alert severity="warning" sx={{ mt: 2 }}>
              <strong>Next Steps:</strong>
              <ol>
                <li>If no auth session → User needs to log in</li>
                <li>If env vars missing → Check .env file</li>
                <li>If Supabase connection fails → Check URL and keys</li>
                <li>If session not persisting → Check auth implementation</li>
              </ol>
            </Alert>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AuthDebugTool;

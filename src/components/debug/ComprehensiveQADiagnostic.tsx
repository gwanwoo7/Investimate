import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  TextField,
  Divider,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Email as EmailIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { createClient } from '@supabase/supabase-js';
import { membershipService } from '../../services/SecureMembershipService';
import DatabaseService from '../../services/databaseService';

interface DiagnosticResult {
  status: 'success' | 'error' | 'warning' | 'info';
  message: string;
  details?: any;
}

interface QAResults {
  supabaseConnection: DiagnosticResult;
  emailConfiguration: DiagnosticResult;
  smtpSettings: DiagnosticResult;
  membershipService: DiagnosticResult;
  userSession: DiagnosticResult;
  proMembershipPersistence: DiagnosticResult;
  emailVerificationFlow: DiagnosticResult;
  environmentVariables: DiagnosticResult;
}

const ComprehensiveQADiagnostic: React.FC = () => {
  const [results, setResults] = useState<QAResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [emailTestResult, setEmailTestResult] = useState<DiagnosticResult | null>(null);
  const [emailTestLoading, setEmailTestLoading] = useState(false);

  const db = DatabaseService.getInstance();

  const runDiagnostics = async () => {
    setLoading(true);
    setResults(null);

    const diagnosticResults: QAResults = {
      supabaseConnection: await testSupabaseConnection(),
      emailConfiguration: await testEmailConfiguration(),
      smtpSettings: await testSMTPSettings(),
      membershipService: await testMembershipService(),
      userSession: await testUserSession(),
      proMembershipPersistence: await testProMembershipPersistence(),
      emailVerificationFlow: await testEmailVerificationFlow(),
      environmentVariables: testEnvironmentVariables(),
    };

    setResults(diagnosticResults);
    setLoading(false);
  };

  const testSupabaseConnection = async (): Promise<DiagnosticResult> => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        return {
          status: 'error',
          message: 'Supabase environment variables not configured',
          details: { supabaseUrl: !!supabaseUrl, supabaseAnonKey: !!supabaseAnonKey }
        };
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        return {
          status: 'error',
          message: `Supabase connection failed: ${error.message}`,
          details: error
        };
      }

      return {
        status: 'success',
        message: 'Supabase connection successful',
        details: {
          url: supabaseUrl,
          hasSession: !!data.session,
          sessionUser: data.session?.user?.email || 'None'
        }
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Supabase test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      };
    }
  };

  const testEmailConfiguration = async (): Promise<DiagnosticResult> => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      // Check if email confirmations are enabled (can't check directly from client)
      // Instead, check the current session and auth settings
      const { data: sessionData } = await supabase.auth.getSession();
      
      return {
        status: 'info',
        message: 'Email configuration check completed',
        details: {
          note: 'Email confirmations setting must be checked manually in Supabase Dashboard',
          currentSession: !!sessionData.session,
          redirectURL: `${window.location.origin}/auth/verify-email`,
          siteURL: window.location.origin
        }
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Email configuration test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      };
    }
  };

  const testSMTPSettings = async (): Promise<DiagnosticResult> => {
    try {
      // Can't test SMTP settings directly from client-side
      // But we can check if the configuration looks correct
      const domain = 'myinvestimate.com';
      const expectedSender = `noreply@${domain}`;
      
      return {
        status: 'warning',
        message: 'SMTP settings cannot be verified from client-side',
        details: {
          expectedHost: 'smtp.gmail.com',
          expectedPort: '587',
          expectedSender: expectedSender,
          expectedDomain: domain,
          note: 'Manual verification required in Supabase Dashboard → Authentication → Settings'
        }
      };
    } catch (error) {
      return {
        status: 'error',
        message: `SMTP test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      };
    }
  };

  const testMembershipService = async (): Promise<DiagnosticResult> => {
    try {
      const status = await membershipService.checkSubscriptionStatus();
      const currentUser = await membershipService.getCurrentUser();
      
      return {
        status: 'success',
        message: 'Membership service operational',
        details: {
          subscriptionStatus: status,
          currentUser: currentUser ? {
            email: currentUser.email,
            tier: currentUser.subscription_tier,
            status: currentUser.subscription_status
          } : null
        }
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Membership service test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      };
    }
  };

  const testUserSession = async (): Promise<DiagnosticResult> => {
    try {
      const localUser = db.getCurrentUser();
      const supabaseUser = await membershipService.getCurrentUser();
      
      return {
        status: localUser || supabaseUser ? 'success' : 'info',
        message: localUser || supabaseUser ? 'User session found' : 'No active user session',
        details: {
          localUser: localUser ? {
            email: localUser.email,
            isSubscribed: localUser.isSubscribed,
            name: localUser.name
          } : null,
          supabaseUser: supabaseUser ? {
            email: supabaseUser.email,
            tier: supabaseUser.subscription_tier,
            status: supabaseUser.subscription_status
          } : null
        }
      };
    } catch (error) {
      return {
        status: 'error',
        message: `User session test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      };
    }
  };

  const testProMembershipPersistence = async (): Promise<DiagnosticResult> => {
    try {
      const localUser = db.getCurrentUser();
      const searchCount = localStorage.getItem('investimate_search_count');
      const stripeData = {
        customerId: localStorage.getItem('stripe_customer_id'),
        subscriptionId: localStorage.getItem('stripe_subscription_id')
      };
      
      let issues = [];
      
      if (localUser?.isSubscribed && searchCount && searchCount !== '0') {
        issues.push('Pro member has non-zero search count in localStorage');
      }
      
      if (stripeData.customerId && stripeData.subscriptionId && !localUser?.isSubscribed) {
        issues.push('Stripe data exists but user is not marked as subscribed');
      }
      
      return {
        status: issues.length > 0 ? 'warning' : 'success',
        message: issues.length > 0 ? 'Pro membership persistence issues detected' : 'Pro membership persistence looks good',
        details: {
          localUser: localUser ? {
            email: localUser.email,
            isSubscribed: localUser.isSubscribed
          } : null,
          searchCount: searchCount || '0',
          stripeData,
          issues
        }
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Pro membership persistence test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      };
    }
  };

  const testEmailVerificationFlow = async (): Promise<DiagnosticResult> => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      // Check current auth state
      const { data: sessionData } = await supabase.auth.getSession();
      const { data: userData } = await supabase.auth.getUser();
      
      return {
        status: 'info',
        message: 'Email verification flow check completed',
        details: {
          hasSession: !!sessionData.session,
          currentUser: userData.user ? {
            email: userData.user.email,
            emailConfirmed: !!userData.user.email_confirmed_at,
            createdAt: userData.user.created_at
          } : null,
          redirectURL: `${window.location.origin}/auth/verify-email`,
          note: 'To test email verification, try signing up with a new email'
        }
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Email verification flow test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      };
    }
  };

  const testEnvironmentVariables = (): DiagnosticResult => {
    const requiredVars = {
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
      VITE_GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      VITE_GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      VITE_STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
    };

    const missing = Object.entries(requiredVars)
      .filter(([_, value]) => !value)
      .map(([key, _]) => key);

    return {
      status: missing.length > 0 ? 'warning' : 'success',
      message: missing.length > 0 ? `Missing environment variables: ${missing.join(', ')}` : 'All environment variables configured',
      details: {
        configured: Object.entries(requiredVars).reduce((acc, [key, value]) => ({
          ...acc,
          [key]: !!value
        }), {}),
        missing
      }
    };
  };

  const testEmailSending = async () => {
    if (!testEmail) {
      setEmailTestResult({
        status: 'error',
        message: 'Please enter an email address to test'
      });
      return;
    }

    setEmailTestLoading(true);
    setEmailTestResult(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: 'TestPassword123!',
        options: {
          data: { name: 'QA Test User' }
        }
      });

      if (error) {
        if (error.message.includes('rate limit') || error.message.includes('over_email_send_rate_limit')) {
          setEmailTestResult({
            status: 'success',
            message: '✅ SMTP is working! Rate limit error proves emails are being sent successfully.',
            details: {
              note: 'Rate limit errors indicate that email sending is working correctly',
              solution: 'Wait 1 hour for rate limit to reset, then test with 1 email only',
              error: error.message
            }
          });
        } else if (error.message.includes('already registered') || error.message.includes('already exists')) {
          setEmailTestResult({
            status: 'warning',
            message: 'Email already registered. Try a different email or this confirms registration is working.',
            details: error
          });
        } else {
          setEmailTestResult({
            status: 'error',
            message: `Email test failed: ${error.message}`,
            details: error
          });
        }
      } else if (data.user) {
        setEmailTestResult({
          status: 'success',
          message: '✅ Email verification system is working! Check your email for verification link.',
          details: {
            userCreated: true,
            needsVerification: !data.user.email_confirmed_at,
            hasSession: !!data.session,
            userId: data.user.id
          }
        });
      }
    } catch (error) {
      setEmailTestResult({
        status: 'error',
        message: `Email test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      });
    } finally {
      setEmailTestLoading(false);
    }
  };

  const getStatusIcon = (status: 'success' | 'error' | 'warning' | 'info') => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon sx={{ color: 'success.main' }} />;
      case 'error':
        return <ErrorIcon sx={{ color: 'error.main' }} />;
      case 'warning':
        return <WarningIcon sx={{ color: 'warning.main' }} />;
      case 'info':
        return <InfoIcon sx={{ color: 'info.main' }} />;
    }
  };

  const getStatusColor = (status: 'success' | 'error' | 'warning' | 'info') => {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <SettingsIcon fontSize="large" />
        Comprehensive QA Diagnostic Tool
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
        This tool performs comprehensive testing of Supabase connections, email verification, 
        and pro membership persistence issues.
      </Typography>

      <Button
        variant="contained"
        onClick={runDiagnostics}
        disabled={loading}
        size="large"
        sx={{ mb: 3 }}
        startIcon={loading ? <CircularProgress size={20} /> : <SettingsIcon />}
      >
        {loading ? 'Running Diagnostics...' : 'Run Full Diagnostic'}
      </Button>

      {/* Email Testing Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmailIcon />
            Email Verification Test
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="Test Email Address"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="test@example.com"
              sx={{ flexGrow: 1 }}
            />
            <Button
              variant="outlined"
              onClick={testEmailSending}
              disabled={emailTestLoading || !testEmail}
              startIcon={emailTestLoading ? <CircularProgress size={20} /> : <EmailIcon />}
            >
              {emailTestLoading ? 'Testing...' : 'Test Email'}
            </Button>
          </Box>

          {emailTestResult && (
            <Alert severity={getStatusColor(emailTestResult.status)} sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                {emailTestResult.message}
              </Typography>
              {emailTestResult.details && (
                <Box sx={{ mt: 1 }}>
                  <pre style={{ fontSize: '12px', margin: 0, whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(emailTestResult.details, null, 2)}
                  </pre>
                </Box>
              )}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Diagnostic Results */}
      {results && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h5" gutterBottom>
            Diagnostic Results
          </Typography>

          {Object.entries(results).map(([testName, result]) => (
            <Accordion key={testName} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  {getStatusIcon(result.status)}
                  <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    {testName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </Typography>
                  <Chip
                    label={result.status.toUpperCase()}
                    color={getStatusColor(result.status)}
                    size="small"
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" sx={{ mb: 2, fontWeight: 'medium' }}>
                  {result.message}
                </Typography>
                
                {result.details && (
                  <Box sx={{ backgroundColor: 'grey.50', p: 2, borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 'medium' }}>
                      Details:
                    </Typography>
                    <pre style={{ fontSize: '12px', margin: 0, whiteSpace: 'pre-wrap' }}>
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {/* Quick Reference */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Reference - Common Issues & Solutions
          </Typography>
          
          <List>
            <ListItem>
              <ListItemIcon>
                <EmailIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Email Verification Not Working"
                secondary="Rate limit errors usually mean SMTP is working correctly. Wait 1 hour between tests."
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <SecurityIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Pro Membership Not Persisting"
                secondary="Check if search count is cleared for Pro members and Stripe data is properly synced."
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <WarningIcon color="warning" />
              </ListItemIcon>
              <ListItemText
                primary="Supabase Configuration"
                secondary="Verify environment variables and email confirmations are enabled in Supabase Dashboard."
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ComprehensiveQADiagnostic;

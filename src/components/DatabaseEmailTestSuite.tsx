import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Chip,
  Divider,
  Paper,
  Stack
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';

import ResendEmailService from '../services/resendEmailService';
import DatabaseService from '../services/databaseService';
import { SecureMembershipService } from '../services/SecureMembershipService';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'info';
  message: string;
  details?: any;
  timestamp: string;
}

const DatabaseEmailTestSuite: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testName, setTestName] = useState('Test User');
  const [currentTest, setCurrentTest] = useState('');

  const addResult = (result: Omit<TestResult, 'timestamp'>) => {
    const timestampedResult = {
      ...result,
      timestamp: new Date().toISOString()
    };
    setTestResults(prev => [...prev, timestampedResult]);
    console.log(`[${result.status.toUpperCase()}] ${result.name}: ${result.message}`, result.details);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircleIcon color="success" />;
      case 'error': return <ErrorIcon color="error" />;
      case 'warning': return <ErrorIcon color="warning" />;
      default: return <InfoIcon color="info" />;
    }
  };

  const testEnvironmentVariables = async () => {
    setCurrentTest('Environment Variables');
    
    // Test Resend API Key
    const resendKey = import.meta.env.VITE_RESEND_API_KEY;
    if (!resendKey) {
      addResult({
        name: 'Resend API Key',
        status: 'error',
        message: 'VITE_RESEND_API_KEY not configured',
        details: { available: false }
      });
    } else {
      addResult({
        name: 'Resend API Key',
        status: 'success',
        message: `API key configured (${resendKey.substring(0, 10)}...)`,
        details: { available: true, keyLength: resendKey.length }
      });
    }

    // Test Supabase configuration
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      addResult({
        name: 'Supabase Configuration',
        status: 'error',
        message: 'Supabase environment variables missing',
        details: { 
          url: !!supabaseUrl, 
          key: !!supabaseKey,
          urlValue: supabaseUrl?.substring(0, 30) + '...',
          keyValue: supabaseKey?.substring(0, 10) + '...'
        }
      });
    } else {
      addResult({
        name: 'Supabase Configuration',
        status: 'success',
        message: 'Supabase environment variables configured',
        details: { 
          url: supabaseUrl.substring(0, 30) + '...', 
          keyLength: supabaseKey.length 
        }
      });
    }
  };

  const testEmailService = async () => {
    setCurrentTest('Email Service');
    
    try {
      const emailService = ResendEmailService.getInstance();
      
      // Test service configuration
      const isConfigured = emailService.isConfigured();
      addResult({
        name: 'Email Service Configuration',
        status: isConfigured ? 'success' : 'error',
        message: isConfigured ? 'Resend service configured correctly' : 'Resend service not configured',
        details: { configured: isConfigured }
      });

      if (!isConfigured) {
        return;
      }

      // Test welcome email
      const welcomeResult = await emailService.sendWelcomeEmail(testEmail, testName);
      addResult({
        name: 'Welcome Email Test',
        status: welcomeResult.success ? 'success' : 'error',
        message: welcomeResult.success ? 'Welcome email sent successfully' : `Failed: ${welcomeResult.error}`,
        details: { 
          success: welcomeResult.success, 
          messageId: welcomeResult.messageId,
          error: welcomeResult.error,
          email: testEmail
        }
      });

      // Test verification email
      const verificationUrl = `${window.location.origin}/auth/verify-email?token=test-token&email=${encodeURIComponent(testEmail)}`;
      const verificationResult = await emailService.sendEmailVerification({
        email: testEmail,
        verificationUrl,
        userName: testName
      });
      
      addResult({
        name: 'Verification Email Test',
        status: verificationResult.success ? 'success' : 'error',
        message: verificationResult.success ? 'Verification email sent successfully' : `Failed: ${verificationResult.error}`,
        details: { 
          success: verificationResult.success, 
          messageId: verificationResult.messageId,
          error: verificationResult.error,
          verificationUrl,
          email: testEmail
        }
      });

    } catch (error) {
      addResult({
        name: 'Email Service Test',
        status: 'error',
        message: `Email service test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error: error instanceof Error ? error.stack : error }
      });
    }
  };

  const testDatabaseService = async () => {
    setCurrentTest('Database Service');
    
    try {
      const db = DatabaseService.getInstance();
      
      // Test user creation
      const testUserId = `test-user-${Date.now()}`;
      const testUser = await db.createUser(testEmail, 'test-password', testName, false);
      
      addResult({
        name: 'Database User Creation',
        status: testUser ? 'success' : 'error',
        message: testUser ? 'Test user created successfully' : 'Failed to create test user',
        details: { user: testUser }
      });

      if (testUser) {
        // Test user retrieval
        const retrievedUser = db.getCurrentUser();
        addResult({
          name: 'Database User Retrieval',
          status: retrievedUser ? 'success' : 'error',
          message: retrievedUser ? 'User retrieved successfully' : 'Failed to retrieve user',
          details: { user: retrievedUser }
        });

        // Test subscription update
        const updatedUser = db.updateUserSubscription(testUser.id, true);
        addResult({
          name: 'Database Subscription Update',
          status: updatedUser ? 'success' : 'error',
          message: updatedUser ? 'Subscription updated successfully' : 'Failed to update subscription',
          details: { 
            original: testUser,
            updated: updatedUser,
            subscriptionChanged: updatedUser?.isSubscribed !== testUser.isSubscribed
          }
        });

        // Cleanup test user
        db.setCurrentUser(null);
      }

    } catch (error) {
      addResult({
        name: 'Database Service Test',
        status: 'error',
        message: `Database test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error: error instanceof Error ? error.stack : error }
      });
    }
  };

  const testSupabaseService = async () => {
    setCurrentTest('Supabase Service');
    
    try {
      const membershipService = SecureMembershipService.getInstance();
      
      // Test service connection
      try {
        const currentUser = await membershipService.getCurrentUser();
        addResult({
          name: 'Supabase Connection',
          status: 'success',
          message: 'Successfully connected to Supabase',
          details: { currentUser: currentUser || 'No user logged in' }
        });
      } catch (connError) {
        addResult({
          name: 'Supabase Connection',
          status: 'warning',
          message: 'Connected to Supabase but no authenticated user',
          details: { error: connError instanceof Error ? connError.message : connError }
        });
      }

      // Test subscription status check
      try {
        const status = await membershipService.checkSubscriptionStatus();
        addResult({
          name: 'Subscription Status Check',
          status: 'success',
          message: 'Subscription status retrieved successfully',
          details: { status }
        });
      } catch (statusError) {
        addResult({
          name: 'Subscription Status Check',
          status: 'warning',
          message: 'Could not check subscription status (user may not be logged in)',
          details: { error: statusError instanceof Error ? statusError.message : statusError }
        });
      }

      // Test feature access check
      try {
        const access = await membershipService.canAccessFeature('property_search');
        addResult({
          name: 'Feature Access Check',
          status: 'success',
          message: 'Feature access check completed',
          details: { access }
        });
      } catch (accessError) {
        addResult({
          name: 'Feature Access Check',
          status: 'warning',
          message: 'Could not check feature access',
          details: { error: accessError instanceof Error ? accessError.message : accessError }
        });
      }

    } catch (error) {
      addResult({
        name: 'Supabase Service Test',
        status: 'error',
        message: `Supabase test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error: error instanceof Error ? error.stack : error }
      });
    }
  };

  const runFullTestSuite = async () => {
    setIsRunning(true);
    clearResults();
    
    addResult({
      name: 'Test Suite Started',
      status: 'info',
      message: 'Running comprehensive database and email tests...'
    });

    try {
      await testEnvironmentVariables();
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for readability
      
      await testEmailService();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await testDatabaseService();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await testSupabaseService();
      
      addResult({
        name: 'Test Suite Completed',
        status: 'info',
        message: 'All tests completed. Review results above.'
      });
      
    } catch (error) {
      addResult({
        name: 'Test Suite Error',
        status: 'error',
        message: `Test suite failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error }
      });
    }
    
    setIsRunning(false);
    setCurrentTest('');
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: 3 }}>
      <Typography variant="h4" gutterBottom align="center">
        🧪 Database & Email Test Suite
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}>
        Comprehensive testing tool to diagnose signup, email delivery, and membership persistence issues
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Test Configuration</Typography>
          <Stack spacing={2} direction={{ xs: 'column', md: 'row' }}>
            <TextField
              fullWidth
              label="Test Email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Enter your email to test email delivery"
              variant="outlined"
              size="small"
            />
            <TextField
              fullWidth
              label="Test Name"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              placeholder="Test User Name"
              variant="outlined"
              size="small"
            />
          </Stack>
          
          <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center' }}>
            <Button
              variant="contained"
              onClick={runFullTestSuite}
              disabled={isRunning}
              startIcon={isRunning ? <CircularProgress size={20} /> : undefined}
              size="large"
            >
              {isRunning ? `Running ${currentTest}...` : 'Run Full Test Suite'}
            </Button>
            
            <Button variant="outlined" onClick={clearResults} disabled={isRunning}>
              Clear Results
            </Button>
          </Box>
        </CardContent>
      </Card>

      {testResults.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Test Results ({testResults.length})
            </Typography>
            
            <Box sx={{ maxHeight: 600, overflowY: 'auto' }}>
              {testResults.map((result, index) => (
                <Accordion key={index} defaultExpanded={result.status === 'error'}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                      {getStatusIcon(result.status)}
                      <Typography sx={{ flexGrow: 1 }}>{result.name}</Typography>
                      <Chip 
                        label={result.status} 
                        color={result.status === 'success' ? 'success' : 
                               result.status === 'error' ? 'error' : 'default'}
                        size="small"
                      />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Alert severity={result.status === 'success' ? 'success' : 
                                   result.status === 'error' ? 'error' : 'info'}>
                      {result.message}
                    </Alert>
                    
                    {result.details && (
                      <Paper sx={{ mt: 2, p: 2, bgcolor: 'grey.50' }}>
                        <Typography variant="subtitle2" gutterBottom>Details:</Typography>
                        <pre style={{ 
                          fontSize: '12px', 
                          margin: 0, 
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word'
                        }}>
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </Paper>
                    )}
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {testResults.length === 0 && !isRunning && (
        <Card>
          <CardContent>
            <Typography variant="body1" align="center" color="text.secondary">
              Click "Run Full Test Suite" to start testing your email and database configuration
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default DatabaseEmailTestSuite;

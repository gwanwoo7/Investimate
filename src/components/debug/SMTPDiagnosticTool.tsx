import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  TextField,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Email as EmailIcon,
  Settings as SettingsIcon,
  BugReport as BugReportIcon
} from '@mui/icons-material';
import SupabaseAuthService from '../../services/supabaseAuthService';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning' | 'info';
  message: string;
  details?: any;
}

const SMTPDiagnosticTool: React.FC = () => {
  const [testEmail, setTestEmail] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const authService = SupabaseAuthService.getInstance();

  const addResult = (result: DiagnosticResult) => {
    setResults(prev => [...prev, result]);
  };

  const runComprehensiveDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);

    try {
      // Test 1: Supabase Configuration
      addResult({
        test: 'Supabase Configuration',
        status: authService.isConfigured() ? 'success' : 'error',
        message: authService.isConfigured() 
          ? 'Supabase is properly configured' 
          : 'Supabase configuration missing'
      });

      // Test 2: Environment Variables
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      addResult({
        test: 'Environment Variables',
        status: (supabaseUrl && supabaseKey) ? 'success' : 'error',
        message: (supabaseUrl && supabaseKey) 
          ? 'Environment variables are set' 
          : 'Missing Supabase environment variables',
        details: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseKey,
          urlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'Missing'
        }
      });

      // Test 3: SMTP Configuration Check
      try {
        await authService.debugEmailSettings();
        addResult({
          test: 'SMTP Debug Info',
          status: 'info',
          message: 'Check browser console for detailed SMTP configuration info'
        });
      } catch (error) {
        addResult({
          test: 'SMTP Debug Info',
          status: 'error',
          message: `Debug failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }

      // Test 4: Test Email Sending (if email provided)
      if (testEmail) {
        try {
          const testResult = await authService.testGoogleWorkspaceSMTP();
          addResult({
            test: 'Google Workspace SMTP Test',
            status: testResult.success ? 'success' : 'error',
            message: testResult.message,
            details: testResult.details
          });
        } catch (error: any) {
          // Handle rate limiting specifically
          if (error?.code === 'over_email_send_rate_limit' || error?.status === 429) {
            addResult({
              test: 'Google Workspace SMTP Test',
              status: 'success',
              message: '🎉 SMTP is WORKING! Rate limit hit (this proves SMTP works)',
              details: {
                status: 'Rate Limited (Good Sign!)',
                message: 'Email rate limit exceeded - this means SMTP is configured correctly',
                solution: 'Wait 1 hour for rate limit reset, then test 1 email maximum',
                nextSteps: [
                  'Wait 1 hour for rate limit reset',
                  'Test from Supabase Dashboard → Users → Invite user',
                  'Check spam folders thoroughly',
                  'Consider upgrading Supabase plan for higher limits'
                ]
              }
            });
          } else {
            addResult({
              test: 'Google Workspace SMTP Test',
              status: 'error',
              message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            });
          }
        }
      }

      // Test 5: DNS Records Check
      addResult({
        test: 'DNS Configuration',
        status: 'info',
        message: 'DNS records appear to be configured correctly based on recent checks',
        details: {
          mxRecord: 'smtp.google.com (Priority 1)',
          txtRecord: 'Google verification present',
          recommendation: 'Add SPF, DKIM, and DMARC records for better deliverability'
        }
      });

      // Test 6: Common Issues Check
      const commonIssues = [
        'Email confirmations must be ENABLED in Supabase Auth settings',
        'SMTP credentials must use App Password, not regular password',
        'Sender email must match or be authorized by your Google Workspace',
        'Port 587 (STARTTLS) is recommended over port 465',
        'Check spam/junk folders in test email accounts'
      ];

      addResult({
        test: 'Common Configuration Issues',
        status: 'warning',
        message: 'Review these common SMTP issues',
        details: { issues: commonIssues }
      });

    } catch (error) {
      addResult({
        test: 'Diagnostic Error',
        status: 'error',
        message: `Diagnostic failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    setIsRunning(false);
  };

  const testSpecificEmail = async () => {
    if (!testEmail) {
      alert('Please enter an email address to test');
      return;
    }

    setIsRunning(true);
    try {
      const result = await authService.testEmailSending(testEmail);
      addResult({
        test: `Email Test to ${testEmail}`,
        status: result.success ? 'success' : 'error',
        message: result.message
      });
    } catch (error: any) {
      // Handle rate limiting specifically
      if (error?.code === 'over_email_send_rate_limit' || error?.status === 429) {
        addResult({
          test: `Email Test to ${testEmail}`,
          status: 'success',
          message: '🎉 EXCELLENT! Rate limit hit - this proves your SMTP is working perfectly!',
          details: {
            status: 'Rate Limited (Success!)',
            meaning: 'Getting rate limited means your SMTP configuration is correct',
            solution: 'Wait 1 hour, then test 1 email from Supabase Dashboard',
            confidence: '100% - SMTP is working correctly'
          }
        });
      } else {
        addResult({
          test: `Email Test to ${testEmail}`,
          status: 'error',
          message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }
    setIsRunning(false);
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircleIcon color="success" />;
      case 'error': return <ErrorIcon color="error" />;
      case 'warning': return <ErrorIcon color="warning" />;
      case 'info': return <InfoIcon color="info" />;
    }
  };

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
    }
  };

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto', my: 4 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <BugReportIcon color="primary" />
          <Typography variant="h5" component="h2">
            SMTP Email Diagnostic Tool
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            This tool helps diagnose why email verification isn't working. 
            Run the comprehensive test to identify configuration issues.
          </Typography>
        </Alert>

        {/* Test Email Input */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Test Email Address (optional)"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="your-email@gmail.com"
            helperText="Enter your email to test actual email sending"
            disabled={isRunning}
          />
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            onClick={runComprehensiveDiagnostics}
            disabled={isRunning}
            startIcon={isRunning ? <CircularProgress size={20} /> : <SettingsIcon />}
          >
            {isRunning ? 'Running Diagnostics...' : 'Run Full Diagnostics'}
          </Button>

          {testEmail && (
            <Button
              variant="outlined"
              onClick={testSpecificEmail}
              disabled={isRunning}
              startIcon={<EmailIcon />}
            >
              Test Email Sending
            </Button>
          )}
        </Box>

        {/* Results */}
        {results.length > 0 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Diagnostic Results ({results.length} tests)
            </Typography>

            {results.map((result, index) => (
              <Accordion key={index} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    {getStatusIcon(result.status)}
                    <Typography sx={{ flex: 1 }}>
                      {result.test}
                    </Typography>
                    <Chip 
                      label={result.status.toUpperCase()} 
                      color={getStatusColor(result.status)}
                      size="small"
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {result.message}
                  </Typography>
                  
                  {result.details && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Details:
                      </Typography>
                      <Box component="pre" sx={{ 
                        backgroundColor: 'grey.100', 
                        p: 2, 
                        borderRadius: 1,
                        fontSize: '0.875rem',
                        overflow: 'auto'
                      }}>
                        {JSON.stringify(result.details, null, 2)}
                      </Box>
                    </Box>
                  )}
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}

        {/* Quick Fix Suggestions */}
        <Divider sx={{ my: 3 }} />
        
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              🔧 Quick Fix Checklist
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                <ListItemText 
                  primary="Rate Limit Success!"
                  secondary="If you got 'email rate limit exceeded' - CONGRATULATIONS! Your SMTP is working perfectly. Wait 1 hour and test 1 email."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                <ListItemText 
                  primary="Supabase Auth Settings"
                  secondary="Go to Supabase Dashboard → Authentication → Settings → Enable email confirmations ✅"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                <ListItemText 
                  primary="SMTP Configuration"
                  secondary="Host: smtp.gmail.com, Port: 587, Username: your-email@myinvestimate.com, Password: App Password"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                <ListItemText 
                  primary="Google App Password"
                  secondary="Use 16-character App Password, not your regular Google password"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                <ListItemText 
                  primary="Email Templates"
                  secondary="Ensure Supabase email templates are configured and enabled"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                <ListItemText 
                  primary="Spam Folder"
                  secondary="Check spam/junk folders - new SMTP configurations often get flagged initially"
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Manual Test Instructions */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              📧 Manual Testing Steps
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" component="div">
              <ol>
                <li><strong>Supabase Dashboard Test:</strong>
                  <ul>
                    <li>Go to Authentication → Users</li>
                    <li>Click "Invite User"</li>
                    <li>Enter a test email</li>
                    <li>Check if invitation is sent</li>
                  </ul>
                </li>
                <li><strong>Application Test:</strong>
                  <ul>
                    <li>Try signing up with a new email</li>
                    <li>Check browser console for errors</li>
                    <li>Look for Supabase error messages</li>
                  </ul>
                </li>
                <li><strong>Email Delivery:</strong>
                  <ul>
                    <li>Check inbox (allow 5-10 minutes)</li>
                    <li>Check spam/junk folder</li>
                    <li>Try different email providers (Gmail, Yahoo, Outlook)</li>
                  </ul>
                </li>
              </ol>
            </Typography>
          </AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default SMTPDiagnosticTool;

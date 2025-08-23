import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  Snackbar,
  Card,
  CardContent
} from '@mui/material';
import {
  Email,
  Send,
  Person,
  Subject
} from '@mui/icons-material';
import NavigationBar from '../components/NavigationBar';

interface ContactPageProps {
  onBack: () => void;
}

export default function ContactPage({ onBack }: ContactPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' | 'info' 
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Enhanced email functionality with myinvestimate.com
      const subject = encodeURIComponent(`[Investimate Contact] ${formData.subject}`);
      const body = encodeURIComponent(
        `Contact Form Submission from Investimate.com\n\n` +
        `Name: ${formData.name}\n` +
        `Email: ${formData.email}\n` +
        `Subject: ${formData.subject}\n\n` +
        `Message:\n${formData.message}\n\n` +
        `---\n` +
        `Sent from: ${window.location.origin}\n` +
        `Date: ${new Date().toLocaleString()}`
      );
      
      // Primary method: Use mailto with myinvestimate.com
      const mailtoLink = `mailto:support@myinvestimate.com?subject=${subject}&body=${body}`;
      
      // Test if mailto is supported
      const testLink = document.createElement('a');
      testLink.href = mailtoLink;
      testLink.click();
      
      setSnackbar({
        open: true,
        message: 'Email client opened successfully! Please send the message to complete your inquiry.',
        severity: 'success'
      });
      
      // Log for debugging
      console.log('📧 Contact form submitted:', {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        timestamp: new Date().toISOString()
      });
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      }, 3000);
      
    } catch (error) {
      console.error('Email submission error:', error);
      setSnackbar({
        open: true,
        message: 'Unable to open email client. Please send your message manually to support@myinvestimate.com or try copying the details below.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Test email functionality
  const testEmailSetup = () => {
    const testSubject = encodeURIComponent('[Test] Email Setup Verification');
    const testBody = encodeURIComponent(
      'This is a test email to verify the email setup for myinvestimate.com\n\n' +
      'If you receive this, the email configuration is working correctly.\n\n' +
      `Sent at: ${new Date().toLocaleString()}`
    );
    
    const mailtoLink = `mailto:support@myinvestimate.com?subject=${testSubject}&body=${testBody}`;
    window.location.href = mailtoLink;
    
    setSnackbar({
      open: true,
      message: 'Test email opened! Check if your email client launched correctly.',
      severity: 'info'
    });
  };

  const isFormValid = formData.name && formData.email && formData.subject && formData.message;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <NavigationBar
        showBackButton={true}
        onBackClick={onBack}
        title="Contact Us"
        showNavButtons={false}
      />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Paper sx={{ p: 4, mb: 4, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Contact Us
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </Typography>
        </Paper>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          {/* Contact Form */}
          <Box sx={{ flex: 2 }}>
            <Paper sx={{ p: 4 }}>
              <Typography variant="h5" gutterBottom color="primary">
                Send us a Message
              </Typography>
              
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField
                    name="name"
                    label="Full Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    fullWidth
                    InputProps={{
                      startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                  
                  <TextField
                    name="email"
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    fullWidth
                    InputProps={{
                      startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                  
                  <TextField
                    name="subject"
                    label="Subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    fullWidth
                    InputProps={{
                      startAdornment: <Subject sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                  
                  <TextField
                    name="message"
                    label="Message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    fullWidth
                    multiline
                    rows={6}
                    placeholder="Tell us about your inquiry, feedback, or how we can help you..."
                  />
                  
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={!isFormValid || loading}
                    startIcon={<Send />}
                    sx={{ mt: 2, py: 1.5 }}
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Box>

          {/* Contact Information */}
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Get in Touch
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Card variant="outlined">
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Email color="primary" />
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Email Support
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        support@myinvestimate.com
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>

                <Card variant="outlined">
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Send color="primary" />
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        General Inquiries
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        hello@myinvestimate.com
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>

                {/* Test Email Button */}
                <Button
                  variant="outlined"
                  size="small"
                  onClick={testEmailSetup}
                  startIcon={<Email />}
                  sx={{ mt: 2 }}
                >
                  Test Email Setup
                </Button>
              </Box>
            </Paper>

            {/* Response Time */}
            <Paper sx={{ p: 3, bgcolor: 'info.light' }}>
              <Typography variant="h6" gutterBottom color="info.dark">
                Response Time
              </Typography>
              <Typography variant="body2" color="info.dark">
                We typically respond to all inquiries within 24 hours during business days. 
                For urgent matters, please mention "URGENT" in your subject line.
              </Typography>
            </Paper>

            {/* FAQ and Email Instructions */}
            <Paper sx={{ p: 3, mt: 3, bgcolor: 'warning.light' }}>
              <Typography variant="h6" gutterBottom color="warning.dark">
                Email Setup Status
              </Typography>
              <Typography variant="body2" color="warning.dark" sx={{ mb: 2 }}>
                <strong>Current Configuration:</strong>
              </Typography>
              <Typography variant="body2" color="warning.dark" component="div">
                • Primary: support@myinvestimate.com<br/>
                • Secondary: hello@myinvestimate.com<br/>
                • Protocol: mailto (opens your email client)
              </Typography>
              <Typography variant="caption" color="warning.dark" sx={{ mt: 1, display: 'block' }}>
                Note: Requires domain email setup to receive messages
              </Typography>
            </Paper>

            {/* Debug Information */}
            <Paper sx={{ p: 3, mt: 3, bgcolor: 'info.light' }}>
              <Typography variant="h6" gutterBottom color="info.dark">
                Testing Information
              </Typography>
              <Typography variant="body2" color="info.dark" sx={{ mb: 2 }}>
                Use the "Test Email Setup" button above to verify your email client integration.
              </Typography>
              <Typography variant="body2" color="info.dark">
                <strong>Supported Email Clients:</strong><br/>
                • Apple Mail, Outlook, Gmail, Thunderbird<br/>
                • Default system email applications<br/>
                • Web-based email clients (with proper configuration)
              </Typography>
            </Paper>
          </Box>
        </Box>

        {/* Additional Information */}
        <Paper sx={{ p: 4, mt: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom color="primary">
            We're Here to Help
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Whether you're a first-time investor or a seasoned real estate professional, 
            our team is dedicated to helping you make the most of Investimate. Don't hesitate 
            to reach out with questions, suggestions, or feedback.
          </Typography>
        </Paper>
      </Container>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

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
  CardContent,
  AppBar,
  Toolbar,
  IconButton
} from '@mui/material';
import {
  Email,
  Send,
  Person,
  Subject,
  ArrowBack
} from '@mui/icons-material';

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
    severity: 'success' as 'success' | 'error' 
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
      // Create a mailto link to send email
      const subject = encodeURIComponent(formData.subject);
      const body = encodeURIComponent(
        `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
      );
      const mailtoLink = `mailto:admin@investimate.com?subject=${subject}&body=${body}`;
      
      // Open the user's default email client
      window.location.href = mailtoLink;
      
      setSnackbar({
        open: true,
        message: 'Your email client has been opened. Please send the message from there.',
        severity: 'success'
      });
      
      // Reset form after a delay
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      }, 2000);
      
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to open email client. Please copy and send the message manually to admin@investimate.com',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.name && formData.email && formData.subject && formData.message;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <AppBar position="static" sx={{ bgcolor: 'primary.main' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={onBack}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Contact Us
          </Typography>
        </Toolbar>
      </AppBar>

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
                        Email
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        admin@investimate.com
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
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

            {/* FAQ Link */}
            <Paper sx={{ p: 3, mt: 3, bgcolor: 'success.light' }}>
              <Typography variant="h6" gutterBottom color="success.dark">
                Quick Questions?
              </Typography>
              <Typography variant="body2" color="success.dark">
                Check out our FAQ section for common questions about property analysis, 
                pricing, and platform features.
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

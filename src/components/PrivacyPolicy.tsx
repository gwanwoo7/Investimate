import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  Divider,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Alert
} from '@mui/material';
import { ArrowBack, Security, Shield, Lock } from '@mui/icons-material';

interface PrivacyPolicyProps {
  onBack?: () => void;
  standalone?: boolean;
}

export default function PrivacyPolicy({ onBack, standalone = false }: PrivacyPolicyProps) {
  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else if (standalone) {
      window.history.back();
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {standalone && (
        <AppBar position="static" sx={{ bgcolor: 'primary.main' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleBackClick}
              sx={{ mr: 2 }}
            >
              <ArrowBack />
            </IconButton>
            <Typography variant="h6" component="div">
              Privacy Policy
            </Typography>
          </Toolbar>
        </AppBar>
      )}
      
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            Privacy Policy for Investimate
          </Typography>
          
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
            Effective Date: August 23, 2025
          </Typography>

          <Typography variant="body1" paragraph>
            Investimate ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
            1. Information We Collect
          </Typography>
          
          <Typography variant="body1" paragraph>
            We may collect information about you in a variety of ways:
          </Typography>

          <Box sx={{ bgcolor: 'info.light', p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="body2" paragraph sx={{ fontWeight: 'bold' }}>
              Personal Data:
            </Typography>
            <Typography variant="body1" paragraph>
              We may collect personally identifiable information, such as your name and email address, when you voluntarily provide it to us, for example, by creating an account or subscribing to a newsletter.
            </Typography>

            <Typography variant="body2" paragraph sx={{ fontWeight: 'bold', mt: 2 }}>
              Derivative Data:
            </Typography>
            <Typography variant="body1" paragraph>
              Our servers automatically collect information when you access the website, such as your IP address, browser type, operating system, access times, and the pages you have viewed directly before and after accessing the site.
            </Typography>

            <Typography variant="body2" paragraph sx={{ fontWeight: 'bold', mt: 2 }}>
              Financial Data:
            </Typography>
            <Typography variant="body1" paragraph>
              We do not collect or store any personal financial information like credit card numbers. If a paid service is offered, it will be processed through a secure third-party payment processor (Stripe).
            </Typography>
          </Box>

          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
            2. Use of Your Information
          </Typography>
          
          <Typography variant="body1" paragraph>
            Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you to:
          </Typography>

          <Box component="ul" sx={{ pl: 3 }}>
            <Typography component="li" variant="body1" paragraph>
              Create and manage your account.
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Improve the functionality and user experience of our website.
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Monitor and analyze usage and trends to improve the Service.
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Send you newsletters or other marketing communications, from which you may opt-out at any time.
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Respond to your comments and questions.
            </Typography>
          </Box>

          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
            3. Cookies and Tracking Technologies
          </Typography>
          
          <Typography variant="body1" paragraph>
            We may use cookies, web beacons, and other tracking technologies on the website to help customize the Service and improve your experience. When you access the site, your personal information is not collected through the use of tracking technology. Most browsers are set to accept cookies by default. You can remove or reject cookies, but be aware that such action could affect the availability and functionality of the website.
          </Typography>

          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
            4. Disclosure of Your Information
          </Typography>
          
          <Box sx={{ bgcolor: 'success.light', p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="body1" paragraph sx={{ fontWeight: 'bold' }}>
              We do not sell, trade, or rent your personal information to others.
            </Typography>
            
            <Typography variant="body1" paragraph>
              We may share information we have collected about you in certain situations:
            </Typography>

            <Typography variant="body2" paragraph sx={{ fontWeight: 'bold', mt: 2 }}>
              By Law or to Protect Rights:
            </Typography>
            <Typography variant="body1" paragraph>
              If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others.
            </Typography>

            <Typography variant="body2" paragraph sx={{ fontWeight: 'bold', mt: 2 }}>
              Third-Party Service Providers:
            </Typography>
            <Typography variant="body1" paragraph>
              We may share your information with third parties that perform services for us or on our behalf, including data analysis, hosting services, and email delivery (e.g., Google Analytics).
            </Typography>

            <Typography variant="body2" paragraph sx={{ fontWeight: 'bold', mt: 2 }}>
              Business Transfers:
            </Typography>
            <Typography variant="body1" paragraph>
              In connection with any merger, sale of company assets, or acquisition of all or a portion of our business by another company, your information may be transferred as part of the assets.
            </Typography>
          </Box>

          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
            5. Security of Your Information
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Security color="primary" />
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                Enterprise-Grade Security
              </Typography>
            </Box>
            <Typography variant="body2">
              We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
            </Typography>
          </Alert>

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Box sx={{ flex: 1, bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Shield color="success" fontSize="small" />
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  Data Encryption
                </Typography>
              </Box>
              <Typography variant="caption">
                All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption.
              </Typography>
            </Box>
            
            <Box sx={{ flex: 1, bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Lock color="primary" fontSize="small" />
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  Secure Storage
                </Typography>
              </Box>
              <Typography variant="caption">
                Payment data processed by Stripe (PCI DSS Level 1 compliant). We never store payment information.
              </Typography>
            </Box>
          </Box>

          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
            6. Policy for Children
          </Typography>
          
          <Typography variant="body1" paragraph>
            Our Service is not intended for use by children under the age of 13. We do not knowingly collect personal information from children under 13.
          </Typography>

          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
            7. Your Rights
          </Typography>
          
          <Typography variant="body1" paragraph>
            Depending on your location, you may have certain rights regarding your personal information:
          </Typography>

          <Box component="ul" sx={{ pl: 3 }}>
            <Typography component="li" variant="body1" paragraph>
              <strong>Right to Access:</strong> You can request access to the personal information we have about you.
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              <strong>Right to Correction:</strong> You can request that we correct any inaccurate information about you.
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              <strong>Right to Deletion:</strong> You can request that we delete your personal information.
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              <strong>Right to Portability:</strong> You can request a copy of your personal information in a machine-readable format.
            </Typography>
          </Box>

          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
            8. Changes to This Privacy Policy
          </Typography>
          
          <Typography variant="body1" paragraph>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
          </Typography>

          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
            9. Contact Us
          </Typography>
          
          <Typography variant="body1" paragraph>
            If you have questions or comments about this Privacy Policy, please contact us at: support@investimate.com
          </Typography>

          {onBack && (
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Button variant="contained" onClick={onBack} size="large">
                I Understand
              </Button>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}

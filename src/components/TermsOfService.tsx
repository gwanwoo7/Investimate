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
  IconButton
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

interface TermsOfServiceProps {
  onBack?: () => void;
  standalone?: boolean;
}

export default function TermsOfService({ onBack, standalone = false }: TermsOfServiceProps) {
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
              Terms of Service
            </Typography>
          </Toolbar>
        </AppBar>
      )}
      
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            Terms of Service for Investimate
          </Typography>
          
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
            Effective Date: August 23, 2025
          </Typography>

          <Typography variant="body1" paragraph>
            Welcome to Investimate! These Terms of Service ("Terms") govern your access to and use of the Investimate website and any related services (collectively, the "Service"). Please read these Terms carefully. By accessing or using our Service, you agree to be bound by these Terms.
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
            1. Description of Service
          </Typography>
          
          <Typography variant="body1" paragraph>
            Investimate provides data, estimates, calculations, and informational tools related to real estate properties for the purpose of rental investment analysis. The information may include, but is not limited to, estimated property values, potential rental income, estimated expenses, cash flow projections, and other related metrics.
          </Typography>

          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
            2. No Financial, Investment, or Legal Advice
          </Typography>
          
          <Box sx={{ bgcolor: 'warning.light', p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="body1" paragraph sx={{ fontWeight: 'bold' }}>
              The content provided on Investimate is for informational and educational purposes ONLY.
            </Typography>
            <Typography variant="body1" paragraph>
              • Investimate is not a registered investment advisor, broker-dealer, or financial analyst.
            </Typography>
            <Typography variant="body1" paragraph>
              • The information provided through the Service does not constitute financial advice, investment advice, legal advice, tax advice, or a recommendation to buy, sell, or hold any property or security.
            </Typography>
            <Typography variant="body1" paragraph>
              • You should not construe any of the information on our website as a solicitation or offer to engage in any investment transaction.
            </Typography>
          </Box>

          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
            3. Disclaimer of Warranties and Limitation of Liability
          </Typography>
          
          <Box sx={{ bgcolor: 'error.light', p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="body1" paragraph sx={{ fontWeight: 'bold' }}>
              This is the most important section of our Terms. Your use of the Service is at your sole risk.
            </Typography>
            
            <Typography variant="body2" paragraph sx={{ fontWeight: 'bold', mt: 2 }}>
              Information May Be Incorrect:
            </Typography>
            <Typography variant="body1" paragraph>
              The data presented on Investimate is aggregated from various public and third-party sources. We do not and cannot guarantee the accuracy, completeness, timeliness, or reliability of any information provided. The data may contain errors, omissions, or be outdated. Real estate values, rental rates, and expenses can change rapidly.
            </Typography>

            <Typography variant="body2" paragraph sx={{ fontWeight: 'bold', mt: 2 }}>
              "As-Is" Basis:
            </Typography>
            <Typography variant="body1" paragraph>
              The Service is provided on an "AS IS" and "AS AVAILABLE" basis without any warranties of any kind, either express or implied.
            </Typography>

            <Typography variant="body2" paragraph sx={{ fontWeight: 'bold', mt: 2 }}>
              NO LEGAL OBLIGATION OR RESPONSIBILITY:
            </Typography>
            <Typography variant="body1" paragraph>
              Investimate, its owners, employees, affiliates, and agents shall not be held liable for any investment decisions, actions taken, or losses incurred, financial or otherwise, based on the information provided through the Service. You are solely and exclusively responsible for conducting your own due diligence, verifying all information, and making your own investment decisions. We strongly recommend consulting with qualified professionals, such as a financial advisor, real estate agent, and legal counsel, before making any investment.
            </Typography>
          </Box>

          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
            4. User Conduct
          </Typography>
          
          <Typography variant="body1" paragraph>
            By using the Service, you agree not to:
          </Typography>
          
          <Box component="ul" sx={{ pl: 3 }}>
            <Typography component="li" variant="body1" paragraph>
              Use the Service for any illegal purpose or in violation of any local, state, national, or international law.
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Scrape, copy, or systematically retrieve data from the Service without our express written permission.
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Interfere with or disrupt the operation of the Service or the servers or networks used to make the Service available.
            </Typography>
          </Box>

          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
            5. Intellectual Property
          </Typography>
          
          <Typography variant="body1" paragraph>
            All content on the Service, including text, graphics, logos, and software, is the property of Investimate or its licensors and is protected by copyright and other intellectual property laws. You are granted a limited, non-exclusive license to access and use the Service for personal, non-commercial purposes.
          </Typography>

          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
            6. Third-Party Links
          </Typography>
          
          <Typography variant="body1" paragraph>
            The Service may contain links to third-party websites or services. We are not responsible for the content, accuracy, or opinions expressed on such websites, and we do not investigate, monitor, or check them for accuracy or completeness.
          </Typography>

          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
            7. Changes to Terms
          </Typography>
          
          <Typography variant="body1" paragraph>
            We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the new Terms on this page. Your continued use of the Service after any such changes constitutes your acceptance of the new Terms.
          </Typography>

          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
            8. Governing Law
          </Typography>
          
          <Typography variant="body1" paragraph>
            These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law principles.
          </Typography>

          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
            9. Contact Us
          </Typography>
          
          <Typography variant="body1" paragraph>
            If you have any questions about these Terms, please contact us at: support@investimate.com
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

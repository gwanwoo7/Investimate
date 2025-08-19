import { Alert, Button, Typography, Box, Link } from '@mui/material';
import { AlertCircle, ExternalLink } from 'lucide-react';

interface APIErrorHandlerProps {
  error: string;
  service: 'real-estate' | 'oauth' | 'payment';
}

export default function APIErrorHandler({ error, service }: APIErrorHandlerProps) {
  const getServiceInfo = () => {
    switch (service) {
      case 'real-estate':
        return {
          title: 'Real Estate API Not Configured',
          description: 'Property searches are using demo data. To access live property listings:',
          steps: [
            'Sign up at RapidAPI.com',
            'Subscribe to the Zillow API',
            'Add your API key to .env file as VITE_RAPID_API_KEY',
            'Restart the development server'
          ],
          link: 'https://rapidapi.com/s.mahmoud97/api/zillow-com1'
        };
      case 'oauth':
        return {
          title: 'OAuth Not Configured',
          description: 'Google/Apple login is not available. To enable social login:',
          steps: [
            'Configure Google OAuth in Google Cloud Console',
            'Set up Apple Sign In (optional)',
            'Add client IDs to .env file',
            'Restart the development server'
          ],
          link: 'https://console.cloud.google.com/'
        };
      case 'payment':
        return {
          title: 'Payment System Not Configured',
          description: 'Pro subscription payments are in demo mode. To enable real payments:',
          steps: [
            'Set up Stripe account',
            'Configure webhook endpoints',
            'Add Stripe keys to .env file',
            'Implement backend payment processing'
          ],
          link: 'https://stripe.com/'
        };
      default:
        return {
          title: 'Service Error',
          description: 'An error occurred with the service.',
          steps: [],
          link: ''
        };
    }
  };

  const serviceInfo = getServiceInfo();

  return (
    <Alert 
      severity="warning" 
      sx={{ mb: 2 }}
      icon={<AlertCircle />}
    >
      <Typography variant="h6" gutterBottom>
        {serviceInfo.title}
      </Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>
        {serviceInfo.description}
      </Typography>
      {serviceInfo.steps.length > 0 && (
        <Box component="ol" sx={{ pl: 2, mb: 1 }}>
          {serviceInfo.steps.map((step, index) => (
            <li key={index}>
              <Typography variant="body2">{step}</Typography>
            </li>
          ))}
        </Box>
      )}
      {serviceInfo.link && (
        <Button
          size="small"
          startIcon={<ExternalLink size={16} />}
          href={serviceInfo.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          Configure Service
        </Button>
      )}
      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
          Error: {error}
        </Typography>
      )}
    </Alert>
  );
}

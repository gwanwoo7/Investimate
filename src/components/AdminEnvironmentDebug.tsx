import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Grid,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  ExpandMore,
  CheckCircle,
  Error,
  Warning,
  Info,
  VpnKey,
  Cloud,
  Payment,
  Google
} from '@mui/icons-material';

interface ConfigStatus {
  name: string;
  status: 'success' | 'error' | 'warning' | 'info';
  message: string;
  value?: string;
  icon: React.ReactNode;
}

export default function AdminEnvironmentDebug() {
  const getConfigStatus = (): ConfigStatus[] => {
    const configs: ConfigStatus[] = [];

    // Supabase Configuration
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey) {
      configs.push({
        name: 'Supabase Connection',
        status: 'success',
        message: 'Supabase is properly configured',
        value: supabaseUrl,
        icon: <Cloud />
      });
    } else {
      configs.push({
        name: 'Supabase Connection',
        status: 'error',
        message: 'Supabase configuration missing',
        icon: <Cloud />
      });
    }

    // Stripe Configuration
    const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (stripeKey) {
      configs.push({
        name: 'Stripe Payment',
        status: 'success',
        message: 'Stripe is configured for payments',
        value: `${stripeKey.substring(0, 20)}...`,
        icon: <Payment />
      });
    } else {
      configs.push({
        name: 'Stripe Payment',
        status: 'error',
        message: 'VITE_STRIPE_PUBLISHABLE_KEY not set',
        icon: <Payment />
      });
    }

    // Google OAuth Configuration
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (googleClientId && !googleClientId.includes('your_google_client_id_here')) {
      configs.push({
        name: 'Google OAuth',
        status: 'success',
        message: 'Google Client ID is configured',
        value: `${googleClientId.substring(0, 30)}...`,
        icon: <Google />
      });
    } else {
      configs.push({
        name: 'Google OAuth',
        status: 'warning',
        message: 'Google Client ID not configured properly',
        icon: <Google />
      });
    }

    // Real Estate API
    const rapidApiKey = import.meta.env.VITE_RAPID_API_KEY;
    if (rapidApiKey && !rapidApiKey.includes('your_rapid_api_key_here')) {
      configs.push({
        name: 'Real Estate API',
        status: 'success',
        message: 'RapidAPI key is configured',
        value: `${rapidApiKey.substring(0, 20)}...`,
        icon: <VpnKey />
      });
    } else {
      configs.push({
        name: 'Real Estate API',
        status: 'info',
        message: 'Using mock data (RapidAPI key not set)',
        icon: <VpnKey />
      });
    }

    return configs;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle color="success" />;
      case 'error': return <Error color="error" />;
      case 'warning': return <Warning color="warning" />;
      case 'info': return <Info color="info" />;
      default: return <Info />;
    }
  };

  const configs = getConfigStatus();

  return (
    <Box sx={{ mt: 3 }}>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls="environment-config-content"
          id="environment-config-header"
        >
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <VpnKey />
            Environment Configuration Status
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Alert severity="info" sx={{ mb: 2 }}>
            This panel shows the current status of API keys and environment variables. 
            Make sure all critical services are properly configured.
          </Alert>

          <Grid container spacing={2}>
            {configs.map((config, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      {config.icon}
                      <Typography variant="h6">
                        {config.name}
                      </Typography>
                      <Chip 
                        label={config.status.toUpperCase()}
                        color={getStatusColor(config.status) as any}
                        size="small"
                        icon={getStatusIcon(config.status)}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {config.message}
                    </Typography>
                    {config.value && (
                      <Typography variant="body2" sx={{ mt: 1, fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
                        {config.value}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Configuration Notes:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <Info color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Supabase" 
                  secondary="Required for user authentication and database operations"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Info color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Stripe" 
                  secondary="Required for subscription payments ($0.01 test mode)"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Info color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Google OAuth" 
                  secondary="Optional - enables Google Sign-In functionality"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Info color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Real Estate API" 
                  secondary="Optional - app uses mock data when not configured"
                />
              </ListItem>
            </List>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}

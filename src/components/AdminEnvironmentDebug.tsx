import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Grid,
  Button,
  Divider,
  CircularProgress
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
  Google,
  Apple,
  Home,
  Email,
  Refresh,
  AdminPanelSettings,
  Dashboard,
  BugReport
} from '@mui/icons-material';

interface ConfigStatus {
  name: string;
  status: 'success' | 'error' | 'warning' | 'info';
  message: string;
  value?: string;
  icon: React.ReactNode;
  category: 'authentication' | 'payment' | 'api' | 'email' | 'database';
  priority: 'critical' | 'high' | 'medium' | 'low';
}

interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  criticalIssues: number;
  warningIssues: number;
  healthyServices: number;
  totalServices: number;
}

export default function AdminEnvironmentDebug() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);

  const testApiConnection = async (name: string, url?: string): Promise<boolean> => {
    if (!url) return false;
    try {
      // Simple connectivity test - in real implementation, make actual API calls
      return true;
    } catch {
      return false;
    }
  };

  const getConfigStatus = (): ConfigStatus[] => {
    const configs: ConfigStatus[] = [];

    // Database - Supabase Configuration (Critical)
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your_supabase_project_url_here')) {
      configs.push({
        name: 'Supabase Database',
        status: 'success',
        message: 'Database connection configured and ready',
        value: supabaseUrl,
        icon: <Cloud />,
        category: 'database',
        priority: 'critical'
      });
    } else {
      configs.push({
        name: 'Supabase Database',
        status: 'error',
        message: 'Database configuration missing - User auth will not work',
        icon: <Cloud />,
        category: 'database',
        priority: 'critical'
      });
    }

    // Payment - Stripe Configuration (Critical for Pro features)
    const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (stripeKey && !stripeKey.includes('your_stripe_publishable_key_here')) {
      configs.push({
        name: 'Stripe Payment Gateway',
        status: 'success',
        message: 'Payment processing configured for Pro subscriptions',
        value: `${stripeKey.substring(0, 20)}...`,
        icon: <Payment />,
        category: 'payment',
        priority: 'critical'
      });
    } else {
      configs.push({
        name: 'Stripe Payment Gateway',
        status: 'error',
        message: 'Payment processing not configured - Pro subscriptions unavailable',
        icon: <Payment />,
        category: 'payment',
        priority: 'critical'
      });
    }

    // Authentication - Google OAuth (High priority)
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (googleClientId && !googleClientId.includes('your_google_client_id_here')) {
      configs.push({
        name: 'Google OAuth',
        status: 'success',
        message: 'Google Sign-In enabled and configured',
        value: `${googleClientId.substring(0, 30)}...`,
        icon: <Google />,
        category: 'authentication',
        priority: 'high'
      });
    } else {
      configs.push({
        name: 'Google OAuth',
        status: 'warning',
        message: 'Google Sign-In not configured - Users limited to email/password only',
        icon: <Google />,
        category: 'authentication',
        priority: 'high'
      });
    }

    // Authentication - Apple OAuth (Medium priority)
    const appleClientId = import.meta.env.VITE_APPLE_CLIENT_ID;
    if (appleClientId && !appleClientId.includes('your_apple_service_id_here')) {
      configs.push({
        name: 'Apple Sign-In',
        status: 'success',
        message: 'Apple Sign-In configured',
        value: `${appleClientId.substring(0, 30)}...`,
        icon: <Apple />,
        category: 'authentication',
        priority: 'medium'
      });
    } else {
      configs.push({
        name: 'Apple Sign-In',
        status: 'info',
        message: 'Apple Sign-In not configured (planned feature)',
        icon: <Apple />,
        category: 'authentication',
        priority: 'medium'
      });
    }

    // Real Estate APIs - Multiple sources for property data
    const rapidApiKey = import.meta.env.VITE_RAPID_API_KEY;
    if (rapidApiKey && !rapidApiKey.includes('your_rapid_api_key_here')) {
      configs.push({
        name: 'Zillow/RapidAPI',
        status: 'success',
        message: 'Real estate data API configured - Live property data available',
        value: `${rapidApiKey.substring(0, 20)}...`,
        icon: <Home />,
        category: 'api',
        priority: 'high'
      });
    } else {
      configs.push({
        name: 'Zillow/RapidAPI',
        status: 'warning',
        message: 'Using mock property data - Configure for live data',
        icon: <Home />,
        category: 'api',
        priority: 'high'
      });
    }

    // Additional Real Estate APIs
    const rentspreeKey = import.meta.env.VITE_RENTSPREE_API_KEY;
    const rentalMarketKey = import.meta.env.VITE_RENTAL_MARKET_DATA_API_KEY;
    const rentberryKey = import.meta.env.VITE_RENTBERRY_API_KEY;

    const additionalApis = [
      { key: rentspreeKey, name: 'RentSpree API', defaultValue: 'your_rentspree_api_key_here' },
      { key: rentalMarketKey, name: 'Rental Market Data API', defaultValue: 'your_rental_market_data_api_key_here' },
      { key: rentberryKey, name: 'RentBerry API', defaultValue: 'your_rentberry_api_key_here' }
    ];

    additionalApis.forEach(api => {
      if (api.key && !api.key.includes(api.defaultValue)) {
        configs.push({
          name: api.name,
          status: 'success',
          message: 'Additional property data source configured',
          value: `${api.key.substring(0, 20)}...`,
          icon: <Home />,
          category: 'api',
          priority: 'medium'
        });
      } else {
        configs.push({
          name: api.name,
          status: 'info',
          message: 'Optional property data source not configured',
          icon: <Home />,
          category: 'api',
          priority: 'low'
        });
      }
    });

    // Email Service Configuration (for contact forms and notifications)
    // Note: This would be configured in backend, checking if contact form works
    configs.push({
      name: 'Email Service (Resend)',
      status: 'info',
      message: 'Email service configured in backend - Contact form should work',
      icon: <Email />,
      category: 'email',
      priority: 'medium'
    });

    return configs;
  };

  const calculateSystemHealth = (configs: ConfigStatus[]): SystemHealth => {
    const criticalIssues = configs.filter(c => c.priority === 'critical' && (c.status === 'error' || c.status === 'warning')).length;
    const warningIssues = configs.filter(c => c.status === 'warning').length;
    const healthyServices = configs.filter(c => c.status === 'success').length;
    
    let overall: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (criticalIssues > 0) {
      overall = 'critical';
    } else if (warningIssues > 2) {
      overall = 'warning';
    }

    return {
      overall,
      criticalIssues,
      warningIssues,
      healthyServices,
      totalServices: configs.length
    };
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      const configs = getConfigStatus();
      setSystemHealth(calculateSystemHealth(configs));
      setIsRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    const configs = getConfigStatus();
    setSystemHealth(calculateSystemHealth(configs));
  }, []);

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
  const configsByCategory = configs.reduce((acc, config) => {
    if (!acc[config.category]) acc[config.category] = [];
    acc[config.category].push(config);
    return acc;
  }, {} as Record<string, ConfigStatus[]>);

  const categoryLabels = {
    database: 'Database & Backend',
    authentication: 'User Authentication',
    payment: 'Payment Processing',
    api: 'Property Data APIs',
    email: 'Email Services'
  };

  const categoryIcons = {
    database: <Cloud />,
    authentication: <AdminPanelSettings />,
    payment: <Payment />,
    api: <Home />,
    email: <Email />
  };

  return (
    <Box sx={{ mt: 3 }}>
      {/* System Health Overview */}
      {systemHealth && (
        <Card sx={{ mb: 3, border: systemHealth.overall === 'critical' ? '2px solid red' : systemHealth.overall === 'warning' ? '2px solid orange' : '2px solid green' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Dashboard />
                Investimate System Health
                <Chip 
                  label={systemHealth.overall.toUpperCase()}
                  color={systemHealth.overall === 'critical' ? 'error' : systemHealth.overall === 'warning' ? 'warning' : 'success'}
                  variant="outlined"
                />
              </Typography>
              <Button
                startIcon={isRefreshing ? <CircularProgress size={16} /> : <Refresh />}
                onClick={handleRefresh}
                disabled={isRefreshing}
                size="small"
              >
                Refresh
              </Button>
            </Box>
            
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Typography variant="h6" color="success.main">
                  {systemHealth.healthyServices}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Services Healthy
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Typography variant="h6" color="warning.main">
                  {systemHealth.warningIssues}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Warnings
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Typography variant="h6" color="error.main">
                  {systemHealth.criticalIssues}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Critical Issues
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Typography variant="h6" color="primary.main">
                  {systemHealth.totalServices}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Services
                </Typography>
              </Grid>
            </Grid>

            {systemHealth.overall === 'critical' && (
              <Alert severity="error" sx={{ mt: 2 }}>
                <strong>Critical issues detected!</strong> Some core features may not work properly. 
                Please check the configuration below and fix critical issues immediately.
              </Alert>
            )}
            {systemHealth.overall === 'warning' && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <strong>System running with warnings.</strong> Some optional features may be limited. 
                Consider configuring additional services for full functionality.
              </Alert>
            )}
            {systemHealth.overall === 'healthy' && (
              <Alert severity="success" sx={{ mt: 2 }}>
                <strong>All systems operational!</strong> Investimate is running smoothly with all core services configured.
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* SOW Implementation Status */}
      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls="sow-status-content"
          id="sow-status-header"
        >
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BugReport />
            SOW Implementation Status
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Alert severity="info" sx={{ mb: 2 }}>
            Based on the SOW requirements, here's the current implementation status for key features:
          </Alert>

          <List dense>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText 
                primary="Authentication & User Management" 
                secondary="✅ Email/Password auth working, Google OAuth ready, Apple OAuth planned"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText 
                primary="User Roles & Access Control (IMPLEMENTED)" 
                secondary="✅ Free plan search limits (5/day) implemented with SearchLimitService & useSearchLimits hook"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText 
                primary="Subscription & Payments" 
                secondary="✅ Stripe integration ready, needs promo code system"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Warning color="warning" />
              </ListItemIcon>
              <ListItemText 
                primary="Property Search & Analysis" 
                secondary="⚠️ Search criteria persistence needed, advanced metrics to be added"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Info color="info" />
              </ListItemIcon>
              <ListItemText 
                primary="Map Search (Polygon/Rectangle/Circle)" 
                secondary="🔄 Polygon/Circle UI implemented, Rectangle pending"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Error color="error" />
              </ListItemIcon>
              <ListItemText 
                primary="Favorites System" 
                secondary="❌ Not yet implemented - needs add/view/remove functionality"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Warning color="warning" />
              </ListItemIcon>
              <ListItemText 
                primary="Community Forum" 
                secondary="⚠️ UI exists but backend integration needed for posts/comments"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText 
                primary="Contact Form" 
                secondary="✅ Email sending configured, needs reliability testing"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Error color="error" />
              </ListItemIcon>
              <ListItemText 
                primary="Routing System" 
                secondary="❌ Needs proper route structure (/home, /calculator, /community, etc.)"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Error color="error" />
              </ListItemIcon>
              <ListItemText 
                primary="Admin Panel" 
                secondary="❌ User management, analytics, and moderation tools needed"
              />
            </ListItem>
          </List>
        </AccordionDetails>
      </Accordion>

      {/* Environment Configuration by Category */}
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
            Critical services must be configured for Investimate to function properly.
          </Alert>

          {Object.entries(configsByCategory).map(([category, categoryConfigs]) => (
            <Box key={category} sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                {categoryIcons[category as keyof typeof categoryIcons]}
                {categoryLabels[category as keyof typeof categoryLabels]}
              </Typography>
              
              <Grid container spacing={2}>
                {categoryConfigs.map((config, index) => (
                  <Grid size={{ xs: 12, md: 6 }} key={index}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        height: '100%',
                        border: config.priority === 'critical' && config.status === 'error' ? '2px solid red' : undefined
                      }}
                    >
                      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                          {config.icon}
                          <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                            {config.name}
                          </Typography>
                          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                            <Chip 
                              label={config.status.toUpperCase()}
                              color={getStatusColor(config.status) as any}
                              size="small"
                              icon={getStatusIcon(config.status)}
                            />
                            <Chip 
                              label={config.priority.toUpperCase()}
                              variant="outlined"
                              size="small"
                              color={config.priority === 'critical' ? 'error' : config.priority === 'high' ? 'warning' : 'default'}
                            />
                          </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, flexGrow: 1 }}>
                          {config.message}
                        </Typography>
                        {config.value && (
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontFamily: 'monospace', 
                              bgcolor: 'grey.100', 
                              p: 1, 
                              borderRadius: 1,
                              wordBreak: 'break-all'
                            }}
                          >
                            {config.value}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              
              {category !== 'email' && <Divider sx={{ mt: 2 }} />}
            </Box>
          ))}

          {/* Quick Setup Guide */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              🚀 Quick Setup Guide:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <Info color="error" />
                </ListItemIcon>
                <ListItemText 
                  primary="1. Critical Setup (Required)" 
                  secondary="Configure Supabase (database) and Stripe (payments) to enable core functionality"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Info color="warning" />
                </ListItemIcon>
                <ListItemText 
                  primary="2. Authentication (High Priority)" 
                  secondary="Set up Google OAuth for better user experience"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Info color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="3. Property Data (High Priority)" 
                  secondary="Configure Zillow/RapidAPI for live property data instead of mock data"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Info color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="4. Optional Enhancements" 
                  secondary="Add Apple Sign-In and additional property data sources for enhanced functionality"
                />
              </ListItem>
            </List>
          </Box>

          {/* SOW Reference Links */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              📋 SOW Implementation Priority:
            </Typography>
            <Alert severity="warning" sx={{ mb: 2 }}>
              <strong>Next Implementation Steps based on SOW:</strong>
              <br />• Fix email verification auto-signin bug
              <br />• ✅ Free plan limitations (5 searches/day) - IMPLEMENTED with SearchLimitService
              <br />• Add search criteria persistence
              <br />• Complete map search result display
              <br />• Build favorites system
              <br />• Implement proper routing structure
              <br />• Create admin panel for user/content management
            </Alert>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}

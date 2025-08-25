import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  AlertTitle
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { membershipService } from '../services/SecureMembershipService';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  onUpgrade: () => void; // Add callback for upgrade action
  feature?: string;
  currentUsage?: {
    used: number;
    limit: number;
  };
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  open,
  onClose,
  onUpgrade,
  feature,
  currentUsage
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userTier, setUserTier] = useState('free');
  const [trialStatus, setTrialStatus] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showTrialSuccess, setShowTrialSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      checkUserStatus();
    }
  }, [open]);

  const checkUserStatus = async () => {
    try {
      const status = await membershipService.checkSubscriptionStatus();
      setUserTier(status.tier);
      
      if (status.tier === 'trial') {
        setTrialStatus({
          isActive: true,
          daysRemaining: status.trialDaysLeft
        });
      }
    } catch (err) {
      console.error('Error checking user status:', err);
    }
  };

  const handleStartTrial = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await membershipService.startFreeTrial(14);
      
      if (result.success) {
        setShowTrialSuccess(true);
        await checkUserStatus();
        
        // Auto-close after 3 seconds
        setTimeout(() => {
          onClose();
          setShowTrialSuccess(false);
        }, 3000);
      } else {
        setError(result.error || 'Failed to start trial');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgradeClick = () => {
    // Use the provided callback instead of direct navigation
    onUpgrade();
  };

  const features = [
    {
      icon: <TrendingUpIcon color="primary" />,
      title: 'Unlimited Property Searches',
      description: 'Search as many properties as you need'
    },
    {
      icon: <AnalyticsIcon color="primary" />,
      title: 'Unlimited Cash Flow Analysis',
      description: 'Analyze every deal with detailed reports'
    },
    {
      icon: <SecurityIcon color="primary" />,
      title: 'Priority Support',
      description: 'Get help when you need it most'
    },
    {
      icon: <SpeedIcon color="primary" />,
      title: 'Export Reports',
      description: 'Download and share your analysis'
    },
    {
      icon: <StarIcon color="primary" />,
      title: 'Market Insights',
      description: 'Access exclusive market data and trends'
    }
  ];

  if (showTrialSuccess) {
    return (
      <Dialog open={open} onClose={() => {}} maxWidth="sm" fullWidth>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <CheckIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            🎉 Trial Started!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            You now have unlimited access to all Pro features for 14 days.
            Enjoy exploring Investimate!
          </Typography>
          <CircularProgress sx={{ mt: 3 }} size={24} />
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Redirecting...
          </Typography>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          {feature ? `${feature} Limit Reached` : 'Upgrade to Pro'}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Unlock unlimited access and premium features
        </Typography>
      </DialogTitle>

      <DialogContent>
        {/* Current Usage Display */}
        {currentUsage && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <AlertTitle>Current Usage</AlertTitle>
            You've used {currentUsage.used} of {currentUsage.limit} {feature?.toLowerCase()} this month.
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Trial Status */}
        {trialStatus?.isActive && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <AlertTitle>Free Trial Active</AlertTitle>
            You have {trialStatus.daysRemaining} days remaining in your trial.
          </Alert>
        )}

        {/* Pricing Cards */}
        <Box sx={{ display: 'flex', gap: 3, mb: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Free Plan */}
          <Box sx={{ flex: 1 }}>
            <Card 
              variant="outlined"
              sx={{ 
                height: '100%',
                opacity: userTier === 'free' ? 1 : 0.7
              }}
            >
              <CardContent>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Free Plan
                  </Typography>
                  <Typography variant="h4" color="text.secondary">
                    $0
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    per month
                  </Typography>
                  {userTier === 'free' && (
                    <Chip label="Current Plan" size="small" sx={{ mt: 1 }} />
                  )}
                </Box>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="5 property searches/month" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="3 cash flow analyses/month" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Basic support" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Box>

          {/* Pro Plan */}
          <Box sx={{ flex: 1 }}>
            <Card 
              sx={{ 
                height: '100%',
                border: '2px solid',
                borderColor: 'primary.main',
                position: 'relative'
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: -10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  px: 2,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}
              >
                RECOMMENDED
              </Box>
              <CardContent>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Pro Plan
                  </Typography>
                  <Typography variant="h4" color="primary">
                    $4.99
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    per month
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Or $49.99/year (save 17%)
                  </Typography>
                  {(userTier === 'pro' || userTier === 'trial') && (
                    <Chip 
                      label={userTier === 'trial' ? 'Trial Active' : 'Current Plan'} 
                      color="primary"
                      size="small" 
                      sx={{ mt: 1 }} 
                    />
                  )}
                </Box>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Unlimited property searches" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Unlimited cash flow analyses" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Export reports to PDF" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Market insights & trends" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Priority support" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Box>
        </Box>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          What You'll Get with Pro:
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
          {features.map((feature, index) => (
            <Card variant="outlined" sx={{ height: '100%' }} key={index}>
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ mr: 2, flexShrink: 0 }}>
                  {feature.icon}
                </Box>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', gap: 2, p: 3 }}>
        {userTier === 'free' && (
          <>
            <Button
              variant="outlined"
              onClick={handleStartTrial}
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={16} /> : <StarIcon />}
              sx={{ minWidth: 180 }}
            >
              {isLoading ? 'Starting Trial...' : 'Start Free Trial'}
            </Button>
            <Button
              variant="contained"
              onClick={handleUpgradeClick}
              size="large"
              sx={{ minWidth: 180 }}
            >
              Upgrade to Pro
            </Button>
          </>
        )}
        
        {userTier === 'trial' && (
          <Button
            variant="contained"
            onClick={handleUpgradeClick}
            size="large"
            sx={{ minWidth: 200 }}
          >
            Convert to Pro Subscription
          </Button>
        )}

        {userTier === 'pro' && (
          <Typography variant="body1" color="primary" sx={{ textAlign: 'center' }}>
            ✅ You already have Pro access!
          </Typography>
        )}

        <Button 
          onClick={onClose} 
          sx={{ minWidth: 100 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

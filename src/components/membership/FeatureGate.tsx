import React, { useState, useEffect } from 'react';
import {
  Box,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  LinearProgress,
  Chip
} from '@mui/material';
import { Lock, Star, Upgrade } from '@mui/icons-material';
import { membershipService, type FeatureAccess } from '../../services/SecureMembershipService';

interface FeatureGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUsage?: boolean;
  onUpgradeClick?: () => void;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  children,
  fallback,
  showUsage = true,
  onUpgradeClick
}) => {
  const [access, setAccess] = useState<FeatureAccess | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);

  useEffect(() => {
    checkAccess();
  }, [feature]);

  const checkAccess = async () => {
    try {
      setLoading(true);
      const accessResult = await membershipService.canAccessFeature(feature);
      setAccess(accessResult);
    } catch (error) {
      console.error('Error checking feature access:', error);
      setAccess({
        allowed: false,
        remaining: null,
        limit: null,
        requiresUpgrade: true,
        message: 'Error checking access'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    if (onUpgradeClick) {
      onUpgradeClick();
    } else {
      setUpgradeDialogOpen(true);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <LinearProgress />
        <Typography variant="body2" sx={{ mt: 1 }}>
          Checking access...
        </Typography>
      </Box>
    );
  }

  if (!access) {
    return (
      <Alert severity="error">
        Unable to verify access to {feature}
      </Alert>
    );
  }

  // If access is allowed, render the protected content
  if (access.allowed) {
    return (
      <>
        {children}
        {showUsage && access.remaining !== null && (
          <Box sx={{ mt: 1, mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {access.remaining} searches remaining this month
            </Typography>
          </Box>
        )}
      </>
    );
  }

  // If fallback is provided, use it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default access denied UI
  return (
    <>
      <Alert 
        severity="warning" 
        icon={<Lock />}
        action={
          <Button
            color="warning"
            size="small"
            onClick={handleUpgrade}
            startIcon={<Star />}
          >
            Upgrade
          </Button>
        }
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            {access.requiresUpgrade ? 'Pro Feature' : 'Access Denied'}
          </Typography>
          <Typography variant="body2">
            {access.message || `${feature} requires a Pro subscription`}
          </Typography>
          {access.remaining !== null && access.limit !== null && (
            <Box sx={{ mt: 1 }}>
              <Chip 
                size="small" 
                label={`${access.limit - (access.remaining || 0)}/${access.limit} used`}
                color="warning"
                variant="outlined"
              />
            </Box>
          )}
        </Box>
      </Alert>

      <UpgradeDialog 
        open={upgradeDialogOpen}
        onClose={() => setUpgradeDialogOpen(false)}
        feature={feature}
        accessInfo={access}
      />
    </>
  );
};

interface UpgradeDialogProps {
  open: boolean;
  onClose: () => void;
  feature: string;
  accessInfo: FeatureAccess;
}

const UpgradeDialog: React.FC<UpgradeDialogProps> = ({
  open,
  onClose,
  feature,
  accessInfo
}) => {
  const handleUpgrade = async () => {
    try {
      // Redirect to subscription management
      const session = await membershipService.getCurrentUser();
      if (session) {
        // Navigate to your subscription page
        window.location.href = '/subscription';
      } else {
        // Navigate to sign up
        window.location.href = '/auth/signup?plan=pro';
      }
    } catch (error) {
      console.error('Error initiating upgrade:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Star color="primary" />
          Upgrade to Pro
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          {accessInfo.message || `Unlock unlimited ${feature} with Pro!`}
        </Typography>
        
        <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
          <Typography variant="h6" color="primary" gutterBottom>
            Pro Benefits:
          </Typography>
          <ul>
            <li>Unlimited property searches</li>
            <li>Advanced cash flow analysis</li>
            <li>Property comparison tools</li>
            <li>Market insights & trends</li>
            <li>Export reports to PDF</li>
          </ul>
        </Box>

        {accessInfo.resetDate && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Your usage resets on {new Date(accessInfo.resetDate).toLocaleDateString()}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Maybe Later
        </Button>
        <Button 
          variant="contained" 
          onClick={handleUpgrade}
          startIcon={<Upgrade />}
        >
          Upgrade Now
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeatureGate;

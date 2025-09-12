import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  AlertTitle,
  Button,
  LinearProgress,
  Chip,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Upgrade as UpgradeIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  Star as StarIcon
} from '@mui/icons-material';

interface SearchQuota {
  userId: string;
  email: string;
  searchCount: number;
  lastSearchDate: string;
  membershipTier: 'free' | 'pro';
  dailyLimit: number;
  resetTime: string;
}

interface SearchLimitNotificationProps {
  quota: SearchQuota | null;
  remainingSearches?: number;
  onUpgrade?: () => void;
  onClose?: () => void;
  variant?: 'compact' | 'detailed';
  showCloseButton?: boolean;
}

export const SearchLimitNotification: React.FC<SearchLimitNotificationProps> = ({
  quota,
  remainingSearches = 0,
  onUpgrade,
  onClose,
  variant = 'compact',
  showCloseButton = true
}) => {
  if (!quota) {
    return null;
  }

  const isPro = quota.membershipTier === 'pro';
  const isLimitReached = !isPro && remainingSearches <= 0;
  const isNearLimit = !isPro && remainingSearches <= 1 && remainingSearches > 0;
  
  // Calculate progress percentage for free users
  const progressPercentage = isPro ? 100 : Math.min((quota.searchCount / quota.dailyLimit) * 100, 100);
  
  // Determine alert severity
  const getSeverity = () => {
    if (isPro) return 'success';
    if (isLimitReached) return 'error';
    if (isNearLimit) return 'warning';
    return 'info';
  };

  // Get status message
  const getStatusMessage = () => {
    if (isPro) {
      return 'Unlimited searches with Pro membership';
    }
    if (isLimitReached) {
      return 'Daily search limit reached';
    }
    if (isNearLimit) {
      return `Only ${remainingSearches} search remaining today`;
    }
    return `${remainingSearches} searches remaining today`;
  };

  // Compact variant for header/toolbar
  if (variant === 'compact') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {isPro ? (
          <Chip
            icon={<StarIcon />}
            label="Pro"
            color="primary"
            size="small"
            sx={{ fontWeight: 'bold' }}
          />
        ) : (
          <Tooltip title={getStatusMessage()}>
            <Chip
              icon={<SearchIcon />}
              label={`${remainingSearches}/${quota.dailyLimit}`}
              color={getSeverity() as any}
              size="small"
              variant={isLimitReached ? 'filled' : 'outlined'}
            />
          </Tooltip>
        )}
        
        {!isPro && (
          <Button
            size="small"
            startIcon={<UpgradeIcon />}
            variant="outlined"
            color="primary"
            onClick={onUpgrade}
            sx={{ textTransform: 'none', minWidth: 'auto' }}
          >
            Upgrade
          </Button>
        )}
      </Box>
    );
  }

  // Detailed variant for prominent display
  return (
    <Card sx={{ mb: 2, border: isLimitReached ? '2px solid' : '1px solid', borderColor: isLimitReached ? 'error.main' : 'divider' }}>
      <CardContent>
        <Stack spacing={2}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SearchIcon color={getSeverity() as any} />
              Search Usage
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {isPro && (
                <Chip
                  icon={<StarIcon />}
                  label="Pro Member"
                  color="primary"
                  sx={{ fontWeight: 'bold' }}
                />
              )}
              
              {showCloseButton && onClose && (
                <IconButton size="small" onClick={onClose}>
                  <CloseIcon />
                </IconButton>
              )}
            </Box>
          </Box>

          {/* Status Alert */}
          <Alert 
            severity={getSeverity()} 
            sx={{ 
              '& .MuiAlert-message': { 
                width: '100%' 
              } 
            }}
          >
            <AlertTitle>
              {isPro ? 'Unlimited Access' : isLimitReached ? 'Limit Reached' : 'Usage Status'}
            </AlertTitle>
            
            <Typography variant="body2" sx={{ mb: 1 }}>
              {getStatusMessage()}
            </Typography>
            
            {!isPro && (
              <>
                {/* Progress Bar */}
                <Box sx={{ mt: 1, mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Daily Usage
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {quota.searchCount}/{quota.dailyLimit} searches
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={progressPercentage}
                    color={isLimitReached ? 'error' : isNearLimit ? 'warning' : 'primary'}
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>
                
                {/* Reset Time */}
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  <InfoIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                  Resets daily at midnight UTC
                </Typography>
              </>
            )}
          </Alert>

          {/* Upgrade CTA */}
          {!isPro && (
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
              <Button
                variant="contained"
                startIcon={<UpgradeIcon />}
                onClick={onUpgrade}
                color="primary"
                size="large"
                sx={{ 
                  textTransform: 'none',
                  boxShadow: 3,
                  '&:hover': {
                    boxShadow: 6
                  }
                }}
              >
                {isLimitReached ? 'Upgrade for Unlimited Searches' : 'Upgrade to Pro'}
              </Button>
            </Box>
          )}
          
          {/* Pro Benefits */}
          {!isPro && (
            <Box sx={{ mt: 1, p: 2, bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Pro Membership Benefits:
              </Typography>
              <Typography variant="body2" component="ul" sx={{ m: 0, pl: 2 }}>
                <li>Unlimited property searches</li>
                <li>Map-based property search</li>
                <li>Advanced filtering options</li>
                <li>Priority customer support</li>
                <li>Export analysis reports</li>
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default SearchLimitNotification;

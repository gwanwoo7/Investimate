import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Tab,
  Tabs
} from '@mui/material';
import {
  ArrowBack
} from '@mui/icons-material';
import {
  Info,
  Phone,
  CreditCard,
  Home,
  Calculator,
  Users
} from 'lucide-react';

interface NavigationBarProps {
  onLogoClick?: () => void;
  showBackButton?: boolean;
  onBackClick?: () => void;
  title?: string;
  showNavButtons?: boolean;
  showMainTabs?: boolean;
  currentTab?: number;
  onTabChange?: (event: React.SyntheticEvent, newValue: number) => void;
  onAboutClick?: () => void;
  onContactClick?: () => void;
  onSubscriptionClick?: () => void;
  onLoginClick?: () => void;
  onSignupClick?: () => void;
  user?: { email: string; isSubscribed: boolean } | null;
  onLogout?: () => void;
  searchCount?: number;
  maxSearches?: number;
  onUpgradeClick?: () => void;
}

export default function NavigationBar({
  onLogoClick,
  showBackButton = false,
  onBackClick,
  title,
  showNavButtons = true,
  showMainTabs = false,
  currentTab = 0,
  onTabChange,
  onAboutClick,
  onContactClick,
  onSubscriptionClick,
  onLoginClick,
  onSignupClick,
  user,
  onLogout,
  searchCount = 0,
  maxSearches = 5,
  onUpgradeClick
}: NavigationBarProps) {
  
  const handleLogoClick = () => {
    if (onLogoClick) {
      onLogoClick();
    } else {
      // Default behavior: reload page to go to home
      window.location.reload();
    }
  };

  return (
    <AppBar 
      position="static" 
      elevation={1} 
      sx={{ 
        bgcolor: 'white', 
        color: 'text.primary', 
        height: 64,
        minHeight: 64,
        maxHeight: 64
      }}
    >
      <Container maxWidth={false} disableGutters>
        <Toolbar 
          sx={{ 
            justifyContent: 'space-between', 
            height: 64, 
            minHeight: '64px !important',
            maxHeight: '64px !important',
            paddingLeft: '24px !important',
            paddingRight: '24px !important',
            width: '100%'
          }}
        >
          {/* Left section */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {showBackButton && onBackClick && (
              <IconButton
                edge="start"
                onClick={onBackClick}
                sx={{ mr: 2, color: 'primary.main' }}
              >
                <ArrowBack />
              </IconButton>
            )}
            
            <Typography 
              variant="h5" 
              component="div" 
              sx={{ 
                fontWeight: 'bold', 
                color: 'primary.main',
                cursor: 'pointer',
                '&:hover': { color: 'primary.dark' },
                lineHeight: 1,
                height: 'auto'
              }}
              onClick={handleLogoClick}
            >
              🏡 Investimate
            </Typography>
            
            {title && (
              <Typography 
                variant="h6" 
                sx={{ 
                  ml: 3, 
                  color: 'text.primary',
                  fontWeight: 500
                }}
              >
                {title}
              </Typography>
            )}
          </Box>
          
          {/* Center section - Main Tabs */}
          {showMainTabs && onTabChange && (
            <Box sx={{ 
              flexGrow: 1, 
              display: 'flex', 
              justifyContent: 'center',
              alignItems: 'center',
              height: 64 
            }}>
              <Tabs 
                value={currentTab} 
                onChange={onTabChange} 
                sx={{ 
                  minHeight: 48,
                  height: 48,
                  '& .MuiTab-root': {
                    minHeight: 48,
                    height: 48,
                    paddingTop: '6px',
                    paddingBottom: '6px',
                    minWidth: 120,
                    fontSize: '0.875rem'
                  },
                  '& .MuiTabs-flexContainer': {
                    gap: 2
                  }
                }}
              >
                <Tab 
                  icon={<Home size={20} />} 
                  label="Home" 
                  sx={{ minHeight: 48, height: 48, py: 1 }}
                />
                <Tab 
                  icon={<Calculator size={20} />} 
                  label="Calculator" 
                  sx={{ minHeight: 48, height: 48, py: 1 }}
                />
                <Tab 
                  icon={<Users size={20} />} 
                  label="Community" 
                  sx={{ minHeight: 48, height: 48, py: 1 }}
                />
              </Tabs>
            </Box>
          )}
          
          {/* Spacer for pages without main tabs */}
          {!showMainTabs && (
            <Box sx={{ flexGrow: 1 }} />
          )}
          
          {/* Right section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: 64 }}>
            {showNavButtons && (
              <>
                {/* Navigation Links */}
                {onAboutClick && (
                  <Button 
                    size="small" 
                    onClick={onAboutClick}
                    startIcon={<Info size={16} />}
                    sx={{ textTransform: 'none' }}
                  >
                    About
                  </Button>
                )}
                {onContactClick && (
                  <Button 
                    size="small" 
                    onClick={onContactClick}
                    startIcon={<Phone size={16} />}
                    sx={{ textTransform: 'none' }}
                  >
                    Contact
                  </Button>
                )}
                {onSubscriptionClick && (
                  <Button 
                    size="small" 
                    onClick={onSubscriptionClick}
                    startIcon={<CreditCard size={16} />}
                    sx={{ textTransform: 'none' }}
                    color="success"
                  >
                    Pro
                  </Button>
                )}
              </>
            )}
            
            {/* User section */}
            {user ? (
              <>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
                {!user.isSubscribed && (
                  <>
                    <Typography variant="caption" color="warning.main">
                      ({maxSearches - searchCount} searches left)
                    </Typography>
                    <Button 
                      variant="contained" 
                      size="small"
                      color="warning"
                      onClick={onUpgradeClick}
                      sx={{ ml: 1 }}
                    >
                      {searchCount >= maxSearches ? 'Upgrade Now' : 'Go Pro'}
                    </Button>
                  </>
                )}
                {user.isSubscribed && (
                  <Typography variant="caption" color="success.main" sx={{ fontWeight: 'bold' }}>
                    Pro Member
                  </Typography>
                )}
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={onLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                {onLoginClick && (
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={onLoginClick}
                  >
                    Login
                  </Button>
                )}
                {onSignupClick && (
                  <Button 
                    variant="contained" 
                    size="small"
                    onClick={onSignupClick}
                  >
                    Sign Up
                  </Button>
                )}
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

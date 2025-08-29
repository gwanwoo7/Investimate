import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Typography, Box, Button, Card, CardContent, Container, Tab, Tabs } from '@mui/material';
import { Calculator, Users, Home, TrendingUp } from 'lucide-react';
import PropertyCalculatorWithMap from './components/PropertyCalculatorWithMap';
import SearchResultsPage from './components/SearchResultsPage';
import CommunityChat from './components/CommunityChat';
import PaymentPage from './components/PaymentPage';
import AdminDashboard from './components/AdminDashboard';
import EnhancedLoginPage from './components/EnhancedLoginPage';
import EnhancedSignupPage from './components/EnhancedSignupPage';
import AuthCallback from './components/AuthCallback';
import ProMembershipQA from './components/ProMembershipQA';
import AdminPage from './pages/AdminPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import SubscriptionPage from './pages/SubscriptionPage';
import NavigationBar from './components/NavigationBar';
import DatabaseService from './services/databaseService';
import { SupabaseUserService } from './services/supabaseService';
import { membershipService } from './services/SecureMembershipService';
import { UpgradeModal } from './components/UpgradeModal';
import AuthDebugTool from './components/debug/AuthDebugTool';
import SMTPDiagnosticTool from './components/debug/SMTPDiagnosticTool'; // Changed to AuthDebugTool
import ComprehensiveQADiagnostic from './components/debug/ComprehensiveQADiagnostic';
import { useState, useEffect } from 'react';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f8fafc',
    },
  },
  typography: {
    h1: {
      fontWeight: 700,
      fontSize: '3.5rem', // Large logo/hero title
      letterSpacing: '-0.02em',
      lineHeight: 1.1,
      '@media (max-width:600px)': {
        fontSize: '2.5rem',
      },
    },
    h2: {
      fontWeight: 600,
      fontSize: '2.5rem', // Section headers
      letterSpacing: '-0.01em',
      lineHeight: 1.2,
      '@media (max-width:600px)': {
        fontSize: '2rem',
      },
    },
    h3: {
      fontWeight: 600,
      fontSize: '2rem', // Subsection headers
      letterSpacing: '-0.01em',
      lineHeight: 1.3,
      '@media (max-width:600px)': {
        fontSize: '1.5rem',
      },
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem', // Card titles
      letterSpacing: '0em',
      lineHeight: 1.4,
      '@media (max-width:600px)': {
        fontSize: '1.25rem',
      },
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem', // Small headings
      letterSpacing: '0em',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 500,
      fontSize: '1.1rem', // Minor headings
      letterSpacing: '0.01em',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem', // Main body text
      lineHeight: 1.6,
      letterSpacing: '0.00938em',
    },
    body2: {
      fontSize: '0.875rem', // Secondary body text
      lineHeight: 1.5,
      letterSpacing: '0.01071em',
    },
    caption: {
      fontSize: '0.75rem', // Captions and small text
      lineHeight: 1.4,
      letterSpacing: '0.03333em',
    },
    subtitle1: {
      fontSize: '1rem', // Subtitle text
      fontWeight: 400,
      lineHeight: 1.75,
      letterSpacing: '0.00938em',
    },
    subtitle2: {
      fontSize: '0.875rem', // Smaller subtitle text
      fontWeight: 500,
      lineHeight: 1.57,
      letterSpacing: '0.00714em',
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 2.66,
      letterSpacing: '0.08333em',
      textTransform: 'uppercase',
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      letterSpacing: '0.02857em',
      textTransform: 'none',
    },
  },
  spacing: 8,
  components: {
    MuiTextField: {
      defaultProps: {
        size: 'small',
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '& .MuiInputBase-input': {
            fontSize: '0.875rem',
            padding: '10px 14px',
          },
          '& .MuiInputLabel-root': {
            fontSize: '0.875rem',
          },
          '& .MuiFormHelperText-root': {
            fontSize: '0.75rem',
          },
        },
      },
    },
    MuiSelect: {
      defaultProps: {
        size: 'small',
      },
      styleOverrides: {
        root: {
          '& .MuiSelect-select': {
            fontSize: '0.875rem',
            padding: '10px 14px',
          },
        },
      },
    },
    MuiFormControl: {
      defaultProps: {
        size: 'small',
        variant: 'outlined',
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          fontSize: '0.875rem',
          fontWeight: 500,
          letterSpacing: '0.02857em',
        },
        sizeSmall: {
          fontSize: '0.75rem',
          padding: '6px 16px',
          fontWeight: 500,
        },
        sizeMedium: {
          fontSize: '0.875rem',
          padding: '8px 22px',
          fontWeight: 500,
        },
        sizeLarge: {
          fontSize: '1rem',
          padding: '12px 28px',
          fontWeight: 600,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontSize: '0.75rem',
          height: '28px',
          fontWeight: 500,
        },
        sizeSmall: {
          fontSize: '0.75rem',
          height: '24px',
          fontWeight: 500,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          padding: '12px 16px',
          borderBottom: '1px solid rgba(224, 224, 224, 1)',
        },
        head: {
          fontWeight: 600,
          fontSize: '0.875rem',
          color: 'rgba(0, 0, 0, 0.87)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)',
        },
        elevation1: {
          boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          transition: 'all 0.3s ease-in-out',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '24px',
          '&:last-child': {
            paddingBottom: '24px',
          },
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          '&:before': {
            display: 'none',
          },
          boxShadow: 'none',
          border: '1px solid rgba(0, 0, 0, 0.12)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppContent />
    </ThemeProvider>
  );
}

function AppContent() {
  const [currentTab, setCurrentTab] = useState(0);
  const [user, setUser] = useState<{ email: string; isSubscribed: boolean; name?: string; id?: string } | null>(null);
  const [userTier, setUserTier] = useState('free');
  const [searchesRemaining, setSearchesRemaining] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [searchCount, setSearchCount] = useState(() => {
    // Restore search count from localStorage
    const saved = localStorage.getItem('investimate_search_count');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [showProQA, setShowProQA] = useState(false);
  const [showQADiagnostic, setShowQADiagnostic] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResultsData, setSearchResultsData] = useState<{
    properties: any[];
    searchType: 'boundary' | 'area';
    searchQuery?: string;
    boundaryInfo?: { north: number; south: number; east: number; west: number };
  } | null>(null);

  const db = DatabaseService.getInstance();

  // Restore user session on app startup and check membership status
  useEffect(() => {
    console.log('🔄 App starting - checking for existing user session...');
    restoreUserSession();
  }, []);

    const restoreUserSession = async () => {
    try {
      console.log('🔄 Starting enhanced user session restoration...');
      
      // Check for existing local user first
      const currentUser = db.getCurrentUser();
      
      if (currentUser) {
        console.log('✅ Found local user:', currentUser.email);
        
        // Check Supabase membership status
        try {
          const status = await membershipService.checkSubscriptionStatus();
          setUserTier(status.tier);
          
          const isSubscribed = status.isActive && (status.tier === 'pro' || status.tier === 'trial');
          
          // Update user subscription status based on Supabase
          setUser({
            email: currentUser.email,
            isSubscribed,
            name: currentUser.name,
            id: currentUser.id
          });
          
          // Sync local database with Supabase status
          if (isSubscribed !== currentUser.isSubscribed) {
            const updatedUser = db.updateUserSubscription(currentUser.id, isSubscribed);
            console.log('🔄 Synced local database with Supabase status:', isSubscribed);
          }
          
          // Reset search count for Pro/Trial members
          if (isSubscribed) {
            setSearchCount(0);
            localStorage.removeItem('investimate_search_count');
            console.log('✅ Pro/Trial member detected, search count cleared');
          } else {
            // Restore search count for free users
            const savedCount = localStorage.getItem('investimate_search_count');
            if (savedCount) {
              setSearchCount(parseInt(savedCount, 10));
            }
            
            // Get remaining searches from Supabase
            try {
              const access = await membershipService.canAccessFeature('property_search');
              setSearchesRemaining(access.remaining || 0);
            } catch (accessError) {
              console.log('Using fallback search logic for free user');
              setSearchesRemaining(Math.max(0, 5 - searchCount));
            }
          }
          
          console.log('📊 User session restored successfully - Status:', {
            email: currentUser.email,
            isSubscribed,
            tier: status.tier,
            searchCount: isSubscribed ? 0 : searchCount
          });
          
        } catch (membershipError) {
          console.warn('⚠️ Could not check Supabase membership, using local data:', membershipError);
          
          // Fallback to local data with Stripe verification
          const isLocallySubscribed = currentUser.isSubscribed || false;
          
          // Check if user has Stripe info but local subscription is false
          const stripeCustomerId = localStorage.getItem('stripe_customer_id');
          const stripeSubscriptionId = localStorage.getItem('stripe_subscription_id');
          
          let finalSubscriptionStatus = isLocallySubscribed;
          
          if (stripeCustomerId && stripeSubscriptionId && !isLocallySubscribed) {
            console.log('🔄 Found Stripe subscription, upgrading local user to Pro...');
            const updatedUser = db.updateUserSubscription(currentUser.id, true);
            if (updatedUser) {
              finalSubscriptionStatus = true;
              console.log('✅ Local user upgraded to Pro based on Stripe data');
            }
          }
          
          setUser({
            email: currentUser.email,
            isSubscribed: finalSubscriptionStatus,
            name: currentUser.name,
            id: currentUser.id
          });
          
          // Handle search count based on final subscription status
          if (finalSubscriptionStatus) {
            setSearchCount(0);
            localStorage.removeItem('investimate_search_count');
            console.log('✅ Pro member (from Stripe), search count cleared');
          } else {
            const savedCount = localStorage.getItem('investimate_search_count');
            if (savedCount) {
              setSearchCount(parseInt(savedCount, 10));
            }
            setSearchesRemaining(Math.max(0, 5 - searchCount));
          }
        }
        
      } else {
        // No local user found, check for orphaned Stripe data
        const stripeCustomerId = localStorage.getItem('stripe_customer_id');
        const stripeSubscriptionId = localStorage.getItem('stripe_subscription_id');
        
        if (stripeCustomerId && stripeSubscriptionId) {
          console.log('🔄 Found orphaned Stripe data, checking Supabase...');
          
          try {
            const status = await membershipService.checkSubscriptionStatus();
            
            if (status.isActive && status.tier === 'pro') {
              // Try to get user from Supabase
              const supabaseUser = await membershipService.getCurrentUser();
              
              if (supabaseUser) {
                console.log('✅ Recovered Pro user from Supabase:', supabaseUser.email);
                
                // Create/restore local user record
                const recoveredUser = {
                  email: supabaseUser.email,
                  isSubscribed: true,
                  name: supabaseUser.full_name || supabaseUser.email.split('@')[0],
                  id: supabaseUser.id
                };
                
                // Save to local database
                db.setCurrentUser(recoveredUser);
                setUser(recoveredUser);
                
                // Clear search count for recovered Pro user
                setSearchCount(0);
                localStorage.removeItem('investimate_search_count');
                
                console.log('✅ Pro subscription recovered and synced');
              }
            }
          } catch (recoveryError) {
            console.warn('Could not recover user from Supabase:', recoveryError);
            // Clean up orphaned Stripe data
            localStorage.removeItem('stripe_customer_id');
            localStorage.removeItem('stripe_subscription_id');
          }
        }
        
        console.log('ℹ️ No user session found, starting fresh');
      }
      
    } catch (error) {
      console.error('❌ Error in session restoration:', error);
      
      // Last resort fallback
      const currentUser = db.getCurrentUser();
      if (currentUser) {
        console.log('🔄 Using emergency fallback session restoration');
        setUser({
          email: currentUser.email,
          isSubscribed: currentUser.isSubscribed || false,
          name: currentUser.name,
          id: currentUser.id
        });
      }
    }
  };

  const MAX_FREE_SEARCHES = 5;

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleLogoClick = () => {
    setCurrentTab(0);
    setShowLogin(false);
    setShowSignup(false);
    setShowPayment(false);
    setShowAdmin(false);
    setShowAbout(false);
    setShowContact(false);
    setShowSubscription(false);
  };

  const handleShowLogin = () => {
    setShowLogin(true);
    setShowSignup(false);
    setShowPayment(false);
  };

  const handleShowSignup = () => {
    setShowSignup(true);
    setShowLogin(false);
    setShowPayment(false);
  };

  const handleShowPayment = () => {
    setShowSubscription(true); // Changed to show subscription page instead
    setShowLogin(false);
    setShowSignup(false);
  };

  const handleShowAdmin = () => {
    setShowAdmin(true);
    setCurrentTab(0);
  };

  const handleShowAbout = () => {
    setShowAbout(true);
    setCurrentTab(0);
  };

  const handleShowContact = () => {
    setShowContact(true);
    setCurrentTab(0);
  };

  const handleShowSubscription = () => {
    setShowSubscription(true);
    setCurrentTab(0);
  };

  const handleBackToMain = () => {
    setShowAdmin(false);
    setShowAbout(false);
    setShowContact(false);
    setShowSubscription(false);
    setShowProQA(false);
    setShowQADiagnostic(false);
    setShowSearchResults(false);
    setCurrentTab(0);
  };

  const handleShowSearchResults = (data: {
    properties: any[];
    searchType: 'boundary' | 'area';
    searchQuery?: string;
    boundaryInfo?: { north: number; south: number; east: number; west: number };
  }) => {
    setSearchResultsData(data);
    setShowSearchResults(true);
    setCurrentTab(0);
  };

  const handleLogin = async (email: string) => {
    console.log('🔐 Processing login for:', email);
    
    const currentUser = db.getCurrentUser();
    if (currentUser) {
      // Check Supabase membership status for accurate subscription info
      try {
        const status = await membershipService.checkSubscriptionStatus();
        const isSubscribed = status.isActive && (status.tier === 'pro' || status.tier === 'trial');
        
        // Update local user if Supabase status differs
        if (isSubscribed !== currentUser.isSubscribed) {
          const updatedUser = db.updateUserSubscription(currentUser.id, isSubscribed);
          console.log('🔄 Synced subscription status on login:', isSubscribed);
        }
        
        setUser({
          email: currentUser.email,
          isSubscribed,
          name: currentUser.name,
          id: currentUser.id
        });
        
        // Handle search count based on subscription
        if (isSubscribed) {
          setSearchCount(0);
          localStorage.removeItem('investimate_search_count');
          console.log('✅ Pro member logged in, search count cleared');
        } else {
          // Restore search count for free users
          const savedCount = localStorage.getItem('investimate_search_count');
          if (savedCount) {
            setSearchCount(parseInt(savedCount, 10));
          }
        }
        
        setUserTier(status.tier);
        
      } catch (membershipError) {
        console.warn('⚠️ Could not check membership on login, using local data');
        
        // Fallback to local data
        setUser({
          email: currentUser.email,
          isSubscribed: currentUser.isSubscribed || false,
          name: currentUser.name,
          id: currentUser.id
        });
        
        if (currentUser.isSubscribed) {
          setSearchCount(0);
          localStorage.removeItem('investimate_search_count');
        }
      }
    } else {
      // Create basic user object if no current user found
      setUser({ email, isSubscribed: false });
    }
    
    setShowLogin(false);
    console.log('✅ Login completed');
  };

  const handleSignup = async (email: string) => {
    console.log('📝 Processing signup for:', email);
    
    const currentUser = db.getCurrentUser();
    if (currentUser) {
      // Check if user was created with Pro status (promo code, etc.)
      try {
        const status = await membershipService.checkSubscriptionStatus();
        const isSubscribed = status.isActive && (status.tier === 'pro' || status.tier === 'trial');
        
        setUser({
          email: currentUser.email,
          isSubscribed,
          name: currentUser.name,
          id: currentUser.id
        });
        
        // Handle search count for new users
        if (isSubscribed) {
          setSearchCount(0);
          localStorage.removeItem('investimate_search_count');
          console.log('✅ New Pro member signed up, search count cleared');
        } else {
          // Start fresh for new free users
          setSearchCount(0);
          localStorage.setItem('investimate_search_count', '0');
        }
        
        setUserTier(status.tier);
        
      } catch (membershipError) {
        console.warn('⚠️ Could not check membership on signup, using local data');
        
        setUser({
          email: currentUser.email,
          isSubscribed: currentUser.isSubscribed || false,
          name: currentUser.name,
          id: currentUser.id
        });
        
        if (currentUser.isSubscribed) {
          setSearchCount(0);
          localStorage.removeItem('investimate_search_count');
        } else {
          setSearchCount(0);
          localStorage.setItem('investimate_search_count', '0');
        }
      }
    } else {
      // Create basic user object if no current user found
      setUser({ email, isSubscribed: false });
      setSearchCount(0);
      localStorage.setItem('investimate_search_count', '0');
    }
    
    setShowSignup(false);
    console.log('✅ Signup completed');
  };

  const handleSubscription = async () => {
    console.log('💳 Processing subscription upgrade...');
    
    if (user) {
      try {
        // Update local user state immediately
        const updatedUser = { ...user, isSubscribed: true };
        setUser(updatedUser);
        
        // Update local database
        if (user.id) {
          const dbUser = db.updateUserSubscription(user.id, true);
          console.log('✅ Local database updated with Pro status');
        }
        
        // Sync with Supabase
        try {
          await membershipService.updateUserProfile({
            subscription_status: 'active',
            subscription_tier: 'pro',
            subscription_ends_at: null // or set future date for recurring billing
          });
          console.log('✅ Supabase profile updated with Pro status');
          
          // Refresh subscription status to ensure cache is updated
          const refreshedStatus = await membershipService.refreshSubscriptionStatus();
          setUserTier(refreshedStatus.tier);
          
        } catch (supabaseError) {
          console.warn('⚠️ Supabase sync failed after subscription:', supabaseError);
          // Continue with local update - will sync later
        }
        
        // Reset search count for new Pro members
        setSearchCount(0);
        localStorage.removeItem('investimate_search_count');
        console.log('✅ Pro membership activated, search count reset');
        
        setShowPayment(false);
        setShowSubscription(false);
        
        console.log('🎉 Subscription upgrade completed successfully');
        
      } catch (error) {
        console.error('❌ Error processing subscription:', error);
        // Revert user state if there was an error
        setUser({ ...user, isSubscribed: false });
      }
    }
  };

  const handleLogout = () => {
    console.log('👋 Logging out user...');
    
    // Clear user session from DatabaseService
    db.setCurrentUser(null);
    
    // Reset application state
    setUser(null);
    setSearchCount(0);
    setCurrentTab(0);
    
    // Clear any cached data
    setShowLogin(false);
    setShowSignup(false);
    setShowPayment(false);
    setShowAdmin(false);
    
    // Clear search count from localStorage
    localStorage.removeItem('investimate_search_count');
    
    console.log('✅ User logged out successfully, state cleared');
  };

  const [canSearchState, setCanSearchState] = useState(false);

  // Check if user can search
  useEffect(() => {
    const checkSearchAccess = async () => {
      if (user?.isSubscribed) {
        setCanSearchState(true);
        return;
      }
      
      try {
        const access = await membershipService.canAccessFeature('property_search');
        setCanSearchState(access.allowed);
        setSearchesRemaining(access.remaining || 0);
      } catch (error) {
        console.error('Error checking search access:', error);
        // Fallback to old logic
        setCanSearchState(searchCount < MAX_FREE_SEARCHES);
      }
    };

    if (user !== null) {
      checkSearchAccess();
    }
  }, [user, searchCount]);

  const handleSearch = async () => {
    if (!user?.isSubscribed) {
      try {
        // Use the membership service to track usage
        const result = await membershipService.useFeature('property_search', { 
          timestamp: new Date().toISOString(),
          searchType: 'property_analysis'
        });
        
        if (result.success) {
          console.log('🔍 Search tracked, remaining:', result.remaining);
          setSearchesRemaining(result.remaining || 0);
          // Update search access state
          setCanSearchState((result.remaining || 0) > 0);
        } else {
          console.log('❌ Search limit reached:', result.error);
          setShowUpgradeModal(true);
          return false;
        }
      } catch (error) {
        console.error('Error tracking search usage:', error);
        // Fallback to old logic
        const newCount = searchCount + 1;
        setSearchCount(newCount);
        localStorage.setItem('investimate_search_count', newCount.toString());
        setCanSearchState(newCount < MAX_FREE_SEARCHES);
      }
    }
    return true;
  };

  const renderNavigation = () => (
    <NavigationBar
      onLogoClick={handleLogoClick}
      showMainTabs={!showLogin && !showSignup && !showPayment && !showAdmin && !showAbout && !showContact && !showSubscription && !showProQA && !showSearchResults}
      currentTab={currentTab}
      onTabChange={handleTabChange}
      onAboutClick={handleShowAbout}
      onContactClick={handleShowContact}
      onSubscriptionClick={handleShowSubscription}
      onLoginClick={handleShowLogin}
      onSignupClick={handleShowSignup}
      user={user}
      onLogout={handleLogout}
      searchCount={searchCount}
      maxSearches={MAX_FREE_SEARCHES}
      onUpgradeClick={handleShowPayment}
    />
  );

  // Handle special pages
  if (showLogin) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <EnhancedLoginPage 
          onLogin={handleLogin}
          onClose={() => setShowLogin(false)}
          onSignup={() => { setShowLogin(false); handleShowSignup(); }}
        />
      </ThemeProvider>
    );
  }

  if (showSignup) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <EnhancedSignupPage 
          onSignup={handleSignup}
          onClose={() => setShowSignup(false)}
          onLogin={() => { setShowSignup(false); handleShowLogin(); }}
        />
      </ThemeProvider>
    );
  }

  if (showAdmin) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AdminPage onBack={handleBackToMain} />
      </ThemeProvider>
    );
  }

  if (showAbout) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AboutPage onBack={handleBackToMain} />
      </ThemeProvider>
    );
  }

  if (showContact) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ContactPage onBack={handleBackToMain} />
      </ThemeProvider>
    );
  }

  if (showSubscription) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SubscriptionPage 
          onBack={handleBackToMain} 
          onSubscriptionSuccess={() => {
            setUser(prev => prev ? { ...prev, isSubscribed: true } : null);
            
            // Reset search count for new Pro members
            setSearchCount(0);
            localStorage.removeItem('investimate_search_count');
            console.log('✅ Pro membership activated, search count reset');
            
            handleBackToMain();
          }}
        />
      </ThemeProvider>
    );
  }

  if (showQADiagnostic) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ComprehensiveQADiagnostic />
        <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 9999 }}>
          <Button 
            variant="contained" 
            color="secondary" 
            onClick={handleBackToMain}
            sx={{ minWidth: 120 }}
          >
            Back to App
          </Button>
        </Box>
      </ThemeProvider>
    );
  }

  if (showProQA) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ProMembershipQA onBack={handleBackToMain} />
      </ThemeProvider>
    );
  }

  // Re-enable payment page
  if (showPayment) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {renderNavigation()}
        <Box sx={{ 
          width: '100%', 
          minHeight: 'calc(100vh - 64px)',
          height: 'calc(100vh - 64px)',
          bgcolor: 'background.default'
        }}>
          <PaymentPage 
            onSubscribe={handleSubscription}
            onClose={() => setShowPayment(false)}
          />
        </Box>
      </ThemeProvider>
    );
  }

  if (showSearchResults && searchResultsData) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SearchResultsPage
          properties={searchResultsData.properties}
          searchType={searchResultsData.searchType}
          searchQuery={searchResultsData.searchQuery}
          boundaryInfo={searchResultsData.boundaryInfo}
          onBack={handleBackToMain}
          onPropertySelect={(property) => {
            console.log('Selected property:', property);
            // Could open property detail modal here
          }}
          user={user}
          onLogout={handleLogout}
          onLoginClick={handleShowLogin}
          onSignupClick={handleShowSignup}
          onSubscriptionClick={handleShowSubscription}
        />
      </ThemeProvider>
    );
  }

  if (currentTab === 1) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {renderNavigation()}
        
        <Box sx={{ 
          height: 'calc(100vh - 64px)', // Just nav bar height
          width: '100vw',
          overflow: 'auto'
        }}>
          <PropertyCalculatorWithMap 
            canSearch={canSearchState}
            onSearch={handleSearch}
            onUpgrade={handleShowPayment}
            searchCount={searchCount}
            maxSearches={MAX_FREE_SEARCHES}
            onShowResults={handleShowSearchResults}
          />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      {/* Navigation */}
      {renderNavigation()}

      {/* Main Content */}
      <Box sx={{ 
        minHeight: 'calc(100vh - 64px)', // Just nav bar height
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {currentTab === 0 && (
          <>
            {/* Hero Section */}
            <Box sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              py: { xs: 8, md: 12 },
              flex: 1
            }}>
              <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center', maxWidth: '800px', mx: 'auto' }}>
                  <Typography variant="h1" component="h1" gutterBottom sx={{ 
                    mb: 3
                  }}>
                    Investimate
                  </Typography>
                  <Typography variant="h4" gutterBottom sx={{ 
                    fontWeight: 400,
                    mb: 4,
                    opacity: 0.95
                  }}>
                    Estimate Right. Invest Smart in Your Next Rental.
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    mb: 6,
                    opacity: 0.9,
                    fontWeight: 400
                  }}>
                    Analyze rental properties with real market data, calculate ROI instantly, 
                    and connect with fellow investors.
                  </Typography>
                  
                  {/* Search Limit Warning */}
                  {user && !user.isSubscribed && !canSearchState && (
                    <Box sx={{ 
                      mb: 4, 
                      p: 3, 
                      bgcolor: 'rgba(255, 193, 7, 0.1)', 
                      borderRadius: 2,
                      border: '1px solid rgba(255, 193, 7, 0.3)'
                    }}>
                      <Typography variant="h6" sx={{ mb: 1, color: '#ffc107' }}>
                        Search Limit Reached
                      </Typography>
                      <Typography sx={{ mb: 2, opacity: 0.9 }}>
                        You've used all your free searches. Upgrade to Pro for unlimited access!
                      </Typography>
                      <Button 
                        variant="contained" 
                        onClick={handleShowPayment}
                        sx={{ bgcolor: '#ffc107', color: 'black', '&:hover': { bgcolor: '#ffb300' } }}
                      >
                        Upgrade to Pro - $4.99/month
                      </Button>
                    </Box>
                  )}
                  
                  <Button 
                    variant="contained" 
                    size="large" 
                    onClick={() => {
                      if (!canSearchState) {
                        handleShowPayment();
                      } else {
                        setCurrentTab(1);
                      }
                    }}
                    startIcon={<Calculator />}
                    sx={{ 
                      py: 2.5, 
                      px: 5, 
                      bgcolor: 'white',
                      color: 'primary.main',
                      fontWeight: 600,
                      '&:hover': { 
                        bgcolor: 'grey.50',
                        transform: 'translateY(-2px)',
                        boxShadow: 6
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    {user ? (
                      user.isSubscribed ? 'Start Analyzing Properties' : `Analyze Properties (${searchesRemaining} left)`
                    ) : (
                      'Start Analyzing Properties'
                    )}
                  </Button>
                </Box>
              </Container>
            </Box>

            {/* Features Section */}
            <Box sx={{ py: { xs: 6, md: 10 }, width: '100%' }}>
              <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 } }}>
                <Typography variant="h3" align="center" gutterBottom sx={{ mb: 6, color: 'text.primary' }}>
                  Everything You Need to Invest Confidently
                </Typography>
              
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                gap: 4,
                mb: 8
              }}>
                <Card sx={{ 
                  p: 3, 
                  textAlign: 'center', 
                  height: '100%',
                  cursor: 'pointer',
                  '&:hover': { 
                    boxShadow: 8,
                    transform: 'translateY(-4px)',
                    transition: 'all 0.3s ease-in-out'
                  }
                }}
                onClick={() => {
                  if (!canSearchState) {
                    handleShowPayment();
                  } else {
                    setCurrentTab(1);
                  }
                }}>
                  <CardContent>
                    <Box sx={{ mb: 3 }}>
                      <Calculator size={64} color="#1976d2" />
                    </Box>
                    <Typography variant="h5" gutterBottom fontWeight="bold">
                      Smart Calculator
                    </Typography>
                    <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      Analyze cash flow, ROI, and cap rates using real Zillow data. 
                      Get accurate mortgage, tax, and insurance calculations.
                    </Typography>
                    {!user?.isSubscribed && user && !canSearchState && (
                      <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 1, fontWeight: 'bold' }}>
                        Upgrade to Pro for unlimited searches
                      </Typography>
                    )}
                  </CardContent>
                </Card>

                <Card sx={{ 
                  p: 3, 
                  textAlign: 'center', 
                  height: '100%',
                  '&:hover': { 
                    boxShadow: 8,
                    transform: 'translateY(-4px)',
                    transition: 'all 0.3s ease-in-out'
                  }
                }}>
                  <CardContent>
                    <Box sx={{ mb: 3 }}>
                      <TrendingUp size={64} color="#999" />
                    </Box>
                    <Typography variant="h5" gutterBottom fontWeight="bold">
                      Market Insights
                    </Typography>
                    <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      Coming Soon
                    </Typography>
                  </CardContent>
                </Card>

                <Card sx={{ 
                  p: 3, 
                  textAlign: 'center', 
                  height: '100%',
                  cursor: 'pointer',
                  '&:hover': { 
                    boxShadow: 8,
                    transform: 'translateY(-4px)',
                    transition: 'all 0.3s ease-in-out'
                  }
                }}
                onClick={() => setCurrentTab(2)}>
                  <CardContent>
                    <Box sx={{ mb: 3 }}>
                      <Users size={64} color="#1976d2" />
                    </Box>
                    <Typography variant="h5" gutterBottom fontWeight="bold">
                      Investor Community
                    </Typography>
                    <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      Connect with experienced investors, share deals, and learn 
                      from real market experiences.
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
              </Container>
            </Box>

            {/* Footer */}
            <Box sx={{ 
              bgcolor: 'grey.900', 
              color: 'white', 
              py: 4,
              mt: 'auto'
            }}>
              <Container maxWidth="lg">
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: 2
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 4,
                    flexDirection: { xs: 'column', sm: 'row' },
                    textAlign: { xs: 'center', sm: 'left' }
                  }}>
                    <Button 
                      color="inherit" 
                      onClick={handleShowAbout}
                      sx={{ 
                        textTransform: 'none',
                        '&:hover': { color: 'primary.light' }
                      }}
                    >
                      About Us
                    </Button>
                    <Button 
                      color="inherit" 
                      onClick={handleShowContact}
                      sx={{ 
                        textTransform: 'none',
                        '&:hover': { color: 'primary.light' }
                      }}
                    >
                      Contact
                    </Button>
                    <Button 
                      color="inherit" 
                      sx={{ 
                        textTransform: 'none',
                        '&:hover': { color: 'primary.light' }
                      }}
                      onClick={handleShowSubscription}
                    >
                      Membership
                    </Button>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 2,
                    flexDirection: { xs: 'column', sm: 'row' },
                    textAlign: { xs: 'center', sm: 'right' }
                  }}>
                    <Typography 
                      variant="body2" 
                      sx={{ opacity: 0.8 }}
                    >
                      © 2025 Investimate. All rights reserved.
                    </Typography>
                    <Button 
                      color="inherit" 
                      size="small"
                      onClick={() => setShowQADiagnostic(true)}
                      sx={{ 
                        textTransform: 'none',
                        opacity: 0.7,
                        mr: 1,
                        '&:hover': { 
                          color: 'success.light',
                          opacity: 1
                        }
                      }}
                    >
                      QA Diagnostic
                    </Button>
                    <Button 
                      color="inherit" 
                      size="small"
                      onClick={handleShowAdmin}
                      sx={{ 
                        textTransform: 'none',
                        opacity: 0.7,
                        mr: 1,
                        '&:hover': { 
                          color: 'primary.light',
                          opacity: 1
                        }
                      }}
                    >
                      Admin
                    </Button>
                    <Button 
                      color="inherit" 
                      size="small"
                      onClick={() => setShowProQA(true)}
                      sx={{ 
                        textTransform: 'none',
                        opacity: 0.7,
                        '&:hover': { 
                          color: 'warning.light',
                          opacity: 1
                        }
                      }}
                    >
                      Pro QA
                    </Button>
                  </Box>
                </Box>
              </Container>
            </Box>
          </>
        )}

        {currentTab === 2 && (
          <Box sx={{ 
            width: '100%', 
            minHeight: 'calc(100vh - 64px)' // Just nav bar height
          }}>
            <CommunityChat />
          </Box>
        )}

        {/* Upgrade Modal */}
        <UpgradeModal
          open={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          onUpgrade={() => {
            setShowUpgradeModal(false);
            handleShowSubscription();
          }}
          feature="Property Search"
          currentUsage={{
            used: 5 - searchesRemaining,
            limit: 5
          }}
        />
            </Box>
    </ThemeProvider>
  );
}

export default App;

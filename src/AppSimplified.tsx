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
import { UserProvider, useUser } from './services/userContextService';
import { UpgradeModal } from './components/UpgradeModal';
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
      fontSize: '3.5rem',
      letterSpacing: '-0.02em',
      lineHeight: 1.1,
      '@media (max-width:600px)': {
        fontSize: '2.5rem',
      },
    },
    h2: {
      fontWeight: 600,
      fontSize: '2.5rem',
      letterSpacing: '-0.01em',
      lineHeight: 1.2,
      '@media (max-width:600px)': {
        fontSize: '2rem',
      },
    },
    h3: {
      fontWeight: 600,
      fontSize: '2rem',
      letterSpacing: '-0.01em',
      lineHeight: 1.3,
      '@media (max-width:600px)': {
        fontSize: '1.5rem',
      },
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      letterSpacing: '0em',
      lineHeight: 1.4,
      '@media (max-width:600px)': {
        fontSize: '1.25rem',
      },
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
      letterSpacing: '0em',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 500,
      fontSize: '1.1rem',
      letterSpacing: '0.01em',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      letterSpacing: '0.00938em',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      letterSpacing: '0.01071em',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
      letterSpacing: '0.03333em',
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.75,
      letterSpacing: '0.00938em',
    },
    subtitle2: {
      fontSize: '0.875rem',
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
          fontSize: '0.875rem',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          fontSize: '0.875rem',
          fontWeight: 500,
        },
        contained: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          fontWeight: 500,
          textTransform: 'none',
          minHeight: 48,
        },
      },
    },
  },
});

function App() {
  return (
    <UserProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppContent />
      </ThemeProvider>
    </UserProvider>
  );
}

function AppContent() {
  const { 
    user, 
    isLoading, 
    login, 
    logout, 
    signup, 
    upgradeToProWithStripe,
    canUseFeature,
    useFeature,
    isProUser,
    resetSearchCount
  } = useUser();

  const [currentTab, setCurrentTab] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [showProQA, setShowProQA] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResultsData, setSearchResultsData] = useState<{
    properties: any[];
    searchType: 'boundary' | 'area';
    searchQuery?: string;
    boundaryInfo?: { north: number; south: number; east: number; west: number };
  } | null>(null);

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
    setShowAdmin(false);
    setShowAbout(false);
    setShowContact(false);
    setShowSubscription(false);
  };

  const handleShowSignup = () => {
    setShowSignup(true);
    setShowLogin(false);
    setShowPayment(false);
    setShowAdmin(false);
    setShowAbout(false);
    setShowContact(false);
    setShowSubscription(false);
  };

  const handleShowPayment = () => {
    setShowPayment(true);
    setShowLogin(false);
    setShowSignup(false);
    setShowAdmin(false);
    setShowAbout(false);
    setShowContact(false);
    setShowSubscription(false);
  };

  const handleShowAdmin = () => {
    setShowAdmin(true);
    setShowLogin(false);
    setShowSignup(false);
    setShowPayment(false);
    setShowAbout(false);
    setShowContact(false);
    setShowSubscription(false);
  };

  const handleShowAbout = () => {
    setShowAbout(true);
    setShowLogin(false);
    setShowSignup(false);
    setShowPayment(false);
    setShowAdmin(false);
    setShowContact(false);
    setShowSubscription(false);
  };

  const handleShowContact = () => {
    setShowContact(true);
    setShowLogin(false);
    setShowSignup(false);
    setShowPayment(false);
    setShowAdmin(false);
    setShowAbout(false);
    setShowSubscription(false);
  };

  const handleShowSubscription = () => {
    setShowSubscription(true);
    setShowLogin(false);
    setShowSignup(false);
    setShowPayment(false);
    setShowAdmin(false);
    setShowAbout(false);
    setShowContact(false);
  };

  const handleLogin = async (email: string, _password: string = '') => {
    console.log('🔐 Attempting login with new user context...');
    const success = await login(email);
    
    if (success) {
      setShowLogin(false);
      console.log('✅ Login successful via user context');
      return true;
    } else {
      console.log('❌ Login failed via user context');
      return false;
    }
  };

  const handleSignup = async (email: string, name: string, _password: string = '') => {
    console.log('📝 Attempting signup with new user context...');
    const success = await signup(email, name);
    
    if (success) {
      setShowSignup(false);
      console.log('✅ Signup successful via user context');
      return true;
    } else {
      console.log('❌ Signup failed via user context');
      return false;
    }
  };

  const handleLogout = async () => {
    console.log('👋 Logging out via user context...');
    await logout();
    resetSearchCount();
    setCurrentTab(0);
    setShowAdmin(false);
    console.log('✅ Logout successful');
  };

  const handleUpgrade = () => {
    setShowUpgradeModal(true);
  };

  const handleCloseUpgradeModal = () => {
    setShowUpgradeModal(false);
  };

  const handleUpgradeToProQA = () => {
    setShowProQA(true);
    setShowUpgradeModal(false);
  };

  const handleSearchSubmit = async (searchParams: any) => {
    console.log('🔍 Search submitted with new user context...');
    
    // Check if user can perform search
    const canSearch = await canUseFeature('property_search');
    
    if (!canSearch && !isProUser()) {
      console.log('❌ Search limit reached, showing upgrade modal');
      setShowUpgradeModal(true);
      return;
    }

    try {
      // Use the feature (this will track usage for free users)
      const success = await useFeature('property_search');
      
      if (!success) {
        console.log('❌ Failed to use search feature');
        setShowUpgradeModal(true);
        return;
      }

      console.log('✅ Search feature used successfully');
      
      // Proceed with search...
      // This would normally call the search API
      // For now, just simulate search results
      setSearchResultsData({
        properties: [],
        searchType: 'area',
        searchQuery: searchParams.location
      });
      setShowSearchResults(true);
      
    } catch (error) {
      console.error('❌ Error during search:', error);
    }
  };

  const handlePaymentSuccess = async (paymentData: { 
    email: string; 
    customerId: string; 
    subscriptionId: string; 
  }) => {
    console.log('💳 Payment successful, upgrading to Pro with new user context...', paymentData);
    
    try {
      const success = await upgradeToProWithStripe(paymentData.customerId, paymentData.subscriptionId);
      
      if (success) {
        console.log('✅ Successfully upgraded to Pro via user context');
        setShowPayment(false);
        setShowUpgradeModal(false);
      } else {
        console.error('❌ Failed to upgrade user to Pro');
      }
    } catch (error) {
      console.error('❌ Error upgrading to Pro:', error);
    }
  };

  // Show loading state while user context is initializing
  if (isLoading) {
    return (
      <Box 
        display="flex" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="100vh"
        bgcolor="background.default"
      >
        <Typography variant="h6" color="primary">
          Loading Investimate...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <NavigationBar
        user={user}
        onLogin={handleShowLogin}
        onSignup={handleShowSignup}
        onLogout={handleLogout}
        onLogoClick={handleLogoClick}
        currentTab={currentTab}
        onTabChange={handleTabChange}
        onShowAdmin={handleShowAdmin}
        onShowAbout={handleShowAbout}
        onShowContact={handleShowContact}
        onShowSubscription={handleShowSubscription}
      />

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 2 }}>
        {/* Hero Section - Only show on home tab and not logged in */}
        {currentTab === 0 && !user && !showLogin && !showSignup && !showPayment && !showAdmin && !showAbout && !showContact && !showSubscription && !showProQA && !showSearchResults && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h1" color="primary" gutterBottom>
              Investimate
            </Typography>
            <Typography variant="h4" color="text.secondary" sx={{ mb: 4, fontWeight: 400 }}>
              Intelligent Real Estate Investment Analysis
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}>
              Discover profitable rental properties with our advanced cash flow analysis, 
              market insights, and investment scoring system. Make smarter investment decisions with data-driven intelligence.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 6 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<Calculator />}
                onClick={() => setCurrentTab(0)}
                sx={{ px: 4, py: 1.5 }}
              >
                Start Analysis
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<TrendingUp />}
                onClick={handleShowAbout}
                sx={{ px: 4, py: 1.5 }}
              >
                Learn More
              </Button>
            </Box>

            {/* Feature Cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3, mt: 8 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                  <Calculator size={48} color="#1976d2" style={{ marginBottom: 16 }} />
                  <Typography variant="h5" gutterBottom>
                    Cash Flow Analysis
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Comprehensive rental property analysis with real market data and conservative estimates
                  </Typography>
                </CardContent>
              </Card>

              <Card>
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                  <Home size={48} color="#1976d2" style={{ marginBottom: 16 }} />
                  <Typography variant="h5" gutterBottom>
                    Property Search
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Find investment properties with our intelligent search and ranking system
                  </Typography>
                </CardContent>
              </Card>

              <Card>
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                  <Users size={48} color="#1976d2" style={{ marginBottom: 16 }} />
                  <Typography variant="h5" gutterBottom>
                    Community Insights
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Connect with other investors and share market insights
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        )}

        {/* Tab Content */}
        {currentTab === 0 && !showLogin && !showSignup && !showPayment && !showAdmin && !showAbout && !showContact && !showSubscription && !showProQA && !showSearchResults && (
          <PropertyCalculatorWithMap 
            user={user}
            onUpgrade={handleUpgrade}
            onSearchSubmit={handleSearchSubmit}
            maxFreeSearches={MAX_FREE_SEARCHES}
            searchesUsed={user?.searchesUsed || 0}
          />
        )}

        {currentTab === 1 && !showLogin && !showSignup && !showPayment && !showAdmin && !showAbout && !showContact && !showSubscription && !showProQA && (
          <CommunityChat user={user} onUpgrade={handleUpgrade} />
        )}

        {/* Modal Pages */}
        {showLogin && (
          <EnhancedLoginPage
            onLogin={handleLogin}
            onClose={() => setShowLogin(false)}
            onSwitchToSignup={handleShowSignup}
          />
        )}

        {showSignup && (
          <EnhancedSignupPage
            onSignup={handleSignup}
            onClose={() => setShowSignup(false)}
            onSwitchToLogin={handleShowLogin}
          />
        )}

        {showPayment && (
          <PaymentPage
            onClose={() => setShowPayment(false)}
            onSuccess={handlePaymentSuccess}
            userEmail={user?.email || ''}
          />
        )}

        {showAdmin && (
          <AdminPage onClose={() => setShowAdmin(false)} />
        )}

        {showAbout && (
          <AboutPage onClose={() => setShowAbout(false)} />
        )}

        {showContact && (
          <ContactPage onClose={() => setShowContact(false)} />
        )}

        {showSubscription && (
          <SubscriptionPage
            onClose={() => setShowSubscription(false)}
            onUpgrade={handleShowPayment}
            user={user}
          />
        )}

        {showProQA && (
          <ProMembershipQA
            onClose={() => setShowProQA(false)}
            onUpgradeClick={handleShowPayment}
          />
        )}

        {showSearchResults && searchResultsData && (
          <SearchResultsPage
            properties={searchResultsData.properties}
            searchType={searchResultsData.searchType}
            searchQuery={searchResultsData.searchQuery}
            boundaryInfo={searchResultsData.boundaryInfo}
            onClose={() => setShowSearchResults(false)}
            onNewSearch={() => {
              setShowSearchResults(false);
              setCurrentTab(0);
            }}
          />
        )}
      </Container>

      {/* Upgrade Modal */}
      <UpgradeModal
        open={showUpgradeModal}
        onClose={handleCloseUpgradeModal}
        onUpgrade={handleShowPayment}
        onProQA={handleUpgradeToProQA}
        searchesUsed={user?.searchesUsed || 0}
        maxFreeSearches={MAX_FREE_SEARCHES}
      />
    </Box>
  );
}

export default App;

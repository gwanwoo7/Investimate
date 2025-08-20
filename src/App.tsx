import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Typography, Box, Button, Card, CardContent, Container, Tab, Tabs } from '@mui/material';
import { Calculator, Users, Home, TrendingUp } from 'lucide-react';
import PropertyCalculatorWithMap from './components/PropertyCalculatorWithMap';
import CommunityChat from './components/CommunityChat';
import PaymentPage from './components/PaymentPage';
import AdminDashboard from './components/AdminDashboard';
import EnhancedLoginPage from './components/EnhancedLoginPage';
import EnhancedSignupPage from './components/EnhancedSignupPage';
import AuthCallback from './components/AuthCallback';
import OAuthDebug from './components/OAuthDebug';
import GeographicSearchTest from './components/GeographicSearchTest';
import AdminPage from './pages/AdminPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import SubscriptionPage from './pages/SubscriptionPage';
import NavigationBar from './components/NavigationBar';
import DatabaseService from './services/databaseService';
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
    },
    h2: {
      fontWeight: 600,
    },
  },
});

function App() {
  const [currentTab, setCurrentTab] = useState(0);
  const [user, setUser] = useState<{ email: string; isSubscribed: boolean; name?: string; id?: string } | null>(null);
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

  const db = DatabaseService.getInstance();

  // Restore user session on app startup
  useEffect(() => {
    console.log('🔄 App starting - checking for existing user session...');
    const currentUser = db.getCurrentUser();
    if (currentUser) {
      console.log('✅ Restoring user session for:', currentUser.email);
      setUser({
        email: currentUser.email,
        isSubscribed: currentUser.isSubscribed || false,
        name: currentUser.name,
        id: currentUser.id
      });
      console.log('📊 User session restored successfully');
    } else {
      console.log('ℹ️ No existing user session found');
    }
  }, []);

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
    setShowPayment(true);
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
    setCurrentTab(0);
  };

  const handleLogin = (email: string) => {
    const currentUser = db.getCurrentUser();
    if (currentUser) {
      setUser({
        email: currentUser.email,
        isSubscribed: currentUser.isSubscribed || false,
        name: currentUser.name,
        id: currentUser.id
      });
    } else {
      setUser({ email, isSubscribed: false });
    }
    setShowLogin(false);
  };

  const handleSignup = (email: string) => {
    const currentUser = db.getCurrentUser();
    if (currentUser) {
      setUser({
        email: currentUser.email,
        isSubscribed: currentUser.isSubscribed || false,
        name: currentUser.name,
        id: currentUser.id
      });
    } else {
      setUser({ email, isSubscribed: false });
    }
    setShowSignup(false);
  };

  const handleSubscription = () => {
    if (user) {
      setUser({ ...user, isSubscribed: true });
      setShowPayment(false);
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

  const canSearch = () => {
    return user?.isSubscribed || searchCount < MAX_FREE_SEARCHES;
  };

  const handleSearch = () => {
    if (!user?.isSubscribed) {
      const newCount = searchCount + 1;
      setSearchCount(newCount);
      
      // Persist search count to localStorage
      localStorage.setItem('investimate_search_count', newCount.toString());
      console.log('🔍 Search count updated:', newCount);
    }
  };

  const renderNavigation = () => (
    <NavigationBar
      onLogoClick={handleLogoClick}
      showMainTabs={!showLogin && !showSignup && !showPayment && !showAdmin && !showAbout && !showContact && !showSubscription}
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
            handleBackToMain();
          }}
        />
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
            canSearch={canSearch()}
            onSearch={handleSearch}
            onUpgrade={handleShowPayment}
            searchCount={searchCount}
            maxSearches={MAX_FREE_SEARCHES}
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
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    mb: 2
                  }}>
                    Investimate
                  </Typography>
                  <Typography variant="h4" gutterBottom sx={{ 
                    fontSize: { xs: '1.2rem', md: '1.5rem' },
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
                  {user && !user.isSubscribed && searchCount >= MAX_FREE_SEARCHES && (
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
                        You've used all {MAX_FREE_SEARCHES} free searches. Upgrade to Pro for unlimited access!
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
                      if (!canSearch()) {
                        handleShowPayment();
                      } else {
                        setCurrentTab(1);
                      }
                    }}
                    startIcon={<Calculator />}
                    sx={{ 
                      py: 2, 
                      px: 4, 
                      fontSize: '1.1rem',
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
                      user.isSubscribed ? 'Start Analyzing Properties' : `Analyze Properties (${MAX_FREE_SEARCHES - searchCount} left)`
                    ) : (
                      'Start Analyzing Properties'
                    )}
                  </Button>
                  
                  {/* Temporary Debug Button */}
                  <Button 
                    variant="outlined"
                    size="small"
                    onClick={() => setCurrentTab(5)}
                    sx={{ 
                      mt: 2,
                      mr: 1,
                      color: 'white',
                      borderColor: 'white',
                      '&:hover': { 
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                        borderColor: 'white'
                      }
                    }}
                  >
                    Debug OAuth
                  </Button>
                  
                  <Button 
                    variant="outlined"
                    size="small"
                    onClick={() => setCurrentTab(6)}
                    sx={{ 
                      mt: 2,
                      color: 'white',
                      borderColor: 'white',
                      '&:hover': { 
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                        borderColor: 'white'
                      }
                    }}
                  >
                    Test Geographic Search
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
                  if (!canSearch()) {
                    handleShowPayment();
                  } else {
                    setCurrentTab(1);
                  }
                }}>
                  <CardContent>
                    <Box sx={{ mb: 3 }}>
                      <Calculator size={56} color="#1976d2" />
                    </Box>
                    <Typography variant="h5" gutterBottom fontWeight="bold">
                      Smart Calculator
                    </Typography>
                    <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      Analyze cash flow, ROI, and cap rates using real Zillow data. 
                      Get accurate mortgage, tax, and insurance calculations.
                    </Typography>
                    {!user?.isSubscribed && user && searchCount >= MAX_FREE_SEARCHES && (
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
                      <TrendingUp size={56} color="#999" />
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
                      <Users size={56} color="#1976d2" />
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
                        fontSize: '1rem',
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
                        fontSize: '1rem',
                        '&:hover': { color: 'primary.light' }
                      }}
                    >
                      Contact
                    </Button>
                    <Button 
                      color="inherit" 
                      sx={{ 
                        textTransform: 'none',
                        fontSize: '1rem',
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
                      onClick={handleShowAdmin}
                      sx={{ 
                        textTransform: 'none',
                        fontSize: '0.875rem',
                        opacity: 0.7,
                        '&:hover': { 
                          color: 'primary.light',
                          opacity: 1
                        }
                      }}
                    >
                      Admin
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

        {currentTab === 5 && (
          <Box sx={{ 
            width: '100%', 
            minHeight: 'calc(100vh - 64px)' // Just nav bar height
          }}>
            <OAuthDebug />
          </Box>
        )}

        {currentTab === 6 && (
          <Box sx={{ 
            width: '100%', 
            minHeight: 'calc(100vh - 64px)' // Just nav bar height
          }}>
            <GeographicSearchTest />
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
}

export default App;

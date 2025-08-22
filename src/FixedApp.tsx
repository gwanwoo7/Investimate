import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Typography, Box, Button, Container, Tab, Tabs, Card, CardContent } from '@mui/material';
import { Calculator, Users, Home, TrendingUp } from 'lucide-react';

// Import key components one by one to ensure they work
import PropertyCalculatorWithMap from './components/PropertyCalculatorWithMap';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
    background: { default: '#f8fafc' },
  },
  typography: {
    h1: { fontWeight: 700 },
    h2: { fontWeight: 600 },
  },
});

function FixedApp() {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      {/* Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Tabs value={currentTab} onChange={handleTabChange} aria-label="main navigation">
            <Tab label="Home" />
            <Tab label="Property Calculator" />
            <Tab label="Community" />
          </Tabs>
        </Container>
      </Box>

      {/* Main Content */}
      <Box sx={{ minHeight: 'calc(100vh - 64px)', bgcolor: 'background.default' }}>
        {currentTab === 0 && (
          <Box sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            py: { xs: 8, md: 12 }
          }}>
            <Container maxWidth="lg">
              <Box sx={{ textAlign: 'center', maxWidth: '800px', mx: 'auto' }}>
                <Typography variant="h1" component="h1" gutterBottom sx={{ 
                  fontSize: { xs: '2.5rem', md: '3.5rem' }, mb: 2
                }}>
                  🏠 Investimate
                </Typography>
                <Typography variant="h4" gutterBottom sx={{ 
                  fontSize: { xs: '1.2rem', md: '1.5rem' }, fontWeight: 400, mb: 4, opacity: 0.95
                }}>
                  Estimate Right. Invest Smart in Your Next Rental.
                </Typography>
                <Typography variant="h6" sx={{ mb: 6, opacity: 0.9, fontWeight: 400 }}>
                  Analyze rental properties with real market data, calculate ROI instantly, 
                  and connect with fellow investors.
                </Typography>
                
                <Button 
                  variant="contained" 
                  size="large" 
                  onClick={() => setCurrentTab(1)}
                  startIcon={<Calculator />}
                  sx={{ 
                    py: 2, px: 4, fontSize: '1.1rem', bgcolor: 'white', color: 'primary.main',
                    fontWeight: 600, '&:hover': { bgcolor: 'grey.50', transform: 'translateY(-2px)' }
                  }}
                >
                  Start Analyzing Properties
                </Button>
              </Box>
            </Container>

            {/* Features Section */}
            <Container maxWidth="lg" sx={{ mt: 10 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
                <Card sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }}>
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Calculator size={48} />
                    <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>Smart Calculator</Typography>
                    <Typography variant="body2">
                      Analyze cash flow, ROI, and cap rates with real market data
                    </Typography>
                  </CardContent>
                </Card>
                <Card sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }}>
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <TrendingUp size={48} />
                    <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>Market Analysis</Typography>
                    <Typography variant="body2">
                      Real-time market insights and property comparisons
                    </Typography>
                  </CardContent>
                </Card>
                <Card sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }}>
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Users size={48} />
                    <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>Community</Typography>
                    <Typography variant="body2">
                      Connect with investors and share insights
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Container>
          </Box>
        )}

        {currentTab === 1 && (
          <Box sx={{ height: 'calc(100vh - 64px)', width: '100%', overflow: 'auto' }}>
            <PropertyCalculatorWithMap 
              canSearch={true}
              onSearch={() => {}}
              onUpgrade={() => {}}
              searchCount={0}
              maxSearches={5}
            />
          </Box>
        )}

        {currentTab === 2 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom>
              Community Chat
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Community features coming soon...
            </Typography>
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
}

export default FixedApp;

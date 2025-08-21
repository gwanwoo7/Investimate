import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Typography, Box, Button, Card, CardContent, Container } from '@mui/material';
import { Calculator, Users, Home, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';

// Test importing services
import DatabaseService from './services/databaseService';

// Test importing components one by one
import NavigationBar from './components/NavigationBar';
import PropertyCalculatorWithMap from './components/PropertyCalculatorWithMap';

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

function SimpleApp() {
  const [currentTab, setCurrentTab] = useState(0);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      <Box sx={{ 
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column'
      }}>
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
                Investimate - QA Test
              </Typography>
              <Typography variant="h4" gutterBottom sx={{ 
                fontSize: { xs: '1.2rem', md: '1.5rem' },
                fontWeight: 400,
                mb: 4,
                opacity: 0.95
              }}>
                Basic App Loading Successfully
              </Typography>
              
              <Button 
                variant="contained" 
                size="large" 
                onClick={() => setCurrentTab(currentTab === 0 ? 1 : 0)}
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
                Test Button - Tab: {currentTab}
              </Button>
            </Box>
          </Container>
        </Box>

        {/* Features Section */}
        <Box sx={{ py: { xs: 6, md: 10 }, width: '100%' }}>
          <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 } }}>
            <Typography variant="h3" align="center" gutterBottom sx={{ mb: 6, color: 'text.primary' }}>
              QA Testing - Basic Components Working
            </Typography>
          
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: 4,
              mb: 8
            }}>
              <Card sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                <CardContent>
                  <Box sx={{ mb: 3 }}>
                    <Calculator size={56} color="#1976d2" />
                  </Box>
                  <Typography variant="h5" gutterBottom fontWeight="bold">
                    ✅ React Loading
                  </Typography>
                  <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    React is rendering successfully
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                <CardContent>
                  <Box sx={{ mb: 3 }}>
                    <TrendingUp size={56} color="#1976d2" />
                  </Box>
                  <Typography variant="h5" gutterBottom fontWeight="bold">
                    ✅ Material-UI Working
                  </Typography>
                  <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    Theme and components loaded
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                <CardContent>
                  <Box sx={{ mb: 3 }}>
                    <Users size={56} color="#1976d2" />
                  </Box>
                  <Typography variant="h5" gutterBottom fontWeight="bold">
                    ✅ Icons Working
                  </Typography>
                  <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    Lucide-react icons rendering
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default SimpleApp;

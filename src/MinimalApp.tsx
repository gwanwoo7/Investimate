import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Typography, Button } from '@mui/material';

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
});

function MinimalApp() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ p: 4 }}>
        <Typography variant="h1" gutterBottom>
          🚀 Investimate - Test Page
        </Typography>
        <Typography variant="h4" gutterBottom color="primary">
          This is a minimal test to verify React is working
        </Typography>
        <Button variant="contained" size="large" sx={{ mt: 2 }}>
          Click Me - React is Working!
        </Button>
        <Box sx={{ mt: 4, p: 2, bgcolor: 'success.light' }}>
          <Typography variant="body1">
            ✅ React is rendering successfully
          </Typography>
          <Typography variant="body1">
            ✅ Material-UI is working
          </Typography>
          <Typography variant="body1">
            ✅ Theme is applied
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default MinimalApp;

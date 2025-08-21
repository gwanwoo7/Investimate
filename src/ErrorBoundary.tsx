import React from 'react';
import { Box, Typography, Button, Alert, Paper } from '@mui/material';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 React Error Boundary caught an error:', error);
    console.error('Error info:', errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 4, minHeight: '100vh', bgcolor: '#f5f5f5' }}>
          <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                🚨 Application Error Detected
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                The React application encountered an error and crashed.
              </Typography>
            </Alert>

            <Typography variant="h6" gutterBottom>
              Error Details:
            </Typography>
            <Paper sx={{ p: 2, bgcolor: '#ffebee', mb: 3 }}>
              <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace' }}>
                {this.state.error?.toString()}
              </Typography>
            </Paper>

            {this.state.errorInfo && (
              <>
                <Typography variant="h6" gutterBottom>
                  Component Stack:
                </Typography>
                <Paper sx={{ p: 2, bgcolor: '#ffebee', mb: 3 }}>
                  <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    {this.state.errorInfo.componentStack}
                  </Typography>
                </Paper>
              </>
            )}

            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => {
                this.setState({ hasError: false, error: undefined, errorInfo: undefined });
                window.location.reload();
              }}
            >
              Reload Application
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

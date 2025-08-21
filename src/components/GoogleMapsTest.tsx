import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { Loader } from '@googlemaps/js-api-loader';

const GoogleMapsTest: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const testGoogleMapsAPI = async () => {
      try {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        
        console.log('All environment variables:', import.meta.env);
        console.log('VITE_GOOGLE_MAPS_API_KEY:', apiKey);
        
        if (!apiKey) {
          throw new Error('Google Maps API key not found in environment variables');
        }

        console.log('Testing Google Maps API key:', apiKey.substring(0, 10) + '...');

        const loader = new Loader({
          apiKey,
          version: 'weekly',
          libraries: ['drawing', 'geometry', 'places'],
        });

        await loader.load();
        
        console.log('Google Maps API loaded successfully!');
        console.log('Google object:', window.google);
        console.log('Maps object:', window.google?.maps);
        
        setSuccess(true);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('Google Maps API loading error:', err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    testGoogleMapsAPI();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3 }}>
        <CircularProgress size={24} />
        <Typography>Testing Google Maps API...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {success ? (
        <Typography color="success.main" variant="h6">
          ✅ Google Maps API loaded successfully!
        </Typography>
      ) : (
        <Typography color="error.main" variant="h6">
          ❌ Error loading Google Maps API: {error}
        </Typography>
      )}
      
      <Typography variant="body2" sx={{ mt: 2 }}>
        API Key: {import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? 
          import.meta.env.VITE_GOOGLE_MAPS_API_KEY.substring(0, 10) + '...' : 
          'NOT FOUND'
        }
      </Typography>
      
      <Typography variant="body2">
        Environment: {import.meta.env.MODE}
      </Typography>
      
      <Typography variant="body2">
        All env vars: {Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')).join(', ')}
      </Typography>
    </Box>
  );
};

export default GoogleMapsTest;

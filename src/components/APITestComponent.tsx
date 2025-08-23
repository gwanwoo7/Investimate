import { useState } from 'react';
import { 
  Button, 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  Alert,
  TextField,
  Stack,
  Divider
} from '@mui/material';
import { RealEstateAPIService } from '../services/realEstateAPIService';
import type { AreaSearchParams } from '../types/property';

export default function APITestComponent() {
  const [redfinResult, setRedfinResult] = useState<any>(null);
  const [zillowResult, setZillowResult] = useState<any>(null);
  const [combinedResult, setCombinedResult] = useState<any>(null);
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<{ [key: string]: string | null }>({});
  
  // Search parameters
  const [searchCity, setSearchCity] = useState('Orlando');
  const [searchState, setSearchState] = useState('FL');

  const getTestParams = (): AreaSearchParams => ({
    city: searchCity.trim() || 'Orlando',
    state: searchState.trim() || 'FL'
  });

  const testRedfinAPI = async () => {
    setLoading(prev => ({ ...prev, redfin: true }));
    setError(prev => ({ ...prev, redfin: null }));
    setRedfinResult(null);

    try {
      console.log('Testing Redfin API...');
      const properties = await RealEstateAPIService.searchPropertiesFromRedfin(getTestParams());
      console.log('Redfin properties found:', properties.length);
      
      setRedfinResult({
        source: 'Redfin Enhanced Data (Location-based)',
        location: `${searchCity}, ${searchState}`,
        propertiesFound: properties.length,
        sampleProperty: properties[0] || null,
        success: true
      });
    } catch (err: any) {
      console.error('Redfin API Error:', err);
      setError(prev => ({ ...prev, redfin: `Redfin API Error: ${err.message}` }));
    }

    setLoading(prev => ({ ...prev, redfin: false }));
  };

  const testZillowAPI = async () => {
    setLoading(prev => ({ ...prev, zillow: true }));
    setError(prev => ({ ...prev, zillow: null }));
    setZillowResult(null);

    try {
      console.log('Testing Zillow API...');
      const properties = await RealEstateAPIService.searchPropertiesFromZillow(getTestParams());
      console.log('Zillow properties found:', properties.length);
      
      setZillowResult({
        source: 'Zillow Real Property Search API',
        location: `${searchCity}, ${searchState}`,
        propertiesFound: properties.length,
        sampleProperty: properties[0] || null,
        success: true
      });
    } catch (err: any) {
      console.error('Zillow API Error:', err);
      setError(prev => ({ ...prev, zillow: `Zillow API Error: ${err.message}` }));
    }

    setLoading(prev => ({ ...prev, zillow: false }));
  };

  const testCombinedAPI = async () => {
    setLoading(prev => ({ ...prev, combined: true }));
    setError(prev => ({ ...prev, combined: null }));
    setCombinedResult(null);

    try {
      console.log('Testing Combined API (Redfin + Zillow)...');
      const properties = await RealEstateAPIService.searchProperties(getTestParams());
      console.log('Combined properties found:', properties.length);
      
      setCombinedResult({
        source: 'Combined Redfin + Zillow APIs',
        location: `${searchCity}, ${searchState}`,
        propertiesFound: properties.length,
        sampleProperty: properties[0] || null,
        success: true
      });
    } catch (err: any) {
      console.error('Combined API Error:', err);
      setError(prev => ({ ...prev, combined: `Combined API Error: ${err.message}` }));
    }

    setLoading(prev => ({ ...prev, combined: false }));
  };

  const renderResult = (result: any, errorMsg: string | null, title: string) => {
    if (errorMsg) {
      return <Alert severity="error" sx={{ mt: 2 }}>{errorMsg}</Alert>;
    }

    if (result) {
      return (
        <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="h6" color="success.main" gutterBottom>
            ✅ {title} Results:
          </Typography>
          <Typography variant="body2" component="pre" sx={{ 
            whiteSpace: 'pre-wrap',
            fontSize: '0.875rem',
            maxHeight: '300px',
            overflow: 'auto'
          }}>
            {JSON.stringify(result, null, 2)}
          </Typography>
        </Box>
      );
    }

    return null;
  };

  return (
    <Paper sx={{ p: 3, m: 2, maxWidth: 1200 }}>
      <Typography variant="h5" gutterBottom>
        Real Estate API Testing Dashboard
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Test individual APIs or the combined service. Enter a city and state to search for properties in that area.
      </Typography>

      {/* Search Controls */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: '#f8f9fa' }}>
        <Typography variant="h6" gutterBottom>
          Search Location
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            label="City"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            placeholder="Orlando"
            size="small"
            sx={{ minWidth: 200 }}
          />
          <TextField
            label="State"
            value={searchState}
            onChange={(e) => setSearchState(e.target.value.toUpperCase())}
            placeholder="FL"
            inputProps={{ maxLength: 2 }}
            size="small"
            sx={{ width: 100 }}
          />
          <Typography variant="body2" color="text.secondary">
            Current: {searchCity}, {searchState}
          </Typography>
        </Stack>
      </Paper>

      <Divider sx={{ mb: 3 }} />

      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
        <Box sx={{ flex: 1 }}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={testRedfinAPI} 
            disabled={loading.redfin}
            fullWidth
            sx={{ mb: 2, py: 2 }}
          >
            {loading.redfin ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Testing Redfin...
              </>
            ) : (
              '🏠 Test Redfin API'
            )}
          </Button>
          {renderResult(redfinResult, error.redfin, 'Redfin API')}
        </Box>

        <Box sx={{ flex: 1 }}>
          <Button 
            variant="contained" 
            color="secondary"
            onClick={testZillowAPI} 
            disabled={loading.zillow}
            fullWidth
            sx={{ mb: 2, py: 2 }}
          >
            {loading.zillow ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Testing Zillow...
              </>
            ) : (
              '🏘️ Test Zillow API'
            )}
          </Button>
          {renderResult(zillowResult, error.zillow, 'Zillow API')}
        </Box>

        <Box sx={{ flex: 1 }}>
          <Button 
            variant="contained" 
            color="success"
            onClick={testCombinedAPI} 
            disabled={loading.combined}
            fullWidth
            sx={{ mb: 2, py: 2 }}
          >
            {loading.combined ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Testing Combined...
              </>
            ) : (
              '🏢 Test Combined APIs'
            )}
          </Button>
          {renderResult(combinedResult, error.combined, 'Combined API')}
        </Box>
      </Box>

      <Box sx={{ mt: 4, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          API Information:
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          • <strong>Redfin API:</strong> Real rental property listings from various locations
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          • <strong>Zillow API:</strong> Market data and property valuations for Orlando, FL
        </Typography>
        <Typography variant="body2">
          • <strong>Combined:</strong> Merges data from both APIs, removes duplicates, and provides comprehensive property search
        </Typography>
      </Box>
    </Paper>
  );
}

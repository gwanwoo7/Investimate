import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Alert, 
  CircularProgress
} from '@mui/material';
import { EnhancedRealEstateAPIService } from '../services/enhancedRealEstateAPIService';
import type { AreaSearchParams, PropertyListing } from '../types/property';

interface TestLocation {
  city: string;
  state: string;
  expectedPriceRange: { min: number; max: number };
  description: string;
}

const GeographicSearchTest: React.FC = () => {
  const [testResults, setTestResults] = useState<{ [key: string]: any }>({});
  const [loading, setLoading] = useState<string>('');

  // Test locations across different states
  const testLocations: TestLocation[] = [
    {
      city: 'Santa Clara',
      state: 'CA',
      expectedPriceRange: { min: 600000, max: 2000000 },
      description: 'California - Silicon Valley (High-cost market)'
    },
    {
      city: 'Houston',
      state: 'TX',
      expectedPriceRange: { min: 200000, max: 800000 },
      description: 'Texas - Major city (Mid-cost market)'
    },
    {
      city: 'Orlando',
      state: 'FL',
      expectedPriceRange: { min: 250000, max: 900000 },
      description: 'Florida - Tourist area (Growing market)'
    }
  ];

  const testLocation = async (location: TestLocation) => {
    const locationKey = `${location.city}, ${location.state}`;
    setLoading(locationKey);

    try {
      console.log(`🧪 Testing search for ${locationKey}...`);

      const searchParams: AreaSearchParams = {
        city: location.city,
        state: location.state,
        propertyTypes: ['single-family'],
        minPrice: 100000,
        maxPrice: 3000000,
        minBedrooms: 2,
        maxBedrooms: 5
      };

      const results: PropertyListing[] = await EnhancedRealEstateAPIService.searchProperties(searchParams);
      
      // Analyze results
      const analysis = {
        totalProperties: results.length,
        priceRange: {
          min: Math.min(...results.map(p => p.purchasePrice || 0)),
          max: Math.max(...results.map(p => p.purchasePrice || 0)),
          average: Math.round(results.reduce((sum, p) => sum + (p.purchasePrice || 0), 0) / results.length)
        },
        cities: [...new Set(results.map(p => p.city))],
        stateMatch: results.every(p => p.state === location.state),
        hasCoordinates: results.every(p => p.latitude && p.longitude)
      };

      console.log(`✅ ${locationKey} test completed:`, analysis);
      
      setTestResults(prev => ({
        ...prev,
        [locationKey]: {
          success: true,
          analysis,
          timestamp: new Date().toLocaleTimeString()
        }
      }));

    } catch (error) {
      console.error(`❌ ${locationKey} test failed:`, error);
      
      setTestResults(prev => ({
        ...prev,
        [locationKey]: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    } finally {
      setLoading('');
    }
  };

  const runAllTests = async () => {
    setTestResults({});
    for (const location of testLocations) {
      await testLocation(location);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Geographic Search Testing Dashboard
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
        Testing property search functionality across different US markets.
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Button 
          variant="contained" 
          onClick={runAllTests} 
          disabled={loading !== ''}
          size="large"
        >
          {loading ? 'Testing...' : 'Run All Geographic Tests'}
        </Button>
        {loading && (
          <Box sx={{ display: 'inline-flex', alignItems: 'center', ml: 2 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" sx={{ ml: 1 }}>
              Testing {loading}...
            </Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
        gap: 3
      }}>
        {testLocations.map((location) => {
          const locationKey = `${location.city}, ${location.state}`;
          const result = testResults[locationKey];
          
          return (
            <Paper key={locationKey} sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h3" sx={{ flexGrow: 1 }}>
                  {locationKey}
                </Typography>
                <Button
                  size="small"
                  onClick={() => testLocation(location)}
                  disabled={loading === locationKey}
                  sx={{ ml: 1 }}
                >
                  {loading === locationKey ? 'Testing...' : 'Test'}
                </Button>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {location.description}
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 2 }}>
                Expected: ${location.expectedPriceRange.min.toLocaleString()} - ${location.expectedPriceRange.max.toLocaleString()}
              </Typography>

              {result && (
                <Box>
                  {result.success ? (
                    <Box>
                      <Alert severity="success" sx={{ mb: 1 }}>
                        ✅ Test passed at {result.timestamp}
                      </Alert>
                      
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Found:</strong> {result.analysis.totalProperties} properties
                      </Typography>
                      
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Price Range:</strong> ${result.analysis.priceRange.min.toLocaleString()} - ${result.analysis.priceRange.max.toLocaleString()} (avg: ${result.analysis.priceRange.average.toLocaleString()})
                      </Typography>
                      
                      <Typography variant="body2">
                        <strong>Cities:</strong> {result.analysis.cities.join(', ')}
                      </Typography>
                    </Box>
                  ) : (
                    <Alert severity="error">
                      ❌ Test failed: {result.error}
                    </Alert>
                  )}
                </Box>
              )}
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
};

export default GeographicSearchTest;

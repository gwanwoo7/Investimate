import { useState, useCallback } from 'react';
import { Box, Container, Typography, Alert, Fab } from '@mui/material';
import { Map as MapIcon } from '@mui/icons-material';
import InteractiveMapWithBoundary from '../components/InteractiveMapWithBoundary';
import EnhancedPropertySearchForm from '../components/EnhancedPropertySearchForm';
import PropertyListView from '../components/PropertyListView';
import { searchPropertiesWithBoundary } from '../services/enhancedRealEstateAPIService';
import type { PropertyListing, AreaSearchParams } from '../types/property';

export default function FindInvestmentPropertiesPage() {
  const [properties, setProperties] = useState<PropertyListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMap, setShowMap] = useState(true);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [searchParams, setSearchParams] = useState<AreaSearchParams | null>(null);

  const handlePropertySearch = useCallback(async (searchData: AreaSearchParams) => {
    console.log('🔍 Starting property search with params:', searchData);
    setLoading(true);
    setError('');
    setSearchParams(searchData);

    try {
      const results = await searchPropertiesWithBoundary(searchData);
      
      console.log(`✅ Search completed: Found ${results.length} properties`);
      setProperties(results);
      
      if (results.length === 0) {
        setError('No properties found matching your criteria. Try adjusting your search parameters.');
      }
    } catch (err) {
      console.error('❌ Property search error:', err);
      setError(err instanceof Error ? err.message : 'Failed to search properties');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleBoundarySearch = useCallback(async (bounds: { north: number; south: number; east: number; west: number }) => {
    console.log('📍 Starting boundary search with bounds:', bounds);
    setLoading(true);
    setError('');

    try {
      const searchData: AreaSearchParams = {
        ...searchParams,
        bounds,
        // Default search parameters for boundary search
        minPrice: searchParams?.minPrice || 50000,
        maxPrice: searchParams?.maxPrice || 20000000,
        minBedrooms: searchParams?.minBedrooms || 2,
        propertyTypes: searchParams?.propertyTypes || ['single-family', 'townhouse', 'condo', 'multi-family'],
        limit: searchParams?.limit || 100
      };

      const results = await searchPropertiesWithBoundary(searchData);
      
      console.log(`✅ Boundary search completed: Found ${results.length} properties`);
      setProperties(results);
      setIsDrawingMode(false); // Exit drawing mode after search
      
      if (results.length === 0) {
        setError('No properties found in the selected area. Try drawing a larger boundary.');
      }
    } catch (err) {
      console.error('❌ Boundary search error:', err);
      setError(err instanceof Error ? err.message : 'Failed to search properties in boundary');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Find My Investment Property
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        Discover profitable rental properties with advanced search and interactive mapping
      </Typography>

      {/* Search Form */}
      <EnhancedPropertySearchForm
        onSearch={handlePropertySearch}
        onBoundarySearch={handleBoundarySearch}
        loading={loading}
        foundProperties={properties.length}
        isDrawingMode={isDrawingMode}
        onDrawingModeChange={setIsDrawingMode}
      />

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Main Content Area */}
      <Box sx={{ position: 'relative' }}>
        {/* Toggle Map Button */}
        <Fab
          color="primary"
          aria-label="toggle map"
          sx={{ 
            position: 'fixed', 
            bottom: 16, 
            right: 16, 
            zIndex: 1000 
          }}
          onClick={() => setShowMap(!showMap)}
        >
          <MapIcon />
        </Fab>

        {/* Map View */}
        {showMap && (
          <Box sx={{ 
            height: 600, 
            mb: 3, 
            border: 1, 
            borderColor: 'divider', 
            borderRadius: 1,
            overflow: 'hidden'
          }}>
            <InteractiveMapWithBoundary
              properties={properties}
              selectedProperty={null}
              onPropertySelect={(property) => console.log('Property selected:', property)}
              onBoundarySearch={handleBoundarySearch}
              isDrawingMode={isDrawingMode}
              onDrawingModeChange={setIsDrawingMode}
              searchLocation={searchParams?.city || ''}
            />
          </Box>
        )}

        {/* Property List */}
        {properties.length > 0 && (
          <>
            <Typography variant="h5" gutterBottom sx={{ mt: 3, mb: 2 }}>
              Found {properties.length} Investment Properties
            </Typography>
            <PropertyListView
              properties={properties}
              onPropertySelect={(property) => console.log('Property selected:', property)}
              selectedProperty={null}
              loading={loading}
            />
          </>
        )}

        {/* No Results State */}
        {!loading && properties.length === 0 && !error && (
          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Ready to find your next investment property?
            </Typography>
            <Typography>
              • Enter a city or zip code above to get started<br/>
              • Use the "Draw Area" feature to search within specific neighborhoods<br/>
              • Try searching for "Santa Clara, CA" to see our enhanced results with 55+ properties<br/>
              • Filter by investment metrics like cash-on-cash ROI and cap rates
            </Typography>
          </Alert>
        )}

        {/* Loading State */}
        {loading && properties.length === 0 && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: 200 
          }}>
            <Typography>Searching for investment properties...</Typography>
          </Box>
        )}
      </Box>

      {/* Search Statistics */}
      {properties.length > 0 && (
        <Alert severity="success" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Search Results:</strong> Found {properties.length} properties
            {searchParams?.bounds && ' within selected boundary'}
            {properties.filter(p => p.investmentScore && p.investmentScore >= 7).length > 0 && 
              ` • ${properties.filter(p => p.investmentScore && p.investmentScore >= 7).length} high-scoring investments (7+)`
            }
          </Typography>
        </Alert>
      )}
    </Container>
  );
}
